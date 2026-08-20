import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRessourceHumaine,
  deleteRessourceHumaine,
  getAllRessourcesHumaines,
  updateRessourceHumaine,
} from '../../services';
import type { RessourceHumaineItem } from '../../types';
import { queryKeys } from './keys';

export function useRessourcesHumainesQuery() {
  return useQuery({
    queryKey: queryKeys.ressourcesHumaines.list(),
    queryFn: getAllRessourcesHumaines,
  });
}

export function useCreateRessourceHumaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RessourceHumaineItem>) => createRessourceHumaine(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ressourcesHumaines.all });
    },
  });
}

export function useUpdateRessourceHumaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RessourceHumaineItem> }) =>
      updateRessourceHumaine(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ressourcesHumaines.all });
    },
  });
}

export function useDeleteRessourceHumaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRessourceHumaine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ressourcesHumaines.all });
    },
  });
}
