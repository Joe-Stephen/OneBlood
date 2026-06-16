'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-0)' }}>
      <Sidebar unreadCount={3} isAdmin={user?.role === 'ADMIN'} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar userName={user?.name || 'User'} userRole={user?.role || 'DONOR'} />
        <main style={{
          flex: 1, overflowY: 'auto', padding: 28,
          background: 'var(--surface-0)',
        }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

