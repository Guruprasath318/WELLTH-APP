import { Component } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="main-content-inner" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaTriangleExclamation size={48} style={{ color: '#e74c3c', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
