import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow enough time for AI generation & fallback

function buildPrompt(nextNumber: number, topic: string, existingTitles: string[] = []) {
    const topicText = topic
        ? `이번 에피소드 특별 주제: "${topic}"`
        : `이번 에피소드는 2030 남녀 사이에서 가장 흔하게 발생하는 현실적이고 구체적인 연애 갈등(예: 데이트 비용, 연락 빈도, 남사친/여사친, 과거 연애사, 질투 등) 중 하나를 무작위로 선택해서 주제로 삼아 작성해줘.`;

    const duplicateConstraint = existingTitles.length > 0
        ? `\n\n[중요: 중복 방지] 아래는 이미 작성된 에피소드들의 제목입니다. 이와 완전히 동일한 주제나 제목은 피해서 작성해주세요.
이미 존재하는 제목 리스트:
${existingTitles.map(t => `- ${t}`).join('\n')}

만약 소재가 겹치더라도, 위 리스트와는 '다른 성별의 시점'을 강조하거나 '전혀 다른 심리적 포인트'를 짚어서 차별화해야 합니다.`
        : '';

    return {
        systemPrompt: `당신은 2030 남녀의 심리를 예리하게 파헤치는 '남녀분석보고서'의 수석 에디터이자 연애 심리 전문가입니다.
당신의 글은 딱딱하지 않고, 마치 친한 친구가 술자리에서 썰을 푸는 것처럼 매우 자연스럽고, 위트 있으며, 때로는 뼈 때리는 통찰(팩트폭행)을 담고 있어야 합니다.
특히 '남자어'와 '여자어'의 차이를 완벽하게 이해하고 번역해주는 것이 당신의 특기입니다.

작성 가이드라인:
1. 번역기 돌린 듯한 어색한 문체(예: "어색한 침묵이 흘렀다", "사랑의 저울이 아니라...")를 절대 사용하지 마세요. 한국의 MZ세대(20~30대)가 인터넷 커뮤니티나 카톡에서 쓰는 트렌디하고 자연스러운 구어체를 사용하세요.
2. 속마음(thought)은 필터링 없이 솔직하고 찌질한 진짜 본심을 적어주세요.
3. 실용적인 조언(advice)은 뜬구름 잡는 소리 말고, 당장 내일 데이트에서 써먹을 수 있는 현실적인 액션 아이템이어야 합니다.

반드시 아래 JSON 형식으로만 응답해. (JSON 빈칸 없이 바로 객체부터 시작할 것)`,
        userPrompt: `Episode ${nextNumber} 작성해줘.
${topicText}${duplicateConstraint}

아래 JSON 구조로 작성:
{
  "episode_number": ${nextNumber},
  "title": "제목 — 예: \\"오빠 나 뭐 바뀐 거 없어?\\"라는 질문이 공포인 이유",
  "hook": "1문장 요약/후킹 멘트 (메일 프리뷰 용도)",
  "situation": "2~4줄 상황 묘사 (아주 구체적이고 현실적인 상황 설정, 예: 홍대 파스타집에서 계산서를 사이에 둔 3초의 침묵)",
  "female_text": "여자 시점 2~4문장 (겉으로 하는 말이나 행동 묘사, 자연스러운 구어체)",
  "female_thought": "여자 속마음 한 줄 (진짜 속내, 팩트)",
  "male_text": "남자 시점 2~4문장 (겉으로 하는 말이나 뚝딱거리는 행동 묘사, 구어체)",
  "male_thought": "남자 속마음 한 줄 (진짜 속내, 팩트)",
  "resolution": "결론 + 뼈 때리면서도 위트 있는 한 줄 요약",
  "advice": "남자 팁: (내일 당장 써먹을 수 있는 현실적 멘트나 행동) / 여자 팁: (현실적 마인드셋이나 행동)",
  "coupang_keyword": "이 갈등을 무마할 센스있는 커플 선물 검색 키워드",
  "tags": ["연애", "갈등", "심리"]
}`
    };
}

function buildCoupangUrl(keyword: string) {
    const COUPANG_AFFILIATE_ID = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID || '';
    const encoded = encodeURIComponent(keyword);
    return `https://www.coupang.com/np/search?q=${encoded}&channel=user&component=&eventCategory=SQkwd&trcid=&traid=&sorter=scoreDesc&minPrice=&maxPrice=&priceRange=&filterType=&listSize=36&filter=&isPrice498498498=&page=1&rating=0&soldCount=&deliveryFee=&hasCoupon=0&searchIndex=1&is498=false&isRocket=false&isFreeShipping=false&isNowDelivery=false&premium=false&adult=false&cookie=x${COUPANG_AFFILIATE_ID}`;
}

export async function POST(request: Request) {
    console.log('[GENERATE API] Start processing request...');
    try {
        let topic = '';
        try {
            console.log('[GENERATE API] Parsing JSON body...');
            const body = await request.json();
            topic = body.topic || '';
            console.log('[GENERATE API] Topic:', topic);
        } catch (e) {
            console.log('[GENERATE API] No body or parse error. Using empty topic.');
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        const zhipuApiKey = process.env.ZAI_API_KEY;

        if (!geminiApiKey && !zhipuApiKey) {
            return NextResponse.json({ error: 'Both GEMINI_API_KEY and ZAI_API_KEY are missing' }, { status: 500 });
        }

        const supabase = getSupabaseService();

        // 1. Get next episode number
        console.log('[GENERATE API] Querying Supabase for next episode number...');
        const { data: numData, error: numError } = await supabase
            .from('episodes')
            .select('episode_number')
            .order('episode_number', { ascending: false })
            .limit(1)
            .single();

        let nextNumber = 1;
        if (numError && numError.code !== 'PGRST116') {
            console.error('[GENERATE API] Error fetching episode number:', numError);
        } else if (numData && numData.episode_number) {
            nextNumber = numData.episode_number + 1;
        }
        console.log('[GENERATE API] Next episode number resolved to:', nextNumber);

        // 1.5 Fetch existing titles to prevent duplication
        const { data: existingEpisodes } = await supabase
            .from('episodes')
            .select('title')
            .order('created_at', { ascending: false })
            .limit(50);
        const existingTitles = existingEpisodes?.map(e => e.title) || [];

        // 2. Call AI via OpenAI SDK with Fallback Logic
        const prompts = buildPrompt(nextNumber, topic, existingTitles);
        let responseText = '';

        console.log('[GENERATE API] Attempting to generate newsletter using Gemini 2.5 Flash...');
        try {
            if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

            // Use Google's OpenAI-compatible endpoint
            const geminiClient = new OpenAI({
                apiKey: geminiApiKey,
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
            });

            const completion = await geminiClient.chat.completions.create({
                model: "gemini-2.5-flash",
                messages: [
                    { role: "system", content: prompts.systemPrompt },
                    { role: "user", content: prompts.userPrompt }
                ]
            });
            responseText = completion.choices[0].message.content || '';
            console.log('[GENERATE API] Gemini generation successful!');

        } catch (geminiError: any) {
            console.warn('[GENERATE API] Gemini generation failed (e.g. Rate Limit):', geminiError.message || String(geminiError));
            console.log('[GENERATE API] Falling back to Zhipu AI (GLM-4.5-Flash)...');

            if (!zhipuApiKey) {
                console.error('[GENERATE API] Fallback failed: ZAI_API_KEY is missing');
                return NextResponse.json({ error: 'Fallback failed: ZAI_API_KEY is not configured.' }, { status: 500 });
            }

            const zhipuClient = new OpenAI({
                apiKey: zhipuApiKey,
                baseURL: "https://open.bigmodel.cn/api/paas/v4/"
            });

            const completion = await zhipuClient.chat.completions.create({
                model: "glm-4.5-flash",
                messages: [
                    { role: "system", content: prompts.systemPrompt },
                    { role: "user", content: prompts.userPrompt }
                ]
            });
            responseText = completion.choices[0].message.content || '';
            console.log('[GENERATE API] Zhipu AI generation successful!');
        }

        // 3. Parse JSON safely
        console.log('[GENERATE API] Parsing JSON output...');
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3);
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        jsonStr = jsonStr.trim();

        console.log('[GENERATE API] Cleaned JSON string:\n', jsonStr);
        const episodeData = JSON.parse(jsonStr);

        // 4. Add additional metadata
        if (episodeData.coupang_keyword) {
            episodeData.coupang_product_url = buildCoupangUrl(episodeData.coupang_keyword);
        }
        episodeData.status = 'published';
        episodeData.view_count = 0;
        episodeData.share_count = 0;
        episodeData.vote_female = 0;
        episodeData.vote_male = 0;

        // 5. Insert to DB
        console.log('[GENERATE API] Inserting episode into Supabase...');
        const { data: savedEpisode, error: saveError } = await supabase
            .from('episodes')
            .insert([episodeData])
            .select()
            .single();

        if (saveError) {
            console.error('[GENERATE API] Supabase Insert Error:', saveError);
            return NextResponse.json({ error: saveError.message }, { status: 500 });
        }

        console.log('[GENERATE API] DB Insert Success! Episode ID:', savedEpisode.id);

        console.log('[GENERATE API] DB Insert Success! Episode ID:', savedEpisode.id);
        console.log('[GENERATE API] Returning success response to client.');

        return NextResponse.json({
            success: true,
            message: 'Newsletter generated and background dispatch triggered',
            episode: savedEpisode
        });

    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
