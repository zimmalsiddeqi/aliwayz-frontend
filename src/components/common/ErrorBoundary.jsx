import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6"
             style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-brand"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;