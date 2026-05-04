import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPantryItems, getExpiringItems } from '../services/api';

const StatCard = ({ label, value, note, color }) => (
  <div
    className="card"
    style={{ borderTop: `3px solid ${color}`, flex: '1', minWidth: '140px' }}
  >
    <div style={{ fontSize: '28px', fontWeight: '600', color }}>{value}</div>
    <div style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>{label}</div>
    {note && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{note}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPantryItems(), getExpiringItems()])
      .then(([allItems, expiringItems]) => {
        setItems(allItems);
        setExpiring(expiringItems);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const expired = items.filter((i) => new Date(i.expiryDate) < today);
  const fresh = items.filter(
    (i) => new Date(i.expiryDate) > new Date(today.getTime() + 7 * 86400000)
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const daysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day';
    return `${diff} days`;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="page-subtitle">
          {user?.household?.name
            ? `Household: ${user.household.name}`
            : 'Here is an overview of your pantry'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <StatCard
              label="Total Items"
              value={items.length}
              color="var(--color-accent)"
            />
            <StatCard
              label="Expiring Soon"
              value={expiring.length}
              note="within 7 days"
              color="var(--color-warning)"
            />
            <StatCard
              label="Expired"
              value={expired.length}
              note="needs attention"
              color="var(--color-danger)"
            />
            <StatCard
              label="Fresh Items"
              value={fresh.length}
              note="more than 7 days"
              color="#4a90a4"
            />
          </div>

          {/* Expiring soon list */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Expiring Soon</h2>
              <Link to="/pantry" style={{ fontSize: '13px' }}>View all</Link>
            </div>

            {expiring.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                No items expiring in the next 7 days.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expiring.map((item) => {
                  const days = daysLeft(item.expiryDate);
                  const isExpired = new Date(item.expiryDate) < today;
                  return (
                    <div key={item._id} style={styles.listRow}>
                      <div>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginLeft: '8px' }}>
                          {item.quantity}
                        </span>
                      </div>
                      <span
                        className={`badge ${isExpired ? 'badge-expired' : 'badge-high'}`}
                      >
                        {formatDate(item.expiryDate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/pantry" className="btn btn-primary">
              Manage Pantry
            </Link>
            <Link to="/ai" className="btn btn-secondary">
              Get Recipe Ideas
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
  },
};

export default Dashboard;
