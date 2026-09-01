import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivities } from '@/services';
import { queryKeys } from './keys';

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: getDashboardStats,
  });
}

export function useRecentActivitiesQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.activities(),
    queryFn: getRecentActivities,
  });
}
