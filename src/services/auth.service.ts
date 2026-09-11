import { apiClient } from '@/api';
import type { LoginResponse, User } from '@/types';

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
};

export type ResetTokenStatus = 'valid' | 'expired' | 'used' | 'invalid';

export const validateResetToken = async (
  token: string
): Promise<{ valid: boolean; status: ResetTokenStatus }> => {
  return apiClient.post<{ valid: boolean; status: ResetTokenStatus }>(
    '/auth/reset-password/validate',
    { token }
  );
};

export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    password,
    confirmPassword,
  });
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
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
  } catch (error) {
    console.warn(
      'Échec dans verifyToken — poursuite en mode dégradé',
      error instanceof Error ? error.message : error
    );
    return null;
  }
};
