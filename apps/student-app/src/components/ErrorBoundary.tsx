import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-marlion-bg flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-marlion-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-marlion-danger/20">
              <i className="fa-solid fa-triangle-exclamation text-4xl text-marlion-danger"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-marlion-muted mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-marlion-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-marlion-primaryHover transition-all"
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
