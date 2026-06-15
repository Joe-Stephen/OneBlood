export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const MOCK = {
    id: params.id,
    bloodType: 'O_POS', urgencyLevel: 'SOS', status: 'OPEN',
    hospital: 'Apollo Hospital, Whitefield, Bangalore',
    unitsRequired: 2, unitsFulfilled: 0,
    contactName: 'Dr. Priya Sharma', contactPhone: '+91 98765 43210',
    notes: 'Post-operative patient, requires within 2 hours. O negative also acceptable.',
    createdAt: '2026-06-15T09:00:00Z', expiresAt: '2026-06-15T15:00:00Z',
    acceptedDonors: [
      { donorName: 'Rahul M.', bloodType: 'O_POS', distanceKm: 1.8, respondedAt: '2026-06-15T09:04:00Z' },
    ],
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span className="badge badge-sos">🚨 SOS</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Request #{MOCK.id}</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          O+ Blood Needed Urgently
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{MOCK.hospital}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Request Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Blood Type', value: 'O+', highlight: true },
                { label: 'Units Required', value: `${MOCK.unitsRequired} units` },
                { label: 'Units Fulfilled', value: `${MOCK.unitsFulfilled}/${MOCK.unitsRequired}` },
                { label: 'Contact', value: MOCK.contactName },
                { label: 'Phone', value: MOCK.contactPhone },
                { label: 'Expires', value: '6 hours remaining' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 600, color: item.highlight ? '#f87171' : 'var(--text-primary)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {MOCK.notes && (
              <>
                <div className="divider" style={{ margin: '16px 0' }} />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{MOCK.notes}</div>
              </>
            )}
          </div>

          {/* Accepted Donors */}
          <div className="card">
            <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
              Accepted Donors ({MOCK.acceptedDonors.length})
            </h2>
            {MOCK.acceptedDonors.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#f87171', fontWeight: 700,
                }}>
                  {d.bloodType.replace('_POS','+')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.donorName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {d.distanceKm} km away · Responded {new Date(d.respondedAt).toLocaleTimeString()}
                  </div>
                </div>
                <span className="badge badge-green">En route</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action sidebar */}
        <div className="card card-brand" style={{ position: 'sticky', top: 88 }}>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: '#f87171' }}>
            Can you help?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Your O+ blood is compatible. The hospital is 1.2 km from your location.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}>
            ✅ Accept — I Can Donate
          </button>
          <button className="btn btn-ghost" style={{ width: '100%' }}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
