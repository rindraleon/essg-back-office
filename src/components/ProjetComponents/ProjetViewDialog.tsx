import {
  Calendar,
  Database,
  ExternalLink,
  Images,
  Info,
  MapPin,
  Tag,
  Users,
  X,
} from 'lucide-react';
import React from 'react';
import MapPicker from '../common/MapPicker';
import type { Projet } from '../../types/projet.types';
import { getTypeColor, formatDateLong } from '../../utils/projet.utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CoverImage from '../common/CoverImage';
import ImageGallery from '../common/ImageGallery';
import { DetailSection, TagList } from '../common/DetailSection';

interface ProjetViewDialogProps {
  open: boolean;
  onClose: () => void;
  projet: Projet | null;
}

const getTypeBadgeDarkClass = (typeColor: string) => {
  switch (typeColor) {
    case 'primary':
      return 'bg-brand-500 text-white';
    case 'success':
      return 'bg-emerald-500 text-white';
    case 'secondary':
      return 'bg-violet-500 text-white';
    case 'warning':
      return 'bg-sage-500 text-white';
    default:
      return 'border border-white/20 bg-white/10 text-white';
  }
};

const getTypeBadgeLightClass = (typeColor: string) => {
  switch (typeColor) {
    case 'primary':
      return 'border-0 bg-brand-100 text-brand-700 hover:bg-brand-100';
    case 'success':
      return 'border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'secondary':
      return 'border-0 bg-violet-100 text-violet-700 hover:bg-violet-100';
    case 'warning':
      return 'border-0 bg-sage-100 text-sage-600 hover:bg-sage-100';
    default:
      return 'border-0 bg-ink-100 text-ink-700 hover:bg-ink-100';
  }
};

const ProjetViewDialog: React.FC<ProjetViewDialogProps> = ({ open, onClose, projet }) => {
  if (!projet) return null;

  const typeColor = getTypeColor(projet.type);

  // ✅ Condition corrigée : accepte 0 comme valeur valide
  const hasLocation =
    projet.latitude !== null &&
    projet.latitude !== undefined &&
    projet.longitude !== null &&
    projet.longitude !== undefined;

  // La galerie exclut la photo de couverture : elle est déjà affichée en
  // tête de fiche, la répéter dans le carrousel n'apporterait rien.
  const galerie = (projet.galerie ?? []).filter(
    (image) => image?.trim() && image.trim() !== projet.image?.trim()
  );

  const locationText = [projet.ville, projet.pays].filter(Boolean).join(', ');
  const hasAddressBlock = Boolean(projet.adresse || locationText);

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
          border border-ink-100
          bg-gradient-to-br from-white via-ink-50 to-ink-100
          p-0
          shadow-[0_24px_80px_rgba(15,23,42,0.35)]
          [&>button]:hidden
        "
      >
        <div className="grid h-full min-h-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="hidden min-h-0 flex-col border-r border-ink-100 bg-ink-950 p-5 text-white lg:flex">
            {/* Photo de couverture : image principale, distincte de la galerie */}
            <CoverImage src={projet.image} alt={projet.titre} dark />

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
                  Fiche projet
                </Badge>

                <Badge className={`rounded-full px-3 py-1 ${getTypeBadgeDarkClass(typeColor)}`}>
                  <Tag className="mr-1 h-3.5 w-3.5" />
                  {projet.type}
                </Badge>

                {/* Statut : même information que sur le site public. */}
                <Badge className="rounded-full bg-white/10 px-3 py-1 text-white">
                  {projet.statut ?? 'En cours'}
                </Badge>
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight text-white">{projet.titre}</h2>

                <div className="mt-3 space-y-2 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateLong(projet.date)}</span>
                  </div>

                  {locationText && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{locationText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-ink-100 bg-white px-5 py-4 lg:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-bold text-ink-900">
                    Détails du projet
                  </DialogTitle>
                  <p className="mt-1 text-sm text-ink-500">Présentation complète du projet</p>
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
              <div className="mb-5 lg:hidden">
                <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
                  <CoverImage src={projet.image} alt={projet.titre} aspect="aspect-[16/9]" />

                  <div className="p-4">
                    <h2 className="mb-3 text-2xl font-bold text-ink-900">{projet.titre}</h2>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge className={`rounded-full ${getTypeBadgeLightClass(typeColor)}`}>
                        <Tag className="mr-1 h-3.5 w-3.5" />
                        {projet.type}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-ink-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateLong(projet.date)}</span>
                      </div>

                      {locationText && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{locationText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Contenu principal ── */}
              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                {/* Colonne principale */}
                <div className="space-y-5">
                  <DetailSection title="Description" icon={<Info className="size-4" />}>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink-600">
                      {projet.description}
                    </p>
                  </DetailSection>

                  {projet.partenaires && projet.partenaires.length > 0 && (
                    <DetailSection
                      title="Partenaires"
                      icon={<Users className="size-4" />}
                      count={projet.partenaires.length}
                    >
                      <TagList items={projet.partenaires} />
                    </DetailSection>
                  )}

                  {projet.sources && projet.sources.length > 0 && (
                    <DetailSection
                      title="Sources de données"
                      icon={<Database className="size-4" />}
                      count={projet.sources.length}
                    >
                      <ul className="space-y-2">
                        {projet.sources.map((source) => (
                          <li key={`${source.title}-${source.url}`}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
                            >
                              <span className="min-w-0 truncate font-medium">{source.title}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </DetailSection>
                  )}

                  {/*
                    Galerie du projet : carrousel autonome, séparé de la photo
                    de couverture affichée en tête de fiche.
                  */}
                  {galerie.length > 0 && (
                    <DetailSection
                      title="Galerie du projet"
                      icon={<Images className="size-4" />}
                      count={galerie.length}
                    >
                      <ImageGallery images={galerie} alt={projet.titre} />
                    </DetailSection>
                  )}
                </div>

                {/* Colonne secondaire */}
                <div className="space-y-4">
                  {hasAddressBlock && (
                    <DetailSection
                      title="Adresse"
                      icon={<MapPin className="h-4 w-4 text-ink-500" />}
                    >
                      <div className="space-y-1 text-sm text-ink-600">
                        {projet.adresse && <p className="break-words">{projet.adresse}</p>}
                        {locationText && <p>{locationText}</p>}
                      </div>
                    </DetailSection>
                  )}

                  {hasLocation && (
                    <DetailSection
                      title="Localisation"
                      icon={<MapPin className="h-4 w-4 text-ink-500" />}
                    >
                      <div className="w-full overflow-hidden rounded-xl border border-ink-100 aspect-[16/9]">
                        <MapPicker
                          latitude={Number(projet.latitude)}
                          longitude={Number(projet.longitude)}
                          onLocationChange={() => {}}
                          label=""
                        />
                      </div>
                    </DetailSection>
                  )}
                </div>
              </div>
            </div>

            {/* Footer fixe */}
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

export default ProjetViewDialog;
