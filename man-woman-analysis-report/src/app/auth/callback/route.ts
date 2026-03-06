import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 * Supabase OAuth 콜백 처리 — code를 세션으로 교환하고 쿠키를 세팅합니다.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 후 지정된 페이지 또는 메인 페이지로 리디렉트
  const next = requestUrl.searchParams.get('next') ?? '/';

  // 상대 경로인 경우 보안을 위해 origin을 붙여서 절대 경로로 만듭니다.
  if (next.startsWith('/')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(origin);
}
