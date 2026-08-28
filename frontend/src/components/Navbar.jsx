import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role;

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          StoreRate
        </Link>

        <nav className="navbar-nav">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/stores" className="nav-link">Stores</Link>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              {role === 'NORMAL_USER' && (
                <>
                  <Link to="/stores" className="nav-link">Stores</Link>
                  <Link to="/password" className="nav-link">Password</Link>
                </>
              )}

              {role === 'SYSTEM_ADMINISTRATOR' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/stores" className="nav-link">Stores</Link>
                  <Link to="/password" className="nav-link">Password</Link>
                </>
              )}

              {role === 'STORE_OWNER' && (
                <>
                  <Link to="/owner/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/owner/ratings" className="nav-link">Ratings</Link>
                  <Link to="/password" className="nav-link">Password</Link>
                </>
              )}

              <div className="navbar-user-info">
                <span className="user-badge">{role === 'SYSTEM_ADMINISTRATOR' ? 'Admin' : role === 'STORE_OWNER' ? 'Owner' : 'User'}</span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
