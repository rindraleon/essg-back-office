import React, { useState } from 'react';
import { LoaderCircle, LogOut, MonitorSmartphone, Power } from 'lucide-react';
import { toast } from 'sonner';
import { formatFullName, formatRelativeTime } from '@/utils';
import type { User } from '@/types';
import type { SessionInfo, SessionStatus } from '@/types/session.types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import ConfirmDialog from '../common/ConfirmDialog';
import PresenceBadge from '../common/PresenceBadge';
import { useUserSessions, useUsersPresence } from '@/hooks/queries/useSessionQueries';
import { useRevokeAllSessions, useRevokeSession } from '@/hooks/mutations/useSessionMutations';

const SESSION_STATUS_META: Record<
  SessionStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  expired: { label: 'Expirée', variant: 'outline' },
  revoked: { label: 'Révoquée', variant: 'destructive' },
};

interface UserSessionsDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

function renderSessionsList(
  isLoading: boolean,
  sessions: SessionInfo[],
  revokePending: boolean,
  onRevoke: (session: SessionInfo) => void
): React.ReactNode {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-400">
        <LoaderCircle className="size-4 animate-spin" />
        Chargement des sessions…
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-400">
        Aucune session enregistrée pour cet utilisateur.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => {
        const meta = SESSION_STATUS_META[session.status];
        const revocable = session.status !== 'revoked' && session.status !== 'expired';
        return (
          <li key={session.id} className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium text-ink-900">
                  {session.deviceName ?? 'Appareil inconnu'}
                  {session.isCurrent && <Badge variant="outline">Session courante</Badge>}
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {[session.browserName, session.osName].filter(Boolean).join(' · ') ||
                    'Navigateur inconnu'}
                  {session.ipAddress ? ` · IP ${session.ipAddress}` : ''}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  Dernière activité :{' '}
                  <span className="font-medium text-ink-600">
                    {formatRelativeTime(session.lastActivityAt)}
                  </span>{' '}
                  · Créée le {new Date(session.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              {revocable && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revokePending}
                  onClick={() => onRevoke(session)}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="size-4" />
                  Déconnecter cette session
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const UserSessionsDialog: React.FC<UserSessionsDialogProps> = ({ open, onClose, user }) => {
  const userId = user?.id ?? null;
  const { data: sessions = [], isLoading, isFetching } = useUserSessions(userId);
  const { data: presenceList } = useUsersPresence();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();

  const [sessionToRevoke, setSessionToRevoke] = useState<SessionInfo | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  if (!user) return null;

  const presence = presenceList?.items.find((item) => item.id === user.id)?.presence ?? null;
  const sessionsActives = sessions.filter((session) => session.status === 'active');

  let sessionsSummary: string;
  if (isFetching) {
    sessionsSummary = 'Actualisation…';
  } else if (sessionsActives.length > 0) {
    sessionsSummary = `${sessionsActives.length} session(s) active(s) sur ${sessions.length}`;
  } else {
    sessionsSummary = 'Aucune session active';
  }

  const handleRevokeOne = async () => {
    if (!sessionToRevoke) return;
    try {
      await revokeSessionMutation.mutateAsync({
        userId: user.id,
        sessionId: sessionToRevoke.id,
      });
      toast.success('Session déconnectée. Les autres sessions restent actives.');
      setSessionToRevoke(null);
    } catch {
      toast.error('Impossible de révoquer cette session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllMutation.mutateAsync(user.id);
      toast.success(`Toutes les sessions de ${formatFullName(user)} ont été déconnectées`);
      setConfirmRevokeAll(false);
    } catch {
      toast.error('Impossible de révoquer toutes les sessions');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="!w-[96vw] !max-w-3xl rounded-[24px] border-2 border-ink-100 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.35)]"
        >
          <DialogHeader className="border-b border-ink-100 px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <MonitorSmartphone className="size-5" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-semibold text-ink-900">
                    Sessions de {formatFullName(user)}
                  </DialogTitle>
                  <PresenceBadge presence={presence} className="mt-1" />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                ✕
              </Button>
            </div>
          </DialogHeader>

          <DialogBody className="max-h-[55vh] overflow-y-auto px-6 py-4">
            {renderSessionsList(isLoading, sessions, revokeSessionMutation.isPending, (session) =>
              setSessionToRevoke(session)
            )}
          </DialogBody>

          <DialogFooter className="border-t border-ink-100 px-6 py-4">
            <div className="flex w-full items-center justify-between gap-3">
              <p className="text-xs text-ink-400">{sessionsSummary}</p>
              <Button
                variant="destructive"
                disabled={sessions.length === 0 || revokeAllMutation.isPending}
                onClick={() => setConfirmRevokeAll(true)}
              >
                <Power className="size-4" />
                Déconnecter toutes les sessions
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={sessionToRevoke !== null}
        title="Déconnecter cette session"
        message={
          sessionToRevoke
            ? `Révoquer la session « ${sessionToRevoke.deviceName ?? 'inconnue'} » de ${formatFullName(user)} ? L'utilisateur sera immédiatement déconnecté de CET appareil uniquement ; ses autres sessions resteront actives.`
            : ''
        }
        confirmLabel="Déconnecter"
        cancelLabel="Annuler"
        severity="warning"
        loading={revokeSessionMutation.isPending}
        onConfirm={handleRevokeOne}
        onCancel={() => setSessionToRevoke(null)}
      />

      <ConfirmDialog
        open={confirmRevokeAll}
        title="Déconnecter toutes les sessions"
        message={`Révoquer TOUTES les sessions de ${formatFullName(user)} ? L'utilisateur sera déconnecté de tous ses appareils et passera hors ligne.`}
        confirmLabel="Tout déconnecter"
        cancelLabel="Annuler"
        severity="error"
        loading={revokeAllMutation.isPending}
        onConfirm={handleRevokeAll}
        onCancel={() => setConfirmRevokeAll(false)}
      />
    </>
  );
};

export default UserSessionsDialog;
