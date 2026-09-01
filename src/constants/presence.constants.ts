import type { UserPresenceStatus } from '@/types/session.types';

export const PRESENCE_LABELS: Record<UserPresenceStatus, string> = {
  online: 'En ligne',
  inactive: 'Inactif',
  offline: 'Hors ligne',
};

export const PRESENCE_DOT_COLORS: Record<UserPresenceStatus, string> = {
  online: 'bg-emerald-500',
  inactive: 'bg-amber-400',
  offline: 'bg-slate-300',
};

export const PRESENCE_TEXT_COLORS: Record<UserPresenceStatus, string> = {
  online: 'text-emerald-700',
  inactive: 'text-amber-700',
  offline: 'text-slate-500',
};
