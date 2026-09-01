import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api';
import { FORMATION_MENTIONS, type FormationMention } from '@/constants';

export function useFormationMentionsQuery() {
  return useQuery<FormationMention[]>({
    queryKey: ['formations', 'mentions'],
    queryFn: () => apiClient.get<FormationMention[]>('/formations/mentions'),
    initialData: FORMATION_MENTIONS,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
