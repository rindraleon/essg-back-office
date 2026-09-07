import { apiClient } from '@/api';
import type { PresenceList, PresenceUser, SessionInfo } from '@/types/session.types';

export const getCurrentSession = async (): Promise<SessionInfo> => {
  return apiClient.get<SessionInfo>('/auth/session');
};

export const getMySessions = async (): Promise<SessionInfo[]> => {
  return apiClient.get<SessionInfo[]>('/auth/sessions');
};

export const logoutCurrentSession = async (): Promise<{ loggedOut: boolean }> => {
  return apiClient.post<{ loggedOut: boolean }>('/auth/logout');
};

export const revokeMySession = async (sessionId: string): Promise<{ revoked: boolean }> => {
  return apiClient.post<{ revoked: boolean }>(`/auth/sessions/${sessionId}/revoke`);
};

export const getUsersPresence = async (): Promise<PresenceList> => {
  const result = await apiClient.getList<PresenceUser>('/admin/users/presence');
  return {
    items: result.data,
    meta: {
      total: result.meta.total,
      page: result.meta.page,
      limit: result.meta.limit,
      totalPages: result.meta.totalPages,
    },
  };
};

export const getUserPresenceById = async (userId: number): Promise<PresenceUser> => {
  const list = await getUsersPresence();
  const found = list.items.find((item) => item.id === userId);
  if (!found) {
    throw new Error(`Présence introuvable pour l'utilisateur #${userId}`);
  }
  return found;
};

export const getUserSessions = async (userId: number): Promise<SessionInfo[]> => {
  return apiClient.get<SessionInfo[]>(`/admin/users/${userId}/sessions`);
};

export const revokeSession = async (
  userId: number,
  sessionId: string,
  reason?: string
): Promise<SessionInfo> => {
  return apiClient.post<SessionInfo>(`/admin/users/${userId}/sessions/${sessionId}/revoke`, {
    ...(reason ? { reason } : {}),
  });
};

export const revokeAllSessions = async (userId: number): Promise<{ revoked: number }> => {
  return apiClient.post<{ revoked: number }>(`/admin/users/${userId}/sessions/revoke-all`);
};
