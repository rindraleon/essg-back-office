import { useState, useMemo, useCallback } from 'react';
import type { ActualiteItem, FilterOptions } from '@/types';

const initialFilters: FilterOptions = {
  categorie: '',
  statut: '',
  dateDebut: '',
  dateFin: '',
};

interface UseFilterProps {
  data: ActualiteItem[];
  searchTerm: string;
}

interface UseFilterReturn {
  filters: FilterOptions;
  filteredData: ActualiteItem[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  updateFilter: (key: keyof FilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

export function useFilter({ data, searchTerm }: UseFilterProps): UseFilterReturn {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const updateFilter = useCallback((key: keyof FilterOptions, value: string) => {
    setFilters((prev: FilterOptions) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== '').length,
    [filters]
  );

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.titre.toLowerCase().includes(term) ||
          item.auteur.toLowerCase().includes(term) ||
          item.contenu.toLowerCase().includes(term)
      );
    }

    if (filters.categorie) {
      result = result.filter((item) => item.categorie === filters.categorie);
    }

    if (filters.statut) {
      result = result.filter((item) => item.statut === filters.statut);
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
