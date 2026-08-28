import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ownerService } from '../services/ownerService';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { RatingStars } from '../components/RatingStars';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import './OwnerDashboardPage.css';

export const OwnerDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [dashboardData, setDashboardData] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ownerService.getOwnerDashboard({ page: pageParam, limit: 20 });

      if (res.success && res.data) {
        setDashboardData(res.data);
        setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Unable to load store overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [pageParam]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const columns = [
    {
      header: 'User',
      key: 'userName',
      render: (row) => <span className="customer-name">{row.userName || 'Anonymous User'}</span>,
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (row) => <RatingStars rating={row.rating} size="sm" showNumber />,
    },
    {
      header: 'Date',
      key: 'createdAt',
      align: 'right',
      render: (row) => <span className="text-meta">{formatDate(row.createdAt)}</span>,
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading store overview..." />;
  }

  if (error) {
    return (
      <div className="owner-dashboard-page">
        <ErrorMessage message={error} />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button variant="secondary" onClick={fetchDashboard}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.store) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-page-header">
          <h1 className="page-title">Store Overview</h1>
        </div>
        <Card className="no-store-card">
          <h3 className="no-store-title">Your store hasn't been assigned yet.</h3>
          <p className="no-store-text">
            Contact a system administrator to assign a registered store to your owner account.
          </p>
        </Card>
      </div>
    );
  }

  const { store, averageRating, ratingCount, ratings } = dashboardData;
  const ratingsList = ratings || [];

  return (
    <div className="owner-dashboard-page">
      <div className="owner-page-header">
        <h1 className="page-title">Store Overview</h1>
        <p className="page-subtitle">See how customers are rating your store.</p>
      </div>

      <Card className="owner-summary-card">
        <div className="summary-header">
          <h2 className="owner-store-title">{store.name}</h2>
          <p className="owner-store-address">{store.address}</p>
        </div>

        <div className="owner-rating-hero">
          <div className="hero-rating-box">
            <span className="hero-rating-label">Average Rating</span>
            {averageRating !== null && averageRating !== undefined ? (
              <div className="hero-rating-values">
                <span className="hero-big-number">{averageRating.toFixed(1)}</span>
                <div className="hero-stars-wrapper">
                  <RatingStars rating={averageRating} size="lg" />
                  <span className="hero-count-label">
                    ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </div>
            ) : (
              <div className="unrated-store-box">Not rated yet</div>
            )}
          </div>
        </div>
      </Card>

      <div className="owner-ratings-section">
        <h3 className="section-title">Customer Ratings</h3>

        <div className="ratings-table-summary text-meta">
          {ratingsList.length > 0 && (
            <span>Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} ratings</span>
          )}
        </div>

        {ratingsList.length === 0 ? (
          <div className="empty-ratings-box">
            <h4 className="empty-ratings-title">No ratings yet</h4>
            <p className="empty-ratings-text">
              Once customers submit ratings for your store, their feedback will appear here.
            </p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={ratingsList} keyField="id" />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
