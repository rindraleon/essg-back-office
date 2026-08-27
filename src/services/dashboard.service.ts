import { apiClient } from '@/api';
import type { Activity, DashboardStats } from '@/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get<DashboardStats>('/dashboard/stats');
};

export const getRecentActivities = async (): Promise<Activity[]> => {
  const data = await apiClient.get<Activity[]>('/dashboard/recent-activities');
  return Array.isArray(data) ? data : [];
};
