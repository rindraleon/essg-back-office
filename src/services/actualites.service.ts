import { apiClient } from '@/api';
import type { ActualiteItem } from '@/types';

type NewsApiItem = Omit<ActualiteItem, 'statut'> & {
  statut?: boolean | ActualiteItem['statut'];
  galerie?: string[];
};

function mapActualite(item: NewsApiItem): ActualiteItem {
  let statut: ActualiteItem['statut'] = 'brouillon';
  if (item.statut === true || item.statut === 'publie') statut = 'publie';
  if (item.statut === 'archive') statut = 'archive';

  return {
    ...item,
    statut,
    galerie: item.galerie ?? [],
  };
}

const getAllActualites = async (): Promise<ActualiteItem[]> => {
  const result = await apiClient.getList<NewsApiItem>('/news', {
    page: 1,
    limit: 100,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
  });
  return result.data.map(mapActualite);
};

const createActualite = async (data: Partial<ActualiteItem>): Promise<ActualiteItem> => {
  const item = await apiClient.post<NewsApiItem>('/news', {
    ...data,
    statut: data.statut === 'publie',
  });
  return mapActualite(item);
};

const updateActualite = async (
  id: string,
  data: Partial<ActualiteItem>
): Promise<ActualiteItem> => {
  const item = await apiClient.put<NewsApiItem>(`/news/${id}`, {
    ...data,
    statut: data.statut === 'publie',
  });
  return mapActualite(item);
};

const deleteActualite = async (id: string): Promise<void> => {
  await apiClient.delete(`/news/${id}`);
};

export { getAllActualites, createActualite, updateActualite, deleteActualite };
