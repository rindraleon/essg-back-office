import { apiClient } from '@/api';
import type { User } from '@/types';

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const getAllUsers = async (page = 1, limit = 10): Promise<UsersListResponse> => {
  const result = await apiClient.getList<User>('/users', {
    page,
    limit,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
  });
  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
  };
};

interface CreateUserData {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role?: 'admin' | 'editeur' | 'lecteur';
  estActif?: boolean;
  avatar?: string;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  return apiClient.post<User>('/users', userData);
};

interface UpdateUserData {
  email?: string;
  motDePasse?: string;
  prenom?: string;
  nom?: string;
  role?: 'admin' | 'editeur' | 'lecteur';
  estActif?: boolean;
  avatar?: string;
}

export const updateUser = async (id: number, userData: UpdateUserData): Promise<User> => {
  const filteredData = Object.fromEntries(
    Object.entries(userData).filter(([, value]) => value !== undefined)
  );
  return apiClient.put<User>(`/users/${id}`, filteredData);
};

export const uploadAvatar = async (id: number, file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient.post<User>(`/users/${id}/avatar`, formData);
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
