import React, { useState } from 'react';

const StarRating = ({ value = 0, onChange, interactive = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const activeRating = interactive && hoverValue > 0 ? hoverValue : value;

  const handleClick = (ratingVal) => {
    if (interactive && onChange) {
      onChange(ratingVal);
    }
  };

  return (
    <div
      className={`star-rating ${interactive ? 'interactive' : ''}`}
      onMouseLeave={() => interactive && setHoverValue(0)}
    >
      {stars.map((star) => (
        <button
          type="button"
          key={star}
          className={`star ${star <= activeRating ? 'filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHoverValue(star)}
          disabled={!interactive}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
