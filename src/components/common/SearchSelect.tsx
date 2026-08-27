import { AlertCircle, Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib';

export interface SearchSelectOption {
  value: string;
  label: string;
  description?: string;
  image?: string;
}

interface SearchSelectProps {
  label: string;
  value: string | null;
  onChange: (value: string | null, option: SearchSelectOption | null) => void;
  options: SearchSelectOption[];
  isLoading?: boolean;
  error?: string;
  loadError?: string | null;
  onRetry?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  hint?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  value,
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
  clearable = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const debouncedQuery = useDebounce(query, 150);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
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

  useEffect(() => {
    setHighlighted(0);
  }, [debouncedQuery, open]);

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const select = (option: SearchSelectOption) => {
    onChange(option.value, option);
    setOpen(false);
    setQuery('');
  };

  const clear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(null, null);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter' && open && filtered[highlighted]) {
      event.preventDefault();
      select(filtered[highlighted]);
    }
  };

  const hasError = Boolean(error);

  return (
    <div className={cn('relative w-full pt-2', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          'flex h-12 w-full items-center gap-2 rounded-md border bg-white px-3 pt-4 pb-1 text-left text-sm',
          'transition-colors focus:outline-none focus:ring-2',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-ink-300 focus:border-brand-500 focus:ring-brand-500/20',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {selected?.image && (
          <img
            loading="lazy"
            decoding="async"
            src={selected.image}
            alt=""
            className="size-6 shrink-0 rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}

        <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-ink-400')}>
          {selected ? selected.label : ' '}
        </span>

        {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-ink-400" />}

        {clearable && selected && !disabled && (
          <button
            type="button"
            aria-label="Effacer la sélection"
            onClick={clear}
            className="grid size-5 shrink-0 place-items-center rounded border-0 bg-transparent p-0 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="size-3.5" />
          </button>
        )}

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
          selected || open
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
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
          </div>

          <div id={listboxId} role="listbox" className="max-h-60 overflow-y-auto py-1">
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
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(option)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                      index === highlighted ? 'bg-brand-50' : 'bg-white',
                      isSelected && 'font-medium text-brand-800'
                    )}
                  >
                    {option.image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={option.image}
                        alt=""
                        className="size-8 shrink-0 rounded-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                    ) : (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
                        {option.label.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-xs text-ink-500">
                          {option.description}
                        </span>
                      )}
                    </span>

                    {isSelected && <Check className="size-4 shrink-0 text-brand-600" />}
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

export default SearchSelect;
