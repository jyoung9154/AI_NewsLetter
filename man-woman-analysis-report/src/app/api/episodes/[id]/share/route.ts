import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const episodeId = params.id;
        const { platform } = await request.json();

        const validPlatforms = ['kakao', 'twitter', 'facebook', 'link', 'other'];
        if (!validPlatforms.includes(platform)) {
            return NextResponse.json({ error: '알 수 없는 플랫폼입니다.' }, { status: 400 });
        }

        const supabase = getSupabaseService();

        // 1. shares 테이블에 기록
        await supabase.from('shares').insert([{
            episode_id: episodeId,
            platform: platform
        }]);

        // 2. episodes 테이블의 share_count 1 증가
        const { data: episode } = await supabase
            .from('episodes')
            .select('share_count')
            .eq('id', episodeId)
            .single();

        if (episode) {
            await supabase
                .from('episodes')
                .update({ share_count: episode.share_count + 1 })
                .eq('id', episodeId);
        }

        return NextResponse.json({ success: true, new_share_count: (episode?.share_count || 0) + 1 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
