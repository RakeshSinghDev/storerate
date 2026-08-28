import React, { useState, useEffect } from 'react';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import './RatingForm.css';

export const RatingForm = ({
  initialRating = 0,
  hasExistingRating = false,
  onSubmit,
  loading = false,
  error = '',
  successMessage = '',
}) => {
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);

  useEffect(() => {
    if (initialRating) {
      setSelectedRating(initialRating);
    }
  }, [initialRating]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRating >= 1 && selectedRating <= 5 && onSubmit) {
      onSubmit(selectedRating);
    }
  };

  return (
    <div className="rating-form-card">
      <h4 className="rating-form-title">
        {hasExistingRating ? 'Modify Your Rating' : 'How would you rate this store?'}
      </h4>
      <p className="rating-form-subtitle">
        Select between 1 and 5 stars to share your experience
      </p>

      <ErrorMessage message={error} />
      {successMessage && (
        <div className="rating-success-message" role="status">
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rating-form">
        <div className="rating-picker-wrapper">
          <RatingStars
            rating={selectedRating}
            interactive={!loading}
            onChange={(val) => setSelectedRating(val)}
            size="lg"
            showNumber
          />
        </div>

        <div className="rating-action-wrapper">
          <Button
            type="submit"
            variant="primary"
            disabled={selectedRating < 1 || selectedRating > 5 || loading}
            loading={loading}
          >
            {hasExistingRating ? 'Save rating' : 'Submit rating'}
          </Button>
        </div>
      </form>
    </div>
  );
};
