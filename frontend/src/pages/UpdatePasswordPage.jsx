import React, { useState } from 'react';
import { authService } from '../services/authService';
import Alert from '../components/common/Alert';

const UpdatePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors([]);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setError('New password must be between 8 and 16 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('New password must contain at least one special character.');
      return;
    }

    setSubmitting(true);

    try {
      await authService.updatePassword({ oldPassword, newPassword });
      setSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
      setFieldErrors(err.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Update Password</h1>
        <p style={{ marginBottom: '1.5rem' }}>Change your account password securely</p>

        <Alert type="danger" message={error} errors={fieldErrors} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="oldPassword">
              Current Password
            </label>
            <input
              id="oldPassword"
              type="password"
              className="form-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password (8–16 chars, 1 Uppercase, 1 Special Char)
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              maxLength={16}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              maxLength={16}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
