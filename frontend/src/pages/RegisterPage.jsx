import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateFrontend = () => {
    const errors = [];
    if (name.trim().length < 20 || name.trim().length > 60) {
      errors.push({ field: 'name', message: 'Name must be between 20 and 60 characters long.' });
    }
    if (address.trim().length > 400) {
      errors.push({ field: 'address', message: 'Address cannot exceed 400 characters.' });
    }
    if (password.length < 8 || password.length > 16) {
      errors.push({ field: 'password', message: 'Password must be between 8 and 16 characters long.' });
    }
    if (!/[A-Z]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one special character.' });
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);

    const clientValidationErrors = validateFrontend();
    if (clientValidationErrors.length > 0) {
      setFieldErrors(clientValidationErrors);
      setError('Please fix the validation errors below.');
      return;
    }

    setSubmitting(true);

    try {
      await register({ name, email, address, password });
      navigate('/stores');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setFieldErrors(err.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Create Account
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Sign up to rate stores and share your experience
        </p>

        <Alert type="danger" message={error} errors={fieldErrors} />

        <form onSubmit={handleSubmit}>
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
              placeholder="e.g. Normal User Full Name Example Person"
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
              placeholder="you@example.com"
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
              placeholder="123 Residential Street, City, State"
              maxLength={400}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (8–16 chars, 1 Uppercase, 1 Special Char)
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              maxLength={16}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
