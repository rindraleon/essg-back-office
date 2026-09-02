import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthToken, getAuthToken } from '@/api';
import { presenceSocket } from '@/api/client/socket';
import { useAuth } from '@/contexts';
import { queryKeys } from '@/hooks/queries/keys';

export const SessionRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      presenceSocket.disconnect();
      return;
    }
    const token = getAuthToken();
    if (!token) return;
    presenceSocket.connect(token);

    const unsubscribeSession = presenceSocket.onSessionChanged((event) => {
      if (event.sessionId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.user(event.userId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.current() });
    });

    const unsubscribeRevoked = presenceSocket.onSessionRevoked((event) => {
      if (event.userId !== user?.id) return;
      clearAuthToken();
      queryClient.clear();
      if (window.location.pathname !== '/login') {
        window.location.replace('/login?reason=session-revoked');
      }
    });

    const unsubscribeSettings = presenceSocket.onSettingsUpdated((event) => {
      queryClient.setQueryData(queryKeys.settings.get(), event.settings);
    });

    return () => {
      unsubscribeSession();
      unsubscribeRevoked();
      unsubscribeSettings();
    };
  }, [isAuthenticated, user?.id, queryClient]);

  return <>{children}</>;
};

export default SessionRealtimeProvider;
