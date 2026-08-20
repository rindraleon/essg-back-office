export interface DashboardStats {
  totalUsers: number;
  totalFormations: number;
  totalNews: number;
  totalProjects: number;
  totalPartnerships?: number;
  totalPartners?: number;
  totalResources: number;
  totalAdmissions: number;
  totalContacts?: number;
  usersChange?: string;
  formationsChange?: string;
  newsChange?: string;
  projectsChange?: string;
  partnershipsChange?: string;
  resourcesChange?: string;
  admissionsChange?: string;
  contactsChange?: string;
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'user' | 'formation' | 'news' | 'project';
}

export interface Overview {
  stats: DashboardStats;
  recentActivities: Activity[];
}
