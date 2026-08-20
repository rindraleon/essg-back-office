import { Eye } from 'lucide-react';
import React from 'react';
import { getImageUrl } from '../../utils/image.utils';
import { type Actualite } from '../../types/news.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NewsCardProps {
  actualite: Actualite;
  onView?: (id: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ actualite, onView }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="flex-1">
        <div className="flex items-start gap-4 mb-3">
          <div className="text-2xl w-[60px] h-[60px] flex items-center justify-center bg-brand-50 rounded-lg flex-shrink-0">
            {actualite.image ? (
              <img
                src={getImageUrl(actualite.image)}
                alt={actualite.titre}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span>📰</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-ink-900 mb-1">{actualite.titre}</h3>
            <div className="flex gap-2 mb-1 flex-wrap items-center">
              <Badge variant="outline">{actualite.categorie}</Badge>
              <span className="text-xs text-ink-500">{formatDate(actualite.date)}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-ink-600 line-clamp-3">{actualite.resume || actualite.contenu}</p>
      </CardContent>
      {onView && (
        <CardFooter className="flex justify-end px-4 pb-4">
          <Button size="sm" variant="ghost" onClick={() => onView(actualite.id)} aria-label="voir">
            <Eye className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NewsCard;
