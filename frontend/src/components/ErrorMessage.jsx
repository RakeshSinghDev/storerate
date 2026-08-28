import React from 'react';
import './ErrorMessage.css';

export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <span className="error-banner-icon">!</span>
      <span className="error-banner-text">{message}</span>
    </div>
  );
};
