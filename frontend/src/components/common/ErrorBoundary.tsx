import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: string;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error: error?.message ?? String(error) };
  }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh' }} className="flex items-center justify-center p-4">
          <div style={{ maxWidth: 420 }} className="bg-white shadow rounded p-6 border border-gray-200">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#555', fontSize: '0.95rem' }}>
              We encountered an unexpected error. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre style={{ marginTop: 8, padding: 8, fontSize: 12, background: '#f8f8f8', borderRadius: 4 }}>
{this.state.error}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 12 }}
              className="px-4 py-2 rounded bg-primary-600 text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
