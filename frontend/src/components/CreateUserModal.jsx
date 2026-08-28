import React, { useState } from 'react';
import { Modal } from './Modal';
import { FormField } from './FormField';
import { Input } from './Input';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { adminService } from '../services/adminService';

export const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('NORMAL_USER');

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setAddress('');
    setPassword('');
    setRole('NORMAL_USER');
    setFieldErrors({});
    setServerError('');
  };

  const validate = () => {
    const errors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.name = 'Name must be between 20 and 60 characters long';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errors.address = 'Address is required';
    } else if (trimmedAddress.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters long';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }

    if (!role) {
      errors.role = 'Role selection is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await adminService.createUser({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
        role,
      });

      if (res.success) {
        resetForm();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User Account">
      <ErrorMessage message={serverError} />
      <form onSubmit={handleSubmit} noValidate>
        <FormField htmlFor="cu-role" label="Account Role" error={fieldErrors.role} required>
          <select
            id="cu-role"
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="NORMAL_USER">NORMAL_USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="SYSTEM_ADMINISTRATOR">SYSTEM_ADMINISTRATOR</option>
          </select>
        </FormField>

        <FormField htmlFor="cu-name" label="Full Name" helperText="Must be 20 to 60 characters long" error={fieldErrors.name} required>
          <Input
            id="cu-name"
            placeholder="e.g. System Administrator Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!fieldErrors.name}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cu-email" label="Email Address" error={fieldErrors.email} required>
          <Input
            id="cu-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cu-address" label="Address" helperText="Maximum 400 characters" error={fieldErrors.address} required>
          <Input
            id="cu-address"
            placeholder="123 Corporate Blvd, Suite 500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={!!fieldErrors.address}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cu-password" label="Password" helperText="8-16 chars, 1 uppercase, 1 special character" error={fieldErrors.password} required>
          <Input
            id="cu-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password}
            disabled={loading}
          />
        </FormField>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
};
