/** Une ligne d'expérience professionnelle du parcours. */
export interface ExperienceProfessionnelle {
  poste: string;
  organisation?: string;
  periode?: string;
}

export interface RessourceHumaineItem {
  id: number;
  slug: string;
  nom: string;
  prenom: string;
  poste: string;
  description?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  photo?: string;

  /* ── Parcours structuré, alimenté par l'import de CV (OCR) ── */
  experiences?: ExperienceProfessionnelle[];
  formations?: string[];
  diplomes?: string[];
  competences?: string[];
  langues?: string[];
  actif: boolean;
  ordre: number;
  creeLe: Date;
  misAJourLe: Date;
}

export type RessourceHumaineFormData = Omit<
  RessourceHumaineItem,
  'id' | 'slug' | 'creeLe' | 'misAJourLe'
>;

export interface RessourceHumaineFilterOptions {
  poste: string;
  actif: string;
  search: string;
}
