import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear all auth cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,           // expire immediately
    path: '/',
  };

  response.cookies.set('access_token',  '', cookieOptions);
  response.cookies.set('refresh_token', '', cookieOptions);
  response.cookies.set('user_role',     '', { ...cookieOptions, httpOnly: false });

  return response;
}
