const MOCK_USERS = [
  { id: '1', name: 'Priya Sharma',  email: 'priya@example.com', role: 'DONOR', bloodType: 'O+', city: 'Bangalore', isActive: true,  donations: 7,  createdAt: 'Jan 10, 2025' },
  { id: '2', name: 'Rahul Kumar',   email: 'rahul@example.com', role: 'DONOR', bloodType: 'A+', city: 'Mumbai',    isActive: true,  donations: 3,  createdAt: 'Feb 5, 2025' },
  { id: '3', name: 'Anjali Menon',  email: 'anjali@example.com',role: 'ADMIN', bloodType: 'B+', city: 'Chennai',   isActive: true,  donations: 0,  createdAt: 'Mar 1, 2024' },
  { id: '4', name: 'Vikram Singh',  email: 'vikram@example.com',role: 'DONOR', bloodType: 'AB−',city: 'Delhi',     isActive: false, donations: 12, createdAt: 'Nov 20, 2023' },
  { id: '5', name: 'Meera Pillai',  email: 'meera@example.com', role: 'DONOR', bloodType: 'O−', city: 'Hyderabad', isActive: true,  donations: 5,  createdAt: 'April 14, 2025' },
];

export default function AdminUsersPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage donor and admin accounts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" placeholder="Search users..." style={{ width: 220 }} />
          <select className="input" style={{ width: 140 }}>
            <option>All Roles</option>
            <option>DONOR</option>
            <option>ADMIN</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users',   value: '12,482', color: '#60a5fa' },
          { label: 'Active Donors', value: '10,891', color: '#4ade80' },
          { label: 'Suspended',     value: '47',     color: '#f87171' },
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
              <th>User</th>
              <th>Role</th>
              <th>Blood Type</th>
              <th>City</th>
              <th>Donations</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : 'badge-blue'}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#f87171' }}>{u.bloodType}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.city}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.donations}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.createdAt}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: 11 }}>
                      {u.isActive ? 'Suspend' : 'Reactivate'}
                    </button>
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
