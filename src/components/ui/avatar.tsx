import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib';
import { getImageUrl } from '@/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      default: 'h-10 w-10',
      sm: 'h-8 w-8',
      lg: 'h-16 w-16',
      xl: 'h-24 w-24',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type AvatarStatus = 'idle' | 'loaded' | 'error';

interface AvatarContextValue {
  status: AvatarStatus;
  setStatus: (status: AvatarStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  className?: string;
  children?: React.ReactNode;
}

function Avatar({ className, size, children, ...props }: Readonly<AvatarProps>) {
  const [status, setStatus] = React.useState<AvatarStatus>('idle');
  const value = React.useMemo(() => ({ status, setStatus }), [status]);

  return (
    <AvatarContext.Provider value={value}>
      <div data-slot="avatar" className={cn(avatarVariants({ size }), className)} {...props}>
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

interface AvatarImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  className?: string;
  src?: string | null;
}

function AvatarImage({
  className,
  alt,
  src,
  onError,
  onLoad,
  ...props
}: Readonly<AvatarImageProps>) {
  const context = React.useContext(AvatarContext);
  const resolved = src ? getImageUrl(src) : '';

  React.useEffect(() => {
    context?.setStatus(resolved ? 'idle' : 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  if (!resolved || context?.status === 'error') return null;

  return (
    <img
      data-slot="avatar-image"
      className={cn('aspect-square h-full w-full object-cover', className)}
      alt={alt || ''}
      src={resolved}
      loading="lazy"
      decoding="async"
      onLoad={(event) => {
        context?.setStatus('loaded');
        onLoad?.(event);
      }}
      onError={(event) => {
        context?.setStatus('error');
        onError?.(event);
      }}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function AvatarFallback({ className, children, ...props }: Readonly<AvatarFallbackProps>) {
  const context = React.useContext(AvatarContext);
  if (context?.status === 'loaded') return null;

  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        'absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
