import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './styles/index.css';
import { AppRoutes } from '@/routes';
import { AuthProvider, ThemeProvider, useTheme } from '@/contexts';
// Import direct (hors baril) pour ne pas charger les composants lourds
// (PDF.js, Leaflet…) dans le shell pré-authentification (ESSG-PERF-02).
import { SessionRealtimeProvider } from '@/components/common/SessionRealtimeProvider';
import { queryClient } from '@/lib';

/** Isole les hooks consommant le thème du reste du shell applicatif. */
function ThemedShell() {
  const { theme } = useTheme();

  return (
    <>
      <AppRoutes />
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
