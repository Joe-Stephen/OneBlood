import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

// In real app: session from httpOnly cookie via server-side fetch
// For now, we render with placeholder session data
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-0)' }}>
      <Sidebar unreadCount={3} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar userName="User" userRole="DONOR" />
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
