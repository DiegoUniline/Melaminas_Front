import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center flex flex-col items-center justify-center min-h-[200px] gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <p className="text-lg font-medium text-foreground">Algo salió mal</p>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error?.message || 'Ocurrió un error inesperado'}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={this.handleRetry}
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
