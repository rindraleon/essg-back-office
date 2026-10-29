import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/services';
import { queryKeys } from './keys';

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.get(),
    queryFn: () => getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      admissionsOuvertes?: boolean;
      navigationPrincipale?: 'admission' | 'resultats' | 'aucun';
    }) => updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
