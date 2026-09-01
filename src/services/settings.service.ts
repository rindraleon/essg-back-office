import { apiClient } from '@/api';

export interface Settings {
  id: number;
  admissionsOuvertes: boolean;
}

export const getSettings = async (): Promise<Settings> => {
  return apiClient.get<Settings>('/settings');
};

export const updateSettings = async (
  payload: Partial<Pick<Settings, 'admissionsOuvertes'>>
): Promise<Settings> => {
  return apiClient.patch<Settings>('/settings', payload);
};
