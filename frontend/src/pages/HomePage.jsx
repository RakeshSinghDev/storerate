import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import StarRating from '../components/common/StarRating';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [featuredStores, setFeaturedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await storeService.getStores({ sortBy: 'rating', sortOrder: 'DESC' });
        setFeaturedStores((res.stores || []).slice(0, 3));
      } catch (err) {
        console.error('Error fetching preview stores', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="home-page">
      <section style={{ textAlign: 'center', padding: '3rem 1rem 4rem 1rem', maxWidth: '750px', margin: '0 auto' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
          STORE RATINGS
        </p>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
          Find stores worth your time.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Browse registered stores, see authentic customer ratings, and share your own rating to help others.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/stores" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Browse Stores
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Store Discovery Preview</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {featuredStores.map((store) => (
              <div key={store.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{store.name}</h3>
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                  {store.address}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StarRating value={Math.round(store.overall_rating)} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {store.overall_rating > 0 ? store.overall_rating.toFixed(1) : 'No ratings'}
                  </span>
                  <span className="text-sm text-muted">({store.total_ratings} ratings)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
