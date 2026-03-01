// supabase/run-migration.mjs
// Supabase SQL 마이그레이션 실행 스크립트
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rltvlhoqbicgfjgygwuu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 개별 SQL 문을 따로 실행 (rpc가 없으므로 테이블별로 진행)
async function runMigration() {
    console.log('🚀 마이그레이션 시작...\n');

    // 1. episodes 테이블 — 데이터 삽입으로 테이블 존재 확인
    console.log('1️⃣ episodes 테이블 확인...');
    const { error: epCheck } = await supabase.from('episodes').select('id').limit(1);
    if (epCheck && epCheck.code === '42P01') {
        console.log('   ❌ episodes 테이블이 없습니다. Supabase 대시보드에서 SQL을 직접 실행해주세요.');
        console.log('   📋 SQL 파일: supabase/migration.sql');
        return false;
    }
    console.log('   ✅ episodes 테이블 존재');

    // 2. 기존 데이터 확인
    const { data: existingEps } = await supabase.from('episodes').select('episode_number');
    const existingNums = new Set((existingEps || []).map(e => e.episode_number));
    console.log(`   📊 기존 에피소드: ${existingEps?.length || 0}개`);

    // 3. sampleEpisodes 데이터 삽입
    const episodes = [
        {
            episode_number: 1,
            title: 'Episode 1. "알았어" 들었을 때 정말 끝난 거 맞아?',
            hook: '당신도 한 번쯤 그 "알았어" 듣고 이제 살았다며 안도한 적 있지 않으신가요?',
            situation: '바쁜 주말 저녁, 약속 시간에 30분 늦은 남친. 약간의 언쟁 끝에 여친이 "알았어"라고 말하고 조수석 창밖만 바라보며 침묵한다. 남친은 화가 풀린 줄 알고 라디오 볼륨을 올린다.',
            female_text: '"알았어"는 상황을 이해했다는 게 아니야. 지금 내 감정을 정돈할 시간이 필요하니까 더 이상 변명하지 말고 기다려 달라는 신호지. 그런데 왜 갑자기 신나는 노래를 트는 걸까? 내 기분은 전혀 신경 안 쓰는 걸까?',
            female_thought: '지금 라디오 틀 기분이야? 진짜 눈치 없다...',
            male_text: '휴, 다행히 화가 좀 풀린 모양이네. "알았어"라고 했으니 일단 이 주제는 넘어간 거겠지? 분위기 좀 살리려고 일부러 신나는 노래 틀었는데, 왜 표정이 더 안 좋아지는 것 같지... 또 내가 뭐 잘못했나?',
            male_thought: '알았다고 했으면 끝난 거 아니었어? 분위기 띄우려고 했는데...',
            resolution: '여성의 "알았어"는 종결이 아니라 리셋 버튼입니다.\n남자에게 필요한 건 5분의 침묵, 여자에게 필요한 건 그 침묵이 무시가 아니라는 확인입니다.\n근데... 그 5분 동안 라디오 볼륨은 내려두는 거야, 진짜로.',
            advice: '여성은 침묵 대신 "지금은 화가 나서 정리가 필요해"라고 명확히 표현해 주세요. 남성은 "알았어" 직후에 바로 분위기를 전환하려 하지 말고 5분 정도 조용히 공감의 시간을 가지세요.',
            next_teaser: "다음 주 에피소드 예고: '5분만 기다려' — 그 5분이 50분이 되는 이유",
            tags: ['의사소통', '침묵', '감정표현', '연애'],
            status: 'published',
            published_at: new Date().toISOString(),
        },
        {
            episode_number: 2,
            title: 'Episode 2. 오늘 밤 "아무거나"의 진짜 의미',
            hook: '오늘 저녁 메뉴를 고민하다 화난 적 있나요? 사실 그건 메뉴 때문이 아니었을지도 모릅니다.',
            situation: '금요일 저녁 데이트. 남친이 "오늘 뭐 먹을래?"라고 묻자 여친은 "아무거나"라고 답한다. 남친이 "그럼 삼겹살 어때?"라고 하자 여친은 "옷에 냄새 배는 건 좀..."이라며 말을 흐린다. "그럼 파스타?" "어제 점심에 먹었어."',
            female_text: '진짜로 아무거나 먹고 싶은 게 아니야. 내가 지금 어떤 기분인지, 이번 주에 얼마나 피곤했는지 고려해서 센스 있게 제안해 주길 바라는 거지. 매번 나보고 정하라고 하는 건 알아보기 귀찮다는 거 아닐까?',
            female_thought: '우리 기념일도 얼마 안 남았는데, 좀 특별한 데 모의해둔 곳 없어?',
            male_text: '진짜 아무거나 괜찮다는 줄 알았어! 이것저것 제안해도 다 거절할 거면 차라리 처음부터 스시 먹고 싶다고 말해주면 안 되나? 메뉴 고르는 게 세상에서 제일 어려워. 스무고개 하는 기분이야.',
            male_thought: '아까부터 네 번이나 퇴짜 맞았어... 그냥 네가 골라 제발 ㅠㅠ',
            resolution: '여성에게 "아무거나"는 메뉴 선택의 책임을 미루는 것이 아니라, 관계에 대한 관심과 센스를 테스트하는 은연중의 표현일 수 있습니다. 반면 남성에게는 효율성 떨어지는 불필요한 스무고개로 스트레스를 유발합니다.',
            advice: '남성은 처음부터 3가지(분위기 좋은 곳 / 가벼운 곳 / 매콤한 것) 선택지를 주고 고르게 하세요. 여성은 완전한 "아무거나" 대신 "매운 거 빼고 아무거나"처럼 최소한의 가이드라인을 주세요.',
            next_teaser: null,
            tags: ['의사소통', '데이트', '음식', '연애'],
            status: 'published',
            published_at: new Date().toISOString(),
        }
    ];

    for (const ep of episodes) {
        if (existingNums.has(ep.episode_number)) {
            console.log(`   ⏭️ Episode ${ep.episode_number} 이미 존재, 스킵`);
            continue;
        }
        const { error } = await supabase.from('episodes').insert(ep);
        if (error) {
            console.log(`   ❌ Episode ${ep.episode_number} 삽입 실패:`, error.message);
        } else {
            console.log(`   ✅ Episode ${ep.episode_number} 삽입 완료`);
        }
    }

    // 4. 다른 테이블 존재 확인
    const tables = ['subscribers', 'episode_views', 'votes', 'shares', 'mbti_reactions', 'newsletter_sends'];
    console.log('\n2️⃣ 나머지 테이블 확인...');
    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
            console.log(`   ❌ ${table} — 테이블 없음 (SQL Editor에서 생성 필요)`);
        } else {
            console.log(`   ✅ ${table} — 테이블 존재`);
        }
    }

    console.log('\n🎉 마이그레이션 점검 완료!');
    return true;
}

runMigration().catch(console.error);
