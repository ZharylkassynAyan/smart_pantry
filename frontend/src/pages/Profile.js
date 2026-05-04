import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [householdName, setHouseholdName] = useState(user?.household?.name || '');
  const [membersCount, setMembersCount] = useState(user?.household?.membersCount || 1);
  const [expiryAlerts, setExpiryAlerts] = useState(user?.notifications?.expiryAlerts ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await updateProfile({
        name,
        household: { name: householdName, membersCount: Number(membersCount) },
        notifications: { expiryAlerts },
      });
      updateUser(updated);
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px' }}>
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account and household preferences</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSave}>
        {/* Account Info */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2 style={styles.sectionTitle}>Account</h2>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <small style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
              Email cannot be changed
            </small>
          </div>
        </div>

        {/* Household Settings */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2 style={styles.sectionTitle}>Household</h2>

          <div className="form-group">
            <label className="form-label">Household Name</label>
            <input
              className="form-input"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Smith Family"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Number of Members</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="20"
              value={membersCount}
              onChange={(e) => setMembersCount(e.target.value)}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={styles.sectionTitle}>Notifications</h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Expiry Alerts</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Get notified when items are about to expire
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={expiryAlerts}
                onChange={(e) => setExpiryAlerts(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
  },
};

export default Profile;
