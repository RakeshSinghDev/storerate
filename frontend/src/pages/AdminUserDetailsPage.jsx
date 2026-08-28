import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Card } from '../components/Card';
import { RatingStars } from '../components/RatingStars';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import './AdminUserDetailsPage.css';

export const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const userId = parseInt(id, 10);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getUserById(userId);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setError(res.message || 'User account not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading) {
    return <LoadingSpinner message="Loading user details..." />;
  }

  if (error || !user) {
    return (
      <div className="admin-user-details-container">
        <ErrorMessage message={error || 'User account not found.'} />
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/users">
            <Button variant="secondary">Back to users</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-details-container">
      <div className="details-nav">
        <Link to="/admin/users" className="back-link">
          ← Back to users
        </Link>
      </div>

      <Card className="user-details-card" title="User Details">
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.name}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Account Role</span>
            <span className="detail-value">
              <span className={`user-role-badge role-${user.role}`}>{user.role}</span>
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Address</span>
            <span className="detail-value">{user.address}</span>
          </div>
        </div>

        {user.role === 'STORE_OWNER' && (
          <div className="store-owner-section">
            <h4 className="section-subtitle">Assigned Store Information</h4>
            {user.store ? (
              <div className="owner-store-box">
                <div className="store-box-item">
                  <span className="detail-label">Store Name</span>
                  <span className="store-name-title">{user.store.name}</span>
                </div>
                <div className="store-box-item">
                  <span className="detail-label">Store Rating Aggregate</span>
                  {user.store.averageRating !== null ? (
                    <div className="rating-summary-group">
                      <RatingStars rating={user.store.averageRating} size="md" showNumber />
                      <span className="text-meta">({user.store.ratingCount} {user.store.ratingCount === 1 ? 'rating' : 'ratings'})</span>
                    </div>
                  ) : (
                    <span className="text-meta">No ratings submitted yet</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="no-store-text">No store assigned yet.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
