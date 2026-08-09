'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { C } from '@/lib/constants/theme';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#FAF7F0',
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#FFFFFF',
              border: `1px solid ${C.limestone}20`,
              borderRadius: 16,
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: `0 4px 24px ${C.basalt}08`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `${C.signalRed}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertTriangle size={28} color={C.signalRed} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', color: C.nile, margin: '0 0 8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: '14px', color: '#8B7E6A', lineHeight: 1.6, margin: '0 0 20px' }}>
              We caught an unexpected error. The team has been notified. Please try again or go back home.
            </p>
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  background: `${C.limestone}10`,
                  border: `1px solid ${C.limestone}20`,
                  borderRadius: 8,
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#6B6354',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>Error details</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && `\n\n${this.state.errorInfo.componentStack}`}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: C.nile,
                  color: C.limestone,
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <RefreshCw size={16} /> Try again
              </button>
              <Link
                href="/app"
                style={{
                  background: 'transparent',
                  color: C.nile,
                  border: `1.5px solid ${C.nile}`,
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontFamily: "'Inter',sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                }}
              >
                <Home size={16} /> Go home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}