'use client';

/**
 * React Error Boundary with friendly fallback UI.
 * FLU-215: Production hardening
 *
 * Uses TeachingLabs theme tokens: teal (#4FA3A5), coral (#E8836B), navy (#1F3A5F).
 */

import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          <div
            style={{
              backgroundColor: '#FEF2F0',
              border: '1px solid #E8836B',
              borderRadius: '14px',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
            }}
          >
            <h2
              style={{
                color: '#1F3A5F',
                fontSize: '1.25rem',
                fontWeight: 600,
                marginTop: 0,
                marginBottom: '0.75rem',
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: '#334155',
                fontSize: '0.95rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              We hit an unexpected error. Please try again, and if the problem persists, let us know.
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#4FA3A5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.625rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = '#3F8E90')
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = '#4FA3A5')
              }
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
