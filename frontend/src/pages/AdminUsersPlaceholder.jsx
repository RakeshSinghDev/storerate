import React from 'react';
import { Card } from '../components/Card';

export const AdminUsersPlaceholder = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>User Management</h1>
      <Card title="Admin User Management (Phase 10)">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          User creation, directory table, filtering, sorting, and pagination will be implemented in Phase 10.
        </p>
      </Card>
    </div>
  );
};
