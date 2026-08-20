import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
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

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  className?: string;
  children?: React.ReactNode;
}

function Avatar({ className, size, ...props }: Readonly<AvatarProps>) {
  return <div data-slot="avatar" className={cn(avatarVariants({ size }), className)} {...props} />;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

function AvatarImage({ className, alt, ...props }: Readonly<AvatarImageProps>) {
  return (
    <img
      data-slot="avatar-image"
      className={cn('aspect-square h-full w-full', className)}
      alt={alt || ''}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  delayMs?: number;
}

function AvatarFallback({ className, delayMs = 0, ...props }: Readonly<AvatarFallbackProps>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
