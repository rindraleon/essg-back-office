import {
  IdCard,
  LoaderCircle,
  LogOut,
  Mail,
  MonitorSmartphone,
  Pencil,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts';
import { getImageUrl, formatFullName, getPersonInitials, formatRelativeTime } from '@/utils';
import { useTitle, useScrollToTop, useMySessions, useRevokeMySession } from '@/hooks';
import { Button } from '@/components';
import { Badge } from '@/components/ui/badge';
import type { SessionStatus } from '@/types/session.types';
import ProfilEditDialog from './ProfilEditDialog';

const SESSION_STATUS_META: Record<
  SessionStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active', variant: 'default' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  expired: { label: 'Expirée', variant: 'outline' },
  revoked: { label: 'Révoquée', variant: 'destructive' },
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  editeur: 'Éditeur',
  lecteur: 'Lecteur',
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 rounded-md bg-ink-50 p-3">
    <span className="mt-0.5 shrink-0 text-ink-500">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 text-xs text-ink-500">{label}</p>
      <p className="truncate font-medium text-ink-900">{value}</p>
    </div>
  </div>
);

const Profil: React.FC = () => {
  useScrollToTop();
  useTitle('Profil');
  const { user, isLoading } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="h-32 animate-pulse rounded-xl border border-ink-100 bg-white" />
        <div className="h-56 animate-pulse rounded-xl border border-ink-100 bg-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-ink-100 bg-white p-8 text-center">
          <p className="text-sm text-ink-500">Profil indisponible. Reconnectez-vous.</p>
        </div>
      </div>
    );
  }

  const initials = getPersonInitials(user);
  const showAvatar = Boolean(user.avatar) && !avatarError;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6 lg:p-8">
      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          {showAvatar ? (
            <img
              loading="lazy"
              decoding="async"
              src={getImageUrl(user.avatar as string)}
              alt={formatFullName(user)}
              onError={() => setAvatarError(true)}
              className="size-20 shrink-0 rounded-full border border-ink-100 object-cover"
            />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-semibold text-brand-800">
              {initials}
            </span>
          )}

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="mb-1.5 text-2xl font-bold text-ink-900">{formatFullName(user)}</h1>
            <span className="inline-block rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>

          <Button onClick={() => setEditOpen(true)} className="w-full shrink-0 sm:w-auto">
            <Pencil className="size-4" />
            Modifier le profil
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
          <UserIcon className="size-4 text-brand-600" />
          Informations personnelles
        </h2>
        <div className="mb-4 h-px w-full bg-ink-100" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoCard icon={<IdCard className="size-4" />} label="Nom" value={user.nom} />
          <InfoCard icon={<UserIcon className="size-4" />} label="Prénom" value={user.prenom} />
          <InfoCard icon={<Mail className="size-4" />} label="Email" value={user.email} />
          <InfoCard
            icon={<Shield className="size-4" />}
            label="Rôle"
            value={ROLE_LABELS[user.role] ?? user.role}
          />
        </div>
      </section>

      <MySessionsSection />

      <ProfilEditDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </div>
  );
};

const MySessionsSection: React.FC = () => {
  const { data: sessions = [], isLoading } = useMySessions();
  const revokeMySessionMutation = useRevokeMySession();

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeMySessionMutation.mutateAsync(sessionId);
      toast.success('Appareil déconnecté');
    } catch {
      toast.error('Impossible de déconnecter cet appareil');
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-400">
        <LoaderCircle className="size-4 animate-spin" />
        Chargement des sessions…
      </div>
    );
  } else if (sessions.length === 0) {
    body = <p className="py-4 text-center text-sm text-ink-400">Aucune session enregistrée.</p>;
  } else {
    body = (
      <ul className="space-y-3">
        {sessions.map((session) => {
          const meta = SESSION_STATUS_META[session.status];
          const canRevoke =
            !session.isCurrent && session.status !== 'revoked' && session.status !== 'expired';
          return (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50/60 p-3"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink-900">
                  {session.deviceName ?? 'Appareil inconnu'}
                  {session.isCurrent && <Badge variant="outline">Session courante</Badge>}
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {[session.browserName, session.osName].filter(Boolean).join(' · ') || '—'}
                  {' · Dernière activité '}
                  {formatRelativeTime(session.lastActivityAt)}
                </p>
              </div>
              {canRevoke && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revokeMySessionMutation.isPending}
                  onClick={() => handleRevoke(session.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="size-4" />
                  Déconnecter
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-900">
        <MonitorSmartphone className="size-4 text-brand-600" />
        Mes sessions
      </h2>
      <p className="mb-3 text-xs text-ink-400">
        Chaque connexion (navigateur, appareil) est une session indépendante. La déconnexion d'un
        appareil n'affecte pas les autres.
      </p>
      <div className="mb-4 h-px w-full bg-ink-100" />
      {body}
    </section>
  );
};

export default Profil;
