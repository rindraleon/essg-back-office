import type { UserRole } from '@/types/auth.types';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  editeur: 'Éditeur',
  scolarite: 'Scolarité',
  lecteur: 'Lecteur',
};

export const getUserRoleLabel = (role: string | undefined): string =>
  role !== undefined && Object.hasOwn(USER_ROLE_LABELS, role)
    ? USER_ROLE_LABELS[role as UserRole]
    : 'Utilisateur';
