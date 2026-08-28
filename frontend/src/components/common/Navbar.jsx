import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          STORE RATINGS
        </Link>

        <nav>
          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/stores" className="nav-link">
                    Stores
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="nav-link">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Get Started
                  </Link>
                </li>
              </>
            ) : (
              <>
                {role === 'NORMAL_USER' && (
                  <>
                    <li>
                      <Link to="/stores" className="nav-link">
                        Stores
                      </Link>
                    </li>
                    <li>
                      <Link to="/update-password" className="nav-link">
                        Password
                      </Link>
                    </li>
                  </>
                )}

                {role === 'STORE_OWNER' && (
                  <>
                    <li>
                      <Link to="/owner/dashboard" className="nav-link">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/update-password" className="nav-link">
                        Password
                      </Link>
                    </li>
                  </>
                )}

                {role === 'SYSTEM_ADMINISTRATOR' && (
                  <>
                    <li>
                      <Link to="/admin/dashboard" className="nav-link">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/users" className="nav-link">
                        Users
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/stores" className="nav-link">
                        Stores
                      </Link>
                    </li>
                    <li>
                      <Link to="/update-password" className="nav-link">
                        Password
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-user">
                  <span>{user.name.split(' ')[0]}</span>
                  <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
