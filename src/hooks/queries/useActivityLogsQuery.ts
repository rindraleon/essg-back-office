import { useQuery } from '@tanstack/react-query';
import type { ActivityLogQuery } from '@/types';
import {
  getActivityLogById,
  getActivityLogs,
} from '../../services/activity-logs.service';
import { queryKeys } from './keys';

export function useActivityLogsQuery(query: ActivityLogQuery) {
  return useQuery({
    queryKey: queryKeys.activityLogs.list(query),
    queryFn: () => getActivityLogs(query),
  });
}

export function useActivityLogQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.activityLogs.detail(id ?? 0),
    queryFn: () => getActivityLogById(id as number),
    enabled: typeof id === 'number' && id > 0,
  });
}
