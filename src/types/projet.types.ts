export type ProjetType = 'International' | 'Service public' | 'Recherche' | 'Partenariat';

export interface ProjectSource {
  title: string;
  url: string;
}

export interface Projet {
  id: number;
  titre: string;
  slug?: string;
  type: ProjetType;
  date: string;
  description: string;
  partenaireIds?: number[];
  statut: string;
  partenaires: string[];
  image: string;
  galerie?: string[];
  sources?: ProjectSource[];
  latitude?: number;
  longitude?: number;
  ville?: string;
  pays?: string;
  adresse?: string;
  creeLe: Date;
  misAJourLe: Date;
}

export type ProjetFormData = Omit<Projet, 'id' | 'slug' | 'creeLe' | 'misAJourLe'>;

export interface ProjetFilterOptions {
  type: string;
  dateDebut: string;
  dateFin: string;
}
