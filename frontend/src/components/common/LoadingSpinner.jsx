import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner" aria-label="Loading indicator"></div>
      {message && <p style={{ marginLeft: '1rem', marginBottom: 0 }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
