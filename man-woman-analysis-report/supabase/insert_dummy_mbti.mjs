import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Get episode 1 id
    const { data: episodes } = await supabase.from('episodes').select('id').order('created_at', { ascending: true }).limit(1);
    if (!episodes || episodes.length === 0) {
        console.log("No episodes found.");
        return;
    }
    const episodeId = episodes[0].id;

    const dummyReactions = [
        {
            episode_id: episodeId,
            mbti_type: 'ENFP',
            gender: 'female',
            reaction: '솔직히 서운한 건 맞지만, 내가 너무 예민했나 싶기도 해. 다음 번엔 좀 더 대화로 풀어나가고 싶은 마음이야. 나한테 먼저 다가와줬으면 좋겠어!',
            sensitivity: 8
        },
        {
            episode_id: episodeId,
            mbti_type: 'INTJ',
            gender: 'male',
            reaction: '이 상황에서의 비효율적인 소통이 문제의 핵심이다. 굳이 감정적으로 반응할 필요 없이 객관적인 원인을 파악하고 재발 방지책을 마련해야 한다.',
            sensitivity: 3
        }
    ];

    const { error } = await supabase.from('mbti_reactions').insert(dummyReactions);
    if (error) {
        if (error.code === '23505') {
            console.log("Dummy reactions already inserted for Episode", episodeId);
        } else {
            console.error("Failed to insert reactions:", error);
        }
    } else {
        console.log("Dummy reactions inserted for Episode", episodeId);
    }
}

run();
