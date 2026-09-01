import { Filter, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import SearchInput from './SearchInput';
import { cn } from '@/lib';

interface ListPageHeaderProps {
  title: string;
  description?: string;
  totalCount: number;
  countLabel?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  activeFilterCount?: number;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  description,
  totalCount,
  countLabel = 'résultat',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  onToggleFilters,
  filtersOpen = false,
  activeFilterCount = 0,
  actionLabel,
  onAction,
  actionIcon,
  children,
  className,
}) => {
  const plural = totalCount !== 1 ? 's' : '';

  return (
    <div
      className={cn(
        'rounded-xl border border-ink-100 bg-white p-4 shadow-card',
        'flex flex-col gap-3 lg:flex-row lg:items-center',
        className
      )}
    >
      <div className="flex min-w-0 shrink-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-base font-semibold text-ink-900">{title}</h2>
          <span
            data-numeric
            className="shrink-0 whitespace-nowrap text-sm font-normal text-ink-500"
          >
            ({totalCount} {countLabel}
            {plural})
          </span>
        </div>
        {description && (
          <p className="hidden max-w-prose truncate text-xs text-ink-500 sm:block">{description}</p>
        )}
      </div>

      <div className="hidden flex-1 lg:block" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="sm:w-64 xl:w-80"
        />

        <div className="flex items-center gap-2">
          {onToggleFilters && (
            <Button
              variant="outline"
              onClick={onToggleFilters}
              aria-expanded={filtersOpen}
              className="flex-1 sm:flex-none"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
              {activeFilterCount > 0 && (
                <span
                  data-numeric
                  className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white"
                >
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}

          {actionLabel && onAction && (
            <Button onClick={onAction} className="flex-1 sm:flex-none">
              {actionIcon ?? <Plus className="h-4 w-4" />}
              <span className="truncate">{actionLabel}</span>
            </Button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default ListPageHeader;
