import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// 빌드 시 정적 렌더링을 피하기 위해
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // AI API 호출 대기 시간을 위해 증가

const zhipuClient = new OpenAI({
    baseURL: "https://open.bigmodel.finance/api/paas/v4/",
    apiKey: process.env.ZAI_API_KEY || "",
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const episodeId = params.id;
        const { searchParams } = new URL(request.url);
        const mbti = searchParams.get('mbti');
        const gender = searchParams.get('gender');

        if (!mbti || !gender) {
            return NextResponse.json({ error: 'MBTI와 성별을 모두 선택해주세요.' }, { status: 400 });
        }

        // 1. DB에서 기존 분석 결과 조회
        const { data: existingData, error: fetchError } = await supabase
            .from('mbti_reactions')
            .select('*')
            .eq('episode_id', episodeId)
            .ilike('mbti_type', mbti)
            .eq('gender', gender)
            .single();

        if (existingData) {
            return NextResponse.json(existingData);
        }

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError; // PGRST116(데이터 없음)이 아닌 진짜 에러면 throw
        }

        // 2. DB에 없다면: 에피소드의 상황(situation) 데이터를 가져옴
        const { data: episodeData, error: episodeError } = await supabase
            .from('episodes')
            .select('situation')
            .eq('id', episodeId)
            .single();

        if (episodeError || !episodeData) {
            return NextResponse.json({ error: '에피소드 상황을 불러올 수 없습니다.' }, { status: 404 });
        }

        // 3. Zhipu AI (GLM-4.5-Flash) 호출 - ZAI_API 전용
        const systemPrompt = `
당신은 남녀 심리 분석 및 연애 코칭 전문가이며, 특히 MBTI 16가지 성격 유형별 행동 양식과 기저 심리를 깊이 이해하고 있습니다.
주어진 상황에서 특정 성별의 특정 MBTI가 속으로 어떻게 생각하고, 현실에서는 어떻게 반응할지 분석해주세요.

출력은 반드시 유효한 JSON 객체여야 하며, 다음 키를 포함해야 합니다:
- "reaction": 현실에서의 반응 텍스트와 속마음을 합친 2~3문장 정도의 텍스트. (예: "속으로는 '아 귀찮아' 생각하지만 겉으로는 '물론이지!'라고 웃으며 대답합니다.")
- "sensitivity": 해당 상황에 대해 이 MBTI 유형이 느끼는 스트레스나 민감도 점수 (1: 전혀 신경 안 씀, 10: 매우 스트레스 받음, 정수형)
        `;

        const userPrompt = `
상황: ${episodeData.situation}
분석 대상: ${mbti} ${gender === 'female' ? '여성' : '남성'}

위 상황에 직면했을 때, 이 대상은 겉보기 반응과 속마음이 각각 어떨까요?
`;

        const response = await zhipuClient.chat.completions.create({
            model: "glm-4-flash", // Zhipu AI Flash 모델
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const rawContent = response.choices[0]?.message?.content || "{}";
        let parsedContent;
        try {
            // Zhipu가 마크다운 코드블록을 섞어줄 수 있으므로 정리
            const cleanJson = rawContent.replace(/```json|```/g, '').trim();
            parsedContent = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[MBTI API] JSON Parse Error:', rawContent);
            return NextResponse.json({ error: 'AI 응답 파싱 중 오류가 발생했습니다.' }, { status: 500 });
        }

        // 4. 생성된 결과를 DB에 저장
        const newReaction = {
            episode_id: episodeId,
            mbti_type: mbti,
            gender: gender,
            reaction: parsedContent.reaction || '분석을 가져오지 못했습니다.',
            sensitivity: parsedContent.sensitivity || 5
        };

        const { data: insertedData, error: insertError } = await supabase
            .from('mbti_reactions')
            .insert([newReaction])
            .select('*')
            .single();

        if (insertError) {
            console.error('[MBTI API] Insert Error:', insertError);
            return NextResponse.json({ error: '분석 결과를 저장하는 중 오류가 발생했습니다.' }, { status: 500 });
        }

        return NextResponse.json(insertedData);

    } catch (error: any) {
        console.error('[MBTI API] Unexpected Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
