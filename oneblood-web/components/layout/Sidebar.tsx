'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DONOR_NAV = [
  { href: '/dashboard',      label: 'Dashboard',     icon: '🏠' },
  { href: '/requests',       label: 'Blood Requests', icon: '🩸' },
  { href: '/donations',      label: 'My Donations',   icon: '📋' },
  { href: '/notifications',  label: 'Notifications',  icon: '🔔' },
  { href: '/profile',        label: 'Profile',        icon: '👤' },
];

const ADMIN_NAV = [
  { href: '/admin/dashboard',  label: 'Dashboard',   icon: '📊' },
  { href: '/admin/users',      label: 'Users',       icon: '👥' },
  { href: '/admin/hospitals',  label: 'Hospitals',   icon: '🏥' },
  { href: '/admin/analytics',  label: 'Analytics',   icon: '📈' },
];

interface SidebarProps {
  unreadCount?: number;
  isAdmin?: boolean;
}

export function Sidebar({ unreadCount = 0, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? ADMIN_NAV : DONOR_NAV;

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
      <div style={{ padding: '0 6px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 24 }}>🩸</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            One<span style={{ color: '#ef4444' }}>Blood</span>
          </span>
        </Link>
        {isAdmin && (
          <div style={{
            marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, color: '#f87171', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <span>⚙️</span> Admin Console
          </div>
        )}
      </div>

      {/* SOS Button — only for donors */}
      {!isAdmin && (
        <Link href="/sos" className="btn btn-sos" style={{
          width: '100%', marginBottom: 16, fontSize: 13, padding: '11px',
        }}>
          🚨 Emergency SOS
        </Link>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const isActive = item.href === '/dashboard' || item.href === '/admin/dashboard'
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 999,
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Switch role link */}
      {isAdmin && (
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <Link href="/dashboard" className="sidebar-link" style={{ fontSize: 12 }}>
            <span>←</span> Donor View
          </Link>
        </div>
      )}

      {/* Footer */}
      <div style={{ paddingTop: 16, borderTop: isAdmin ? 'none' : '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          OneBlood Foundation<br />
          Non-profit · India
        </p>
      </div>
    </aside>
  );
}
