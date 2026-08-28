import React from 'react';
import './FormField.css';

export const FormField = ({
  htmlFor,
  label,
  helperText,
  error,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="form-label">
          {label}
          {required && <span className="required-star"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field-message error-message">{error}</span>
      ) : helperText ? (
        <span className="field-message helper-message">{helperText}</span>
      ) : null}
    </div>
  );
};
