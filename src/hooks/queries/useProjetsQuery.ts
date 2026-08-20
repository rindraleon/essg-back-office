import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProjet, deleteProjet, getAllProjets, updateProjet } from '../../services';
import type { ProjetFormData } from '../../types';
import { queryKeys } from './keys';

export function useProjetsQuery() {
  return useQuery({
    queryKey: queryKeys.projets.list(),
    queryFn: getAllProjets,
  });
}

export function useCreateProjet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjetFormData) => createProjet(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projets.all });
    },
  });
}

export function useUpdateProjet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjetFormData }) => updateProjet(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projets.all });
    },
  });
}

export function useDeleteProjet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProjet(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projets.all });
    },
  });
}
