import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lyra Uncaught Runtime Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('lyra_settings');
      localStorage.removeItem('lyra_messages');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center mb-4 text-2xl animate-bounce">
            🌸
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent mb-2">
            Lyra Recovery Mode (सुरक्षा मोड)
          </h1>
          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            A temporary browser script or caching error occurred. Tap below to safely reload the application.
          </p>
          <div className="glass-card p-3 rounded-xl max-w-sm mb-5 text-[11px] text-rose-300 font-mono text-left break-all border border-rose-500/20">
            {this.state.error?.message || 'Unexpected state occurred'}
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/25 cursor-pointer transition-all"
          >
            Reload & Recover (ऐप पुनः लोड करें)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
