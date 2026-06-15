'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BLOOD_TYPES = ['O_POS','O_NEG','A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG'] as const;
const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

const STEPS = ['Personal Details', 'Health Info', 'Location', 'Review'];

type BloodType = typeof BLOOD_TYPES[number];

interface FormState {
  name: string;
  phone: string;
  bloodType: BloodType;
  weightKg: number;
  dateOfBirth: string;
  city: string;
  state: string;
  lat: string;
  lon: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', bloodType: 'O_POS',
    weightKg: 65, dateOfBirth: '',
    city: '', state: '', lat: '', lon: '',
  });

  const update = (key: keyof FormState, val: string | number) =>
    setForm(f => ({ ...f, [key]: val }));

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      update('lat', String(pos.coords.latitude.toFixed(6)));
      update('lon', String(pos.coords.longitude.toFixed(6)));
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // In production: call donorsApi.createProfile + usersApi.updateMe
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--surface-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 32 }}>🩸</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>
            Complete Your <span style={{ color: '#ef4444' }}>Donor Profile</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Takes 2 minutes · Helps us match you with patients who need your blood type
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: i <= step ? '#ef4444' : 'var(--surface-4)',
                transition: 'background 0.3s',
              }} />
              <div style={{
                fontSize: 10, marginTop: 6, textAlign: 'center',
                color: i === step ? '#f87171' : 'var(--text-muted)',
                fontWeight: i === step ? 600 : 400,
              }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        <div className="card animate-fade-in">
          {/* Step 0 — Personal Details */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Personal Details</h2>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name *</label>
                <input className="input" placeholder="Your full name" value={form.name}
                  onChange={e => update('name', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Phone Number *</label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1 — Health Info */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Health Information</h2>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Blood Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {BLOOD_TYPES.map(bt => (
                    <button
                      key={bt} type="button"
                      onClick={() => update('bloodType', bt)}
                      className={form.bloodType === bt ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '12px', fontSize: 16, fontWeight: 700 }}
                    >
                      {BLOOD_LABELS[bt]}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Weight (kg) *</label>
                  <input className="input" type="number" min={45} max={300} value={form.weightKg}
                    onChange={e => update('weightKg', Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Date of Birth *</label>
                  <input className="input" type="date" value={form.dateOfBirth}
                    onChange={e => update('dateOfBirth', e.target.value)} />
                </div>
              </div>

              <div className="card" style={{
                background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', padding: 14,
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  ✅ You must be <strong>18–65 years</strong> old and weigh at least <strong>45 kg</strong> to donate.
                  Your health data is encrypted and never shared without consent.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Your Location</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                We use your location to match you with nearby blood requests. Your precise coordinates
                are only shared with hospitals when you accept a donation request.
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={detectLocation}
                style={{ width: '100%' }}
              >
                📍 Auto-detect My Location
              </button>

              {form.lat && (
                <div className="card" style={{ background: 'rgba(74,222,128,0.06)', borderColor: 'rgba(74,222,128,0.2)', padding: 12 }}>
                  <p style={{ fontSize: 13, color: '#4ade80' }}>
                    ✅ Location detected: {parseFloat(form.lat).toFixed(4)}°N, {parseFloat(form.lon).toFixed(4)}°E
                  </p>
                </div>
              )}

              <div className="divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>City *</label>
                  <input className="input" placeholder="Bangalore" value={form.city}
                    onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>State *</label>
                  <input className="input" placeholder="Karnataka" value={form.state}
                    onChange={e => update('state', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>Review & Submit</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Please verify your information before joining.</p>

              {[
                { label: 'Name',       value: form.name },
                { label: 'Phone',      value: form.phone },
                { label: 'Blood Type', value: BLOOD_LABELS[form.bloodType], highlight: true },
                { label: 'Weight',     value: `${form.weightKg} kg` },
                { label: 'DOB',        value: form.dateOfBirth },
                { label: 'City',       value: `${form.city}, ${form.state}` },
                { label: 'Location',   value: form.lat ? `${parseFloat(form.lat).toFixed(4)}°N, ${parseFloat(form.lon).toFixed(4)}°E` : 'Not set' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: item.highlight ? '#f87171' : 'var(--text-primary)', fontSize: 14 }}>
                    {item.value || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Not provided</span>}
                  </span>
                </div>
              ))}

              <div className="card" style={{
                background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)',
                padding: 14, marginTop: 8,
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  By clicking &quot;Join as Donor&quot; you agree to receive SMS and push notifications
                  when your blood type is needed nearby. You can update availability anytime.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => setStep(s => s + 1)}>
                Continue →
              </button>
            ) : (
              <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving...</>
                  : '🩸 Join as Donor'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 12 }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
