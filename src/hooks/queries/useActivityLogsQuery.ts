import { useQuery } from '@tanstack/react-query';
import type { ActivityLogQuery } from '@/types';
import { getActivityLogs } from '@/services';
import { queryKeys } from './keys';

export function useActivityLogsQuery(query: ActivityLogQuery) {
  return useQuery({
    queryKey: queryKeys.activityLogs.list(query),
    queryFn: () => getActivityLogs(query),
  });
}
