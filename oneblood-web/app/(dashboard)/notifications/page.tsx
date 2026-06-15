const MOCK_NOTIFS = [
  { id: '1', type: 'SOS_ALERT',          body: '🚨 O+ blood needed 1.2km away at Apollo Hospital — SOS!', read: false, time: '5 min ago' },
  { id: '2', type: 'BLOOD_REQUEST_MATCH',body: 'A− blood needed 3.8km away at Manipal Hospital. Urgency: HIGH', read: false, time: '23 min ago' },
  { id: '3', type: 'DONOR_ACCEPTED',     body: 'Rahul M. has accepted your blood request. They are on their way.', read: false, time: '1h ago' },
  { id: '4', type: 'REQUEST_FULFILLED',  body: 'Your blood request has been fulfilled. Thank you to all donors!', read: true, time: '3h ago' },
  { id: '5', type: 'COOLDOWN_ENDED',     body: 'You are now eligible to donate blood again. Be a hero today!', read: true, time: '2d ago' },
];

const TYPE_ICONS: Record<string, string> = {
  SOS_ALERT: '🚨', BLOOD_REQUEST_MATCH: '🩸',
  DONOR_ACCEPTED: '✅', REQUEST_FULFILLED: '🎉', COOLDOWN_ENDED: '💪',
};

export default function NotificationsPage() {
  const unread = MOCK_NOTIFS.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {unread} unread notification{unread !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm">Mark all read</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MOCK_NOTIFS.map(n => (
          <div
            key={n.id}
            style={{
              display: 'flex', gap: 14, padding: '16px 20px',
              borderRadius: 14, cursor: 'pointer',
              background: n.read ? 'var(--surface-1)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${n.read ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`,
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: n.read ? 'var(--surface-3)' : 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {TYPE_ICONS[n.type] ?? '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, lineHeight: 1.5, marginBottom: 4,
                color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                fontWeight: n.read ? 400 : 500,
              }}>
                {n.body}
              </p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.time}</span>
            </div>
            {!n.read && <div className="notif-dot" style={{ flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
