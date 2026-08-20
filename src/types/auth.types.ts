export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
}

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'admin' | 'editeur' | 'lecteur';
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
  role?: 'admin' | 'editeur' | 'lecteur';
  estActif?: boolean;
  avatar?: string;
  avatarFile?: File;
}
