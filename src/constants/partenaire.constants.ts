export const PARTENAIRE_TYPES = [
  { value: 'Entreprise', label: 'Entreprise' },
  { value: 'Institution', label: 'Institution' },
  { value: 'Organisation', label: 'Organisation' },
  { value: 'Autre', label: 'Autre' },
] as const;

export const PARTENAIRE_TYPE_COLORS: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  Entreprise: 'primary',
  Institution: 'secondary',
  Organisation: 'success',
  Autre: 'warning',
};

export const DEFAULT_PARTENAIRE_FORM_DATA = {
  nom: '',
  type: 'Entreprise' as const,
  secteur: '',
  dateDebut: new Date().toISOString().split('T')[0],
  description: '',
  logo: '',
  siteWeb: '',
  contact: '',
};

export const INITIAL_PARTENAIRE_FILTERS = {
  type: '',
  secteur: '',
  dateDebut: '',
  dateFin: '',
};
