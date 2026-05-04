import React, { useEffect, useState } from 'react';
import { getPantryItems, addPantryItem, deletePantryItem } from '../services/api';

const CATEGORIES = ['Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains', 'Condiments', 'Beverages', 'Frozen', 'Other'];

const today = new Date();

const getDaysLeft = (dateStr) => Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));

const getUrgency = (daysLeft) => {
  if (daysLeft < 0) return 'expired';
  if (daysLeft === 0) return 'critical';
  if (daysLeft <= 3) return 'high';
  if (daysLeft <= 7) return 'medium';
  return 'low';
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const Pantry = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    expiryDate: '',
    category: 'Other',
  });

  const fetchItems = () => {
    getPantryItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const newItem = await addPantryItem(form);
      setItems((prev) => [...prev, newItem].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)));
      setForm({ name: '', quantity: '', expiryDate: '', category: 'Other' });
      setShowForm(false);
      setSuccess('Item added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePantryItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setDeleteId(null);
      setSuccess('Item removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Pantry</h1>
          <p className="page-subtitle">
            {items.length} item{items.length !== 1 ? 's' : ''} — sorted by expiry date
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(''); }}
        >
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Add Item Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add New Item</h2>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Item Name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="e.g. Whole Milk"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  name="quantity"
                  placeholder="e.g. 1 litre, 500g"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Expiry Date</label>
                <input
                  className="form-input"
                  name="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Item'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Your pantry is empty. Add your first item to get started.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Item
          </button>
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Item</span>
            <span>Quantity</span>
            <span>Category</span>
            <span>Expiry Date</span>
            <span>Status</span>
            <span></span>
          </div>

          {items.map((item) => {
            const days = getDaysLeft(item.expiryDate);
            const urgency = getUrgency(days);
            const confirmingDelete = deleteId === item._id;

            return (
              <div key={item._id} style={styles.tableRow}>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{item.quantity}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.category}</span>
                <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{formatDate(item.expiryDate)}</span>
                <span>
                  <span className={`badge badge-${urgency}`}>
                    {days < 0
                      ? `${Math.abs(days)}d ago`
                      : days === 0
                      ? 'Today'
                      : `${days}d left`}
                  </span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  {confirmingDelete ? (
                    <span style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDeleteId(item._id)}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  table: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr auto',
    gap: '12px',
    padding: '10px 16px',
    background: 'var(--color-surface-alt)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr auto',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
    alignItems: 'center',
    transition: 'background 0.1s',
  },
};

export default Pantry;
