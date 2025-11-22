/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Something went wrong</h2>
          <p className="text-white/80">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

