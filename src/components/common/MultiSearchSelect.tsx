import { AlertCircle, Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib';
import type { SearchSelectOption } from './SearchSelect';

interface MultiSearchSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[], options: SearchSelectOption[]) => void;
  options: SearchSelectOption[];
  isLoading?: boolean;
  error?: string;
  loadError?: string | null;
  onRetry?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

const MultiSearchSelect: React.FC<MultiSearchSelectProps> = ({
  label,
  values,
  onChange,
  options,
  isLoading = false,
  error,
  loadError = null,
  onRetry,
  placeholder = 'Rechercher...',
  emptyMessage = 'Aucun résultat',
  hint,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const byValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options]
  );

  const selected = useMemo(
    () =>
      values
        .map((value) => byValue.get(value))
        .filter((option): option is SearchSelectOption => Boolean(option)),
    [values, byValue]
  );

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      `${option.label} ${option.description ?? ''}`.toLowerCase().includes(term)
    );
  }, [options, debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const emit = (nextValues: string[]) => {
    onChange(
      nextValues,
      nextValues
        .map((value) => byValue.get(value))
        .filter((option): option is SearchSelectOption => Boolean(option))
    );
  };

  const toggle = (option: SearchSelectOption) => {
    emit(
      values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value]
    );
  };

  const remove = (value: string) => emit(values.filter((item) => item !== value));

  const hasError = Boolean(error);

  return (
    <div className={cn('relative w-full pt-2', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          'flex min-h-12 w-full items-center gap-2 rounded-md border bg-white px-3 pt-4 pb-1.5 text-left text-sm',
          'transition-colors focus:outline-none focus:ring-2',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-ink-300 focus:border-brand-500 focus:ring-brand-500/20',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1 py-0.5">
          {selected.length === 0 && <span className="text-ink-400">&nbsp;</span>}
          {selected.map((option) => (
            <span
              key={option.value}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
            >
              <span className="truncate">{option.label}</span>
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Retirer ${option.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(option.value);
                }}
                className="shrink-0 rounded hover:text-red-600"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </span>

        {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-ink-400" />}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-400 transition-transform duration-150 motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>

      <span
        className={cn(
          'pointer-events-none absolute left-3 origin-[0] transition-all duration-200 motion-reduce:transition-none',
          selected.length > 0 || open
            ? 'top-0 bg-white px-1 text-xs font-bold text-brand-700'
            : 'top-[1.35rem] text-sm text-ink-400',
          hasError && 'text-red-500'
        )}
      >
        {label}
      </span>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-ink-200 bg-white shadow-elevated">
          <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2">
            <Search className="size-4 shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable
            className="max-h-60 overflow-y-auto py-1"
          >
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-6 text-sm text-ink-500">
                <Loader2 className="size-4 animate-spin" />
                Chargement…
              </div>
            )}

            {!isLoading && loadError && (
              <div className="px-3 py-4 text-sm">
                <p className="flex items-start gap-2 text-red-600">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{loadError}</span>
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Réessayer
                  </button>
                )}
              </div>
            )}

            {!isLoading && !loadError && filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-ink-500">{emptyMessage}</p>
            )}

            {!isLoading &&
              !loadError &&
              filtered.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggle(option)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50',
                      isSelected && 'font-medium text-brand-800'
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded border',
                        isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-xs text-ink-500">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <p className={cn('mt-1 min-h-4 text-[11px]', hasError ? 'text-red-500' : 'text-ink-400')}>
        {error || hint || '\u00a0'}
      </p>
    </div>
  );
};

export default MultiSearchSelect;
