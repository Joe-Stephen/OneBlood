import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PATTERNS = [
  /^\/dashboard/,
  /^\/requests/,
  /^\/donations/,
  /^\/notifications/,
  /^\/profile/,
  /^\/admin/,
  /^\/onboarding/,
];

// Routes only for unauthenticated users
const AUTH_ONLY_PATTERNS = [
  /^\/login/,
];

// Admin-only routes
const ADMIN_ONLY_PATTERNS = [
  /^\/admin/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken  = req.cookies.get('access_token')?.value;
  const userRole     = req.cookies.get('user_role')?.value;

  const isAuthenticated = !!accessToken;
  const isProtected     = PROTECTED_PATTERNS.some(p => p.test(pathname));
  const isAuthOnly      = AUTH_ONLY_PATTERNS.some(p => p.test(pathname));
  const isAdminRoute    = ADMIN_ONLY_PATTERNS.some(p => p.test(pathname));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isAdminRoute && isAuthenticated && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
