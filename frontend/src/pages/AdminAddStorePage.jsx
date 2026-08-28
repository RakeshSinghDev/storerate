import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { adminService } from '../services/adminService';
import Alert from '../components/common/Alert';

const AdminAddStorePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [owners, setOwners] = useState([]);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await adminService.getUsers({ role: 'STORE_OWNER' });
        setOwners(res.users || []);
      } catch (err) {
        console.error('Failed to load store owners list', err);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setSubmitting(true);

    try {
      await storeService.createStore({
        name,
        email,
        address,
        owner_id: ownerId ? parseInt(ownerId, 10) : null,
      });
      navigate('/admin/stores');
    } catch (err) {
      setError(err.message || 'Failed to create store listing.');
      setFieldErrors(err.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '1rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Add New Store Listing</h1>
        <p style={{ marginBottom: '1.5rem' }}>Register a new store into the rating platform</p>

        <Alert type="danger" message={error} errors={fieldErrors} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Store Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Supermart"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Store Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@store.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Store Physical Address (Max 400 characters)
            </label>
            <textarea
              id="address"
              className="form-textarea"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="456 Retail Blvd, Suite 100"
              maxLength={400}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ownerId">
              Assigned Store Owner (Optional)
            </label>
            <select
              id="ownerId"
              className="form-select"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">-- No Owner Assigned --</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <div className="form-hint">Only users with the STORE_OWNER role appear in this list.</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Store'}
            </button>
            <Link to="/admin/stores" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddStorePage;
