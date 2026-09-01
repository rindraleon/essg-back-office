export interface Actualite {
  id: number;
  slug: string;
  titre: string;
  categorie: string;
  date: string;
  resume: string;
  contenu: string;
  image: string;
  enVedette: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

export interface NewsResponse {
  data: Actualite[];
  total: number;
  page: number;
  limit: number;
}
