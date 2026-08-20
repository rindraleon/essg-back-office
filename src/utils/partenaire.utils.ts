import type { Partenaire, PartenaireFilterOptions } from '../types/partenaire.types';

export function filterBySearchTerm(data: Partenaire[], searchTerm: string): Partenaire[] {
  if (!searchTerm.trim()) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(
    (partenaire) =>
      partenaire.nom.toLowerCase().includes(term) ||
      partenaire.description.toLowerCase().includes(term) ||
      partenaire.secteur.toLowerCase().includes(term)
  );
}

export function filterPartenaireData(
  data: Partenaire[],
  searchTerm: string,
  filters: PartenaireFilterOptions
): Partenaire[] {
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
}

