import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeAllSessions, revokeMySession, revokeSession } from '@/services/session.service';
import { queryKeys } from '../queries/keys';

function invalidateAllSessionData(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      sessionId,
      reason,
    }: {
      userId: number;
      sessionId: string;
      reason?: string;
    }) => revokeSession(userId, sessionId, reason),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.user(variables.userId),
      });
      invalidateAllSessionData(queryClient);
    },
  });
}

/** Déconnexion d'un de MES autres appareils */
export function useRevokeMySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeMySession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.mine() });
      invalidateAllSessionData(queryClient);
    },
  });
}

/** Révocation administrative de TOUTES les sessions d'un utilisateur */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => revokeAllSessions(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.user(userId),
      });
      invalidateAllSessionData(queryClient);
    },
  });
}
