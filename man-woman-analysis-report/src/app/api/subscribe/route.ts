import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, gender, mbti, age_group } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('subscribers')
        .insert([{
            email,
            gender_preference: gender || 'both',
            mbti: mbti || null,
            age_group: age_group || null,
            status: 'active',
            subscribed_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        // 이미 구독 중인 경우 처리
        if (error.code === '23505') {
            return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
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
