import * as React from 'react';
import { cn } from '@/lib';

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, error, hint, id, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="relative w-full pt-2">
        <textarea
          ref={ref}
          id={id}
          value={value}
          placeholder=" "
          className={cn(
            'peer w-full rounded-md border bg-white px-3 pt-5 pb-2 text-sm',
            'resize-none outline-none transition-all',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'placeholder-transparent',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-300',
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-3 origin-[0] transition-all duration-200',
            hasValue
              ? 'top-0 bg-white px-1 text-xs font-bold text-brand-700'
              : 'top-5 text-sm text-ink-400',
            'peer-focus:top-0 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:font-bold',
            'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold',
            error ? 'text-red-500 peer-focus:text-red-500' : 'peer-focus:text-brand-700'
          )}
        >
          {label}
        </label>
        <p className={cn('mt-1 min-h-4 text-[11px]', error ? 'text-red-500' : 'text-ink-400')}>
          {error || hint || '\u00a0'}
        </p>
      </div>
    );
  }
);
FloatingTextarea.displayName = 'FloatingTextarea';

export { FloatingTextarea };
