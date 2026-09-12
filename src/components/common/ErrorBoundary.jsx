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
    
    // Auto-reload on deployment chunk mismatch errors
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /dynamically imported module|Loading chunk|Failed to fetch/i.test(error?.message || '');

    if (isChunkError) {
      const reloaded = sessionStorage.getItem('eb_chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('eb_chunk_reload', 'true');
        window.location.reload();
      }
    }
  }

  handleRefresh = () => {
    sessionStorage.removeItem('eb_chunk_reload');
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('eb_chunk_reload');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = /dynamically imported module|Loading chunk|Failed to fetch/i.test(
        this.state.error?.message || ''
      );

      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div className="text-center space-y-5 max-w-sm w-full p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <img src="/navbar-logo.png" alt="Aliwayz" className="h-8 w-auto object-contain" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                {isChunkError ? 'New Version Available' : 'Something Went Wrong'}
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {isChunkError
                  ? 'Aliwayz has been updated with new improvements. Please refresh to load the latest version.'
                  : 'An unexpected issue occurred. Refreshing the page will resolve this.'}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={this.handleRefresh}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-md transition-all"
              >
                Refresh App
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full rounded-xl border border-[var(--color-border)] py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;