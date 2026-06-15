import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
  }

  try {
    const res = await fetch(`${API_URL}/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirectUri: `${req.nextUrl.origin}/api/auth/callback`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Auth failed: ${res.status}`);
    }

    const { data } = await res.json() as { data: { user: { isProfileComplete: boolean }; accessToken: string; refreshToken: string } };

    // Set auth cookies
    const response = NextResponse.redirect(
      new URL(data.user.isProfileComplete ? '/dashboard' : '/onboarding', req.url),
    );

    response.cookies.set('access_token', data.accessToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 3600, path: '/',
    });
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 30 * 24 * 60 * 60, path: '/',
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
  }
}
