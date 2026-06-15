import Link from 'next/link';

const stats = [
  { value: '1.2M+', label: 'Registered Donors' },
  { value: '94%',   label: 'SOS Fulfillment Rate' },
  { value: '11 min',label: 'Avg. Response Time' },
  { value: '28',    label: 'States Covered' },
];

const bloodTypes = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface-0)', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🩸</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
            One<span style={{ color: '#ef4444' }}>Blood</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Donate Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: '100px 48px 80px',
        textAlign: 'center',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '25%', right: '8%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(185,28,28,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(60px)',
        }} />

        <span className="badge badge-red" style={{ marginBottom: 24, fontSize: 12 }}>
          🇮🇳 India&apos;s #1 Blood Network
        </span>

        <h1 className="heading-1" style={{ marginBottom: 24, position: 'relative' }}>
          Every Second Counts.<br />
          <span className="text-gradient">Find Donors Instantly.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560,
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          OneBlood connects patients with compatible blood donors across India in minutes.
          Real-time matching, SOS alerts, and a community of 1.2M+ registered donors.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn btn-sos" style={{ fontSize: 16, padding: '16px 36px' }}>
            🚨 Emergency SOS Request
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Register as Donor →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: 1100, margin: '0 auto 80px', padding: '0 48px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
      }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f87171', marginBottom: 6 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Blood types */}
      <section style={{
        maxWidth: 1100, margin: '0 auto 80px', padding: '0 48px', textAlign: 'center',
      }}>
        <h2 className="heading-3" style={{ marginBottom: 8 }}>All Blood Types Covered</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
          Our matching engine knows exactly which donors can donate to which recipients.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {bloodTypes.map(bt => (
            <div key={bt} className="card" style={{
              padding: '16px 24px', textAlign: 'center', minWidth: 80,
              fontSize: 20, fontWeight: 700, color: '#f87171',
            }}>
              {bt}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 48px' }}>
        <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: 48 }}>
          How <span className="text-gradient">OneBlood</span> Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { icon: '📍', step: '01', title: 'Post a Request', desc: 'Enter blood type, hospital, and urgency level. Our engine instantly finds compatible donors near you.' },
            { icon: '🔔', step: '02', title: 'Donors Get Alerted', desc: 'Matched donors receive push notifications and SMS within seconds. SOS broadcasts reach 50km radius.' },
            { icon: '🏥', step: '03', title: 'Blood Arrives', desc: 'Donors accept the request, head to hospital, and you get real-time status updates the entire way.' },
          ].map(item => (
            <div key={item.step} className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -12, right: 20,
                fontSize: 11, fontWeight: 800, color: 'rgba(239,68,68,0.3)',
                letterSpacing: '0.1em',
              }}>
                {item.step}
              </div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 10, color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 800, margin: '0 auto 100px', padding: '0 48px', textAlign: 'center',
      }}>
        <div className="card card-brand" style={{ padding: '60px 48px' }}>
          <h2 className="heading-2" style={{ marginBottom: 16 }}>
            Ready to Save a Life?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
            Join 1.2M+ donors across India. Your blood can save up to 3 lives per donation.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Get Started — It&apos;s Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 48px',
        textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
      }}>
        © 2026 OneBlood Foundation · Non-profit · DPDP Act 2023 Compliant
      </footer>
    </main>
  );
}
