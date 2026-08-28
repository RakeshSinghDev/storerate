import React, { useState, useEffect } from 'react';
import { ownerService } from '../services/ownerService';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const StoreOwnerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await ownerService.getDashboard();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load store owner dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading store owner dashboard..." />;

  const store = data?.store;
  const ratings = data?.ratings || [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Store Owner Dashboard</h1>
        <p className="text-muted" style={{ marginBottom: 0 }}>Overview and rating analytics for your registered store</p>
      </div>

      <Alert type="danger" message={error} />

      {!store ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Store Assigned</h3>
          <p style={{ maxWidth: '500px', margin: '0.5rem auto' }}>
            There is currently no store associated with your account. Please contact an administrator to assign a store to your profile.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{store.name}</h2>
                <p className="text-muted" style={{ marginBottom: '0.25rem' }}>{store.address}</p>
                <p className="text-sm text-muted">{store.email}</p>
              </div>

              <div style={{ backgroundColor: '#FAFBFD', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                  Average Rating
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {store.overallRating > 0 ? store.overallRating.toFixed(1) : '0.0'}
                </div>
                <div style={{ margin: '0.5rem 0' }}>
                  <StarRating value={Math.round(store.overallRating)} />
                </div>
                <div className="text-sm text-muted">
                  Based on {store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Recent Customer Ratings</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '1.25rem' }}>
              Customers who have submitted ratings for {store.name}
            </p>

            {ratings.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem 0' }}>No customer ratings submitted yet for this store.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Customer Email</th>
                      <th>Rating</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.user_name}</td>
                        <td>{r.user_email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <StarRating value={r.rating} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.rating} / 5</span>
                          </div>
                        </td>
                        <td className="text-sm text-muted">
                          {new Date(r.updated_at || r.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StoreOwnerDashboardPage;
