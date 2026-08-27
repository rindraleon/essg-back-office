import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMessage,
  getAllMessages,
  replyToMessage,
  searchMessages,
  updateMessage,
  type PaginationQuery,
} from '@/services';
import { queryKeys } from './keys';

export function useRecentMessagesQuery(limit = 4, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.messages.all, 'recent', limit],
    queryFn: () => getAllMessages({ page: 1, limit, sortBy: 'creeLe', sortOrder: 'DESC' }),
    enabled,
  });
}

export function useMessagesQuery(query: PaginationQuery & { q?: string } = {}) {
  const params = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? 'creeLe',
    sortOrder: query.sortOrder ?? 'DESC',
    q: query.q?.trim() || undefined,
    sujet: query.sujet,
    lu: query.lu,
    dateDebut: query.dateDebut,
    dateFin: query.dateFin,
  };

  return useQuery({
    queryKey: queryKeys.messages.list(params),
    queryFn: () => (params.q ? searchMessages(params.q, params) : getAllMessages(params)),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => updateMessage(id, true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}

export function useReplyToMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sujet, message }: { id: number; sujet?: string; message: string }) =>
      replyToMessage(id, { sujet, message }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMessage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
  });
}
