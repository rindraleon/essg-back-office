import { apiClient } from '../api/client/http';
import type { Formation, FormationFormData } from '../types/formation.types';

const getAllFormations = async (): Promise<Formation[]> => {
  const result = await apiClient.getList<Formation>('/formations', { page: 1, limit: 100 });
  return result.data;
};

const getFormationById = async (id: number): Promise<Formation> => {
  return apiClient.get<Formation>(`/formations/${id}`);
};

const searchFormations = async (query: string): Promise<Formation[]> => {
  const result = await apiClient.getList<Formation>('/formations/search', { q: query, page: 1, limit: 100 });
  return result.data;
};

const createFormation = async (data: FormationFormData): Promise<Formation> => {
  return apiClient.post<Formation>('/formations', data);
};

const updateFormation = async (id: number, data: Partial<FormationFormData>): Promise<Formation> => {
  return apiClient.put<Formation>(`/formations/${id}`, data);
};

const deleteFormation = async (id: number): Promise<void> => {
  await apiClient.delete(`/formations/${id}`);
};

export {
  getAllFormations,
  getFormationById,
  searchFormations,
  createFormation,
  updateFormation,
  deleteFormation,
};
