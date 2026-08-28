import React from 'react';
import './Input.css';

export const Input = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  className = '',
  ...props
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`form-input ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
  );
};
