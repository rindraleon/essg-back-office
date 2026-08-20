import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, hint, id, type = 'text', ...props }, ref) => {
    return (
      <div className="relative w-full pt-2">
        <Input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className={cn(
            'peer h-12 w-full rounded-md border border-ink-300 bg-white px-3 pt-5 pb-2 text-sm',
            'focus-visible:border-brand-800',
            'focus-visible:ring-0',
            'focus-visible:ring-offset-0',
            error && 'border-red-500',
            className
          )}
          {...props}
        />

        <Label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-[10px] top-0 z-10',
            'bg-white px-1 text-xs font-bold text-brand-700',
            'transition-all duration-200',
            'peer-placeholder-shown:top-[1.35rem]',
            'peer-placeholder-shown:left-[10px]',
            'peer-placeholder-shown:bg-transparent',
            'peer-placeholder-shown:px-0',
            'peer-placeholder-shown:text-sm',
            'peer-placeholder-shown:font-normal',
            'peer-placeholder-shown:text-ink-400',
            'peer-focus:top-0',
            'peer-focus:left-2',
            'peer-focus:bg-white',
            'peer-focus:px-1',
            'peer-focus:text-xs',
            'peer-focus:font-bold',
            'peer-focus:text-brand-800',
            error && 'text-red-500 peer-focus:text-red-500'
          )}
        >
          {label}
        </Label>
        <p className={cn('mt-1 min-h-4 text-[11px]', error ? 'text-red-500' : 'text-ink-400')}>
          {error || hint || '\u00a0'}
        </p>
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };
