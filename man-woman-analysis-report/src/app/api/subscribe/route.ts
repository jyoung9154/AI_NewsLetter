import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, my_gender, mbti, interested_mbti, age_group, start_option, specific_episode } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. 다음에 보낼 에피소드 번호 계산
    let nextEpisodeToSend = 1;
    if (start_option === 'latest') {
        const { data: maxEp } = await supabase
            .from('episodes')
            .select('episode_number')
            .order('episode_number', { ascending: false })
            .limit(1)
            .single();

        // 현재 가장 최신 에피소드를 오늘 바로 받거나, 내일 다음 화부터 받게 설정
        nextEpisodeToSend = (maxEp?.episode_number || 0) + 1;
    } else if (start_option === 'specific' && specific_episode) {
        nextEpisodeToSend = specific_episode;
    }

    const { data: existingUser } = await supabase
        .from('subscribers')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        // 이미 존재하는 유저면 업데이트
        const updates: any = {};
        if (my_gender) updates.gender = my_gender;
        if (mbti) updates.mbti = mbti;
        if (interested_mbti) updates.interested_mbti = interested_mbti;
        if (age_group) updates.age_group = age_group;
        if (start_option) updates.start_option = start_option;
        if (nextEpisodeToSend) updates.next_episode_to_send = nextEpisodeToSend;
        updates.status = 'active';

        const { error: updateError } = await supabase
            .from('subscribers')
            .update(updates)
            .eq('email', email);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Subscriber updated successfully', data: { email } }, { status: 200 });
    }

    // 신규 구독
    const { data, error } = await supabase
        .from('subscribers')
        .insert([{
            email,
            gender: my_gender || null,
            gender_preference: 'both',
            mbti: mbti || null,
            interested_mbti: interested_mbti || null,
            age_group: age_group || null,
            status: 'active',
            start_option: start_option || 'latest',
            next_episode_to_send: nextEpisodeToSend,
            subscribed_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Subscribed successfully', data }, { status: 201 });
}

export async function GET() {
    const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('status', 'active');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
