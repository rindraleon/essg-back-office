import { useState, useMemo, useCallback } from 'react';
import type { Partenaire, PartenaireFilterOptions } from '../types/partenaire.types';
import { INITIAL_PARTENAIRE_FILTERS } from '../constants/partenaire.constants';
import { filterBySearchTerm } from '../utils/partenaire.utils';

interface UsePartenaireFilterProps {
  data: Partenaire[];
  searchTerm: string;
}

interface UsePartenaireFilterReturn {
  filters: PartenaireFilterOptions;
  filteredData: Partenaire[];
  setFilters: React.Dispatch<React.SetStateAction<PartenaireFilterOptions>>;
  updateFilter: (key: keyof PartenaireFilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

export function usePartenaireFilter({
  data,
  searchTerm,
}: UsePartenaireFilterProps): UsePartenaireFilterReturn {
  const [filters, setFilters] = useState<PartenaireFilterOptions>(INITIAL_PARTENAIRE_FILTERS);

  const updateFilter = useCallback((key: keyof PartenaireFilterOptions, value: string) => {
    setFilters((prev: PartenaireFilterOptions) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_PARTENAIRE_FILTERS);
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const filteredData = useMemo(() => {
    let result = filterBySearchTerm(data, searchTerm);

    // Type filter
    if (filters.type) {
      result = result.filter((item) => item.type === filters.type);
    }

    // Secteur filter
    if (filters.secteur) {
      result = result.filter((item) =>
        item.secteur.toLowerCase().includes(filters.secteur.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateDebut) {
      result = result.filter((item) => item.dateDebut >= filters.dateDebut);
    }
    if (filters.dateFin) {
      result = result.filter((item) => item.dateDebut <= filters.dateFin);
    }

    return result;
  }, [data, searchTerm, filters]);

  return {
    filters,
    filteredData,
    setFilters,
    updateFilter,
    resetFilters,
    activeFilterCount,
  };
}
