import { PROJET_TYPE_COLORS } from '../constants/projet.constants';
import type { Projet } from '../types/projet.types';

export const getTypeColor = (
  type: string
): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
  return PROJET_TYPE_COLORS[type] || 'info';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

export const normalizeSourceUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const isValidSourceUrl = (url: string): boolean => {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(normalizeSourceUrl(url));
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const formatDateLong = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const filterBySearchTerm = (projets: Projet[], searchTerm: string): Projet[] => {
  if (!searchTerm.trim()) return projets;

  const term = searchTerm.toLowerCase();
  return projets.filter(
    (projet) =>
      projet.titre.toLowerCase().includes(term) ||
      projet.description.toLowerCase().includes(term) ||
      projet.partenaires.some((p) => p.toLowerCase().includes(term))
  );
};
