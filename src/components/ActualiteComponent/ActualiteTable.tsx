import { Eye, Pencil, Trash2 } from 'lucide-react';
// src/components/actualites/ActualiteTable.tsx
import React from 'react';
import type { ActualiteItem } from '../../types/actualite.types';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActualiteTableProps {
  data: ActualiteItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (actualite: ActualiteItem) => void;
  onEdit: (actualite: ActualiteItem) => void;
  onDelete: (actualite: ActualiteItem) => void;
}

const ActualiteTable: React.FC<ActualiteTableProps> = ({
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
  const columns: Column<ActualiteItem>[] = [
    {
      id: 'titre',
      label: 'Titre',
      minWidth: 200,
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-semibold text-ink-900 line-clamp-1">{row.titre}</span>
          <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{row.contenu}</p>
        </div>
      ),
    },
    {
      id: 'categorie',
      label: 'Catégorie',
      minWidth: 120,
      render: (row) => (
        <Badge variant="outline" className="text-xs">
          {row.categorie}
        </Badge>
      ),
    },
    {
      id: 'auteur',
      label: 'Auteur',
      minWidth: 130,
      render: (row) => <span className="text-sm text-ink-600">{row.auteur}</span>,
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 110,
      render: (row) => (
        <span className="text-sm text-ink-600">
          {new Date(row.date).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      id: 'statut',
      label: 'Statut',
      minWidth: 100,
      render: (row) => <StatusBadge status={row.statut} />,
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
    <DataTable<ActualiteItem>
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucune actualité trouvée"
    />
  );
};

export default ActualiteTable;
