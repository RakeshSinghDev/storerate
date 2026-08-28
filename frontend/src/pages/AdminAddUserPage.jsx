import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Alert from '../components/common/Alert';

const AdminAddUserPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('NORMAL_USER');

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const errs = [];
    if (name.trim().length < 20 || name.trim().length > 60) {
      errs.push({ field: 'name', message: 'Name must be between 20 and 60 characters long.' });
    }
    if (address.trim().length > 400) {
      errs.push({ field: 'address', message: 'Address cannot exceed 400 characters.' });
    }
    if (password.length < 8 || password.length > 16) {
      errs.push({ field: 'password', message: 'Password must be between 8 and 16 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      errs.push({ field: 'password', message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errs.push({ field: 'password', message: 'Password must contain at least one special character.' });
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    const clientErrs = validate();
    if (clientErrs.length > 0) {
      setFieldErrors(clientErrs);
      setError('Please fix the validation errors below.');
      return;
    }

    setSubmitting(true);

    try {
      await adminService.createUser({ name, email, address, password, role });
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
      setFieldErrors(err.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '1rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Add New User Account</h1>
        <p style={{ marginBottom: '1.5rem' }}>Create admin, normal user, or store owner accounts</p>

        <Alert type="danger" message={error} errors={fieldErrors} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Account Role
            </label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="NORMAL_USER">NORMAL_USER</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
              <option value="SYSTEM_ADMINISTRATOR">SYSTEM_ADMINISTRATOR</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name (20 to 60 characters)
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. System Administrator Account Name"
              minLength={20}
              maxLength={60}
              required
            />
            <div className="form-hint">Length: {name.length}/60 (Min 20 characters)</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address (Max 400 characters)
            </label>
            <textarea
              id="address"
              className="form-textarea"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Corporate Blvd, Tech City"
              maxLength={400}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Initial Password (8–16 chars, 1 Uppercase, 1 Special Char)
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={16}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
            <Link to="/admin/users" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUserPage;
