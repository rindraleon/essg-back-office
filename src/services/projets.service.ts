import { apiClient } from '@/api';
import type { Projet, ProjetFormData } from '@/types';

const getAllProjets = async (): Promise<Projet[]> => {
  const result = await apiClient.getList<Projet>('/projects', {
    page: 1,
    limit: 100,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
  });
  return result.data;
};

const createProjet = async (data: ProjetFormData): Promise<Projet> => {
  return apiClient.post<Projet>('/projects', data);
};

const updateProjet = async (id: number, data: ProjetFormData): Promise<Projet> => {
  return apiClient.put<Projet>(`/projects/${id}`, data);
};

const deleteProjet = async (id: number): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

const uploadImage = async (file: File, folder = 'images'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await apiClient.post<{ url: string }>(
    `/upload/image?folder=${encodeURIComponent(folder)}`,
    formData
  );
  return result.url;
};

export { getAllProjets, createProjet, updateProjet, deleteProjet, uploadImage };
