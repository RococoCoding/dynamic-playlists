import React from 'react';
import ErrorPage from './presentational/ErrorPage';
import { getErrorMessage } from '../utils';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: getErrorMessage(error.message) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error);
    console.log('ErrorInfo', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage message={this.state.errorMsg} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;