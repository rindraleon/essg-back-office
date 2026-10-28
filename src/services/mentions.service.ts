import { apiClient } from '@/api';
import type {
  Mention,
  MentionFormData,
  MentionOption,
  MentionQueryFilters,
  Parcours,
  ParcoursFormData,
} from '@/types';

const LIST_LIMIT = 100;

const getMentions = async (search = '', filters: MentionQueryFilters = {}): Promise<Mention[]> => {
  const result = await apiClient.getList<Mention>('/mentions', {
    page: 1,
    limit: LIST_LIMIT,
    sortBy: 'nom',
    sortOrder: 'ASC',
    withParcours: 'true',
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(filters.isActive ? { isActive: filters.isActive } : {}),
    ...(filters.domaine ? { domaine: filters.domaine } : {}),
  });
  return result.data;
};

const getMentionById = async (id: number): Promise<Mention> => {
  return apiClient.get<Mention>(`/mentions/${id}`, { withFormations: 'true' });
};

const getMentionOptions = async (): Promise<MentionOption[]> => {
  return apiClient.get<MentionOption[]>('/mentions/options');
};

const getMentionDomaines = async (): Promise<string[]> => {
  return apiClient.get<string[]>('/mentions/domaines');
};

const getParcoursByMention = async (mentionId: number): Promise<Parcours[]> => {
  const result = await apiClient.getList<Parcours>('/parcours', {
    page: 1,
    limit: LIST_LIMIT,
    sortBy: 'nom',
    sortOrder: 'ASC',
    mentionId,
  });
  return result.data;
};

const createMention = async (data: MentionFormData): Promise<Mention> => {
  return apiClient.post<Mention>('/mentions', data);
};

const updateMention = async (id: number, data: Partial<MentionFormData>): Promise<Mention> => {
  return apiClient.put<Mention>(`/mentions/${id}`, data);
};

const deleteMention = async (id: number, cascade = false): Promise<void> => {
  await apiClient.delete(`/mentions/${id}${cascade ? '?cascade=true' : ''}`);
};

const createParcours = async (data: ParcoursFormData): Promise<Parcours> => {
  return apiClient.post<Parcours>('/parcours', data);
};

const updateParcours = async (id: number, data: Partial<ParcoursFormData>): Promise<Parcours> => {
  return apiClient.put<Parcours>(`/parcours/${id}`, data);
};

const deleteParcours = async (id: number): Promise<void> => {
  await apiClient.delete(`/parcours/${id}`);
};

export {
  getMentions,
  getMentionById,
  getMentionOptions,
  getMentionDomaines,
  getParcoursByMention,
  createMention,
  updateMention,
  deleteMention,
  createParcours,
  updateParcours,
  deleteParcours,
};
