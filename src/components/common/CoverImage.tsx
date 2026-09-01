import { ImageOff } from 'lucide-react';
import React, { useState } from 'react';
import { getImageUrl } from '@/utils';
import { cn } from '@/lib';

interface CoverImageProps {
  src?: string | null;
  alt: string;
  aspect?: string;
  className?: string;
  dark?: boolean;
}

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
        className
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
