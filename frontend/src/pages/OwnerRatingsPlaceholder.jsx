import React from 'react';
import { Card } from '../components/Card';

export const OwnerRatingsPlaceholder = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Customer Ratings</h1>
      <Card title="Customer Ratings View (Phase 11)">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Detailed paginated user ratings for the store owner's store will be implemented in Phase 11.
        </p>
      </Card>
    </div>
  );
};
