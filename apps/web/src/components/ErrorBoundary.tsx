import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink">
          <div className="text-center p-8">
            <p className="text-lg font-semibold text-ink dark:text-white mb-2">Something went wrong</p>
            <p className="text-sm text-ink-muted dark:text-ink-faint mb-4">Try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-medium rounded-full bg-ink dark:bg-white text-white dark:text-ink hover:bg-ink-light dark:hover:bg-paper-warm cursor-pointer transition-colors"
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
