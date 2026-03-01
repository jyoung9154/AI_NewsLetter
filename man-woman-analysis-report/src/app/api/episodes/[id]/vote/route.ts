import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const episodeId = params.id;
        const { genderVote } = await request.json();

        if (genderVote !== 'female' && genderVote !== 'male') {
            return NextResponse.json({ error: '지정되지 않은 성별 투표입니다.' }, { status: 400 });
        }

        const supabase = getSupabaseService();
        const viewerIp = request.headers.get('x-forwarded-for') || 'unknown';

        // 1. IP로 중복 투표 확인 (여기서는 간단히 votes 테이블을 검사)
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('episode_id', episodeId)
            .eq('voter_ip', viewerIp)
            .single();

        if (existingVote) {
            return NextResponse.json({ error: '이미 투표에 참여하셨습니다.' }, { status: 403 });
        }

        // 2. 투표 기록 삽입
        const { error: insertError } = await supabase
            .from('votes')
            .insert([{
                episode_id: episodeId,
                gender_vote: genderVote,
                voter_ip: viewerIp,
            }]);

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // 3. 에피소드 테이블의 투표 카운트 업데이트
        const { data: episode } = await supabase
            .from('episodes')
            .select('vote_female, vote_male')
            .eq('id', episodeId)
            .single();

        if (episode) {
            const updateField = genderVote === 'female' ? { vote_female: episode.vote_female + 1 } : { vote_male: episode.vote_male + 1 };
            await supabase
                .from('episodes')
                .update(updateField)
                .eq('id', episodeId);
        }

        return NextResponse.json({ success: true, message: '투표가 반영되었습니다.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
