'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call backend to blacklist the token
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Continue even if API call fails
    }

    // Clear cookies via the frontend API route
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Welcome back,{' '}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
          {userName}
        </span>
        <span className={`badge ${userRole === 'ADMIN' ? 'badge-red' : 'badge-blue'}`} style={{ marginLeft: 8 }}>
          {userRole}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/notifications" className="btn btn-ghost btn-sm">
          🔔
        </Link>
        <Link href="/profile" className="btn btn-secondary btn-sm">
          Profile
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn btn-ghost btn-sm"
          style={{
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.3)',
            opacity: loggingOut ? 0.6 : 1,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
          }}
        >
          {loggingOut ? '...' : '⏻ Logout'}
        </button>
      </div>
    </header>
  );
}
