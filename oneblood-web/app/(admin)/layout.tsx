import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-0)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar userName="Admin" userRole="ADMIN" />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
