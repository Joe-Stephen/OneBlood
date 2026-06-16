'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [otp, setOtp] = useState('');
  
  // UI states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (isSignUp && !name) {
      setError('Full Name is required to sign up');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.sendOtp(email, isSignUp ? name : undefined);
      setIsOtpSent(true);
      setTimer(60); // 1-minute resend cooldown
    } catch (err) {
      console.error('Failed to send OTP:', err);
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Verification failed');
      }

      // Populate Zustand store
      setAuth(json.data.accessToken, json.data.user);

      // Redirect accordingly
      router.push(json.data.user.isProfileComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      console.error('Verification error:', err);
      const message = err instanceof Error ? err.message : 'Invalid verification code.';
      setError(message);
    } finally {
      setLoading(false);
    }
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

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
        <div className="card glass-strong" style={{ padding: '36px 32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>
            {isOtpSent 
              ? `Verification code sent to ${email}`
              : (isSignUp ? 'Sign up to become a life-saving donor' : 'Sign in to access your donor dashboard')
            }
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '12px 14px', marginBottom: 20, color: '#f87171',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{error}</span>
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp}>
              {isSignUp && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    id="otp-name-input"
                    type="text"
                    className="input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ fontSize: 14 }}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  id="otp-email-input"
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: 14 }}
                  required
                />
              </div>

              <button
                id="send-otp-btn"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: 15, marginBottom: 16 }}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(false); setError(null); }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    New to OneBlood?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(true); setError(null); }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Enter 6-Digit Verification Code
                </label>
                <input
                  id="otp-code-input"
                  type="text"
                  maxLength={6}
                  className="input"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ fontSize: 20, textAlign: 'center', letterSpacing: 8, fontWeight: 700 }}
                  required
                />
              </div>

              <button
                id="verify-otp-btn"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: 15, marginBottom: 16 }}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => { setIsOtpSent(false); setOtp(''); setError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  ← Go Back
                </button>

                {timer > 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="divider" style={{ margin: '24px 0' }} />

          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '13px', fontSize: 14, gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
