import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from './http';
import type {
  PresenceChangedEvent,
  SessionChangedEvent,
  SessionRevokedEvent,
  SettingsUpdatedEvent,
} from '@/types/session.types';

type PresenceListener = (event: PresenceChangedEvent) => void;
type SessionListener = (event: SessionChangedEvent) => void;
type RevokedListener = (event: SessionRevokedEvent) => void;
type SettingsListener = (event: SettingsUpdatedEvent) => void;

class PresenceSocket {
  private socket: Socket | null = null;
  private readonly presenceListeners = new Set<PresenceListener>();
  private readonly sessionListeners = new Set<SessionListener>();
  private readonly revokedListeners = new Set<RevokedListener>();
  private readonly settingsListeners = new Set<SettingsListener>();

  connect(token: string): void {
    const currentAuth = this.socket?.auth as { token?: string } | undefined;
    if (this.socket?.connected && currentAuth?.token === token) return;
    this.disconnect();

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });
    this.socket = socket;

    socket.on('connect', () => {
      socket.emit('presence:ping', { at: new Date().toISOString() });
    });
    socket.on('presence:changed', (event: PresenceChangedEvent) => {
      this.presenceListeners.forEach((listener) => listener(event));
    });
    socket.on('session:changed', (event: SessionChangedEvent) => {
      this.sessionListeners.forEach((listener) => listener(event));
    });
    socket.on('session:revoked', (event: SessionRevokedEvent) => {
      this.revokedListeners.forEach((listener) => listener(event));
    });
    socket.on('settings.updated', (event: SettingsUpdatedEvent) => {
      this.settingsListeners.forEach((listener) => listener(event));
    });
    socket.on('auth:error', () => {
      socket.disconnect();
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  onPresenceChanged(listener: PresenceListener): () => void {
    this.presenceListeners.add(listener);
    return () => this.presenceListeners.delete(listener);
  }

  onSessionChanged(listener: SessionListener): () => void {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  }

  onSessionRevoked(listener: RevokedListener): () => void {
    this.revokedListeners.add(listener);
    return () => this.revokedListeners.delete(listener);
  }

  onSettingsUpdated(listener: SettingsListener): () => void {
    this.settingsListeners.add(listener);
    return () => this.settingsListeners.delete(listener);
  }
}

export const presenceSocket = new PresenceSocket();
