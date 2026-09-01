import React from 'react';
import type { UserPresence, UserPresenceStatus } from '@/types/session.types';
import { formatRelativeTime } from '@/utils';
import { PRESENCE_DOT_COLORS, PRESENCE_LABELS, PRESENCE_TEXT_COLORS } from '../../constants/presence.constants';

function presenceHint(presence: UserPresence): string {
  switch (presence.status) {
    case 'online':
      return presence.activeSessions > 1
        ? `${presence.activeSessions} sessions actives`
        : '1 session active';
    case 'inactive':
      return presence.validSessions > 1
        ? `${presence.validSessions} sessions encore valides`
        : '1 session encore valide';
    default:
      return presence.totalSessions > 0 ? 'aucune session valide' : 'aucune session';
  }
}

const PresenceBadge: React.FC<{
  presence?: UserPresence | null;
  showHint?: boolean;
  className?: string;
}> = ({ presence, showHint = true, className = '' }) => {
  const status: UserPresenceStatus = presence?.status ?? 'offline';
  const hint = presence ? presenceHint(presence) : '';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-2.5 py-1 text-xs font-medium ${PRESENCE_TEXT_COLORS[status]}`}
        title={
          presence?.lastActivityAt
            ? `Dernière activité : ${formatRelativeTime(presence.lastActivityAt)}`
            : 'Aucune activité récente'
        }
      >
        <span
          className={`size-2 rounded-full ${PRESENCE_DOT_COLORS[status]} ${
            status === 'online' ? 'animate-pulse' : ''
          }`}
        />
        {PRESENCE_LABELS[status]}
      </span>
      {showHint && hint && <span className="text-xs text-ink-400">{hint}</span>}
    </span>
  );
};

export default PresenceBadge;
