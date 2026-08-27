export type PartenaireType = 'Entreprise' | 'Institution' | 'Organisation' | 'Autre';

export interface Partenaire {
  id: number;
  nom: string;
  slug?: string;
  type: PartenaireType;
  secteur: string;
  dateDebut: string;
  description: string;
  logo: string;
  siteWeb?: string;
  contact?: string;
  creeLe: Date;
  misAJourLe: Date;
}

export type PartenaireFormData = Omit<Partenaire, 'id' | 'slug' | 'creeLe' | 'misAJourLe'>;

export interface PartenaireFilterOptions {
  type: string;
  secteur: string;
  dateDebut: string;
  dateFin: string;
}
