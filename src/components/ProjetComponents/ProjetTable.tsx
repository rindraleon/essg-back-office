import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import type { Projet } from '@/types';
import { getTypeColor, formatDate } from '@/utils';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ProjetTableProps {
  data: Projet[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (projet: Projet) => void;
  onEdit: (projet: Projet) => void;
  onDelete: (projet: Projet) => void;
}

const ProjetTable: React.FC<ProjetTableProps> = ({
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
  const columns = useMemo<Column<Projet>[]>(
    () => [
      {
        id: 'titre',
        label: 'Projet',
        minWidth: 200,
        render: (row) => (
          <div className="max-w-xs">
            <span className="font-semibold text-ink-900 line-clamp-1">{row.titre}</span>
            <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{row.description}</p>
          </div>
        ),
      },
      {
        id: 'type',
        label: 'Type',
        minWidth: 120,
        render: (row) => {
          const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            primary: 'default',
            secondary: 'secondary',
            success: 'default',
            warning: 'secondary',
            info: 'outline',
          };
          return <Badge variant={colorMap[getTypeColor(row.type)] || 'outline'}>{row.type}</Badge>;
        },
      },
      {
        id: 'partenaires',
        label: 'Partenaires',
        minWidth: 150,
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.partenaires.slice(0, 2).map((partenaire, index) => (
              <Badge key={`${row.id}-${index}`} variant="outline" className="text-xs">
                {partenaire}
              </Badge>
            ))}
            {row.partenaires.length > 2 && (
              <Badge key={`${row.id}-more`} variant="outline" className="text-xs">
                +{row.partenaires.length - 2}
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'localisation',
        minWidth: 140,
        label: 'Localisation',
        render: (row) => (
          <div className="text-sm text-ink-600">
            {row.ville && <div>{row.ville}</div>}
            {row.pays && <div className="text-xs text-ink-500">{row.pays}</div>}
          </div>
        ),
      },
      {
        id: 'date',
        label: 'Date',
        minWidth: 100,
        render: (row) => <span className="text-sm text-ink-600">{formatDate(row.date)}</span>,
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 120,
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
      emptyMessage="Aucun projet trouvé"
      getRowId={(row) => row.id}
    />
  );
};

export default ProjetTable;
