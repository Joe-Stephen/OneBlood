import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'No session' },
      { status: 401 }
    );
  }

  return NextResponse.json({ accessToken });
}
