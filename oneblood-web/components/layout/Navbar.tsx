'use client';
import Link from 'next/link';

export function Navbar({ userName, userRole }: { userName: string; userRole: string }) {
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
      </div>
    </header>
  );
}
