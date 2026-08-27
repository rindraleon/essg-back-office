import { apiClient } from '@/api';

export interface Message {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  lu: boolean;
  luLe?: string | null;
  luPar?: string | null;
  reponse?: string | null;
  reponseSujet?: string | null;
  reponduLe?: string | null;
  reponduPar?: string | null;
  creeLe: string;
  misAJourLe: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  q?: string;
  sujet?: string;
  lu?: boolean;
  dateDebut?: string;
  dateFin?: string;
}

function toLegacy<T>(result: {
  data: T[];
  meta: { total: number; page: number; limit: number };
}): PaginationResponse<T> {
  return {
    data: result.data,
    total: result.meta.total,
    page: result.meta.page,
    limit: result.meta.limit,
  };
}

function toMessageParams(query: PaginationQuery, q?: string) {
  return {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? 'creeLe',
    sortOrder: query.sortOrder ?? 'DESC',
    q: q ?? query.q,
    sujet: query.sujet && query.sujet !== 'all' ? query.sujet : undefined,
    lu: query.lu,
    dateDebut: query.dateDebut || undefined,
    dateFin: query.dateFin || undefined,
  };
}

export const getAllMessages = async (
  query: PaginationQuery = {}
): Promise<PaginationResponse<Message>> => {
  const result = await apiClient.getList<Message>('/messages', toMessageParams(query));
  return toLegacy(result);
};

export const searchMessages = async (
  q: string,
  query: PaginationQuery = {}
): Promise<PaginationResponse<Message>> => {
  const result = await apiClient.getList<Message>('/messages/search', toMessageParams(query, q));
  return toLegacy(result);
};

export const updateMessage = async (id: number, lu: boolean): Promise<Message> => {
  return apiClient.put<Message>(`/messages/${id}`, { lu });
};

export const replyToMessage = async (
  id: number,
  payload: { sujet?: string; message: string }
): Promise<Message> => {
  return apiClient.post<Message>(`/messages/${id}/reply`, payload);
};

export const deleteMessage = async (id: number): Promise<void> => {
  await apiClient.delete(`/messages/${id}`);
};
