import { apiClient } from '@/api';
import type { Admission, AdmissionStatus } from '@/types';

export interface AdmissionQuery {
  page?: number;
  limit?: number;
  q?: string;
  statut?: string;
  niveau?: string;
  formation?: string;
  dateDebut?: string;
  dateFin?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdmissionsListResponse {
  data: Admission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAllAdmissions = async (
  query: AdmissionQuery = {}
): Promise<AdmissionsListResponse> => {
  const result = await apiClient.getList<Admission>('/admissions', {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    q: query.q,
    statut: query.statut && query.statut !== 'all' ? query.statut : undefined,
    niveau: query.niveau && query.niveau !== 'all' ? query.niveau : undefined,
    formation: query.formation && query.formation !== 'all' ? query.formation : undefined,
    dateDebut: query.dateDebut || undefined,
    dateFin: query.dateFin || undefined,
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

export const getAdmissionById = async (id: number): Promise<Admission> => {
  return apiClient.get<Admission>(`/admissions/${id}`);
};

export type AdmissionDecisionPayload = {
  statut: AdmissionStatus;
  commentaire?: string;
  reponseDate?: string;
  reponseHeure?: string;
  reponseLieu?: string;
  reponseInstructions?: string;
  reponseMessage?: string;
};

export const updateAdmissionStatus = async (
  id: number,
  statut: AdmissionStatus | AdmissionDecisionPayload,
  commentaire?: string
): Promise<Admission> => {
  const payload: AdmissionDecisionPayload =
    typeof statut === 'object' ? statut : { statut, commentaire };
  return apiClient.patch<Admission>(`/admissions/${id}/status`, payload);
};

export const getAdmissionFileBlob = async (
  id: number,
  fileId: number,
  download = false
): Promise<Blob> => {
  const suffix = download ? '?download=1' : '';
  return apiClient.getBlob(`/admissions/${id}/files/${fileId}${suffix}`);
};

export const deleteAdmissionFile = async (id: number, fileId: number): Promise<void> => {
  await apiClient.delete(`/admissions/${id}/files/${fileId}`);
};

export const deleteAdmission = async (id: number): Promise<void> => {
  await apiClient.delete(`/admissions/${id}`);
};
