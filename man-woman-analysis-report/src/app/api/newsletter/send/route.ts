import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseService } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const { episodeId } = await request.json();

    if (!episodeId) {
        return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseService();

    // 1. 에피소드 정보 조회
    const { data: episode, error: epError } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .single();

    if (epError || !episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // 2. 활성 구독자 조회
    const { data: subscribers, error: subError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('status', 'active');

    if (subError || !subscribers || subscribers.length === 0) {
        return NextResponse.json({ error: 'No active subscribers' }, { status: 404 });
    }

    try {
        // 3. Resend API를 이용한 배치 발송 (샘플로 한 번에 발송하거나 실제로는 배치를 나눠야 함)
        // 여기서는 Resend의 batch 기능을 한 번만 사용하는 간단한 버전
        const { data, error } = await resend.emails.send({
            from: '남녀분석보고서 <newsletter@man-woman-analysis.com>',
            to: subscribers.map(s => s.email),
            subject: `Episode ${episode.episode_number}. ${episode.title}`,
            html: `
        <h1>${episode.title}</h1>
        <p>${episode.situation}</p>
        <hr />
        <p>자세한 내용은 웹사이트에서 확인하세요!</p>
      `, // 실제로는 더 예쁜 템플릿 필요
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 4. 발송 완료 기록
        await supabase
            .from('episodes')
            .update({ sent_at: new Date().toISOString(), status: 'sent' })
            .eq('id', episodeId);

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
