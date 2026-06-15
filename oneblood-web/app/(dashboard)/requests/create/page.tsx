'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BLOOD_TYPES = ['O_POS','O_NEG','A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG'];
const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

export default function CreateRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    bloodType: 'O_POS', unitsRequired: 1, hospitalName: '',
    urgencyLevel: 'NORMAL', contactName: '', contactPhone: '', notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In production: call API
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    router.push('/requests');
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Post Blood Request</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Fill in the details below. Compatible donors near the hospital will be notified instantly.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Blood type */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Blood Type Required *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {BLOOD_TYPES.map(bt => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, bloodType: bt }))}
                  className={form.bloodType === bt ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '10px', fontSize: 15, fontWeight: 700 }}
                >
                  {BLOOD_LABELS[bt]}
                </button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Units Required *
            </label>
            <input
              className="input"
              type="number" min={1} max={20}
              value={form.unitsRequired}
              onChange={e => setForm(f => ({ ...f, unitsRequired: Number(e.target.value) }))}
            />
          </div>

          {/* Hospital */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Hospital Name *
            </label>
            <input
              className="input"
              type="text" placeholder="e.g. Apollo Hospital, Bangalore"
              value={form.hospitalName}
              onChange={e => setForm(f => ({ ...f, hospitalName: e.target.value }))}
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Urgency Level *
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['NORMAL', 'URGENT', 'SOS'] as const).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, urgencyLevel: u }))}
                  className={form.urgencyLevel === u ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ flex: 1 }}
                >
                  {u === 'SOS' ? '🚨 ' : u === 'URGENT' ? '⚡ ' : '🩸 '}{u}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Contact Name *
              </label>
              <input
                className="input"
                type="text" placeholder="Dr. Name / Patient"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Contact Phone *
              </label>
              <input
                className="input"
                type="tel" placeholder="+91 98765 43210"
                value={form.contactPhone}
                onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              Additional Notes
            </label>
            <textarea
              className="input"
              rows={3} placeholder="Any additional information..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${isSubmitting ? '' : ''}`}
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            {isSubmitting ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Posting Request...</>
            ) : (
              '🩸 Post Blood Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
