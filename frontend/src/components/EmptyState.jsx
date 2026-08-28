import React from 'react';
import './EmptyState.css';

export const EmptyState = ({ title = 'No results found', description, action }) => {
  return (
    <div className="empty-state">
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
