import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getImageUrl } from '../../utils/image.utils';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  /** Images de la galerie, hors image de couverture. */
  images?: string[] | null;
  alt: string;
  /** Ratio d'affichage (classe Tailwind). */
  aspect?: string;
  /** Affiche la bande de miniatures sous le visuel principal. */
  showThumbnails?: boolean;
  className?: string;
}

/**
 * Galerie d'images en carrousel, INDÉPENDANTE de l'image de couverture.
 *
 * Auparavant, `ImageCarousel` fusionnait la couverture et la galerie en une
 * seule liste : impossible de distinguer l'image principale des visuels
 * secondaires. Ce composant n'affiche que la galerie ; la couverture est
 * rendue à part par `CoverImage`.
 *
 * Fonctionnalités : navigation précédent/suivant, une image à la fois,
 * compteur de position, miniatures cliquables, navigation clavier, et
 * transition en fondu neutralisée par `prefers-reduced-motion`.
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  alt,
  aspect = 'aspect-[16/9]',
  showThumbnails = true,
  className,
}) => {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());

  /** Liste utile : dédoublonnée et purgée des URLs en erreur. */
  const slides = useMemo(() => {
    const all = (images ?? [])
      .filter((src): src is string => Boolean(src?.trim()))
      .map((src) => src.trim());
    return Array.from(new Set(all)).filter((src) => !broken.has(src));
  }, [images, broken]);

  const count = slides.length;

  // L'index reste valide si une image est retirée de la galerie.
  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)));
  }, [count]);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  };

  const markBroken = (src: string) =>
    setBroken((current) => new Set(current).add(src));

  /* État vide : la fiche n'a pas de galerie, on le dit explicitement. */
  if (count === 0) {
    return (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-ink-50',
          aspect,
          className,
        )}
      >
        <Images className="size-9 text-ink-300" />
        <p className="text-sm text-ink-500">Aucune image dans la galerie</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Visuel principal */}
      <div
        role="group"
        aria-roledescription="carrousel"
        aria-label={`Galerie : ${alt}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl border border-ink-100 bg-ink-950',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          aspect,
        )}
      >
        {slides.map((src, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <img
              key={src}
              src={getImageUrl(src)}
              alt={`${alt} — image ${slideIndex + 1} sur ${count}`}
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
              onError={() => markBroken(src)}
              aria-hidden={!isActive}
              className={cn(
                'absolute inset-0 h-full w-full object-cover',
                'transition-opacity duration-300 ease-out motion-reduce:transition-none',
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            />
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Compteur de position, toujours visible */}
        <span
          data-numeric
          className="absolute right-2.5 top-2.5 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          {index + 1} / {count}
        </span>
      </div>

      {/* Miniatures : accès direct à une image précise */}
      {showThumbnails && count > 1 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {slides.map((src, slideIndex) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Afficher l'image ${slideIndex + 1}`}
              aria-current={slideIndex === index}
              className={cn(
                'size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors duration-150 motion-reduce:transition-none',
                slideIndex === index
                  ? 'border-brand-500'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <img
                src={getImageUrl(src)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => markBroken(src)}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
