import { Eye, Pencil, Star, Trash2 } from 'lucide-react';
// src/components/FormationComponents/FormationTable.tsx
import React from 'react';
import type { Formation } from '../../types/formation.types';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FormationTableProps {
  data: Formation[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (formation: Formation) => void;
  onEdit: (formation: Formation) => void;
  onDelete: (formation: Formation) => void;
}

const FormationTable: React.FC<FormationTableProps> = ({
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
  const columns: Column<Formation>[] = [
    {
      id: 'titre',
      label: 'Formation',
      minWidth: 250,
      render: (row) => (
        <div className="max-w-md">
          <span className="font-semibold text-ink-900 line-clamp-1">{row.titre}</span>
          <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{row.domaine.join(', ')}</p>
        </div>
      ),
    },
    {
      id: 'niveau',
      label: 'Niveau',
      minWidth: 110,
      render: (row) => {
        const variantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
          Licence: 'default',
          Master: 'secondary',
          Doctorat: 'outline',
        };
        return (
          <Badge variant={variantMap[row.niveau] || 'outline'} className="text-xs">
            {row.niveau}
          </Badge>
        );
      },
    },
    {
      id: 'duree',
      label: 'Durée',
      minWidth: 100,
      render: (row) => <span className="text-sm text-ink-600">{row.duree}</span>,
    },
    {
      id: 'credits',
      label: 'Crédits',
      minWidth: 80,
      align: 'center',
      render: (row) => <span className="text-sm font-medium text-ink-700">{row.credits}</span>,
    },
    {
      id: 'enVedette',
      label: 'Vedette',
      minWidth: 100,
      align: 'center',
      render: (row) =>
        row.enVedette ? (
          <Star />
        ) : (
          <span className="text-sm text-ink-400">-</span>
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" onClick={() => onView(row)} className="h-8 w-8">
            <Eye className="size-4 h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onEdit(row)} className="h-8 w-8">
            <Pencil className="size-4 h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(row)}
            className="h-8 w-8 text-red-600 hover:text-red-700"
          >
            <Trash2 className="size-4 h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Formation>
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucune formation trouvée"
    />
  );
};

export default FormationTable;
