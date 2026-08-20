import { apiClient } from '../api/client/http';
import type { ActualiteItem } from '../types/actualite.types';

type NewsApiItem = Omit<ActualiteItem, 'statut'> & {
  statut?: boolean | ActualiteItem['statut'];
  galerie?: string[];
};

function mapActualite(item: NewsApiItem): ActualiteItem {
  const statut: ActualiteItem['statut'] =
    item.statut === true || item.statut === 'publie'
      ? 'publie'
      : item.statut === 'archive'
        ? 'archive'
        : 'brouillon';

  return {
    ...item,
    statut,
    galerie: item.galerie ?? [],
  };
}

const getAllActualites = async (): Promise<ActualiteItem[]> => {
  const result = await apiClient.getList<NewsApiItem>('/news', { page: 1, limit: 100 });
  return result.data.map(mapActualite);
};

const getActualiteById = async (id: string): Promise<ActualiteItem> => {
  const item = await apiClient.get<NewsApiItem>(`/news/${id}`);
  return mapActualite(item);
};

const createActualite = async (data: Partial<ActualiteItem>): Promise<ActualiteItem> => {
  const item = await apiClient.post<NewsApiItem>('/news', {
    ...data,
    statut: data.statut === 'publie',
  });
  return mapActualite(item);
};

const updateActualite = async (id: string, data: Partial<ActualiteItem>): Promise<ActualiteItem> => {
  const item = await apiClient.put<NewsApiItem>(`/news/${id}`, {
    ...data,
    statut: data.statut === 'publie',
  });
  return mapActualite(item);
};

const deleteActualite = async (id: string): Promise<void> => {
  await apiClient.delete(`/news/${id}`);
};

export { getAllActualites, getActualiteById, createActualite, updateActualite, deleteActualite };
