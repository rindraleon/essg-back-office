import { apiClient, clearAuthToken } from '@/api';
import type { LoginResponse, User } from '@/types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
};

interface VerifyPayload {
  valid: boolean;
  user: {
    userId: number;
    email: string;
    role: string;
    prenom: string;
    nom: string;
    avatar?: string;
    creeLe?: string;
    misAJourLe?: string;
  };
}

export const verifyToken = async (): Promise<User | null> => {
  try {
    const payload = await apiClient.post<VerifyPayload>('/auth/verify');
    if (payload.valid && payload.user) {
      return {
        id: payload.user.userId,
        email: payload.user.email,
        role: payload.user.role as 'admin' | 'editeur' | 'lecteur',
        prenom: payload.user.prenom,
        nom: payload.user.nom,
        estActif: true,
        creeLe: payload.user.creeLe || '',
        misAJourLe: payload.user.misAJourLe || '',
        avatar: payload.user.avatar,
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const logout = async (): Promise<void> => {
  clearAuthToken();
};
