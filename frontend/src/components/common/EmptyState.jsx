import React from 'react';

const EmptyState = ({ title = 'No results found', message = 'Try adjusting your search filters or add a new record.', action }) => {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
