import { cn } from '@/lib';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-ink-100', className)}
      {...props}
    />
  );
}

export { Skeleton };
