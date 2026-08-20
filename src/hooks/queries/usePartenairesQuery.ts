import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPartenaire,
  deletePartenaire,
  getAllPartenaires,
  updatePartenaire,
} from '../../services';
import type { PartenaireFormData } from '../../types';
import { queryKeys } from './keys';

export function usePartenairesQuery() {
  return useQuery({
    queryKey: queryKeys.partenaires.list(),
    queryFn: getAllPartenaires,
  });
}

export function useCreatePartenaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PartenaireFormData | FormData) => createPartenaire(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.partenaires.all });
    },
  });
}

export function useUpdatePartenaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartenaireFormData | FormData }) =>
      updatePartenaire(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.partenaires.all });
    },
  });
}

export function useDeletePartenaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePartenaire(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.partenaires.all });
    },
  });
}
