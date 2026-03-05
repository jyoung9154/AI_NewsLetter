import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /auth/callback
 * Supabase OAuth 콜백 처리 — code를 세션으로 교환
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 후 메인 페이지로 리디렉트
  return NextResponse.redirect(origin);
}
