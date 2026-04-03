import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';
import OpenAI from 'openai';

// Import repair logic
import { repairImages } from './repair-missing-images.mjs';

// Load env
dotenv.config({ path: '.env.local' });

// Env variables are provided by GitHub Actions Secrets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const leonardoApiKey = process.env.LEONARDO_API_KEY;
const zhipuApiKey = process.env.ZAI_API_KEY || process.env.ZHIPU_API_KEY;
const hfApiToken = process.env.HF_API_TOKEN;
const coupangAffiliateId = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID || '';

console.log('[GENERATE BOT] Environment Check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    hasGeminiKey: !!geminiApiKey,
    hasZhipuKey: !!zhipuApiKey,
    hasHfApiToken: !!hfApiToken,
    nodeVersion: process.version
});

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

if (!geminiApiKey && !zhipuApiKey) {
    console.error('Missing both GEMINI_API_KEY and ZAI_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── 타이틀 패턴 풀 (15종) ──────────────────────────────────────────
const TITLE_PATTERNS = [
    { name: '커뮤니티 썰형', example: '남친이 여사친이랑 인생네컷 찍었대서 한판 함;;', guide: '실제 고민 게시판(블라인드, 에브리타임 등)에 올라올 법한 날것의 문체' },
    { name: '익명 투표/판단형', example: '소개팅 첫 만남에 국밥집, 이거 내가 예민한 거야?', guide: '자신의 상황을 공유하며 유저들의 판단이나 투표를 유도하는 제목' },
    { name: '팩트 폭행/뼈 때리는 한 줄', example: '안 바쁜 거야. 네가 후순위인 거야.', guide: '냉정한 진실을 짧고 강렬하게 찔러서 클릭을 유도하는 제목' },
    { name: '현실 고증/비유형', example: '당신의 연애는 지금 넷플릭스 자동재생 상태입니다', guide: '현실적인 상황을 재치 있는 비유나 유행어로 묘사하는 제목' },
    { name: '대화/카톡 재현형', example: '그가 보낸 ㅋㅋ는 웃은 게 아니다', guide: '실제 카톡이나 대화를 인용해 호기심을 자극하는 제목' },
    { name: '직접 겨냥/질문형', example: '솔직히 너, 연애할 자격 없을 수도 있어', guide: '너를 직접 겨냥해 도발적으로 관심을 끄는 제목' },
    { name: '반전/의외성 강조형', example: '매일 사랑해 하는 커플이 더 빨리 깨지는 이유', guide: '상식을 뒤집거나 예상치 못한 포인트를 짚는 제목' },
    { name: '심리 폭로형', example: '남자들이 절대 말 안 하는 진짜 이별 사유', guide: '이성간의 숨겨진 심리나 비밀을 알려주는 느낌의 제목' },
    { name: '상황 시뮬레이션형', example: '고백 후 72시간: 남자의 뇌에서 벌어지는 일', guide: '특정한 시간이나 상황을 설정해 궁금증을 유발하는 제목' },
    { name: '공식/법칙형 (위트 버전)', example: '밀당의 황금비율은 7:3이다 (근거 있음)', guide: '전문성을 가장한 재치 있는 분석형 제목' },
];

function getRandomTitlePattern() {
    return TITLE_PATTERNS[Math.floor(Math.random() * TITLE_PATTERNS.length)];
}

function getRandomBlockTypes() {
    const allBlocks = [2, 3, 4];
    // 랜덤하게 1~3개 블록을 선택
    const shuffled = allBlocks.sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    return shuffled.slice(0, count).sort();
}

function buildPrompt(nextNumber, topic, existingTitles = [], blockTypes = [2]) {
    const pattern = getRandomTitlePattern();
    console.log(`[GENERATE BOT] Selected title pattern: "${pattern.name}", Block Types: [${blockTypes.join(', ')}]`);
    const topicText = topic
        ? `이번 에피소드 특별 주제: "${topic}"`
        : `이번 에피소드는 2030 남녀 사이에서 가장 흔하게 발생하는 현실적이고 구체적인 연애 갈등(예: 데이트 비용, 연락 빈도, 남사친/여사친, 과거 연애사, 질투 등) 중 하나를 무작위로 선택해서 주제로 삼아 작성해줘.`;

    const duplicateConstraint = existingTitles.length > 0
        ? `\n\n[중요: 중복 방지] 아래는 이미 작성된 에피소드들의 제목입니다. 이와 완전히 동일한 주제나 제목은 피해서 작성해주세요.
이미 존재하는 제목 리스트:
${existingTitles.map(t => `- ${t}`).join('\n')}

만약 소재가 겹치더라도, 위 리스트와는 '다른 성별의 시점'을 강조하거나 '전혀 다른 심리적 포인트'를 짚어서 차별화해야 합니다.`
        : '';

    let extraBlockInstructions = '';
    const blockParts = [];
    if (blockTypes.includes(2)) {
        blockParts.push(`"expert_analysis": "심리 분석관의 시선 (왜 이런 행동/말이 나오는지 진화심리학이나 뇌과학 등 분석적이고 위트있는 2~3줄 짜리 팩트폭행 기사)"`);
    }
    if (blockTypes.includes(3)) {
        blockParts.push(`"probability_stats": [\n    {"reason": "남/녀의 해당 행동의 진짜 이유 중 가장 큰 비율 (예: 단톡방 뻘소리 들킬까봐)", "percentage": 60},\n    {"reason": "두번째 이유", "percentage": 25},\n    {"reason": "세번째 이유", "percentage": 10},\n    {"reason": "네번째 이유", "percentage": 5}\n  ]`);
    }
    if (blockTypes.includes(4)) {
        blockParts.push(`"worst_response": {\n    "female": "여자의 최악수 (이 상황에서 흔히 치는, 100% 싸움으로 번지는 대사)",\n    "male": "남자의 최악수 (이 상황에서 흔히 치는, 100% 의심병 시작되는 대사)"\n  }`);
    }
    if (blockParts.length > 0) {
        extraBlockInstructions = '\n  ' + blockParts.join(',\n  ') + ',';
    }

    return {
        systemPrompt: `당신은 2030 남녀의 심리를 예리하게 파헤치는 '남녀분석보고서'의 수석 에디터이자 연애 심리 전문가입니다.
당신의 글은 딱딱한 보고서가 아니라, '에브리타임', '블라인드', '네이트판' 같은 커뮤니티에서 폭발적인 조회수를 기록하는 인기글처럼 매우 자연스럽고, 날것의 느낌이 나며, 위트 있어야 합니다.

작성 가이드라인:
1. 번역기 말투나 AI 티가 나는 구조화된 문장(예: "어색한 침묵이 흘렀다", "사랑의 저울은...", "첫째, 둘째...")을 절대 사용하지 마세요.
2. 2030 세대가 친구와 카톡할 때나 커뮤니티에 고민글을 올릴 때 쓰는 '구어체', '실제 용어', '적절한 신조어'를 사용하세요. (예: ~함, ~듯, ~함;;, 킹받네, 뚝딱거림 등)
3. 제목은 반드시 사람들의 호기심을 자극해서 클릭하지 않고는 못 배기게 만드세요.
4. 속마음(thought)은 필터링 없이 솔직하고 찌질한 진짜 본심을 적어주세요.
5. 실용적인 조언(advice)은 뜬구름 잡는 소리 말고, 당장 내일 데이트에서 써먹을 수 있는 아주 구체적인 액션 아이템이어야 합니다.

반드시 아래 JSON 형식으로만 응답해. (JSON 빈칸 없이 바로 객체부터 시작할 것)`,
        userPrompt: `Episode ${nextNumber} 작성해줘.
${topicText}${duplicateConstraint}

아래 JSON 구조로 작성:
{
  "episode_number": ${nextNumber},
  "slug": "a-short-english-url-friendly-slug-for-seo (e.g. boy-best-friend-conflict)",
  "title": "제목 — 반드시 '${pattern.name}' 패턴으로 작성. 따옴표나 쌍따옴표는 절대 쓰지 마세요. 예시: ${pattern.example}. 가이드: ${pattern.guide}",
  "hook": "후킹 멘트 (메일 프리뷰용, 제목보다 더 날것의 호기심 유발 문장)",
  "situation": "2~4줄 상황 묘사 (아주 구체적이고 디테일한 상황 설정, 예: '다 먹고 영수증 챙긴 남친, 설마 더치페이 계산기 돌리는 건 아니겠지?')",
  "female_text": "여자 시점 (자연스러운 구어체)",
  "female_thought": "여자 속마음 (진짜 속내, 팩폭)",
  "male_text": "남자 시점 (자연스러운 구어체)",
  "male_thought": "남자 속마음 (진짜 속내, 팩폭)",
  "dialogue": "현실 고증 카톡 재현 (진짜 싸울 때 하는 말투 3~4줄. 👩/👨: 대사)",${extraBlockInstructions}
  "resolution": "결론 (짧고 강렬한 요약)",
  "advice": "현실 조언 (이거 진짜 효과 있는 팁만 적어)",
  "coupang_keyword": "관련 아이템 키워드",
  "image_prompt": "A simple flat vector illustration describing the situation above, minimalist style, solid color background, clean design. (English only)",
  "tags": ["태그 3~5개"]
} `,
    };
}

function buildCoupangUrl(keyword) {
    const encoded = encodeURIComponent(keyword);
    return `https://www.coupang.com/np/search?q=${encoded}&channel=user&component=&eventCategory=SQkwd&trcid=&traid=&sorter=scoreDesc&minPrice=&maxPrice=&priceRange=&filterType=&listSize=36&filter=&isPrice498498498=&page=1&rating=0&soldCount=&deliveryFee=&hasCoupon=0&searchIndex=1&is498=false&isRocket=false&isFreeShipping=false&isNowDelivery=false&premium=false&adult=false&cookie=x${coupangAffiliateId}`;
}

async function generateNewsletter() {
    console.log('[GENERATE BOT] Start processing request...');
    try {
        // 0. Repair missing images first (Workaround for restricted workflow push)
        console.log('[GENERATE BOT] Step 0: Checking for missing images to repair...');
        await repairImages();

        let topic = ''; // Can be provided via process.env.TOPIC if needed later

        // 1. Get next episode number
        console.log('[GENERATE BOT] Querying Supabase for next episode number...');
        const { data: numData, error: numError } = await supabase
            .from('episodes')
            .select('episode_number')
            .order('episode_number', { ascending: false })
            .limit(1)
            .single();

        let nextNumber = 1;
        if (numError && numError.code !== 'PGRST116') {
            console.error('[GENERATE BOT] Error fetching episode number:', numError);
        } else if (numData && numData.episode_number) {
            nextNumber = numData.episode_number + 1;
        }
        console.log('[GENERATE BOT] Next episode number resolved to:', nextNumber);

        // 100개 이상의 에피소드가 생성되어도 정상적으로 발행되도록 제한 로직 제거
        /*
        if (nextNumber > 100) {
            // After 100 episodes, only generate if it's 9:00 AM (00 UTC), 6:00 AM (21 UTC) or 6:00 PM (09 UTC)
            const currentHourUTC = new Date().getUTCHours();
            const isTargetRun = currentHourUTC === 0; // 9 AM KST
            const isMorningRun = currentHourUTC === 21; // 6 AM KST
            const isEveningRun = currentHourUTC === 9; // 18 PM KST

            if (!isTargetRun && !isMorningRun && !isEveningRun) {
                console.log(`[GENERATE BOT] 100 episodes reached and Current hour (${currentHourUTC} UTC) is not 0, 21 or 09. Skipping.`);
                process.exit(0);
            }
        }
        */


        // 1.5 Fetch existing titles
        const { data: existingEpisodes } = await supabase
            .from('episodes')
            .select('title')
            .order('created_at', { ascending: false })
            .limit(50);
        const existingTitles = existingEpisodes?.map(e => e.title) || [];

        const blockTypes = getRandomBlockTypes();
        const prompts = buildPrompt(nextNumber, topic, existingTitles, blockTypes);
        let responseText = '';

        console.log('[GENERATE BOT] Attempting to generate newsletter using Gemini 2.5 Flash...');
        try {
            if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

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
            console.log('[GENERATE BOT] Gemini generation successful!');

        } catch (geminiError) {
            console.warn('[GENERATE BOT] Gemini generation failed:', geminiError.message || String(geminiError));
            console.log('[GENERATE BOT] Falling back to Zhipu AI (GLM-4.5-Flash)...');

            if (!zhipuApiKey) {
                throw new Error('Fallback failed: ZAI_API_KEY is missing');
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
            console.log('[GENERATE BOT] Zhipu AI generation successful!');
        }

        // Parse JSON
        console.log('[GENERATE BOT] Parsing JSON output...');
        let jsonStr = responseText.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);

        jsonStr = jsonStr.trim();
        jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        jsonStr = jsonStr.replace(/(?<=:\s*")([^"]*?)"([^"]*?)(?="[,}\n])/g, '$1\\"$2');

        let episodeData;
        try {
            episodeData = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('[GENERATE BOT] JSON Parse Error. Raw string was:', jsonStr);
            throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
        }

        // Remove quotes from title
        if (episodeData.title) {
            episodeData.title = episodeData.title.replace(/['"“”‘’]/g, '').trim();
        }

        if (episodeData.coupang_keyword) {
            episodeData.coupang_product_url = buildCoupangUrl(episodeData.coupang_keyword);
        }

        let imageBuffer = null;

        // Leonardo.ai 이미지 생성 및 Supabase Storage 업로드 연동
        // Leonardo.ai 이미지 생성 및 Supabase Storage 업로드 연동
        if (episodeData.image_prompt && leonardoApiKey) {
            console.log(`[GENERATE BOT] Generating image via Leonardo.ai using prompt: ${episodeData.image_prompt}`);

            try {
                // 1. Start generation
                const genResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
                    method: 'POST',
                    headers: {
                        "accept": "application/json",
                        "content-type": "application/json",
                        "authorization": `Bearer ${leonardoApiKey}`
                    },
                    body: JSON.stringify({
                        prompt: episodeData.image_prompt,
                        modelId: "291be633-cb24-434f-898f-e662799936ad", // Leonardo Signature
                        width: 512,
                        height: 512,
                        num_images: 1,
                        promptMagic: true
                    })
                });

                if (genResponse.ok) {
                    const genData = await genResponse.json();
                    const generationId = genData.sdGenerationJob?.generationId;

                    if (generationId) {
                        console.log(`[GENERATE BOT] Leonardo Job ID: ${generationId}. Polling for result...`);

                        let imageUrl = null;
                        for (let i = 0; i < 15; i++) { // Max 30 seconds
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                                headers: {
                                    "accept": "application/json",
                                    "authorization": `Bearer ${leonardoApiKey}`
                                }
                            });

                            if (pollResponse.ok) {
                                const pollData = await pollResponse.json();
                                const images = pollData.generations_by_pk?.generated_images;
                                if (images && images.length > 0) {
                                    imageUrl = images[0].url;
                                    break;
                                }
                                console.log(`[GENERATE BOT] Polling Leonardo ${i + 1}... (Status: ${pollData.generations_by_pk?.status})`);
                            }
                        }

                        if (imageUrl) {
                            console.log(`[GENERATE BOT] Leonardo Image URL: ${imageUrl}. Downloading...`);
                            const imgResponse = await fetch(imageUrl);
                            if (imgResponse.ok) {
                                const arrayBuffer = await imgResponse.arrayBuffer();
                                imageBuffer = Buffer.from(arrayBuffer);
                                console.log('[GENERATE BOT] Leonardo image downloaded successfully.');
                            }
                        } else {
                            console.warn('[GENERATE BOT] Leonardo generation timed out or failed.');
                        }
                    }
                } else {
                    const errorText = await genResponse.text();
                    console.warn(`[GENERATE BOT] Leonardo API Error (${genResponse.status}):`, errorText);
                }
            } catch (leoError) {
                console.error('[GENERATE BOT] Error during Leonardo call:', leoError);
            }
        }

        // --- FALLBACK: Hugging Face Inference API ---
        const hfApiToken = process.env.HF_API_TOKEN;
        if (!imageBuffer && episodeData.image_prompt && hfApiToken) {
            console.log(`[GENERATE BOT] Attempting Fallback: Generating image via Hugging Face...`);
            try {
                const hfResponse = await fetch(
                    "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
                    {
                        headers: {
                            "Authorization": `Bearer ${hfApiToken}`,
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify({
                            inputs: episodeData.image_prompt,
                            options: { wait_for_model: true }
                        }),
                    }
                );

                if (hfResponse.ok) {
                    const arrayBuffer = await hfResponse.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                    console.log('[GENERATE BOT] Hugging Face image generated successfully.');
                } else {
                    const hfErrorText = await hfResponse.text();
                    console.warn(`[GENERATE BOT] Hugging Face API Error (${hfResponse.status}):`, hfErrorText);
                }
            } catch (hfError) {
                console.error('[GENERATE BOT] Error during Hugging Face call:', hfError);
            }
        }

        if (imageBuffer) {
            const fileName = `episode_${episodeData.episode_number}_${Date.now()}.jpg`;
            console.log(`[GENERATE BOT] Uploading image to Supabase Storage: episode_images/${fileName}...`);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('episode_images')
                .upload(fileName, imageBuffer, {
                    contentType: 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error('[GENERATE BOT] Supabase Storage Upload failed:', uploadError);
            } else {
                const { data: publicUrlData } = supabase.storage
                    .from('episode_images')
                    .getPublicUrl(uploadData.path);

                episodeData.image_url = publicUrlData.publicUrl;
                console.log('[GENERATE BOT] Image URL attached:', episodeData.image_url);
            }
        } else if (episodeData.image_prompt) {
            console.warn('[GENERATE BOT] Failed to generate image. Proceeding without image.');
        }

        episodeData.status = 'published';
        episodeData.view_count = 0;
        episodeData.share_count = 0;
        episodeData.vote_female = 0;
        episodeData.vote_male = 0;

        if (episodeData.image_prompt) {
            delete episodeData.image_prompt;
        }

        console.log('[GENERATE BOT] Inserting episode into Supabase...');
        const { data: savedEpisode, error: saveError } = await supabase
            .from('episodes')
            .insert([episodeData])
            .select()
            .single();

        if (saveError) {
            throw new Error(`Supabase Insert Error: ${saveError.message}`);
        }

        console.log('[GENERATE BOT] DB Insert Success! Episode ID:', savedEpisode.id);
        console.log('[GENERATE BOT] Finished successfully.');
        process.exit(0);

    } catch (e) {
        console.error('[GENERATE BOT] Fatal Error:', e);
        process.exit(1);
    }
}

generateNewsletter();
