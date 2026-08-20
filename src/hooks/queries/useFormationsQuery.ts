import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFormation,
  deleteFormation,
  getAllFormations,
  updateFormation,
} from '../../services';
import type { FormationFormData } from '../../types';
import { queryKeys } from './keys';

export function useFormationsQuery() {
  return useQuery({
    queryKey: queryKeys.formations.list(),
    queryFn: getAllFormations,
  });
}

export function useCreateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormationFormData) => createFormation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.formations.all });
    },
  });
}

export function useUpdateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormationFormData> }) =>
      updateFormation(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.formations.all });
    },
  });
}

export function useDeleteFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFormation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.formations.all });
    },
  });
}
