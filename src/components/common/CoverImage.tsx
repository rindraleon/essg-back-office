import { ImageOff } from 'lucide-react';
import React, { useState } from 'react';
import { getImageUrl } from '../../utils/image.utils';
import { cn } from '@/lib/utils';

interface CoverImageProps {
  src?: string | null;
  alt: string;
  /** Ratio d'affichage (classe Tailwind). */
  aspect?: string;
  className?: string;
  /** Rendu sur fond sombre (colonne latérale des dialogs). */
  dark?: boolean;
}

/**
 * Image de couverture d'une fiche (projet, actualité).
 *
 * Volontairement distincte de `ImageGallery` : la couverture est l'image
 * principale de la ressource, elle a son emplacement propre en tête de
 * dialog et ne doit pas défiler avec les autres visuels. Auparavant, elle
 * était injectée dans le carrousel comme une image parmi d'autres, ce qui
 * la rendait indiscernable du reste de la galerie.
 */
const CoverImage: React.FC<CoverImageProps> = ({
  src,
  alt,
  aspect = 'aspect-[16/9]',
  className,
  dark = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src?.trim()) && !hasError;

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl border',
        dark ? 'border-white/10 bg-ink-800' : 'border-ink-100 bg-ink-50',
        aspect,
        className,
      )}
    >
      {showImage ? (
        <img
          src={getImageUrl(src as string)}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <ImageOff className={cn('size-10', dark ? 'text-ink-500' : 'text-ink-300')} />
          <p className={cn('text-sm', dark ? 'text-ink-400' : 'text-ink-500')}>
            Aucune image de couverture
          </p>
        </div>
      )}
    </div>
  );
};

export default CoverImage;
