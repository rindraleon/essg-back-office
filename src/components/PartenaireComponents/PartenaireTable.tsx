import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { getImageUrl, isRemoteImage } from '../../utils/image.utils';
import type { Partenaire } from '../../types/partenaire.types';

import { PARTENAIRE_TYPE_COLORS } from '../../constants/partenaire.constants';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/utils';

interface PartenaireTableProps {
  data: Partenaire[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (partenaire: Partenaire) => void;
  onEdit: (partenaire: Partenaire) => void;
  onDelete: (partenaire: Partenaire) => void;
}

const PartenaireTable: React.FC<PartenaireTableProps> = ({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = useMemo<Column<Partenaire>[]>(
    () => [
      {
        id: 'nom',
        label: 'Partenaire',
        minWidth: 250,
        render: (row) => {
          const isImageLogo = isRemoteImage(row.logo);
          return (
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {isImageLogo ? (
                    <AvatarImage src={getImageUrl(row.logo)} alt={row.nom} />
                  ) : (
                    <AvatarFallback className="bg-ink-100 text-ink-700">{row.logo}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <span className="font-semibold text-ink-900 line-clamp-1">{row.nom}</span>
                  <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{row.secteur}</p>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'type',
        label: 'Type',
        minWidth: 140,
        render: (row) => {
          const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            primary: 'default',
            secondary: 'secondary',
            success: 'default',
            warning: 'secondary',
            info: 'outline',
          };
          return (
            <Badge variant={colorMap[PARTENAIRE_TYPE_COLORS[row.type]] || 'outline'}>
              {row.type}
            </Badge>
          );
        },
      },
      {
        id: 'contact',
        label: 'Contact',
        minWidth: 180,
        render: (row) => (
          <span className="text-sm text-ink-600">{row.contact || row.siteWeb || '-'}</span>
        ),
      },
      {
        id: 'dateDebut',
        label: 'Date début',
        minWidth: 120,
        render: (row) => <span className="text-sm text-ink-600">{formatDate(row.dateDebut)}</span>,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 130,
        align: 'right',
        render: (row) => (
          <TooltipProvider>
            <div className="flex justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onView(row)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voir</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucun partenaire trouvé"
      getRowId={(row) => row.id}
    />
  );
};

export default PartenaireTable;
