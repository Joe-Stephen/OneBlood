'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard',      label: 'Dashboard',      icon: '🏠' },
  { href: '/requests',       label: 'Blood Requests',  icon: '🩸' },
  { href: '/donations',      label: 'My Donations',    icon: '📋' },
  { href: '/notifications',  label: 'Notifications',   icon: '🔔' },
  { href: '/profile',        label: 'Profile',         icon: '👤' },
];

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 6px 28px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 24 }}>🩸</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            One<span style={{ color: '#ef4444' }}>Blood</span>
          </span>
        </Link>
      </div>

      {/* SOS Button */}
      <Link href="/sos" className="btn btn-sos" style={{
        width: '100%', marginBottom: 20, fontSize: 13, padding: '12px',
      }}>
        🚨 Emergency SOS
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#ef4444',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 999,
              }}>
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          OneBlood Foundation<br />
          Non-profit · India
        </p>
      </div>
    </aside>
  );
}
