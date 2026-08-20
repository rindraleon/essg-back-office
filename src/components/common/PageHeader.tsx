import { Plus } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 sm:text-base">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="h-10 shrink-0 rounded-xl px-4 shadow-[0_10px_24px_-10px_rgba(46,106,95,0.55)]"
        >
          {actionIcon || <Plus className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
