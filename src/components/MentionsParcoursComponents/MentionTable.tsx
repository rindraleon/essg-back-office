import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import type { Mention, MentionTableProps } from '@/types';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Button } from '../ui/button';

const MentionTable: React.FC<MentionTableProps> = ({
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
  const columns: Column<Mention>[] = [
    {
      id: 'nom',
      label: 'Mention',
      minWidth: 240,
      render: (row) => (
        <div className="max-w-md">
          <span className="font-semibold text-ink-900 line-clamp-1">{row.nom}</span>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
            {row.domaine ? `Domaine : ${row.domaine}` : row.slug}
          </p>
        </div>
      ),
    },
    {
      id: 'parcours',
      label: 'Parcours',
      minWidth: 260,
      render: (row) =>
        row.parcours && row.parcours.length > 0 ? (
          <div className="flex max-w-lg flex-wrap gap-1">
            {row.parcours.map((parcours) => (
              <span
                key={parcours.id}
                className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] text-ink-600"
              >
                {parcours.nom}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] italic text-ink-400">Aucun parcours</span>
        ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onView(row)}
            className="h-8 w-8"
            aria-label={`Consulter la mention ${row.nom}`}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(row)}
            className="h-8 w-8"
            aria-label={`Modifier la mention ${row.nom}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(row)}
            className="h-8 w-8 text-red-600 hover:text-red-700"
            aria-label={`Supprimer la mention ${row.nom}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Mention>
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      emptyMessage="Aucune mention enregistrée. Créez la première mention pour organiser vos parcours."
      getRowId={(row) => row.id}
    />
  );
};

export default MentionTable;
