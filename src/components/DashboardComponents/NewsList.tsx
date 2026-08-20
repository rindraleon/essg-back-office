import { RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import { type Actualite } from '../../types/news.types';
import { getNews } from '../../services/news.service';
import { Button } from '@/components/ui/button';

const NewsList: React.FC = () => {
  const [news, setNews] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNews();
      setNews(data);
    } catch (err) {
      setError('Erreur lors du chargement des actualités');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <Button onClick={fetchNews}>
          <RefreshCw className="mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8">
        <h6 className="text-ink-500 text-lg">Aucune actualité disponible pour le moment</h6>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {news.map((actualite) => (
        <div key={actualite.id}>
          <NewsCard actualite={actualite} />
        </div>
      ))}
    </div>
  );
};

export default NewsList;
