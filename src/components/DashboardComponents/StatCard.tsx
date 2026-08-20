import { ArrowUpRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactElement;
  loading?: boolean;
  to?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, loading = false, to }) => {
  const isPositive = change?.startsWith('+');

  if (loading) {
    return (
      <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/2 rounded bg-ink-100" />
          <div className="mb-2 h-8 w-3/4 rounded bg-ink-100" />
          <div className="h-4 w-1/4 rounded bg-ink-100" />
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-medium text-ink-500">{title}</p>
          <p className="mb-2 text-2xl font-bold tracking-tight text-ink-900">{value}</p>
          {change && (
            <span
              className={`inline-flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-brand-600' : 'text-red-600'
              }`}
            >
              <span aria-hidden="true">{isPositive ? '↗' : '↘'}</span>
              {change}
            </span>
          )}
          {to && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              Voir la liste
              <ArrowUpRight className="size-3.5" />
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-transform duration-200 group-hover:scale-105">
            {icon}
          </div>
        )}
      </div>
  );

  const className =
    'group relative block overflow-hidden rounded-sm border border-ink-100 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40';

  if (to) {
    return (
      <Link to={to} className={className} aria-label={`Ouvrir ${title}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

export default StatCard;
