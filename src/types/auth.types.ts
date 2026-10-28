import type { Permission } from '@/constants/permissions.constants';

export type UserRole = 'admin' | 'editeur' | 'scolarite' | 'lecteur';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;

  refreshToken: string;
  email: string;
  sessionId: string;
  expiresAt: string;
}

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: UserRole;
  permissions: Permission[];
  estActif: boolean;
  creeLe: string;
  misAJourLe: string;
  avatar?: string;
}

export interface UserFormData {
  email: string;
  motDePasse?: string;
  prenom: string;
  nom: string;
  role?: UserRole;
  estActif?: boolean;
  avatar?: string;
  avatarFile?: File;
}
