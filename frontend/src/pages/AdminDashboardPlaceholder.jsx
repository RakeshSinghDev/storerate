import React from 'react';
import { Card } from '../components/Card';

export const AdminDashboardPlaceholder = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>System Administrator Dashboard</h1>
      <Card title="Admin Dashboard (Phase 10)">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          System administrator total users, stores, and ratings metrics will be implemented in Phase 10.
        </p>
      </Card>
    </div>
  );
};
