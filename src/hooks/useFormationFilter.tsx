import { useState, useMemo, useCallback } from 'react';
import type { Formation, FormationFilterOptions } from '@/types';

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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.titre.toLowerCase().includes(term) ||
          item.domaine.some((d) => d.toLowerCase().includes(term)) ||
          item.description.toLowerCase().includes(term)
      );
    }

    if (filters.niveau) {
      result = result.filter((item) => item.niveau === filters.niveau);
    }

    if (filters.domaine) {
      result = result.filter((item) => item.domaine.includes(filters.domaine));
    }

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
