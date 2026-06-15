const MOCK_DONATIONS = [
  { id: '1', hospital: 'Apollo Hospital', type: 'Whole Blood',     units: 1, date: 'Sept 1, 2025',  nextEligible: 'Nov 30, 2025' },
  { id: '2', hospital: 'Manipal Hospital',type: 'Platelets',       units: 2, date: 'May 15, 2025',  nextEligible: 'May 29, 2025' },
  { id: '3', hospital: 'Fortis Hospital', type: 'Whole Blood',     units: 1, date: 'Jan 10, 2025',  nextEligible: 'Apr 10, 2025' },
  { id: '4', hospital: 'St. John\'s',     type: 'Plasma',          units: 1, date: 'Aug 20, 2024',  nextEligible: 'Sept 17, 2024' },
  { id: '5', hospital: 'NIMHANS',         type: 'Whole Blood',     units: 1, date: 'Mar 5, 2024',   nextEligible: 'June 3, 2024' },
  { id: '6', hospital: 'Apollo Hospital', type: 'Double Red Cells',units: 1, date: 'Oct 12, 2023',  nextEligible: 'Feb 29, 2024' },
  { id: '7', hospital: 'Manipal Hospital',type: 'Whole Blood',     units: 1, date: 'June 1, 2023',  nextEligible: 'Aug 30, 2023' },
];

const TYPE_COLORS: Record<string, string> = {
  'Whole Blood': '#f87171',
  'Platelets': '#60a5fa',
  'Plasma': '#4ade80',
  'Double Red Cells': '#a78bfa',
};

export default function DonationsPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>My Donations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Your complete donation history
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Donations', value: '7',  icon: '🩸', color: '#ef4444' },
          { label: 'Lives Impacted',  value: '21', icon: '❤️', color: '#f87171' },
          { label: 'Units Donated',   value: '8',  icon: '💉', color: '#60a5fa' },
          { label: 'Years Donating',  value: '3',  icon: '📅', color: '#4ade80' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 600, fontSize: 15 }}>Donation History</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Hospital</th>
              <th>Type</th>
              <th>Units</th>
              <th>Next Eligible</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DONATIONS.map(d => (
              <tr key={d.id}>
                <td style={{ color: 'var(--text-secondary)' }}>{d.date}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.hospital}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600,
                    color: TYPE_COLORS[d.type] ?? '#9494a8',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: TYPE_COLORS[d.type] ?? '#9494a8',
                    }} />
                    {d.type}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.units}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.nextEligible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
