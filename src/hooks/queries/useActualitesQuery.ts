import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createActualite,
  deleteActualite,
  getAllActualites,
  updateActualite,
} from '../../services';
import type { ActualiteItem } from '../../types';
import { queryKeys } from './keys';

export function useActualitesQuery() {
  return useQuery({
    queryKey: queryKeys.actualites.list(),
    queryFn: getAllActualites,
  });
}

export function useCreateActualite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ActualiteItem>) => createActualite(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.actualites.all });
    },
  });
}

export function useUpdateActualite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActualiteItem> }) =>
      updateActualite(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.actualites.all });
    },
  });
}

export function useDeleteActualite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActualite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.actualites.all });
    },
  });
}
