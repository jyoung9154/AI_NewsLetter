import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 빌드 시 정적 렌더링을 피하기 위해
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const episodeId = params.id;
        const { searchParams } = new URL(request.url);
        const mbti = searchParams.get('mbti');
        const gender = searchParams.get('gender');

        if (!mbti || !gender) {
            return NextResponse.json({ error: 'MBTI와 성별을 모두 선택해주세요.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('mbti_reactions')
            .select('*')
            .eq('episode_id', episodeId)
            .ilike('mbti_type', mbti)
            .eq('gender', gender)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // 데이터가 없는 경우 (아직 작성되지 않음)
                return NextResponse.json({ message: '아직 이 상황에 대한 반응이 분석되지 않았어요 😅' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
