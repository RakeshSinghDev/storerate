import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { Card } from '../components/Card';
import { RatingStars } from '../components/RatingStars';
import { RatingForm } from '../components/RatingForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import './StoreDetailsPage.css';

export const StoreDetailsPage = () => {
  const { id } = useParams();
  const storeId = parseInt(id, 10);

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await storeService.getStoreById(storeId);
      if (res.success && res.data) {
        setStore(res.data);
      } else {
        setError(res.message || 'Store not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load store details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  const handleRatingSubmit = async (newRatingValue) => {
    setSubmitError('');
    setSuccessMessage('');
    setSubmitLoading(true);

    try {
      const hasExistingRating = store?.myRating !== null && store?.myRating !== undefined;
      let res;

      if (hasExistingRating) {
        res = await storeService.updateRating(storeId, newRatingValue);
      } else {
        res = await storeService.createRating(storeId, newRatingValue);
      }

      if (res.success) {
        setSuccessMessage(hasExistingRating ? 'Rating updated.' : 'Rating submitted.');
        
        // Refresh store details summary to reflect updated averages
        const updatedStoreRes = await storeService.getStoreById(storeId);
        if (updatedStoreRes.success && updatedStoreRes.data) {
          setStore(updatedStoreRes.data);
        }
      }
    } catch (err) {
      if (err.status === 409) {
        setSubmitError('You have already rated this store.');
        fetchStoreDetails(); // Refresh store data
      } else {
        setSubmitError(err.message || 'Failed to submit rating. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading store details..." />;
  }

  if (error || !store) {
    return (
      <div className="store-details-container">
        <ErrorMessage message={error || 'Store not found.'} />
        <div style={{ marginTop: '16px' }}>
          <Link to="/stores">
            <Button variant="secondary">Back to stores</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="store-details-container">
      <div className="store-details-nav">
        <Link to="/stores" className="back-link">
          ← Back to stores
        </Link>
      </div>

      <Card className="store-details-card">
        <h1 className="details-title">{store.name}</h1>
        <p className="details-address">{store.address}</p>

        <div className="details-summary-grid">
          <div className="summary-box">
            <span className="box-label">Overall Rating</span>
            {store.averageRating !== null ? (
              <div className="box-rating">
                <span className="big-rating">{store.averageRating.toFixed(1)}</span>
                <RatingStars rating={store.averageRating} size="lg" />
                <span className="count-label">({store.ratingCount} {store.ratingCount === 1 ? 'rating' : 'ratings'})</span>
              </div>
            ) : (
              <div className="no-rating-box">Not rated yet</div>
            )}
          </div>

          <div className="summary-box">
            <span className="box-label">Your Rating</span>
            {store.myRating !== null && store.myRating !== undefined ? (
              <div className="box-rating">
                <span className="big-rating">{store.myRating}</span>
                <RatingStars rating={store.myRating} size="lg" />
              </div>
            ) : (
              <div className="no-rating-box">Not rated</div>
            )}
          </div>
        </div>

        <RatingForm
          initialRating={store.myRating || 0}
          hasExistingRating={store.myRating !== null && store.myRating !== undefined}
          onSubmit={handleRatingSubmit}
          loading={submitLoading}
          error={submitError}
          successMessage={successMessage}
        />
      </Card>
    </div>
  );
};
