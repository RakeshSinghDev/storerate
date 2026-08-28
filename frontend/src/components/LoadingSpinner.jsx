import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};
