const MOCK_HOSPITALS = [
  { id: '1', name: 'Apollo Hospital',          city: 'Bangalore', state: 'Karnataka', status: 'VERIFIED',  beds: 500, requestsHandled: 142, verifiedAt: 'Jan 5, 2025' },
  { id: '2', name: 'Manipal Hospital',         city: 'Bangalore', state: 'Karnataka', status: 'VERIFIED',  beds: 350, requestsHandled: 98,  verifiedAt: 'Feb 12, 2025' },
  { id: '3', name: 'Fortis Hospital',          city: 'Mumbai',    state: 'Maharashtra',status: 'VERIFIED',  beds: 420, requestsHandled: 87,  verifiedAt: 'Mar 1, 2025' },
  { id: '4', name: 'AIIMS',                    city: 'Delhi',     state: 'Delhi',      status: 'VERIFIED',  beds: 1200,requestsHandled: 310, verifiedAt: 'Nov 20, 2024' },
  { id: '5', name: 'Kauvery Hospital',         city: 'Chennai',   state: 'Tamil Nadu', status: 'PENDING',   beds: 280, requestsHandled: 0,   verifiedAt: null },
  { id: '6', name: 'Rainbow Children Hospital',city: 'Hyderabad', state: 'Telangana',  status: 'PENDING',   beds: 160, requestsHandled: 0,   verifiedAt: null },
  { id: '7', name: 'SUT Hospital',             city: 'Trivandrum',state: 'Kerala',     status: 'REJECTED',  beds: 200, requestsHandled: 0,   verifiedAt: null },
];

const STATUS_CLASSES: Record<string, string> = {
  VERIFIED: 'badge-fulfilled', PENDING: 'badge-yellow', REJECTED: 'badge-expired',
};

export default function AdminHospitalsPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Hospital Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Verify and manage partner hospitals</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" placeholder="Search hospitals..." style={{ width: 220 }} />
          <button className="btn btn-primary">+ Add Hospital</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Verified',  value: '4',  color: '#4ade80' },
          { label: 'Pending',   value: '2',  color: '#facc15' },
          { label: 'Rejected',  value: '1',  color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>Location</th>
              <th>Status</th>
              <th>Beds</th>
              <th>Requests Handled</th>
              <th>Verified On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HOSPITALS.map(h => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                  {h.name}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {h.city}, {h.state}
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASSES[h.status] ?? 'badge-gray'}`}>
                    {h.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{h.beds.toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{h.requestsHandled}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {h.verifiedAt ?? '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    {h.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
                          ✅ Verify
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ fontSize: 11, color: '#f87171' }}>
                          ✗ Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
