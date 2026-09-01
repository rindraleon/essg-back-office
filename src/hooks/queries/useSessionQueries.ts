import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/contexts';
import type { PresenceChangedEvent, PresenceList } from '@/types/session.types';
import { presenceSocket } from '@/api/client/socket';
import {
  getCurrentSession,
  getMySessions,
  getUserSessions,
  getUsersPresence,
} from '@/services/session.service';
import { queryKeys } from './keys';

export function useCurrentSession() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.sessions.current(),
    queryFn: getCurrentSession,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    retry: false,
  });
}

/** Toutes les sessions du compte connecté (multi-appareils). */
export function useMySessions() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.sessions.mine(),
    queryFn: getMySessions,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    retry: false,
  });
}

/** Sessions détaillées d'un utilisateur (back-office, admin). */
export function useUserSessions(userId: number | null) {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: queryKeys.sessions.user(userId ?? -1),
    queryFn: () => getUserSessions(userId as number),
    enabled: isAdmin && userId !== null,
  });
}

export function useUsersPresence(page = 1, limit = 1000) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = presenceSocket.onPresenceChanged((event) => {
      const cacheKey = queryKeys.sessions.presence(page, limit);
      queryClient.setQueryData(cacheKey, (old: PresenceList | undefined) =>
        applyPresenceChange(old, event)
      );
    });
    return unsubscribe;
  }, [page, limit, queryClient]);

  return useQuery({
    queryKey: queryKeys.sessions.presence(page, limit),
    queryFn: () => getUsersPresence(page, limit),
    enabled: isAdmin,
    select: normalizePresenceList,
    refetchInterval: () => (presenceSocket.connected ? false : 15_000),
    staleTime: 10_000,
  });
}

/** Garantit une liste de présence utilisable, quelle que soit la réponse. */
function normalizePresenceList(data: PresenceList | undefined): PresenceList {
  if (Array.isArray(data?.items)) return data;
  return { items: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } };
}

/** Fusion d'un événement `presence:changed` dans le cache de la liste. */
function applyPresenceChange(
  old: Awaited<ReturnType<typeof getUsersPresence>> | undefined,
  event: PresenceChangedEvent
): Awaited<ReturnType<typeof getUsersPresence>> | undefined {
  if (!old) return old;
  const items = Array.isArray(old.items) ? old.items : [];
  return {
    ...old,
    items: items.map((item) =>
      item.id === event.userId ? { ...item, presence: event.presence } : item
    ),
  };
}
