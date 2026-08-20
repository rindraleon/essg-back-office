export interface ActualiteItem {
  id: string;
  titre: string;
  contenu: string;
  categorie: string;
  auteur: string;
  date: string;
  statut: 'publie' | 'brouillon' | 'archive';
  image?: string;
  galerie?: string[];
  resume?: string;
  enVedette?: boolean;
}

export type ActualiteFormData = Omit<ActualiteItem, 'id'>;

export interface FilterOptions {
  categorie: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}
