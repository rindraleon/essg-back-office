import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { getImageUrl, formatFullName, getPersonInitials } from '@/utils';
import type { RessourceHumaineItem } from '@/types';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface RessourceHumaineTableProps {
  data: RessourceHumaineItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (ressource: RessourceHumaineItem) => void;
  onEdit: (ressource: RessourceHumaineItem) => void;
  onDelete: (ressource: RessourceHumaineItem) => void;
}

const RessourceHumaineTable: React.FC<RessourceHumaineTableProps> = ({
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
  const columns: Column<RessourceHumaineItem>[] = [
    {
      id: 'photo',
      label: 'Photo',
      minWidth: 60,
      render: (row) => (
        <Avatar className="h-9 w-8">
          {row.photo ? (
            <AvatarImage src={getImageUrl(row.photo)} alt={formatFullName(row)} />
          ) : (
            <AvatarFallback className="bg-ink-100 text-ink-700 text-xs">
              {getPersonInitials(row)}
            </AvatarFallback>
          )}
        </Avatar>
      ),
    },
    {
      id: 'nom',
      label: 'Nom complet',
      minWidth: 180,
      render: (row) => (
        <div>
          <span className="font-semibold text-ink-900">{formatFullName(row)}</span>
        </div>
      ),
    },
    {
      id: 'poste',
      label: 'Poste',
      minWidth: 120,
      render: (row) => <Badge variant="outline">{row.poste}</Badge>,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 180,
      render: (row) => <span className="text-sm text-ink-600">{row.email || '-'}</span>,
    },
    {
      id: 'telephone',
      label: 'Téléphone',
      minWidth: 120,
      render: (row) => <span className="text-sm text-ink-600">{row.telephone || '-'}</span>,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 110,
      align: 'right',
      render: (row) => (
        <TooltipProvider>
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => onView(row)} className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => onEdit(row)} className="h-8 w-8">
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
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucune ressource humaine trouvée"
      getRowId={(row) => row.id}
    />
  );
};

export default RessourceHumaineTable;
