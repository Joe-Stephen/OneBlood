import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/v1/auth/otp/verify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error('[OTP Verify Route] API error:', res.status, raw);
      let parsedErr: { error?: { message?: string } } = { error: { message: 'Verification failed' } };
      try {
        parsedErr = JSON.parse(raw) as { error?: { message?: string } };
      } catch {}
      return NextResponse.json(
        { success: false, error: parsedErr.error?.message || 'Verification failed' },
        { status: res.status }
      );
    }

    const json = JSON.parse(raw) as {
      data: {
        user: { id: string; email: string; name: string; role: string; isProfileComplete: boolean };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }
    };

    const { data } = json;
    const isProd = process.env.NODE_ENV === 'production';
    
    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: data.accessToken,
        user: data.user,
      }
    });

    // Set secure HTTP-only cookies matching the OAuth callback route
    response.cookies.set('access_token', data.accessToken, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',
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
    const error = err as Error;
    console.error('[OTP Verify Route] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
