import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import './AuthPages.css';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      });

      // Auto-login after successful registration
      await login(email.trim(), password);
      navigate('/stores');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Card title="Create your StoreRate account" subtitle="Sign up to explore stores and share ratings">
        <ErrorMessage message={serverError} />
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            htmlFor="reg-name"
            label="Full Name"
            helperText="Must be 20 to 60 characters long"
            error={fieldErrors.name}
            required
          >
            <Input
              id="reg-name"
              type="text"
              placeholder="e.g. Rakesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!fieldErrors.name}
              disabled={loading}
            />
          </FormField>

          <FormField
            htmlFor="reg-email"
            label="Email Address"
            error={fieldErrors.email}
            required
          >
            <Input
              id="reg-email"
              type="email"
              placeholder="rakesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              disabled={loading}
            />
          </FormField>

          <FormField
            htmlFor="reg-address"
            label="Address"
            helperText="Maximum 400 characters"
            error={fieldErrors.address}
            required
          >
            <Input
              id="reg-address"
              type="text"
              placeholder="Dhanbad, Jharkhand"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={!!fieldErrors.address}
              disabled={loading}
            />
          </FormField>

          <FormField
            htmlFor="reg-password"
            label="Password"
            helperText="8-16 chars, 1 uppercase letter, 1 special character"
            error={fieldErrors.password}
            required
          >
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              disabled={loading}
            />
          </FormField>

          <Button type="submit" variant="primary" fullWidth loading={loading} className="auth-submit-btn">
            Create Account
          </Button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Card>
    </div>
  );
};
