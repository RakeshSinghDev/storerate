import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import './AuthPages.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const userProfile = await login(email, password);
      
      if (userProfile?.role === 'SYSTEM_ADMINISTRATOR') {
        navigate('/admin/dashboard');
      } else if (userProfile?.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/stores');
      }
    } catch (err) {
      setError(err.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <Card title="Sign in to StoreRate" subtitle="Enter your email and password to access your account">
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit} noValidate>
          <FormField htmlFor="login-email" label="Email Address" required>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </FormField>

          <FormField htmlFor="login-password" label="Password" required>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </FormField>

          <Button type="submit" variant="primary" fullWidth loading={loading} className="auth-submit-btn">
            Sign In
          </Button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register">Create an account</Link>
        </div>
      </Card>
    </div>
  );
};
