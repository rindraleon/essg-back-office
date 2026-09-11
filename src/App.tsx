import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './styles/index.css';
import { AppRoutes } from '@/routes';
import { AuthProvider } from '@/contexts';
// Import direct (hors baril) pour ne pas charger les composants lourds
// (PDF.js, Leaflet…) dans le shell pré-authentification (ESSG-PERF-02).
import { SessionRealtimeProvider } from '@/components/common/SessionRealtimeProvider';
import { queryClient } from '@/lib';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionRealtimeProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </SessionRealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
