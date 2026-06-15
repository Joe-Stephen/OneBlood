import Link from 'next/link';

const MOCK_REQUESTS = [
  { id: '1', bloodType: 'O_POS', urgencyLevel: 'SOS',    status: 'OPEN',              hospital: 'Apollo Hospital, Bangalore',    units: 2, fulfilled: 0, distance: '1.2 km', time: '5 min ago' },
  { id: '2', bloodType: 'A_NEG', urgencyLevel: 'URGENT', status: 'PARTIALLY_MATCHED', hospital: 'Manipal Hospital, Bangalore',   units: 3, fulfilled: 1, distance: '3.8 km', time: '23 min ago' },
  { id: '3', bloodType: 'B_POS', urgencyLevel: 'NORMAL', status: 'OPEN',              hospital: 'Fortis Hospital, Bangalore',    units: 1, fulfilled: 0, distance: '6.1 km', time: '1h ago' },
  { id: '4', bloodType: 'AB_NEG',urgencyLevel: 'URGENT', status: 'FULFILLED',         hospital: 'St. John\'s Hospital, Bangalore',units:2,  fulfilled: 2, distance: '9.4 km', time: '3h ago' },
  { id: '5', bloodType: 'O_NEG', urgencyLevel: 'NORMAL', status: 'EXPIRED',           hospital: 'NIMHANS, Bangalore',           units: 1, fulfilled: 0, distance: '12 km',  time: '1d ago' },
];

const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

const STATUS_CLASSES: Record<string, string> = {
  OPEN: 'badge-open', PARTIALLY_MATCHED: 'badge-partially',
  FULFILLED: 'badge-fulfilled', EXPIRED: 'badge-expired', CANCELLED: 'badge-cancelled',
};

export default function RequestsPage() {
  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Blood Requests</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Active and recent blood requests near you</p>
        </div>
        <Link href="/requests/create" className="btn btn-primary">
          + Post Request
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'SOS', 'Urgent', 'Normal', 'Fulfilled'].map(f => (
          <button key={f} className={`btn ${f === 'All' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Hospital</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Units</th>
              <th>Distance</th>
              <th>Posted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REQUESTS.map(r => (
              <tr key={r.id}>
                <td>
                  <span style={{ fontWeight: 700, color: '#f87171', fontSize: 15 }}>
                    {BLOOD_LABELS[r.bloodType]}
                  </span>
                </td>
                <td style={{ maxWidth: 220 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {r.hospital}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    r.urgencyLevel === 'SOS' ? 'badge-sos' :
                    r.urgencyLevel === 'URGENT' ? 'badge-urgent' : 'badge-normal'
                  }`}>
                    {r.urgencyLevel}
                  </span>
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASSES[r.status] ?? 'badge-gray'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {r.fulfilled}/{r.units}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.distance}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.time}</td>
                <td>
                  {r.status === 'OPEN' || r.status === 'PARTIALLY_MATCHED' ? (
                    <Link href={`/requests/${r.id}`} className="btn btn-primary btn-sm">
                      Respond
                    </Link>
                  ) : (
                    <Link href={`/requests/${r.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
