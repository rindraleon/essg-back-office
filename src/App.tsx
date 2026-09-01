import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './styles/index.css';
import { AppRoutes } from '@/routes';
import { AuthProvider } from '@/contexts';
import { SessionRealtimeProvider } from '@/components';
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
