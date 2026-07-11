import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CyberBackground } from './visual/CyberBackground';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center cq-bg-app text-white p-6 relative overflow-hidden">
          <CyberBackground />
          <div className="max-w-lg w-full cq-panel cq-feedback-error rounded-2xl p-6 relative z-10">
            <h1 className="text-xl font-bold mb-2 cq-title-display">Something went wrong</h1>
            <p className="text-sm text-red-100 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cq-btn-secondary px-4 py-2 font-semibold"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
