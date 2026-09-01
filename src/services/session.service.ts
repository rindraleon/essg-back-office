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

/** Déconnecter UN de mes autres appareils (session distante). */
export const revokeMySession = async (sessionId: string): Promise<{ revoked: boolean }> => {
  return apiClient.post<{ revoked: boolean }>(`/auth/sessions/${sessionId}/revoke`);
};

export const getUsersPresence = async (page = 1, limit = 100): Promise<PresenceList> => {
  return apiClient.get<PresenceList>('/admin/users/presence', { page, limit });
};

export const getUserPresenceById = async (userId: number): Promise<PresenceUser> => {
  const list = await getUsersPresence(1, 1000);
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
