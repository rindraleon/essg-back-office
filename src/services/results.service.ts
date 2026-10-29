import { apiClient } from '@/api';
import type { PaginationParams } from '@/api/types/api';

export type ResultatPublicationType = 'excel' | 'pdf';
export type ResultatPublicationStatus = 'brouillon' | 'publie' | 'archive';
export type ResultatConsultationMode = 'public' | 'protege';
export type StatutAcademique = 'admis' | 'ajourne';

export interface ResultatIndividuel {
  id: number;
  publicationId: number;
  matricule: string;
  nom: string;
  prenom: string;
  classe: string | null;
  periode: string | null;
  notes: Record<string, unknown> | null;
  moyenne: number | string | null;
  statutAcademique: StatutAcademique | null;
  observation: string | null;
  codeConsultation: string | null;
  creeLe: string;
}

export interface ResultatPublication {
  id: number;
  titre: string;
  type: ResultatPublicationType;
  anneeScolaire: string;
  periode: string | null;
  classeFormation: string | null;
  fichierOriginal: string;
  objetChemin: string;
  mimeType: string;
  taille: number;
  statutPublication: ResultatPublicationStatus;
  modeConsultation: ResultatConsultationMode;
  autorisePublicationPublique: boolean;
  totalIndividuels: number;
  totalAdmis: number;
  totalAjourne: number;
  creePar: number | null;
  creeLe: string;
  misAJourPar: number | null;
  misAJourLe: string;
  resultatsIndividuels?: ResultatIndividuel[];
}

export interface ResultatsListResponse {
  data: ResultatPublication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResultatQuery extends PaginationParams {
  q?: string;
  anneeScolaire?: string;
  periode?: string;
  classeFormation?: string;
  type?: string;
  statutPublication?: string;
}

export interface ResultatIndividuelQuery {
  page?: number;
  limit?: number;
  q?: string;
  statutAcademique?: StatutAcademique;
}

export interface ResultatsIndividuelsResponse {
  data: ResultatIndividuel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllResultats = async (
  query: ResultatQuery = {}
): Promise<ResultatsListResponse> => {
  const result = await apiClient.getList<ResultatPublication>('/resultats', {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    q: query.q || undefined,
    anneeScolaire: query.anneeScolaire || undefined,
    periode: query.periode || undefined,
    classeFormation: query.classeFormation || undefined,
    type: query.type || undefined,
    statutPublication: query.statutPublication || undefined,
    sortBy: query.sortBy ?? 'creeLe',
    sortOrder: query.sortOrder ?? 'DESC',
  });
  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
    totalPages: result.meta.totalPages,
  };
};

export const getResultatById = async (id: number): Promise<ResultatPublication> => {
  return apiClient.get<ResultatPublication>(`/resultats/${id}`);
};

export const getResultatIndividuels = async (
  publicationId: number,
  query: ResultatIndividuelQuery = {}
): Promise<ResultatsIndividuelsResponse> => {
  const result = await apiClient.getList<ResultatIndividuel>(
    `/resultats/${publicationId}/individuels`,
    {
      page: query.page ?? 1,
      limit: query.limit ?? 100,
      q: query.q || undefined,
      statutAcademique: query.statutAcademique || undefined,
    }
  );
  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
    totalPages: result.meta.totalPages,
  };
};

export const downloadModeleResultats = async (): Promise<Blob> => {
  const response = await apiClient.getBlob('/resultats/modele');
  return response;
};

export const getResultatFileBlob = async (id: number, download = false): Promise<Blob> => {
  const suffix = download ? '?download=1' : '';
  return apiClient.getBlob(`/resultats/${id}/fichier${suffix}`);
};

export interface ImportResultatPayload {
  fichier: File;
  titre: string;
  type: 'excel' | 'pdf';
  anneeScolaire: string;
  periode?: string;
  classeFormation?: string;
  modeConsultation: 'public' | 'protege';
  autorisePublicationPublique?: boolean;
}

export interface ImportResultatPreviewRow {
  numeroLigne: number;
  matricule: string | null;
  nom: string | null;
  prenom: string | null;
  classe: string | null;
  periode: string | null;
  notes: Record<string, unknown> | null;
  moyenne: number | null;
  statutAcademique: StatutAcademique | null;
  observation: string | null;
  valide: boolean;
  erreurs: string[];
  doublon: boolean;
}

export interface ImportResultatPreview {
  type: 'excel' | 'pdf' | 'inconnu';
  feuille: string | null;
  colonnes: string[];
  lignes: ImportResultatPreviewRow[];
  totalLignes: number;
  lignesValides: number;
  lignesInvalides: number;
  doublons: number;
  message: string;
}

export interface ImportResultatResponse {
  publication: ResultatPublication;
  preview: ImportResultatPreview;
}

export interface ConfirmationImportResultat {
  publication: ResultatPublication;
  inseres: number;
  ignores: number;
  doublons: number;
  erreurs: number;
}

export const importResultat = async (
  payload: ImportResultatPayload
): Promise<ImportResultatResponse> => {
  const formData = new FormData();
  formData.append('fichier', payload.fichier);
  formData.append('titre', payload.titre);
  formData.append('type', payload.type);
  formData.append('anneeScolaire', payload.anneeScolaire);
  if (payload.periode) formData.append('periode', payload.periode);
  if (payload.classeFormation) formData.append('classeFormation', payload.classeFormation);
  formData.append('modeConsultation', payload.modeConsultation);
  if (payload.autorisePublicationPublique !== undefined)
    formData.append('autorisePublicationPublique', String(payload.autorisePublicationPublique));

  return apiClient.post<ImportResultatResponse>('/resultats/import', formData);
};

export const confirmerImportResultat = async (id: number): Promise<ConfirmationImportResultat> => {
  return apiClient.post<ConfirmationImportResultat>(`/resultats/import/${id}/confirmer`);
};

export const publierResultat = async (id: number): Promise<ResultatPublication> => {
  return apiClient.post<ResultatPublication>(`/resultats/${id}/publier`);
};

export const depublierResultat = async (id: number): Promise<ResultatPublication> => {
  return apiClient.post<ResultatPublication>(`/resultats/${id}/depublier`);
};

export const archiverResultat = async (id: number): Promise<ResultatPublication> => {
  return apiClient.post<ResultatPublication>(`/resultats/${id}/archiver`);
};

export const supprimerResultat = async (id: number): Promise<void> => {
  await apiClient.delete(`/resultats/${id}`);
};
