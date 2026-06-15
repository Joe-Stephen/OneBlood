'use client';
import Link from 'next/link';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      redirect_uri:  `${window.location.origin}/api/auth/callback`,
      response_type: 'code',
      scope:         'openid email profile',
      access_type:   'offline',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-0)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: 36 }}>🩸</span>
            <span style={{ fontWeight: 800, fontSize: 28, color: 'var(--text-primary)' }}>
              One<span style={{ color: '#ef4444' }}>Blood</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10 }}>
            India&apos;s Blood Donation Network
          </p>
        </div>

        {/* Card */}
        <div className="card glass-strong" style={{ padding: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
            Sign in to access your donor dashboard
          </p>

          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '14px', fontSize: 15, gap: 12 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider" style={{ margin: '28px 0' }} />

          <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your location data is used only for donor matching and is never sold.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
          New to OneBlood?{' '}
          <span style={{ color: '#f87171' }}>Create an account for free after signing in.</span>
        </p>
      </div>
    </div>
  );
}
