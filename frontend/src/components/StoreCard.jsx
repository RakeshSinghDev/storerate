import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import './StoreCard.css';

export const StoreCard = ({ store }) => {
  const { id, name, address, averageRating, ratingCount, myRating } = store;

  return (
    <Card className="store-card">
      <div className="store-card-content">
        <div className="store-card-main">
          <Link to={`/stores/${id}`} className="store-card-title-link">
            <h3 className="store-card-title">{name}</h3>
          </Link>
          <p className="store-card-address">{address}</p>

          <div className="store-card-ratings">
            <div className="rating-row">
              <span className="rating-label">Overall rating:</span>
              {averageRating !== null && averageRating !== undefined ? (
                <div className="rating-value-group">
                  <RatingStars rating={averageRating} size="sm" showNumber />
                  <span className="rating-count">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
                </div>
              ) : (
                <span className="text-meta">No ratings yet</span>
              )}
            </div>

            <div className="rating-row my-rating-row">
              <span className="rating-label">Your rating:</span>
              {myRating !== null && myRating !== undefined ? (
                <RatingStars rating={myRating} size="sm" showNumber />
              ) : (
                <span className="text-meta">Not rated</span>
              )}
            </div>
          </div>
        </div>

        <div className="store-card-action">
          <Link to={`/stores/${id}`}>
            <Button variant={myRating ? 'secondary' : 'primary'} size="sm">
              {myRating ? 'Change rating' : 'Rate this store'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
