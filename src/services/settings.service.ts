import { apiClient } from '@/api';

export type NavigationPrincipale = 'admission' | 'resultats' | 'aucun';

export interface Settings {
  id: number;
  admissionsOuvertes: boolean;
  navigationPrincipale: NavigationPrincipale;
}

export const getSettings = async (): Promise<Settings> => {
  return apiClient.get<Settings>('/settings');
};

export const updateSettings = async (
  payload: Partial<Pick<Settings, 'admissionsOuvertes' | 'navigationPrincipale'>>,
): Promise<Settings> => {
  return apiClient.patch<Settings>('/settings', payload);
};
