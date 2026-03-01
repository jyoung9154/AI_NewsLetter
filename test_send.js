// Test script to send newsletter to a single email address
import { sendToEmail } from '/Users/jaeyoung/.openclaw/skills/newsletter-generator/send.js';
import { generateEpisode, saveEpisode } from '/Users/jaeyoung/.openclaw/skills/newsletter-generator/generate.js';
import { createClient } from '@supabase/supabase-js';

(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest draft episode
    const { data: episode, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('status', 'draft')
        .order('episode_number', { ascending: false })
        .limit(1)
        .single();

    let targetEpisode = episode;
    if (!targetEpisode) {
        const { generateEpisode, saveEpisode } = await import('/Users/jaeyoung/.openclaw/skills/newsletter-generator/generate.js');
        const { nextNumber } = await generateEpisode();
        const dummy = {
            episode_number: nextNumber,
            title: `Test Episode ${nextNumber}`,
            situation: '테스트 상황',
            female_pov: '여성 관점',
            female_quote: '여성 인용',
            male_pov: '남성 관점',
            male_quote: '남성 인용',
            conclusion: '테스트 결론',
            tip: '남자 팁 / 여자 팁',
            product_keyword: '커플 선물',
        };
        targetEpisode = await saveEpisode(dummy);
    }

    const result = await sendToEmail('jyoung_9154@naver.com', targetEpisode);
    console.log('Send result:', result);
})();
