import type { Partenaire } from '@/types';

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
