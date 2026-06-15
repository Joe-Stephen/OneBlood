'use client';
import { useState } from 'react';

const BLOOD_TYPES = ['O_POS','O_NEG','A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG'];
const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

export default function ProfilePage() {
  const [availability, setAvailability] = useState(true);

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your donor profile and settings</p>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            JD
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Joe Stephen</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>joe@example.com</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-red">O+</span>
              <span className="badge badge-blue">DONOR</span>
              <span className="badge badge-green">Eligible</span>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Availability
              </label>
              <button
                id="availability-toggle"
                onClick={() => setAvailability(!availability)}
                style={{
                  width: 48, height: 26, borderRadius: 999, border: 'none',
                  background: availability ? '#ef4444' : 'var(--surface-4)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: availability ? 24 : 4,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: availability ? '#4ade80' : 'var(--text-muted)', textAlign: 'right' }}>
              {availability ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Donor Details */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Donor Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Full Name', value: 'Joe Stephen', id: 'name' },
            { label: 'Phone', value: '+91 98765 43210', id: 'phone' },
            { label: 'City', value: 'Bangalore', id: 'city' },
            { label: 'State', value: 'Karnataka', id: 'state' },
            { label: 'Weight', value: '72 kg', id: 'weight' },
            { label: 'Date of Birth', value: '1995-04-15', id: 'dob' },
          ].map(field => (
            <div key={field.id}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                id={field.id}
                className="input"
                defaultValue={field.value}
                style={{ fontSize: 14 }}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 20 }}>
          Save Changes
        </button>
      </div>

      {/* Blood Type (read-only) */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Blood Type</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Blood type cannot be changed after initial setup. Contact support if there was an error.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {BLOOD_TYPES.map(bt => (
            <div
              key={bt}
              className={bt === 'O_POS' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: 15, opacity: bt !== 'O_POS' ? 0.4 : 1 }}
            >
              {BLOOD_LABELS[bt]}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, color: '#f87171', marginBottom: 12 }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Permanently delete your account. This action cannot be undone.
        </p>
        <button className="btn btn-secondary btn-sm" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
