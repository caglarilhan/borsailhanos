"use client";

import * as React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: integrate with monitoring (Sentry/LogRocket)
    console.error("ErrorBoundary caught: ", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">!</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Beklenmeyen bir hata oluştu</h2>
            <p className="text-sm text-gray-600 mb-4">Sayfayı yenilemeyi veya aşağıdaki butonla tekrar denemeyi deneyin.</p>
            <button onClick={this.handleRetry} className="h-10 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700">Tekrar Dene</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


