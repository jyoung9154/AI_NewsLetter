import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: Request) {
    try {
        const { myMbti, myGender, targetMbti, targetGender, situation } = await request.json();

        if (!myMbti || !myGender || !targetMbti || !targetGender) {
            return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
        }

        // Zhipu AI (GLM-4.5-Flash) 설정
        const zhipuApiKey = process.env.ZAI_API_KEY;
        if (!zhipuApiKey) {
            return NextResponse.json({ error: 'ZAI_API_KEY 설정 오류' }, { status: 500 });
        }

        const client = new OpenAI({
            apiKey: zhipuApiKey,
            baseURL: "https://open.bigmodel.cn/api/paas/v4/"
        });

        const systemPrompt = `
당신은 남녀 심리 분석 및 연애 궁합 전문가입니다. 
본인(${myGender === 'female' ? '여성' : '남성'}, ${myMbti})과 상대방(${targetGender === 'female' ? '여성' : '남성'}, ${targetMbti})의 연애 심리를 분석해주세요.

특히 사용자가 제공한 상황 정보를 바탕으로 매우 구체적이고 실질적인 조언을 제공해야 합니다.
상황 정보: ${situation || '일반적인 연애 상황'}

출력은 반드시 유효한 JSON 객체여야 하며, 다음 키를 포함해야 합니다:
- "score": 1~100 사이의 궁합 점수 (정수, 상황에 맞춰 변동 가능)
- "summary": 현재 상황과 두 사람의 관계를 한 줄로 요약하는 문장
- "attraction": 이 상황에서 서로가 서로에게 느끼는 감정이나 끌리는 포인트 (3~4줄)
- "challenges": 이 상황에서 발생하거나 겪을 수 있는 구체적인 갈등 (3~4줄)
- "tips": 현재 상황을 해결하거나 더 좋게 만들기 위한 맞춤형 솔루션 (3~4줄)
- "compatibility_tag": 상황별 궁합 등급 (예: "찰떡궁합", "위기 극복 필요", "서로 다른 언어" 등)
        `;

        const userPrompt = `
${myGender === 'female' ? '여성' : '남성'} ${myMbti}와 ${targetGender === 'female' ? '여성' : '남성'} ${targetMbti}의 상황별 연애 분석을 전문가의 시선에서 상세히 분석해주세요.
입력된 상황: ${situation || '없음 (일반 궁합 분석)'}
        `;

        const response = await client.chat.completions.create({
            model: "glm-4.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const rawContent = response.choices[0]?.message?.content || "{}";
        let parsedContent;
        try {
            // JSON 코드 블록 제거 및 정리
            let cleanJson = rawContent.trim();
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
            parsedContent = JSON.parse(cleanJson.trim());
        } catch (e) {
            console.error('[Analyze API] JSON Parse Error:', rawContent);
            return NextResponse.json({ error: 'AI 응답 파싱 중 오류가 발생했습니다.' }, { status: 500 });
        }

        return NextResponse.json(parsedContent);

    } catch (error: any) {
        console.error('[Analyze API] Unexpected Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
