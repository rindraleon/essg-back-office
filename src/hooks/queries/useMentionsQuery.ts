import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMention,
  createParcours,
  deleteMention,
  deleteParcours,
  getMentionById,
  getMentionDomaines,
  getMentionOptions,
  getMentions,
  getParcoursByMention,
  updateMention,
  updateParcours,
} from '@/services';
import type { MentionFormData, MentionQueryFilters, ParcoursFormData } from '@/types';
import { queryKeys } from './keys';

/** Cache partagé : mentions, parcours et formations dérivent des mêmes données. */
function invalidateHierarchy(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.mentions.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.parcours.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.formations.all });
}

export function useMentionsQuery(
  search = '',
  filters: MentionQueryFilters = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: queryKeys.mentions.list(search, filters),
    queryFn: () => getMentions(search, filters),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useMentionDetailQuery(id: number | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.mentions.detail(id ?? -1),
    queryFn: () => getMentionById(id as number),
    enabled: enabled && id !== null && id > 0,
  });
}

export function useMentionOptionsQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.mentions.options(),
    queryFn: getMentionOptions,
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled ?? true,
  });
}

export function useMentionDomainesQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.mentions.domaines(),
    queryFn: getMentionDomaines,
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled ?? true,
  });
}

export function useParcoursByMentionQuery(mentionId: number | null) {
  return useQuery({
    queryKey: queryKeys.parcours.byMention(mentionId ?? -1),
    queryFn: () => getParcoursByMention(mentionId as number),
    enabled: mentionId !== null && mentionId > 0,
  });
}

export function useCreateMention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MentionFormData) => createMention(data),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}

export function useUpdateMention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MentionFormData> }) =>
      updateMention(id, data),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}

export function useDeleteMention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade }: { id: number; cascade?: boolean }) =>
      deleteMention(id, cascade ?? false),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}

export function useCreateParcours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ParcoursFormData) => createParcours(data),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}

export function useUpdateParcours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ParcoursFormData> }) =>
      updateParcours(id, data),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}

export function useDeleteParcours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteParcours(id),
    onSuccess: () => invalidateHierarchy(queryClient),
  });
}
