import React, { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { ratingService } from '../services/ratingService';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const NormalUserStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submittingStoreId, setSubmittingStoreId] = useState(null);

  const { isAuthenticated, user } = useAuth();

  const fetchStores = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await storeService.getStores({ search: query });
      setStores(res.stores || []);
    } catch (err) {
      setError(err.message || 'Failed to load store listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores(searchQuery);
  };

  const handleRateStore = async (storeId, newRatingValue) => {
    if (!isAuthenticated) {
      setError('Please sign in to submit a store rating.');
      return;
    }

    try {
      setSubmittingStoreId(storeId);
      setError(null);
      setSuccessMessage(null);

      const res = await ratingService.submitOrUpdateRating(storeId, newRatingValue);

      setSuccessMessage(`Successfully updated rating for ${res.store.name}!`);

      // Update store list in local state
      setStores((prevStores) =>
        prevStores.map((s) =>
          s.id === storeId
            ? {
                ...s,
                overall_rating: res.store.overall_rating,
                total_ratings: res.store.total_ratings,
                user_rating: newRatingValue,
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingStoreId(null);
    }
  };

  return (
    <div className="stores-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Stores</h1>
          <p className="text-muted" style={{ marginBottom: 0 }}>
            Discover registered stores and share your ratings
          </p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: '2rem' }}>
        <div className="filter-group" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by store name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              fetchStores('');
            }}
          >
            Clear
          </button>
        )}
      </form>

      <Alert type="danger" message={error} />
      <Alert type="success" message={successMessage} />

      {loading ? (
        <LoadingSpinner message="Fetching store listings..." />
      ) : stores.length === 0 ? (
        <EmptyState
          title="No stores found"
          message={searchQuery ? `No stores match "${searchQuery}". Try a different keyword.` : 'No stores registered in the platform yet.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {stores.map((store) => (
            <div key={store.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{store.name}</h3>
                <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                  {store.address}
                </p>

                <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span className="text-sm font-medium">Overall Rating:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {store.overall_rating > 0 ? store.overall_rating.toFixed(1) : 'Unrated'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StarRating value={Math.round(store.overall_rating)} />
                    <span className="text-sm text-muted">({store.total_ratings} {store.total_ratings === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ backgroundColor: '#FAFBFD', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="text-sm font-medium">Your Rating:</span>
                    <span className="text-sm" style={{ fontWeight: 600, color: store.user_rating ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                      {store.user_rating ? `${store.user_rating} / 5` : 'Not rated'}
                    </span>
                  </div>

                  {user && user.role === 'NORMAL_USER' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <StarRating
                        value={store.user_rating || 0}
                        interactive={submittingStoreId !== store.id}
                        onChange={(newVal) => handleRateStore(store.id, newVal)}
                      />
                      <span className="text-sm text-muted" style={{ fontSize: '0.8rem' }}>
                        {submittingStoreId === store.id ? 'Saving...' : store.user_rating ? 'Click star to update' : 'Click star to rate'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted">
                      {isAuthenticated ? 'Store rating is available for normal user accounts.' : 'Sign in as a normal user to submit ratings.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NormalUserStoresPage;
