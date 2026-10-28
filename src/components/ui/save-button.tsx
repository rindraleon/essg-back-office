import { useEffect, useRef, type ComponentProps } from 'react';
import { Check, CircleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib';
import { Button } from './button';

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

interface SaveButtonProps extends Omit<ComponentProps<typeof Button>, 'loading'> {
  status?: SaveStatus;
  celebrate?: boolean;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
}

const CONFETTI_COLORS = [
  '#78a44e',
  '#42612c',
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

const STATUS_ICONS: Record<SaveStatus, LucideIcon | null> = {
  idle: null,
  loading: null,
  success: Check,
  error: CircleAlert,
};

const STATUS_CLASSES: Record<SaveStatus, string> = {
  idle: '',
  loading: '',
  success:
    'bg-emerald-700 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-emerald-950 dark:hover:bg-emerald-600',
  error: 'text-danger-700',
};

const fireConfetti = async (element: HTMLElement | null) => {
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const confetti = (await import('canvas-confetti')).default;
  const { left, top, width, height } = element.getBoundingClientRect();
  await confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 32,
    ticks: 160,
    colors: CONFETTI_COLORS,
    origin: {
      x: (left + width / 2) / window.innerWidth,
      y: (top + height / 2) / window.innerHeight,
    },
    disableForReducedMotion: true,
  });
};

function SaveButton({
  status = 'idle',
  celebrate = false,
  loadingLabel = 'Enregistrement…',
  successLabel = 'Enregistré',
  errorLabel = 'Échec, réessayer',
  variant,
  className,
  type = 'submit',
  children,
  ...props
}: SaveButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isSuccess = status === 'success';

  useEffect(() => {
    if (!isSuccess || !celebrate) return;
    fireConfetti(buttonRef.current).catch(() => undefined);
  }, [isSuccess, celebrate]);

  const messages = { loading: loadingLabel, success: successLabel, error: errorLabel };
  const StatusIcon = STATUS_ICONS[status];

  return (
    <>
      <Button
        ref={buttonRef}
        type={type}
        variant={status === 'error' ? 'destructive' : variant}
        loading={status === 'loading'}
        className={cn(
          'min-w-36 transition-[color,background-color,transform] duration-200 motion-safe:active:scale-[0.98]',
          STATUS_CLASSES[status],
          className
        )}
        {...props}
      >
        <span key={status} className="inline-flex animate-fade-in items-center gap-1.5">
          {StatusIcon && <StatusIcon className="animate-scale-in" aria-hidden="true" />}
          {status === 'idle' ? children : messages[status]}
        </span>
      </Button>
      <span role="status" className="sr-only">
        {status === 'idle' ? '' : messages[status]}
      </span>
    </>
  );
}

export { SaveButton };
