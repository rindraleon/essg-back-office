import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client/http';
import { FORMATION_MENTIONS, type FormationMention } from '../../constants/formation.constants';

/**
 * Référentiel Mention → Titres de formation.
 *
 * Les constantes locales servent de `initialData` : le formulaire est
 * immédiatement utilisable (aucun flash de contenu, aucun select vide) et
 * l'API vient simplement rafraîchir la liste en arrière-plan. Si l'appel
 * échoue, le repli local reste affiché — le formulaire n'est jamais bloqué.
 */
export function useFormationMentionsQuery() {
  return useQuery<FormationMention[]>({
    queryKey: ['formations', 'mentions'],
    queryFn: () => apiClient.get<FormationMention[]>('/formations/mentions'),
    initialData: FORMATION_MENTIONS,
    // Référentiel quasi statique : inutile de le recharger à chaque montage.
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
