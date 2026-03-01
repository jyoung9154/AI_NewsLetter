import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const episodeId = params.id;
        const supabase = getSupabaseService();

        // 1. 현재 조회수 가져오기
        const { data: episode, error: fetchError } = await supabase
            .from('episodes')
            .select('view_count')
            .eq('id', episodeId)
            .single();

        if (fetchError || !episode) {
            return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        // 2. 조회수 1 증가
        const { error: updateError } = await supabase
            .from('episodes')
            .update({ view_count: episode.view_count + 1 })
            .eq('id', episodeId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3. (선택) 상세 로깅 - IP나 User-Agent 기록 (간단히 빈 값으로라도 삽입)
        await supabase.from('episode_views').insert([{
            episode_id: episodeId,
            viewer_ip: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown'
        }]);

        return NextResponse.json({ success: true, new_view_count: episode.view_count + 1 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
