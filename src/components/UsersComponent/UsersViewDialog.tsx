import { Image, Mail, User as UserIcon, X } from 'lucide-react';
import React from 'react';
import { getImageUrl } from '../../utils/image.utils';
import type { User } from '../../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatFullName, getPersonInitials } from '../../utils/name.utils';

interface UsersViewDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UsersViewDialog: React.FC<UsersViewDialogProps> = ({ open, onClose, user }) => {
  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'editeur':
        return 'Éditeur';
      case 'lecteur':
        return 'Lecteur';
      default:
        return role;
    }
  };

  const getInitials = () => getPersonInitials(user);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="
          !w-[96vw]
          !max-w-[calc(100%-1rem)]
          sm:!max-w-6xl
          !h-[90vh]
          !max-h-[90vh]
          gap-0
          overflow-hidden
          rounded-[30px]
          border-2 border-ink-100
          bg-white
          p-0
          shadow-[0_24px_80px_rgba(15,23,42,0.35)]
          [&>button]:hidden
        "
      >
        <div className="grid h-full min-h-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Colonne gauche desktop */}
          <aside className="hidden min-h-0 flex-col border-r border-ink-100 bg-ink-950 p-5 text-white lg:flex">
            {/* Avatar en haut gauche */}
            <div className="w-full self-start">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="aspect-[16/9] w-full bg-ink-800">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={formatFullName(user)}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
                      <div className="text-center">
                        <Image className="mx-auto mb-2 h-12 w-12 text-ink-500" />
                        <p className="text-sm text-ink-400">Aucune photo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Texte séparé de l'image pour meilleure lisibilité */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">Utilisateur</Badge>

                <Badge
                  className={`rounded-full px-3 py-1 text-white ${
                    user.estActif ? 'bg-emerald-500' : 'bg-ink-500'
                  }`}
                >
                  {user.estActif ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight text-white">
                  {user.prenom} {user.nom}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-white text-ink-900">
                    <UserIcon className="mr-1 h-3.5 w-3.5" />
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {user.email && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-white/80">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Email</span>
                    </div>
                    <p className="text-base font-semibold text-white break-all">{user.email}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-white/80">
                    <span className="text-xs uppercase tracking-wide">Rôle</span>
                  </div>
                  <p className="text-base font-semibold text-white">{getRoleLabel(user.role)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/70">Créé le</p>
                <p className="text-base font-semibold text-white">{formatDate(user.creeLe)}</p>
              </div>
            </div>
          </aside>

          {/* Colonne droite */}
          <section className="flex min-h-0 flex-col">
            {/* Header */}
            <DialogHeader className="shrink-0 border-b border-ink-100 bg-white px-5 py-4 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-bold text-ink-900">
                    Détails de l'utilisateur
                  </DialogTitle>
                  <p className="mt-1 text-sm text-ink-500">Informations complètes du compte</p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 shrink-0 rounded-full border border-ink-100 bg-white hover:bg-ink-100"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Body scrollable */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
              {/* Version mobile */}
              <div className="mb-5 lg:hidden">
                <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
                  <div className="p-4">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={user.avatar ? getImageUrl(user.avatar) : undefined}
                          alt="Avatar"
                        />
                        <AvatarFallback className="bg-ink-100 text-ink-700 text-xl">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="mb-2 text-xl font-bold text-ink-900">
                          {formatFullName(user)}
                        </h2>
                        <p className="text-sm text-ink-500 mb-2">{user.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={user.estActif ? 'default' : 'secondary'}>
                            {user.estActif ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                {/* Colonne principale */}
                <div className="space-y-5">
                  <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-700">
                      Informations personnelles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-ink-50 rounded-lg">
                        <p className="text-xs text-ink-500 mb-1">Prénom</p>
                        <p className="text-sm font-medium text-ink-900">{user.prenom}</p>
                      </div>
                      <div className="p-3 bg-ink-50 rounded-lg">
                        <p className="text-xs text-ink-500 mb-1">Nom</p>
                        <p className="text-sm font-medium text-ink-900">{user.nom}</p>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-ink-50 rounded-lg">
                      <p className="text-xs text-ink-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-ink-900">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Colonne secondaire */}
                <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-700">
                      Informations
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-ink-500">Rôle</p>
                        <div className="mt-1">
                          <Badge
                            variant={
                              user.role === 'admin'
                                ? 'default'
                                : user.role === 'editeur'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-ink-500">Statut</p>
                        <div className="mt-1">
                          <Badge variant={user.estActif ? 'default' : 'outline'}>
                            {user.estActif ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-ink-500">Créé le</p>
                        <p className="text-sm font-medium text-ink-900">
                          {formatDate(user.creeLe)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-500">Mis à jour le</p>
                        <p className="text-sm font-medium text-ink-900">
                          {formatDate(user.misAJourLe)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end border-t border-ink-100 bg-white px-5 py-4 lg:px-6">
              <Button type="button" onClick={onClose} variant="outline" className="rounded-xl">
                Fermer
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsersViewDialog;
