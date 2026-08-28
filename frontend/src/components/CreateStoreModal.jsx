import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField } from './FormField';
import { Input } from './Input';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { adminService } from '../services/adminService';

export const CreateStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [ownersList, setOwnersList] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStoreOwners = async () => {
    try {
      setOwnersLoading(true);
      const res = await adminService.getStoreOwners();
      if (res.success && Array.isArray(res.data)) {
        setOwnersList(res.data);
      }
    } catch (err) {
      console.error('Failed to load store owners list:', err);
    } finally {
      setOwnersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStoreOwners();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setAddress('');
    setOwnerId('');
    setFieldErrors({});
    setServerError('');
  };

  const validate = () => {
    const errors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Store name is required';
    } else if (trimmedName.length < 2 || trimmedName.length > 60) {
      errors.name = 'Store name must be between 2 and 60 characters';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Store email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errors.address = 'Store address is required';
    } else if (trimmedAddress.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
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
      const res = await adminService.createStore({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        ownerId: ownerId ? parseInt(ownerId, 10) : null,
      });

      if (res.success) {
        resetForm();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Store">
      <ErrorMessage message={serverError} />
      <form onSubmit={handleSubmit} noValidate>
        <FormField htmlFor="cs-name" label="Store Name" error={fieldErrors.name} required>
          <Input
            id="cs-name"
            placeholder="e.g. Apex Supermart"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!fieldErrors.name}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cs-email" label="Store Email Address" error={fieldErrors.email} required>
          <Input
            id="cs-email"
            type="email"
            placeholder="contact@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!fieldErrors.email}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cs-address" label="Store Address" helperText="Maximum 400 characters" error={fieldErrors.address} required>
          <Input
            id="cs-address"
            placeholder="456 Retail Blvd, Shopping Plaza"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={!!fieldErrors.address}
            disabled={loading}
          />
        </FormField>

        <FormField htmlFor="cs-owner" label="Assigned Store Owner" helperText="Only users with STORE_OWNER role are listed">
          <select
            id="cs-owner"
            className="form-input"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            disabled={loading || ownersLoading}
          >
            <option value="">-- No Owner Assigned --</option>
            {ownersList.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </FormField>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Store
          </Button>
        </div>
      </form>
    </Modal>
  );
};
