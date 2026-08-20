export type PartenaireType = 'Entreprise' | 'Institution' | 'Organisation' | 'Autre';

export interface Partenaire {
  id: number;
  nom: string;
  /** Généré côté backend à partir du nom — jamais saisi ni affiché. */
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

/** Le slug est exclu : il n'est ni saisi, ni envoyé par le formulaire. */
export type PartenaireFormData = Omit<Partenaire, 'id' | 'slug' | 'creeLe' | 'misAJourLe'>;

export interface PartenaireFilterOptions {
  type: string;
  secteur: string;
  dateDebut: string;
  dateFin: string;
}
