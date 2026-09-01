import Cookies from 'js-cookie';
import {
  ApiError,
  EMPTY_META,
  type ApiEnvelope,
  type PaginatedResult,
  type PaginationMeta,
  type PaginationParams,
} from '../types/api';

const DEFAULT_API_URL = 'http://localhost:3000';
const TOKEN_COOKIE_NAME = 'token_name';
const REQUEST_TIMEOUT = 15_000;

export type DocumentBlob = Blob & {
  inlineViewable: boolean;
  mimetype: string;
};

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: PaginationParams;
  body?: unknown;
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
}

function resolveBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_URL;
  return raw.replace(/\/$/, '').replace(/\/api$/, '');
}

export const API_BASE_URL = resolveBaseUrl();

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return Cookies.get(TOKEN_COOKIE_NAME);
}

export function getAuthToken(): string | undefined {
  return getToken();
}

export function setAuthToken(token: string, options?: Cookies.CookieAttributes) {
  if (typeof window === 'undefined') return;
  Cookies.set(TOKEN_COOKIE_NAME, token, { sameSite: 'lax', ...options });
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_COOKIE_NAME);
}

export function hasAuthToken(): boolean {
  return Boolean(getToken());
}

let onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(fn: () => void) {
  onAuthFailure = fn;
}

function handleUnauthorized(requestUrl: string): void {
  const isAuthProbe =
    requestUrl.includes('/auth/verify') ||
    requestUrl.includes('/auth/me') ||
    requestUrl.includes('/auth/session');
  if (isAuthProbe) return;
  try {
    clearAuthToken();
  } catch (error) {
    console.warn('Nettoyage du jeton impossible', error);
  }
  onAuthFailure?.();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    const returnTo = `${window.location.pathname}${window.location.search || ''}`;
    window.location.replace(`/login?redirect=${encodeURIComponent(returnTo)}`);
  }
}

function buildUrl(path: string, params?: PaginationParams): string {
  let resolvedPath = path;
  if (!path.startsWith('http')) {
    resolvedPath = path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
  }
  const url = new URL(resolvedPath);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function readValidationMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const body = payload as { message?: unknown };
  if (typeof body.message === 'string') return body.message;
  if (Array.isArray(body.message)) {
    return body.message.filter((item): item is string => typeof item === 'string').join(' ');
  }
  return undefined;
}

function toApiErrorFromStatus(status: number, payload: unknown, requestUrl: string): ApiError {
  if (status === 401) {
    handleUnauthorized(requestUrl);
    return new ApiError('Votre session a expiré. Veuillez vous reconnecter.', {
      statusCode: status,
      kind: 'unauthorized',
    });
  }

  const fallback = readValidationMessage(payload);
  if (status === 400) {
    return new ApiError(fallback || 'Les données envoyées sont invalides.', {
      statusCode: status,
      kind: 'validation',
      details: payload,
    });
  }
  if (status === 403) {
    return new ApiError("Vous n'avez pas les droits nécessaires pour cette action.", {
      statusCode: status,
      kind: 'forbidden',
    });
  }
  if (status === 404) {
    return new ApiError(fallback || 'Ressource introuvable.', {
      statusCode: status,
      kind: 'not_found',
    });
  }
  if (status === 409) {
    return new ApiError(fallback || 'Cette valeur est déjà utilisée.', {
      statusCode: status,
      kind: 'conflict',
      details: payload,
    });
  }
  if (status === 502 || status === 503) {
    return new ApiError(fallback || 'Une erreur serveur est survenue. Réessayez plus tard.', {
      statusCode: status,
      kind: 'server',
      details: payload,
    });
  }
  if (status >= 500) {
    return new ApiError(fallback || 'Une erreur serveur est survenue. Réessayez plus tard.', {
      statusCode: status,
      kind: 'server',
    });
  }
  return new ApiError(fallback || 'Une erreur inattendue est survenue.', {
    statusCode: status,
    kind: 'unknown',
    details: payload,
  });
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('La requête a expiré. Veuillez réessayer.', { kind: 'timeout' });
  }
  if (error instanceof TypeError) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return new ApiError(
      offline
        ? 'Vous êtes hors ligne. Vérifiez votre connexion Internet avant de réessayer.'
        : 'Le serveur est inaccessible. Vérifiez votre connexion.',
      { kind: 'network' }
    );
  }
  return new ApiError('Une erreur inattendue est survenue.', { kind: 'unknown' });
}

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'statusCode' in payload && 'data' in payload) {
    return ((payload as ApiEnvelope<T>).data ?? null) as T;
  }
  return payload as T;
}

function unwrapMeta(payload: unknown): PaginationMeta | undefined {
  if (payload && typeof payload === 'object' && 'meta' in payload) {
    return (payload as ApiEnvelope<unknown>).meta;
  }
  return undefined;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: PaginationMeta; message?: string }> {
  const controller = new AbortController();
  const timeout = options.timeout ?? REQUEST_TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeout);
  const resolvedUrl = buildUrl(url, options.params);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(resolvedUrl, {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await parseJsonSafe(response);
      throw toApiErrorFromStatus(response.status, payload, url);
    }

    const envelope = (await parseJsonSafe(response)) as ApiEnvelope<T> | T;
    return {
      data: unwrap<T>(envelope),
      meta: unwrapMeta(envelope),
      message:
        envelope && typeof envelope === 'object' && 'message' in envelope
          ? (envelope as ApiEnvelope<T>).message
          : undefined,
    };
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  async get<T>(url: string, params?: PaginationParams): Promise<T> {
    const { data } = await request<T>(url, { method: 'GET', params });
    return data;
  },

  async getList<T>(url: string, params?: PaginationParams): Promise<PaginatedResult<T>> {
    const result = await request<T[]>(url, { method: 'GET', params });
    const items = Array.isArray(result.data) ? result.data : [];
    return {
      data: items,
      meta: result.meta ?? {
        ...EMPTY_META,
        total: items.length,
        limit: params?.limit ?? items.length,
      },
      message: result.message ?? '',
    };
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await request<T>(url, { method: 'POST', body });
    return data;
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await request<T>(url, { method: 'PUT', body });
    return data;
  },

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const { data } = await request<T>(url, { method: 'PATCH', body });
    return data;
  },

  async delete(url: string): Promise<void> {
    await request<null>(url, { method: 'DELETE' });
  },

  async getBlob(url: string): Promise<DocumentBlob> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    const headers: Record<string, string> = {
      Accept:
        'application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(buildUrl(url), {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      const blob = await response.blob();
      if (!response.ok) {
        if (blob.type.includes('application/json')) {
          const parsed = JSON.parse(await blob.text()) as { message?: string };
          throw toApiErrorFromStatus(response.status, parsed, url);
        }
        throw toApiErrorFromStatus(response.status, null, url);
      }
      if (blob.type.includes('application/json')) {
        const parsed = JSON.parse(await blob.text()) as { message?: string };
        throw new ApiError(parsed.message || 'Document introuvable', { kind: 'not_found' });
      }
      if (blob.size === 0) {
        throw new ApiError('Le document est vide ou illisible.', { kind: 'not_found' });
      }

      const inlineViewable = response.headers.get('X-Document-Inline-Viewable') !== 'false';
      return Object.assign(blob, {
        inlineViewable,
        mimetype: blob.type || 'application/octet-stream',
      });
    } catch (error) {
      throw toApiError(error);
    } finally {
      clearTimeout(timer);
    }
  },
};

export default apiClient;
