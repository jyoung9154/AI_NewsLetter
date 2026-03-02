import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { myMbti, myGender, targetMbti, targetGender } = await request.json();

        if (!myMbti || !myGender || !targetMbti || !targetGender) {
            return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY 설정 오류' }, { status: 500 });
        }

        const geminiClient = new OpenAI({
            apiKey: geminiApiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        });

        const systemPrompt = `
당신은 남녀 심리 분석 및 연애 궁합 전문가입니다. 
본인(${myGender === 'female' ? '여성' : '남성'}, ${myMbti})과 상대방(${targetGender === 'female' ? '여성' : '남성'}, ${targetMbti})의 MBTI 궁합을 분석해주세요.

출력은 반드시 유효한 JSON 객체여야 하며, 다음 키를 포함해야 합니다:
- "score": 1~100 사이의 궁합 점수 (정수)
- "summary": 두 사람의 관계를 한 줄로 요약하는 키워드나 문장 (예: "불붙는 정체성, 물과 기름의 만남")
- "attraction": 서로가 서로에게 끌리는 이유 (3~4줄)
- "challenges": 두 사람이 만났을 때 겪을 수 있는 주요 갈등 상황 (3~4줄)
- "tips": 더 좋은 관계를 위해 서로에게 필요한 조언 (3~4줄)
- "compatibility_tag": 궁합 등급 (예: "천생연분", "무난한 조화", "노력이 필요한 관계" 등)
        `;

        const userPrompt = `
${myGender === 'female' ? '여성' : '남성'} ${myMbti}와 ${targetGender === 'female' ? '여성' : '남성'} ${targetMbti}의 연애 궁합을 전문가의 시선에서 상세히 분석해주세요.
        `;

        const response = await geminiClient.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const rawContent = response.choices[0]?.message?.content || "{}";
        let parsedContent;
        try {
            const cleanJson = rawContent.replace(/```json|```/g, '').trim();
            parsedContent = JSON.parse(cleanJson);
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
