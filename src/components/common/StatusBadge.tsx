// src/components/common/StatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const statusMap: Record<string, StatusConfig> = {
  publie: { label: 'Publié', variant: 'default' },
  brouillon: { label: 'Brouillon', variant: 'secondary' },
  archive: { label: 'Archivé', variant: 'outline' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const config = statusMap[status] || { label: status, variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className={size === 'small' ? 'text-xs' : 'text-sm'}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
