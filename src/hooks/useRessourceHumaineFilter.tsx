import { useState, useMemo, useCallback } from 'react';
import type { RessourceHumaineItem, RessourceHumaineFilterOptions } from '@/types';

const initialFilters: RessourceHumaineFilterOptions = {
  poste: '',
  actif: '',
  search: '',
};

interface UseRessourceHumaineFilterProps {
  data: RessourceHumaineItem[];
  searchTerm: string;
}

interface UseRessourceHumaineFilterReturn {
  filters: RessourceHumaineFilterOptions;
  filteredData: RessourceHumaineItem[];
  setFilters: React.Dispatch<React.SetStateAction<RessourceHumaineFilterOptions>>;
  updateFilter: (key: keyof RessourceHumaineFilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

export function useRessourceHumaineFilter({
  data,
  searchTerm,
}: UseRessourceHumaineFilterProps): UseRessourceHumaineFilterReturn {
  const [filters, setFilters] = useState<RessourceHumaineFilterOptions>(initialFilters);

  const updateFilter = useCallback((key: keyof RessourceHumaineFilterOptions, value: string) => {
    setFilters((prev: RessourceHumaineFilterOptions) => ({ ...prev, [key]: value }));
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
          item.nom.toLowerCase().includes(term) ||
          item.prenom.toLowerCase().includes(term) ||
          item.poste.toLowerCase().includes(term)
      );
    }

    if (filters.poste) {
      result = result.filter((item) => item.poste === filters.poste);
    }

    if (filters.actif) {
      const isActive = filters.actif === 'true';
      result = result.filter((item) => item.actif === isActive);
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
