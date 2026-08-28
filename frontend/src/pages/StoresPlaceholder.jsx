import React from 'react';
import { Card } from '../components/Card';

export const StoresPlaceholder = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Store Directory</h1>
      <Card title="Stores Listing (Phase 9)">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Normal user store discovery, search, sorting, and rating workflows will be implemented in Phase 9.
        </p>
      </Card>
    </div>
  );
};
