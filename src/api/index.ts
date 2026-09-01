export {
  API_BASE_URL,
  setAuthToken,
  clearAuthToken,
  hasAuthToken,
  getAuthToken,
  registerAuthFailureHandler,
  apiClient,
} from './client/http';
export type { DocumentBlob, RequestOptions } from './client/http';
export { ApiError, EMPTY_META } from './types/api';
export type {
  PaginationMeta,
  ApiEnvelope,
  PaginatedResult,
  PaginationParams,
  ApiErrorKind,
} from './types/api';
