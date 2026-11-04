import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
import './styles/index.css';
import { AppRoutes } from '@/routes';
import { AuthProvider, ThemeProvider, useTheme } from '@/contexts';
import { SessionRealtimeProvider } from '@/components/common/SessionRealtimeProvider';
import AppErrorBoundary from '@/components/common/AppErrorBoundary';
import { queryClient } from '@/lib';

function ThemedShell() {
  const { theme } = useTheme();
  const { pathname } = useLocation();

  return (
    <>
      <AppErrorBoundary resetKey={pathname}>
        <AppRoutes />
      </AppErrorBoundary>
      <Toaster position="top-right" richColors theme={theme} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionRealtimeProvider>
            <ThemedShell />
          </SessionRealtimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
