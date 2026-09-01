import { useState, useMemo, useCallback } from 'react';
import type { Projet, ProjetFilterOptions } from '@/types';
import { INITIAL_FILTERS } from '@/constants';
import { filterProjectsBySearchTerm as filterBySearchTerm } from '@/utils';

interface UseProjetFilterProps {
  data: Projet[];
  searchTerm: string;
}

interface UseProjetFilterReturn {
  filters: ProjetFilterOptions;
  filteredData: Projet[];
  setFilters: React.Dispatch<React.SetStateAction<ProjetFilterOptions>>;
  updateFilter: (key: keyof ProjetFilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

export function useProjetFilter({ data, searchTerm }: UseProjetFilterProps): UseProjetFilterReturn {
  const [filters, setFilters] = useState<ProjetFilterOptions>(INITIAL_FILTERS);

  const updateFilter = useCallback((key: keyof ProjetFilterOptions, value: string) => {
    setFilters((prev: ProjetFilterOptions) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const filteredData = useMemo(() => {
    let result = filterBySearchTerm(data, searchTerm);

    if (filters.type) {
      result = result.filter((item) => item.type === filters.type);
    }

    if (filters.dateDebut) {
      result = result.filter((item) => item.date >= filters.dateDebut);
    }
    if (filters.dateFin) {
      result = result.filter((item) => item.date <= filters.dateFin);
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
