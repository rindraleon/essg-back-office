import type { ActivityLog, ActivityLogQuery, ActivityLogsListResponse } from '@/types';
import { apiClient } from '@/api';

export const getActivityLogs = async (
  query: ActivityLogQuery = {}
): Promise<ActivityLogsListResponse> => {
  const result = await apiClient.getList<ActivityLog>('/activity-logs', {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    userId: query.userId,
    action: query.action,
    module: query.module,
    method: query.method,
    statusCode: query.statusCode,
    success: query.success,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'DESC',
  });

  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
    totalPages: result.meta.totalPages,
  };
};

export default {
  getActivityLogs,
};
