import type { ReactNode } from 'react';

import { Mail, Shield, UserRound, X } from 'lucide-react';

import { getImageUrl, formatFullName, getPersonInitials } from '@/utils';
import type { User } from '@/types';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface UsersViewDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface InfoItemProps {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  editeur: 'Éditeur',
  lecteur: 'Lecteur',
};

const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;

function InfoItem({ label, value, icon }: Readonly<InfoItemProps>) {
  return (
    <div className="group flex min-w-0 items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-3.5 transition-colors hover:bg-ink-50">
      {icon ? (
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-ink-500 shadow-sm ring-1 ring-ink-100"
        >
          {icon}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>

        <p className="truncate text-sm font-semibold text-ink-900">{value || 'Non renseigné'}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: Readonly<{
  icon: ReactNode;
  title: string;
}>) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600"
      >
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-ink-950">{title}</h3>
    </div>
  );
}

function UsersViewDialog({ open, onClose, user }: Readonly<UsersViewDialogProps>) {
  if (!user) {
    return null;
  }

  const fullName = formatFullName(user);
  const initials = getPersonInitials(user);
  const roleLabel = getRoleLabel(user.role);

  const roleVariant =
    user.role === 'admin' ? 'default' : user.role === 'editeur' ? 'secondary' : 'outline';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100%-2rem)]
          max-w-3xl
          overflow-hidden
          rounded-2xl
          border-ink-100
          bg-white
          p-0
          shadow-[0_24px_80px_rgba(15,23,42,0.18)]
        "
      >
        {/* Header */}
        <DialogHeader className="border-b border-ink-100 px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-1 ring-ink-100">
                  <AvatarImage
                    src={user.avatar ? getImageUrl(user.avatar) : undefined}
                    alt={fullName}
                  />

                  <AvatarFallback className="bg-ink-100 text-lg font-bold text-ink-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Online indicator */}
                <span
                  aria-label={user.estActif ? 'Compte actif' : 'Compte inactif'}
                  className={`
                    absolute
                    bottom-0
                    right-0
                    h-3.5
                    w-3.5
                    rounded-full
                    border-2
                    border-white
                    ${user.estActif ? 'bg-emerald-500' : 'bg-ink-300'}
                  `}
                />
              </div>

              <div className="min-w-0">
                <DialogTitle className="truncate text-xl font-bold tracking-tight text-ink-950">
                  {fullName}
                </DialogTitle>

                {user.email ? (
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                    <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ink-400" />

                    <span className="truncate text-sm text-ink-500">{user.email}</span>
                  </div>
                ) : null}

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Badge variant={roleVariant} className="rounded-lg px-2.5 py-1 text-xs">
                    <Shield aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />
                    {roleLabel}
                  </Badge>

                  <Badge
                    variant={user.estActif ? 'default' : 'secondary'}
                    className="rounded-lg px-2.5 py-1 text-xs"
                  >
                    {user.estActif ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              className="
                h-9
                w-9
                shrink-0
                rounded-lg
                text-ink-500
                transition-colors
                hover:bg-ink-100
                hover:text-ink-900
              "
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 px-6 py-6 sm:px-7">
          {/* Account overview */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Statut</p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`
                    h-2
                    w-2
                    rounded-full
                    ${user.estActif ? 'bg-emerald-500' : 'bg-ink-300'}
                  `}
                />

                <span className="text-sm font-semibold text-ink-900">
                  {user.estActif ? 'Compte actif' : 'Compte inactif'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Rôle</p>

              <p className="mt-2 text-sm font-semibold text-ink-900">{roleLabel}</p>
            </div>

            <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Profil</p>

              <p className="mt-2 text-sm font-semibold text-ink-900">Utilisateur</p>
            </div>
          </div>

          {/* Personal information */}
          <section aria-labelledby="personal-information-title">
            <SectionHeader
              icon={<UserRound aria-hidden="true" className="h-4 w-4" />}
              title="Informations personnelles"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Nom" value={user.nom} />

              <InfoItem label="Prénom" value={user.prenom} />
            </div>
          </section>

          {/* Account information */}
          <section aria-labelledby="account-information-title">
            <SectionHeader
              icon={<Shield aria-hidden="true" className="h-4 w-4" />}
              title="Informations du compte"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="Rôle" value={roleLabel} />

              <InfoItem label="Statut" value={user.estActif ? 'Actif' : 'Inactif'} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-ink-100 bg-ink-50/40 px-6 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg px-5">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UsersViewDialog;
