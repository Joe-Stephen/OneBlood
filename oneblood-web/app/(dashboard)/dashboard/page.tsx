import Link from 'next/link';

const MOCK_REQUESTS = [
  { id: '1', bloodType: 'O_POS', urgencyLevel: 'SOS',    status: 'OPEN', hospital: 'Apollo Hospital, Bangalore', units: 2, distance: '1.2 km' },
  { id: '2', bloodType: 'A_NEG', urgencyLevel: 'URGENT', status: 'OPEN', hospital: 'Manipal Hospital, Bangalore', units: 1, distance: '3.8 km' },
  { id: '3', bloodType: 'B_POS', urgencyLevel: 'NORMAL', status: 'OPEN', hospital: 'Fortis Hospital, Bangalore',  units: 3, distance: '6.1 km' },
];

const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

function UrgencyBadge({ level }: { level: string }) {
  const cls = level === 'SOS' ? 'badge-sos' : level === 'URGENT' ? 'badge-urgent' : 'badge-normal';
  return <span className={`badge ${cls}`}>{level}</span>;
}

export default function DashboardPage() {
  const stats = [
    { label: 'Total Donations', value: '7',   icon: '🩸', color: '#ef4444' },
    { label: 'Lives Impacted',  value: '21',  icon: '❤️', color: '#f87171' },
    { label: 'Next Eligible',   value: 'Now', icon: '✅', color: '#4ade80' },
    { label: 'Requests Nearby', value: '12',  icon: '📍', color: '#60a5fa' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Donor Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Your donation activity and nearby blood requests
        </p>
      </div>

      {/* SOS CTA */}
      <div className="card card-brand" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, padding: '20px 24px',
      }}>
        <div>
          <h2 style={{ color: '#f87171', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
            🚨 Emergency Blood Needed?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Instantly alert compatible donors within 50km
          </p>
        </div>
        <Link href="/sos" className="btn btn-sos" style={{ flexShrink: 0 }}>
          Send SOS Now
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Requests */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 600, fontSize: 16 }}>Active Blood Requests Near You</h2>
          <Link href="/requests" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_REQUESTS.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 16px', borderRadius: 12,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: '#f87171', flexShrink: 0,
              }}>
                {BLOOD_LABELS[r.bloodType]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {r.hospital}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {r.units} unit{r.units !== 1 ? 's' : ''} needed · {r.distance} away
                </div>
              </div>
              <UrgencyBadge level={r.urgencyLevel} />
              <Link href={`/requests/${r.id}`} className="btn btn-primary btn-sm">
                Respond
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Eligibility Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🩺 Donation Eligibility</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(74,222,128,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>✅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#4ade80' }}>Eligible to Donate</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active cooldown period</div>
            </div>
          </div>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Last donation</span>
            <span style={{ color: 'var(--text-secondary)' }}>Sept 1, 2025</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>Next eligible</span>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>Now</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>📊 Donation History</h3>
          {[
            { date: 'Sept 1, 2025',  hospital: 'Apollo Hospital',  type: 'Whole Blood', units: 1 },
            { date: 'May 15, 2025',  hospital: 'Manipal Hospital', type: 'Platelets',   units: 2 },
            { date: 'Jan 10, 2025',  hospital: 'Fortis Hospital',  type: 'Whole Blood', units: 1 },
          ].map((d, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, paddingBottom: 12,
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              marginBottom: i < 2 ? 12 : 0,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444', marginTop: 5, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.hospital}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.type} · {d.units} unit · {d.date}</div>
              </div>
            </div>
          ))}
          <Link href="/donations" className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%' }}>
            View All Donations →
          </Link>
        </div>
      </div>
    </div>
  );
}
