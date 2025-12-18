'use client';

import React, { Suspense, Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AsyncBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-black/5">
          <div className="text-center p-6">
            <p className="text-red-500/70 text-sm">Failed to load component</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-xs text-white/50 hover:text-white/70 underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface AsyncBoundaryProps {
  children: ReactNode;
  /** Fallback shown while loading */
  loadingFallback?: ReactNode;
  /** Fallback shown on error */
  errorFallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Combines Suspense and ErrorBoundary for async component loading.
 * Use this to wrap dynamically imported components for proper loading/error states.
 */
export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  const defaultLoading = (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-white/30">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={loadingFallback || defaultLoading}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/** Minimal loading spinner for inline use */
export function LoadingSpinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
