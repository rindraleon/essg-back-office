import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MultiValueSelectProps {
  label: string;
  /** Valeurs retenues, dans l'ordre choisi. Ce sont les chaînes stockées. */
  values: string[];
  onChange: (values: string[]) => void;
  /** Propositions prêtes à cocher. L'utilisateur n'y est pas limité. */
  suggestions?: string[];
  /**
   * Autorise la saisie d'une valeur absente des propositions.
   * Indispensable ici : chaque formation a ses conditions propres.
   */
  allowCustom?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** Comparaison tolérante : casse, accents et espaces multiples ignorés. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sélection multiple de valeurs textuelles (§1.3).
 *
 * Différence avec `MultiSearchSelect` : celui-ci manipule des identifiants
 * d'entités chargées d'une API, alors que `MultiValueSelect` manipule les
 * chaînes elles-mêmes et accepte des valeurs libres. Les deux partagent le
 * même langage visuel (jetons, libellé flottant, chevron, liste déroulante)
 * pour que le formulaire reste homogène.
 *
 * Comportements couverts :
 *  - sélection/désélection d'une proposition ;
 *  - ajout d'une valeur libre (touche Entrée ou bouton « Ajouter ») ;
 *  - suppression individuelle d'un jeton (souris ou clavier) ;
 *  - dédoublonnage insensible à la casse et aux accents ;
 *  - valeurs venant du backend absentes des propositions : elles restent
 *    affichées comme jetons et sont conservées à l'enregistrement.
 */
const MultiValueSelect: React.FC<MultiValueSelectProps> = ({
  label,
  values,
  onChange,
  suggestions = [],
  allowCustom = true,
  placeholder = 'Rechercher ou saisir…',
  emptyMessage = 'Aucune proposition',
  hint,
  error,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedKeys = useMemo(() => new Set(values.map(normalize)), [values]);

  /**
   * Propositions = suggestions + valeurs déjà retenues hors catalogue
   * (données existantes du backend), filtrées par la recherche.
   */
  const options = useMemo(() => {
    const merged = [...suggestions];
    for (const value of values) {
      if (!merged.some((item) => normalize(item) === normalize(value))) merged.push(value);
    }
    const term = normalize(query);
    if (!term) return merged;
    return merged.filter((item) => normalize(item).includes(term));
  }, [suggestions, values, query]);

  const trimmedQuery = query.trim();
  const canAddCustom =
    allowCustom && trimmedQuery.length > 0 && !selectedKeys.has(normalize(trimmedQuery));

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

  const toggle = (value: string) => {
    if (selectedKeys.has(normalize(value))) {
      onChange(values.filter((item) => normalize(item) !== normalize(value)));
    } else {
      onChange([...values, value]);
    }
  };

  const addCustom = () => {
    if (!canAddCustom) return;
    onChange([...values, trimmedQuery]);
    setQuery('');
    inputRef.current?.focus();
  };

  const remove = (value: string) =>
    onChange(values.filter((item) => normalize(item) !== normalize(value)));

  const hasError = Boolean(error);
  const hasValues = values.length > 0;

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
          'transition-colors focus:outline-none focus:ring-2 motion-reduce:transition-none',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-ink-300 focus:border-brand-500 focus:ring-brand-500/20',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1 py-0.5">
          {!hasValues && <span className="text-ink-400">&nbsp;</span>}
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
            >
              <span className="truncate">{value}</span>
              <span
                role="button"
                tabIndex={-1}
                aria-label={`Retirer ${value}`}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(value);
                }}
                className="shrink-0 rounded hover:text-red-600"
              >
                <X className="size-3" />
              </span>
            </span>
          ))}
        </span>

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
          hasValues || open
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
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCustom();
                }
              }}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
          </div>

          <div id={listboxId} role="listbox" aria-multiselectable className="max-h-60 overflow-y-auto py-1">
            {canAddCustom && (
              <button
                type="button"
                onClick={addCustom}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 motion-reduce:transition-none"
              >
                <Plus className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">Ajouter « {trimmedQuery} »</span>
              </button>
            )}

            {options.length === 0 && !canAddCustom && (
              <p className="px-3 py-6 text-center text-sm text-ink-500">{emptyMessage}</p>
            )}

            {options.map((option) => {
              const isSelected = selectedKeys.has(normalize(option));
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 motion-reduce:transition-none',
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
                  <span className="min-w-0 flex-1 truncate">{option}</span>
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

export default MultiValueSelect;
