export default function AdminDashboard() {
  const stats = [
    { label: 'Total Donors',      value: '12,482', icon: '👥', color: '#60a5fa', trend: '+182 this week' },
    { label: 'Open Requests',     value: '47',     icon: '🩸', color: '#f87171', trend: '8 SOS active' },
    { label: 'Fulfillment Rate',  value: '94.2%',  icon: '✅', color: '#4ade80', trend: '+1.2% vs last month' },
    { label: 'Avg Response Time', value: '11 min', icon: '⚡', color: '#facc15', trend: '-2 min vs last month' },
  ];

  const recentActivity = [
    { type: 'SOS',     text: 'O− SOS request posted — Apollo Hospital, Bangalore', time: '2 min ago', dot: '#ef4444' },
    { type: 'DONOR',   text: 'New donor registered: Priya K. (A+) — Chennai',      time: '8 min ago', dot: '#60a5fa' },
    { type: 'FULFILL', text: 'B+ request fulfilled — Manipal Hospital, Mumbai',     time: '15 min ago', dot: '#4ade80' },
    { type: 'HOSP',    text: 'Fortis Hospital Pune submitted verification docs',    time: '1h ago',     dot: '#facc15' },
    { type: 'SOS',     text: 'AB− SOS request posted — AIIMS, Delhi',              time: '1h ago',     dot: '#ef4444' },
  ];

  const bloodTypeStats = [
    { type: 'O+',  donors: 3240, pct: 82 },
    { type: 'A+',  donors: 2810, pct: 71 },
    { type: 'B+',  donors: 2190, pct: 55 },
    { type: 'O−',  donors: 890,  pct: 22 },
    { type: 'AB+', donors: 750,  pct: 19 },
    { type: 'A−',  donors: 610,  pct: 15 },
    { type: 'B−',  donors: 420,  pct: 11 },
    { type: 'AB−', donors: 120,  pct: 3  },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Blood type distribution */}
        <div className="card">
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Donor Blood Type Distribution</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bloodTypeStats.map(b => (
              <div key={b.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, fontWeight: 700, color: '#f87171', fontSize: 14 }}>{b.type}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${b.pct}%`,
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {b.donors.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Live Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: a.dot,
                  marginTop: 5, flexShrink: 0,
                  boxShadow: `0 0 6px ${a.dot}`,
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 2 }}>{a.text}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
