import { Filter, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import SearchInput from './SearchInput';
import { cn } from '@/lib/utils';

interface ListPageHeaderProps {
  /** Titre de la liste, ex. « Liste des partenaires ». */
  title: string;
  /** Phrase courte décrivant la page (optionnelle, masquée sous `sm`). */
  description?: string;
  /** Nombre de résultats après recherche/filtres. */
  totalCount: number;
  /** Mot au singulier utilisé pour le compteur (« résultat » par défaut). */
  countLabel?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Affiche le bouton Filtre (masqué si `onToggleFilters` est absent). */
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  activeFilterCount?: number;
  /** Action principale (création). */
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  /** Actions supplémentaires rendues après le bouton principal. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * En-tête unifié des pages de liste du back-office (cf. cahier des charges §12).
 *
 * Structure : Titre + total → espace flexible → recherche → filtre → actions.
 *
 * Points clés :
 *  - le compteur est en `tabular-nums` et `whitespace-nowrap` : il ne provoque
 *    plus de saut de ligne quand il passe de 9 à 10 résultats ;
 *  - une seule ligne dès `lg`, empilement propre en dessous ;
 *  - tous les boutons (dont Filtre) partagent la même taille/rayon via <Button>.
 */
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
      {/* Titre + total : ne se comprime pas, ne passe pas à la ligne */}
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

      {/* Espace flexible */}
      <div className="hidden flex-1 lg:block" />

      {/* Recherche + filtre + actions */}
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
