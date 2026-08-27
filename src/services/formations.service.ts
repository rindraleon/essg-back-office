import { apiClient } from '@/api';
import type { Formation, FormationFormData } from '@/types';

const getAllFormations = async (): Promise<Formation[]> => {
  const result = await apiClient.getList<Formation>('/formations', {
    page: 1,
    limit: 100,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
  });
  return result.data;
};

const createFormation = async (data: FormationFormData): Promise<Formation> => {
  return apiClient.post<Formation>('/formations', data);
};

const updateFormation = async (
  id: number,
  data: Partial<FormationFormData>
): Promise<Formation> => {
  return apiClient.put<Formation>(`/formations/${id}`, data);
};

const deleteFormation = async (id: number): Promise<void> => {
  await apiClient.delete(`/formations/${id}`);
};

export { getAllFormations, createFormation, updateFormation, deleteFormation };
