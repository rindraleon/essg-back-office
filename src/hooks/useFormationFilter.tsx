import { useState, useMemo, useCallback } from 'react';
import type { Formation, FormationFilterOptions } from '../types/formation.types';

const initialFilters: FormationFilterOptions = {
  niveau: '',
  domaine: '',
  enVedette: '',
};

interface UseFormationFilterProps {
  data: Formation[];
  searchTerm: string;
}

interface UseFormationFilterReturn {
  filters: FormationFilterOptions;
  filteredData: Formation[];
  updateFilter: (key: keyof FormationFilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const useFormationFilter = ({
  data,
  searchTerm,
}: UseFormationFilterProps): UseFormationFilterReturn => {
  const [filters, setFilters] = useState<FormationFilterOptions>(initialFilters);

  const updateFilter = useCallback((key: keyof FormationFilterOptions, value: string) => {
    setFilters((prev: FormationFilterOptions) => ({ ...prev, [key]: value }));
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

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.titre.toLowerCase().includes(term) ||
          item.domaine.some((d) => d.toLowerCase().includes(term)) ||
          item.description.toLowerCase().includes(term)
      );
    }

    // Niveau filter
    if (filters.niveau) {
      result = result.filter((item) => item.niveau === filters.niveau);
    }

    // Domaine filter
    if (filters.domaine) {
      result = result.filter((item) => item.domaine.includes(filters.domaine));
    }

    // En vedette filter
    if (filters.enVedette !== '') {
      const isFeatured = filters.enVedette === 'true';
      result = result.filter((item) => item.enVedette === isFeatured);
    }

    return result;
  }, [data, searchTerm, filters]);

  return {
    filters,
    filteredData,
    updateFilter,
    resetFilters,
    activeFilterCount,
  };
};
export default useFormationFilter;
