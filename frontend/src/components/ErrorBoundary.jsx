import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught rendering failure:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px 16px', maxWidth: '480px', margin: '0 auto' }}>
          <Card title="Something went wrong">
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              An unexpected error occurred while rendering this page.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Return Home
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
