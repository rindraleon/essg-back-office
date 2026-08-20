import { apiClient } from '../api/client/http';
import type { Actualite } from '../types/news.types';

export const getNews = async (): Promise<Actualite[]> => {
  const result = await apiClient.getList<Actualite>('/news', { page: 1, limit: 20 });
  return result.data;
};

export const getNewsBySlug = async (slug: string): Promise<Actualite> => {
  return apiClient.get<Actualite>(`/news/slug/${slug}`);
};
