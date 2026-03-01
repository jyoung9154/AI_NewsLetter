import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, my_gender, mbti, interested_mbti, age_group } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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
            gender_preference: 'both', // 이제 쓰지 않으므로 기본값
            mbti: mbti || null,
            interested_mbti: interested_mbti || null,
            age_group: age_group || null,
            status: 'active',
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
