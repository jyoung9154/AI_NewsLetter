import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'email parameter is required' }, { status: 400 });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase
            .from('subscribers')
            .update({
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email);

        if (error) {
            console.error('[UNSUBSCRIBE] DB update error:', error);
            return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
        }

        console.log(`[UNSUBSCRIBE] Successfully unsubscribed: ${email}`);
        return NextResponse.json({ success: true, message: '수신거부 처리되었습니다.' });
    } catch (e: any) {
        console.error('[UNSUBSCRIBE] Error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
