import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    console.error('[callback] OAuth error or missing code:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/callback`;
  console.log('[callback] Exchanging code with API:', API_URL, '| redirectUri:', redirectUri);

  try {
    const res = await fetch(`${API_URL}/v1/auth/google`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    });

    const raw = await res.text();
    console.log('[callback] API responded:', res.status, raw.slice(0, 300));

    if (!res.ok) {
      console.error('[callback] API error:', res.status, raw);
      return NextResponse.redirect(new URL(`/login?error=api_${res.status}`, req.url));
    }

    const json = JSON.parse(raw) as {
      data: {
        user: { isProfileComplete: boolean; role: string };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }
    };

    const { data } = json;
    const destination = data.user.isProfileComplete ? '/dashboard' : '/onboarding';
    console.log('[callback] Success! Redirecting to', destination, '| role:', data.user.role);

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.redirect(new URL(destination, req.url));

    response.cookies.set('access_token', data.accessToken, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',           // 'strict' blocks the redirect cookie — use 'lax'
      maxAge:   data.expiresIn,
      path:     '/',
    });
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',
      maxAge:   30 * 24 * 60 * 60,
      path:     '/',
    });
    response.cookies.set('user_role', data.user.role, {
      secure:   isProd,
      sameSite: 'lax',
      maxAge:   30 * 24 * 60 * 60,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[callback] Unexpected error:', err);
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }
}
