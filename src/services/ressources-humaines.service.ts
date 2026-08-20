import { apiClient } from '../api/client/http';
import type { RessourceHumaineItem } from '../types/ressource-humaine.types';

const getAllRessourcesHumaines = async (): Promise<RessourceHumaineItem[]> => {
  const result = await apiClient.getList<RessourceHumaineItem>('/ressources-humaines', {
    page: 1,
    limit: 100,
  });
  return result.data;
};

const getRessourceHumaineById = async (id: string): Promise<RessourceHumaineItem> => {
  return apiClient.get<RessourceHumaineItem>(`/ressources-humaines/${id}`);
};

const createRessourceHumaine = async (
  data: Partial<RessourceHumaineItem>,
): Promise<RessourceHumaineItem> => {
  return apiClient.post<RessourceHumaineItem>('/ressources-humaines', data);
};

const updateRessourceHumaine = async (
  id: string,
  data: Partial<RessourceHumaineItem>,
): Promise<RessourceHumaineItem> => {
  return apiClient.put<RessourceHumaineItem>(`/ressources-humaines/${id}`, data);
};

const deleteRessourceHumaine = async (id: string): Promise<void> => {
  await apiClient.delete(`/ressources-humaines/${id}`);
};

export {
  getAllRessourcesHumaines,
  getRessourceHumaineById,
  createRessourceHumaine,
  updateRessourceHumaine,
  deleteRessourceHumaine,
};
