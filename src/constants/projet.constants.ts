export const PROJET_TYPES = [
  { value: 'International', label: 'International' },
  { value: 'Service public', label: 'Service public' },
  { value: 'Recherche', label: 'Recherche' },
  { value: 'Partenariat', label: 'Partenariat' },
] as const;

export const PROJET_STATUTS = [
  { value: 'En cours', label: 'En cours' },
  { value: 'Terminé', label: 'Terminé' },
] as const;

export const PROJET_TYPE_COLORS: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  International: 'primary',
  'Service public': 'secondary',
  Recherche: 'success',
  Partenariat: 'warning',
};

export const DEFAULT_FORM_DATA = {
  titre: '',
  type: 'Recherche' as const,
  statut: 'En cours' as const,
  date: new Date().toISOString().split('T')[0],
  description: '',
  partenaires: [] as string[],
  partenaireIds: [] as number[],
  image: '/images/hero-campus.jpg',
  galerie: [] as string[],
  sources: [] as { title: string; url: string }[],
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  ville: '',
  pays: '',
  adresse: '',
};

export const INITIAL_FILTERS = {
  type: '',
  dateDebut: '',
  dateFin: '',
};
