import React, { useState } from 'react';
import './RatingStars.css';

export const RatingStars = ({
  rating = 0,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`rating-stars-container size-${size} ${interactive ? 'interactive' : ''}`}>
      <div className="stars-group">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = displayRating >= starValue;
          return (
            <span
              key={starValue}
              className={`star ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              role={interactive ? 'button' : 'img'}
              aria-label={`${starValue} star`}
              tabIndex={interactive ? 0 : -1}
              onKeyDown={(e) => {
                if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                  handleClick(starValue);
                }
              }}
            >
              ★
            </span>
          );
        })}
      </div>
      {showNumber && rating !== null && rating !== undefined && (
        <span className="rating-number">
          {typeof rating === 'number' ? rating.toFixed(1) : rating}
        </span>
      )}
    </div>
  );
};
