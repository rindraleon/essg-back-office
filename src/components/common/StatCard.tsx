import { Card, CardContent, Typography } from '@/components/compat/mui';
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  color?: 'gray' | 'blue' | 'green' | 'amber';
  subtitle?: string;
}

const colorMeta = {
  gray: { text: 'text-ink-900', accent: 'bg-ink-300' },
  blue: { text: 'text-brand-700', accent: 'bg-brand-500' },
  green: { text: 'text-brand-700', accent: 'bg-brand-600' },
  amber: { text: 'text-sage-700', accent: 'bg-sage-500' },
} as const;

const StatsCard: React.FC<StatCardProps> = React.memo(
  ({ title, value, color = 'gray', subtitle }) => {
    const meta = colorMeta[color];

    return (
      <Card
        variant="outlined"
        className="relative overflow-hidden !shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:!shadow-card-hover"
      >
        {/* Accent coloré discret */}
        <span className={`absolute inset-x-0 top-0 h-1 ${meta.accent}`} />

        <CardContent className="flex flex-col items-center py-4 pt-5">
          <Typography variant="h4" className={`font-bold ${meta.text}`}>
            {value}
          </Typography>
          <Typography variant="body2" className="text-ink-500 font-medium">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" className="text-ink-400 mt-1">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export default StatsCard;
