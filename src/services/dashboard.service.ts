import { apiClient } from '../api/client/http';
import type { Activity, DashboardStats, Overview } from '../types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get<DashboardStats>('/dashboard/stats');
};

export const getRecentActivities = async (): Promise<Activity[]> => {
  const data = await apiClient.get<Activity[]>('/dashboard/recent-activities');
  return Array.isArray(data) ? data : [];
};

export const getDashboardOverview = async (): Promise<Overview> => {
  const [stats, recentActivities] = await Promise.all([getDashboardStats(), getRecentActivities()]);
  return { stats, recentActivities };
};
