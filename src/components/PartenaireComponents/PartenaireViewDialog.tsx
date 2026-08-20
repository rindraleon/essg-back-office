import { Calendar, Globe, Mail, Tag, X } from 'lucide-react';
import React from 'react';
import { getImageUrl, isRemoteImage } from '../../utils/image.utils';
import type { Partenaire } from '../../types/partenaire.types';
import { PARTENAIRE_TYPE_COLORS } from '../../constants/partenaire.constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils';

interface PartenaireViewDialogProps {
  open: boolean;
  onClose: () => void;
  partenaire: Partenaire | null;
}

const getBadgeVariant = (
  colorType: string,
): React.ComponentProps<typeof Badge>['variant'] => {
  switch (colorType) {
    case 'primary':
      return 'default';
    case 'secondary':
      return 'secondary';
    case 'success':
      return 'default';
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

  const badgeVariant: React.ComponentProps<typeof Badge>['variant'] = getBadgeVariant(
    PARTENAIRE_TYPE_COLORS[partenaire.type],
  );

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
        <div className="flex min-h-0 flex-col">
          <DialogHeader className="shrink-0 border-b border-ink-100 bg-white px-5 py-4 lg:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-ink-900">
                  Détail du partenaire
                </DialogTitle>
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

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
            {/* Logo and Title */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                {partenaire.logo &&
                (partenaire.logo.startsWith('/uploads/') || partenaire.logo.startsWith('http')) ? (
                  <AvatarImage
                    src={getImageUrl(partenaire.logo)}
                    alt={partenaire.nom}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-ink-100 text-ink-700 text-3xl">
                    {partenaire.logo}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-bold mb-1">{partenaire.nom}</h3>
                <Badge variant={badgeVariant}>{partenaire.type}</Badge>
              </div>
            </div>

            <hr className="my-4" />

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-1 text-ink-600 text-sm">
                <Tag className="size-4" />
                <span className="font-medium">Secteur:</span>
                <span>{partenaire.secteur}</span>
              </div>
              <div className="flex items-center gap-1 text-ink-600 text-sm">
                <Calendar className="size-4" />
                <span className="font-medium">Depuis:</span>
                <span>{formatDate(partenaire.dateDebut)}</span>
              </div>
            </div>

            <hr className="my-4" />

            {/* Description */}
            <div className="mb-4">
              <h4 className="font-semibold text-ink-700 mb-2">Description</h4>
              <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">
                {partenaire.description}
              </p>
            </div>

            <hr className="my-4" />

            {/* Contact Information */}
            <div className="space-y-3">
              {partenaire.siteWeb && (
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-ink-600" />
                  <span className="text-sm text-ink-700">
                    <span className="font-semibold">Site web:</span>{' '}
                    <a
                      href={partenaire.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {partenaire.siteWeb}
                    </a>
                  </span>
                </div>
              )}

              {partenaire.contact && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-ink-600" />
                  <span className="text-sm text-ink-700">
                    <span className="font-semibold">Contact:</span> {partenaire.contact}
                  </span>
                </div>
              )}
            </div>

            {/* Logo Info */}
            <div className="mt-4 pt-4 border-t border-ink-100">
              <h4 className="font-semibold text-ink-700 mb-2">Logo</h4>
              <div className="bg-ink-50 p-3 rounded-lg border border-ink-100">
                {isRemoteImage(partenaire.logo) ? (
                  <div>
                    <p className="text-sm text-ink-600 block mb-2">
                      {/* <span className="font-semibold">Image:</span> {partenaire.logo} */}
                    </p>
                    <img
                      src={getImageUrl(partenaire.logo)}
                      alt={`Logo de ${partenaire.nom}`}
                      className="max-w-[200px] max-h-[200px] rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-ink-600">
                    <span className="font-semibold">Emoji:</span> {partenaire.logo || 'Aucun'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end border-t border-ink-100 bg-white px-5 py-4 lg:px-6">
            <Button type="button" onClick={onClose} variant="outline" className="rounded-xl">
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartenaireViewDialog;
