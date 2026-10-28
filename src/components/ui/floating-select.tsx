import * as React from 'react';
import { cn } from '@/lib';
import type { SelectRootChangeEventDetails } from '@base-ui/react/select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface FloatingSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string | null, eventDetails: SelectRootChangeEventDetails) => void;
  options: { label: string; value: string }[];
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  error,
  hint,
  placeholder = ' ',
  className,
  id,
}) => {
  const autoId = React.useId();
  const selectId = id ?? `floating-select-${autoId.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const errorId = `${selectId}-error`;
  const hasValue = Boolean(value);
  const placeholderText = typeof placeholder === 'string' ? placeholder.trim() : '';
  const selectedLabel = hasValue
    ? (options.find((opt) => opt.value === value)?.label ?? null)
    : null;
  // Le libellé monte si une valeur est choisie ou si un placeholder doit être
  // lu dans la zone : les deux textes ne peuvent alors jamais se chevaucher.
  const floated = hasValue || placeholderText !== '';

  return (
    <div className="relative w-full pt-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          title={selectedLabel ?? undefined}
          className={cn(
            'h-12 min-h-12 w-full bg-card px-3 pt-5 pb-2 text-sm',
            'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-300',
            className
          )}
        >
          {/* Rendu maîtrisé du texte : libellé complet, jamais la valeur brute. */}
          <SelectValue placeholder={placeholder}>
            {() => selectedLabel ?? (placeholderText !== '' ? placeholder : ' ')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="hover:bg-ink-100"
              title={opt.label}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span
        className={cn(
          'pointer-events-none absolute left-3 origin-[0] transition-all duration-200',
          floated
            ? 'top-0 bg-card px-1 text-xs font-bold text-brand-700'
            : 'top-[1.35rem] text-sm text-ink-400',
          error && 'text-red-500'
        )}
      >
        {label}
      </span>
      <p
        id={errorId}
        role={error ? 'alert' : undefined}
        className={cn('mt-1 min-h-4 text-[11px]', error ? 'text-red-500' : 'text-ink-400')}
      >
        {error || hint || '\u00a0'}
      </p>
    </div>
  );
};

export { FloatingSelect };
