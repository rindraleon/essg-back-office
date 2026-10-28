import type { LucideIcon } from 'lucide-react';
import {
  Folder,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Layers,
  Mail,
  Newspaper,
  ScrollText,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import routesStatic from '@/routes/routes';
import { PERMISSIONS, type Permission } from './permissions.constants';

export interface MenuAccess {
  permission?: Permission;
  adminOnly?: boolean;
}

export interface AccessContext {
  isAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
}

interface NavItem extends MenuAccess {
  name: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Tableau de bord',
    label: 'Accueil',
    href: routesStatic.dashboard,
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    name: 'Actualités',
    label: 'Actualités',
    href: routesStatic.actualites,
    icon: Newspaper,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Formations',
    label: 'Formations',
    href: routesStatic.formations,
    icon: GraduationCap,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Mentions & Parcours',
    label: 'Mentions',
    href: routesStatic.mentionsParcours,
    icon: Layers,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Projets',
    label: 'Projets',
    href: routesStatic.projets,
    icon: Folder,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Partenaires',
    label: 'Partenaires',
    href: routesStatic.partenaires,
    icon: Handshake,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Contacts',
    label: 'Contacts',
    href: routesStatic.contacts,
    icon: Mail,
    permission: PERMISSIONS.CONTACT_VIEW,
  },
  {
    name: 'Admissions',
    label: 'Admissions',
    href: routesStatic.admissions,
    icon: UserCheck,
    permission: PERMISSIONS.ADMISSION_VIEW,
  },
  {
    name: 'Équipes Pédagogiques',
    label: 'Ressources',
    href: routesStatic.ressourcesHumaines,
    icon: Users,
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    name: 'Utilisateurs',
    label: 'Utilisateurs',
    href: routesStatic.utilisateurs,
    icon: Users,
    adminOnly: true,
  },
  {
    name: 'Journal',
    label: 'Journal',
    href: routesStatic.activityLogs,
    icon: ScrollText,
    adminOnly: true,
  },
  {
    name: 'Paramètres',
    label: 'Paramètres',
    href: routesStatic.parametres,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_ADMISSION,
  },
];

export const isNavActive = (href: string, pathname: string): boolean => {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
};

export const isAdminRole = (role?: string): boolean => role === 'admin';

export const canAccessMenu = (menu: MenuAccess, access: AccessContext): boolean =>
  (!menu.adminOnly || access.isAdmin) &&
  (menu.permission === undefined || access.hasPermission(menu.permission));

export const getVisibleNavItems = (access: AccessContext): NavItem[] =>
  NAV_ITEMS.filter((item) => canAccessMenu(item, access));
