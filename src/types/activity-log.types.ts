export interface ActivityLog {
  id: number;
  userId: number | null;
  /** Nom complet de l'auteur, dénormalisé par le backend. */
  userName: string | null;
  action: string;
  description: string;
  method: string;
  endpoint: string;
  module: string;
  statusCode: number;
  success: boolean;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityLogQuery {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  module?: string;
  method?: string;
  statusCode?: number;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ActivityLogsListResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}