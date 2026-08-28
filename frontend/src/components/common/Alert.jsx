import React from 'react';

const Alert = ({ type = 'danger', message, errors = [] }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message && <div>{message}</div>}
      {errors && errors.length > 0 && (
        <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
          {errors.map((err, idx) => (
            <li key={idx}>
              {err.field ? <strong>{err.field}: </strong> : null}
              {err.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alert;
