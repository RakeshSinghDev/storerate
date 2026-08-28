import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Unable to load dashboard statistics.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform overview and management.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading dashboard statistics..." />
      ) : error ? (
        <div>
          <ErrorMessage message={error} />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={fetchDashboardStats}>Try again</Button>
          </div>
        </div>
      ) : (
        <div className="admin-stats-grid">
          <Card className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats?.totalUsers?.toLocaleString() || 0}</span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Total Stores</span>
            <span className="stat-value">{stats?.totalStores?.toLocaleString() || 0}</span>
          </Card>

          <Card className="stat-card">
            <span className="stat-label">Total Ratings</span>
            <span className="stat-value">{stats?.totalRatings?.toLocaleString() || 0}</span>
          </Card>
        </div>
      )}
    </div>
  );
};
