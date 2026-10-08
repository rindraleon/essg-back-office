import { useState, useMemo, useCallback } from 'react';
import type { Mention, MentionFilterOptions } from '@/types';

const initialFilters: MentionFilterOptions = {
  isActive: '',
  domaine: '',
};

interface UseMentionFilterProps {
  data: Mention[];
  searchTerm: string;
}

interface UseMentionFilterReturn {
  filters: MentionFilterOptions;
  filteredData: Mention[];
  updateFilter: (key: keyof MentionFilterOptions, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

/** Recherche plein texte (nom, slug, description, parcours) + filtres statut/domaine. */
const useMentionFilter = ({ data, searchTerm }: UseMentionFilterProps): UseMentionFilterReturn => {
  const [filters, setFilters] = useState<MentionFilterOptions>(initialFilters);

  const updateFilter = useCallback((key: keyof MentionFilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((mention) => {
        const inParcours = (mention.parcours ?? []).some((p) => p.nom.toLowerCase().includes(term));
        return (
          mention.nom.toLowerCase().includes(term) ||
          mention.slug.toLowerCase().includes(term) ||
          (mention.description ?? '').toLowerCase().includes(term) ||
          inParcours
        );
      });
    }

    if (filters.isActive) {
      const wanted = filters.isActive === 'true';
      result = result.filter((mention) => mention.isActive === wanted);
    }

    if (filters.domaine) {
      result = result.filter(
        (mention) => (mention.domaine ?? '').toLowerCase() === filters.domaine.toLowerCase()
      );
    }

    return result;
  }, [data, searchTerm, filters]);

  return { filters, filteredData, updateFilter, resetFilters, activeFilterCount };
};

export default useMentionFilter;
