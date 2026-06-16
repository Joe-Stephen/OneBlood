'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usersApi, donorsApi, ApiError } from '@/lib/api/client';
import type { ApiResponse, User } from '@/types';

const BLOOD_TYPES = ['O_POS','O_NEG','A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG'];
const BLOOD_LABELS: Record<string, string> = {
  O_POS:'O+', O_NEG:'O−', A_POS:'A+', A_NEG:'A−',
  B_POS:'B+', B_NEG:'B−', AB_POS:'AB+', AB_NEG:'AB−',
};

interface DBProfile {
  id: string;
  user_id: string;
  blood_type: string;
  weight_kg: number;
  date_of_birth: string | Date;
  city: string;
  state: string;
  availability_status: string;
  next_eligible_date: string | Date | null;
  is_eligible: boolean;
  created_at: string;
}

interface EligibilityInfo {
  isEligible: boolean;
  availabilityStatus: string;
  nextEligibleDate: string | Date | null;
  cooldownDaysRemaining: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { accessToken, user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [weight, setWeight] = useState(0);
  const [dob, setDob] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('O_POS');
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!accessToken) return;
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch user (critical)
        try {
          const userRes = await usersApi.getMe(accessToken) as ApiResponse<User>;
          if (userRes.success && userRes.data) {
            setName(userRes.data.name || '');
            setPhone(userRes.data.phone || '');
          }
        } catch (err) {
          console.error('Failed to load user details:', err);
          throw err;
        }

        // 2. Fetch profile (optional, might be 404)
        try {
          const profileRes = await donorsApi.getProfile(accessToken) as ApiResponse<DBProfile>;
          if (profileRes.success && profileRes.data) {
            setProfile(profileRes.data);
            setSelectedBloodType(profileRes.data.blood_type || 'O_POS');
            setCity(profileRes.data.city || '');
            setState(profileRes.data.state || '');
            setWeight(profileRes.data.weight_kg || 0);
            
            const dobVal = profileRes.data.date_of_birth;
            if (dobVal) {
              const dobString = typeof dobVal === 'string'
                ? dobVal.split('T')[0]
                : new Date(dobVal).toISOString().split('T')[0];
              setDob(dobString);
            }
            
            setAvailability(profileRes.data.availability_status === 'ACTIVE');
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            console.log('No donor profile found for this user.');
          } else {
            console.error('Failed to load donor profile:', err);
          }
        }

        // 3. Fetch eligibility (optional, might be 404)
        try {
          const eligibilityRes = await donorsApi.getEligibility(accessToken) as ApiResponse<EligibilityInfo>;
          if (eligibilityRes.success && eligibilityRes.data) {
            setEligibility(eligibilityRes.data);
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            console.log('No eligibility data found.');
          } else {
            console.error('Failed to load eligibility details:', err);
          }
        }
      } catch (err) {
        console.error('Error during data loading:', err);
        const message = err instanceof Error ? err.message : 'Failed to load details.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [accessToken]);

  const handleSave = async () => {
    if (!name || !phone || !city || !state || !weight || !dob) {
      alert('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    try {
      if (!accessToken) throw new Error('No session active. Please log in.');

      // 1. Update basic details
      await usersApi.updateMe(accessToken, { name, phone });

      if (!profile) {
        // Create profile
        const latNum = 12.9716; // default
        const lonNum = 77.5946; // default

        const newProfile = await donorsApi.createProfile(accessToken, {
          bloodType: selectedBloodType,
          weightKg: Number(weight),
          dateOfBirth: dob,
          city,
          state,
          location: {
            lat: latNum,
            lon: lonNum,
          },
        }) as ApiResponse<DBProfile>;

        if (newProfile?.success && newProfile?.data) {
          setProfile(newProfile.data);
        }

        // Update local Zustand store
        updateUser({ name, phone, isProfileComplete: true });
        alert('Donor profile created successfully!');
        window.location.reload(); // Reload to refresh eligibility
      } else {
        // Update profile
        const updatedProfile = await donorsApi.updateProfile(accessToken, {
          weightKg: Number(weight),
          city,
          state,
        }) as ApiResponse<DBProfile>;

        if (updatedProfile?.success && updatedProfile?.data) {
          setProfile(updatedProfile.data);
        }

        // Update local Zustand store
        updateUser({ name, phone });
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save profile changes:', err);
      const message = err instanceof Error ? err.message : 'Failed to save changes.';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) {
      alert('Please complete and save your profile details first to toggle availability.');
      return;
    }

    const nextVal = !availability;
    setAvailability(nextVal); // Optimistic update
    try {
      if (!accessToken) throw new Error('No session active');
      await donorsApi.updateProfile(accessToken, {
        availabilityStatus: nextVal ? 'ACTIVE' : 'INACTIVE',
      });
      
      setEligibility((prev) =>
        prev ? { ...prev, availabilityStatus: nextVal ? 'ACTIVE' : 'INACTIVE' } : null
      );
    } catch (err) {
      console.error('Failed to update availability status:', err);
      setAvailability(!nextVal); // Revert
      alert('Failed to update availability status.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      if (!accessToken) throw new Error('No session active');
      await usersApi.deleteMe(accessToken);
      
      await fetch('/api/auth/logout', { method: 'POST' });
      useAuthStore.getState().clearAuth();
      router.push('/login');
    } catch (err) {
      console.error('Failed to delete account:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete account.';
      alert(message);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 720, borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <h2 style={{ fontWeight: 600, fontSize: 16, color: '#f87171', marginBottom: 8 }}>Error Loading Profile</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const isEligible = eligibility?.isEligible ?? profile?.is_eligible ?? true;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your donor profile and settings</p>
      </div>

      {!profile && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <p style={{ fontSize: 13, color: '#f87171', margin: 0, fontWeight: 500 }}>
            ⚠️ You have not set up your donor profile yet. Complete the details below and select your blood group to activate your profile.
          </p>
        </div>
      )}

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {getInitials(name || user?.name || '')}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{name || user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-red">{BLOOD_LABELS[selectedBloodType]}</span>
              <span className="badge badge-blue">{user?.role || 'DONOR'}</span>
              <span className={`badge ${isEligible ? 'badge-green' : 'badge-red'}`}>
                {isEligible ? 'Eligible' : 'Cooldown'}
              </span>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Availability
              </label>
              <button
                id="availability-toggle"
                onClick={handleToggleAvailability}
                style={{
                  width: 48, height: 26, borderRadius: 999, border: 'none',
                  background: availability ? '#ef4444' : 'var(--surface-4)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  opacity: profile ? 1 : 0.5,
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
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              Phone *
            </label>
            <input
              id="phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              City *
            </label>
            <input
              id="city"
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              State *
            </label>
            <input
              id="state"
              className="input"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              Weight (kg) *
            </label>
            <input
              id="weight"
              type="number"
              className="input"
              value={weight || ''}
              onChange={(e) => setWeight(Number(e.target.value))}
              style={{ fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              Date of Birth *
            </label>
            <input
              id="dob"
              type="date"
              className="input"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
          {profile ? (saving ? 'Saving...' : 'Save Changes') : (saving ? 'Creating...' : 'Create Profile')}
        </button>
      </div>

      {/* Blood Type */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Blood Type</h2>
        {profile ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Blood type cannot be changed after initial setup. Contact support if there was an error.
          </p>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Select your blood type to complete registration.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {BLOOD_TYPES.map(bt => (
            <button
              key={bt}
              type="button"
              disabled={!!profile}
              onClick={() => setSelectedBloodType(bt)}
              className={bt === selectedBloodType ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                textAlign: 'center',
                padding: '10px',
                fontWeight: 700,
                fontSize: 15,
                cursor: profile ? 'default' : 'pointer',
                opacity: bt !== selectedBloodType ? 0.4 : 1
              }}
            >
              {BLOOD_LABELS[bt]}
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <h2 style={{ fontWeight: 600, fontSize: 15, color: '#f87171', marginBottom: 12 }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Permanently delete your account. This action cannot be undone.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={handleDeleteAccount} style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
