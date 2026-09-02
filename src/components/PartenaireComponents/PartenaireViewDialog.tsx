import React from 'react';
import { Building2, ExternalLink, Globe, Mail, Tag, X } from 'lucide-react';

import { getImageUrl, isRemoteImage, formatDate } from '@/utils';
import type { Partenaire } from '@/types';
import { PARTENAIRE_TYPE_COLORS } from '@/constants';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface PartenaireViewDialogProps {
  open: boolean;
  onClose: () => void;
  partenaire: Partenaire | null;
}

const getBadgeVariant = (colorType: string): React.ComponentProps<typeof Badge>['variant'] => {
  switch (colorType) {
    case 'primary':
    case 'success':
      return 'default';
    case 'secondary':
    case 'warning':
      return 'secondary';
    default:
      return 'outline';
  }
};

const PartenaireViewDialog: React.FC<PartenaireViewDialogProps> = ({
  open,
  onClose,
  partenaire,
}) => {
  if (!partenaire) return null;

  const badgeVariant = getBadgeVariant(PARTENAIRE_TYPE_COLORS[partenaire.type]);
  const logoIsImage = isRemoteImage(partenaire.logo);
  const hasContactInfo = partenaire.siteWeb || partenaire.contact;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[calc(100vw-2rem)]
          max-w-[850px]
          overflow-hidden
          rounded-2xl
          border border-ink-100
          bg-white
          p-0
          shadow-[0_24px_70px_rgba(15,23,42,0.18)]
        "
      >
        {/* ============ HEADER ÉPURÉ ============ */}
        <DialogHeader className="border-b border-ink-100 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Fiche Partenaire
              </span>
              <DialogTitle className="mt-0.5 truncate text-lg font-bold text-ink-950 sm:text-xl">
                {partenaire.nom}
              </DialogTitle>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="
                size-8
                shrink-0
                rounded-full
                border border-ink-100
                text-ink-400
                hover:bg-ink-50 hover:text-ink-900
              "
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* ============ GRILLE PRINCIPALE (SANS SCROLL) ============ */}
        <div className="grid grid-cols-1 divide-y divide-ink-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* COLONNE GAUCHE : Identité & Métadonnées (4/12) */}
          <aside className="bg-ink-50/30 p-6 lg:col-span-4 lg:p-8">
            <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-start lg:gap-6">
              {/* Logo */}
              <div
                className="
                  flex size-20
                  shrink-0 items-center justify-center
                  overflow-hidden rounded-xl
                  border border-ink-100 bg-white
                  shadow-sm
                  sm:size-24
                  lg:size-28
                "
              >
                {logoIsImage ? (
                  <img
                    src={getImageUrl(partenaire.logo)}
                    alt={`Logo de ${partenaire.nom}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-contain p-2.5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Avatar className="size-full rounded-xl">
                    <AvatarFallback className="rounded-xl bg-ink-100 text-2xl font-bold text-ink-600">
                      {partenaire.nom.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Badges & Type */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={badgeVariant}
                    className="px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
                  >
                    {partenaire.type}
                  </Badge>
                  {partenaire.secteur && (
                    <Badge
                      variant="outline"
                      className="gap-1 px-2 py-0 text-[10px] font-normal text-ink-600"
                    >
                      <Tag className="size-3" />
                      {partenaire.secteur}
                    </Badge>
                  )}
                </div>
                <p className="hidden text-xs text-ink-500 lg:block">
                  Informations d'identification et statut du partenariat.
                </p>
              </div>
            </div>

            {/* Date de début du partenariat */}
            <div className="mt-6 border-t border-ink-100/80 pt-5">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Partenaire depuis
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-ink-800">
                    {formatDate(partenaire.dateDebut)}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* COLONNE DROITE : Contenu & Coordonnées (8/12) */}
          <main className="p-6 lg:col-span-8 lg:p-8 flex flex-col justify-between gap-6">
            {/* Section Description */}
            <section aria-labelledby="desc-title">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 text-brand-600" />
                <h3
                  id="desc-title"
                  className="text-xs font-bold uppercase tracking-wider text-ink-900"
                >
                  À propos du partenaire
                </h3>
              </div>
              <div className="rounded-xl border border-ink-50 bg-ink-50/20 p-4">
                {partenaire.description ? (
                  <p className="text-sm leading-relaxed text-ink-600">{partenaire.description}</p>
                ) : (
                  <p className="text-sm italic text-ink-400">
                    Aucune description disponible pour ce partenaire.
                  </p>
                )}
              </div>
            </section>

            {/* Section Coordonnées */}
            <section aria-labelledby="contact-title">
              <div className="mb-2.5 flex items-center gap-2">
                <Mail className="size-4 text-brand-600" />
                <h3
                  id="contact-title"
                  className="text-xs font-bold uppercase tracking-wider text-ink-900"
                >
                  Coordonnées directes
                </h3>
              </div>

              {hasContactInfo ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {partenaire.siteWeb && (
                    <a
                      href={partenaire.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        group flex items-center gap-3
                        rounded-xl border border-ink-100 bg-white
                        p-3 transition-all
                        hover:border-brand-200 hover:bg-brand-50/20
                      "
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-ink-400">
                          Site Internet
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-ink-800 group-hover:text-brand-700 transition-colors">
                          {partenaire.siteWeb.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                      </div>
                      <ExternalLink className="size-3.5 shrink-0 text-ink-300 group-hover:text-brand-500 transition-colors" />
                    </a>
                  )}

                  {partenaire.contact && (
                    <a
                      href={
                        partenaire.contact.includes('@')
                          ? `mailto:${partenaire.contact}`
                          : undefined
                      }
                      className="
                        group flex items-center gap-3
                        rounded-xl border border-ink-100 bg-white
                        p-3 transition-all
                        hover:border-brand-200 hover:bg-brand-50/20
                      "
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-ink-400">
                          Contact
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-ink-800 group-hover:text-brand-700 transition-colors">
                          {partenaire.contact}
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/30 py-4 text-center">
                  <p className="text-xs text-ink-400">Aucune coordonnée enregistrée.</p>
                </div>
              )}
            </section>
          </main>
        </div>

        {/* ============ FOOTER CLASSIQUE ============ */}
        <footer className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/30 px-6 py-3 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 rounded-lg text-xs"
          >
            Fermer
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default PartenaireViewDialog;
