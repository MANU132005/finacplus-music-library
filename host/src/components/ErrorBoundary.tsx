import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

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
    console.error('ErrorBoundary caught a runtime crash:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-soft-lg p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Error</h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              We encountered a runtime crash or an error loading a micro-frontend module. This might be due to a network connection drop or compilation issues.
            </p>
            <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-left max-h-36 overflow-y-auto">
              <code className="text-xs font-mono text-red-600 block break-all leading-normal">
                {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
              </code>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
              >
                Dismiss Overlay
              </button>
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-850 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
