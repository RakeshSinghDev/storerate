import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import './AuthPages.css';

export const PasswordUpdate = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { updatePassword } = useAuth();

  const validate = () => {
    const errors = {};
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      errors.newPassword = 'Password must be between 8 and 16 characters long';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one special character';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await updatePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setServerError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Card title="Update Password" subtitle="Change your account password securely">
        <ErrorMessage message={serverError} />
        {successMessage && <div className="text-success" style={{ marginBottom: '16px', fontWeight: '500' }}>{successMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            htmlFor="current-pass"
            label="Current Password"
            error={fieldErrors.currentPassword}
            required
          >
            <Input
              id="current-pass"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!fieldErrors.currentPassword}
              disabled={loading}
            />
          </FormField>

          <FormField
            htmlFor="new-pass"
            label="New Password"
            helperText="8-16 chars, 1 uppercase letter, 1 special character"
            error={fieldErrors.newPassword}
            required
          >
            <Input
              id="new-pass"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!fieldErrors.newPassword}
              disabled={loading}
            />
          </FormField>

          <Button type="submit" variant="primary" fullWidth loading={loading} className="auth-submit-btn">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
