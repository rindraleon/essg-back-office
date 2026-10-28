import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur non gérée dans le back-office', error, info.componentStack);
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 px-6 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Impossible d’afficher cette page</h1>
          <p className="mt-1 max-w-md text-sm text-ink-500">
            Un problème est survenu. Rechargez l’application pour reprendre votre session.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recharger l’application
        </Button>
      </div>
    );
  }
}

export default AppErrorBoundary;
