import React from 'react';
import { Card } from '../components/Card';

export const AdminStoresPlaceholder = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Store Management</h1>
      <Card title="Admin Store Management (Phase 10)">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Store creation, owner validation, directory table, filtering, sorting, and pagination will be implemented in Phase 10.
        </p>
      </Card>
    </div>
  );
};
