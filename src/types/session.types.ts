export type SessionStatus = 'active' | 'inactive' | 'expired' | 'revoked';

export type UserPresenceStatus = 'online' | 'inactive' | 'offline';

export interface SessionInfo {
  id: string;
  userId: number;
  status: SessionStatus;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  lastSeenAt: string | null;
  revokedAt: string | null;
  revokedBy: number | null;
  ipAddress: string | null;
  deviceName: string | null;
  browserName: string | null;
  osName: string | null;
  isCurrent?: boolean;
}

export interface UserPresence {
  status: UserPresenceStatus;
  activeSessions: number;
  validSessions: number;
  totalSessions: number;
  lastActivityAt: string | null;
}

export interface PresenceUser {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  presence: UserPresence;
}

export interface PresenceList {
  items: PresenceUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  sessionId?: string;
  expiresAt?: string;
}

export type SessionEventAction =
  | 'session.created'
  | 'session.touched'
  | 'session.expired'
  | 'session.revoked'
  | 'session.logout'
  | 'sessions.revokedAll';

export interface SessionChangedEvent {
  userId: number;
  sessionId: string | null;
  action: SessionEventAction;
  sessionStatus: SessionStatus | null;
  presence: UserPresence;
  at: string;
}

export interface PresenceChangedEvent {
  userId: number;
  presence: UserPresence;
}

export interface SessionRevokedEvent {
  userId: number;
  sessionId: string | null;
  action: SessionEventAction;
  reason: string | null;
  at: string;
}

/** Événement `settings.updated` diffusé aux administrateurs (Spec §12). */
export interface SettingsUpdatedEvent {
  settings: { admissionsOuvertes: boolean };
  updatedAt: string;
}
