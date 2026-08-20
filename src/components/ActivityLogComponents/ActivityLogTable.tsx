import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable, { type Column } from '../common/DataTable';
import type { ActivityLog } from '@/types';


interface ActivityLogTableProps {
  data: ActivityLog[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (log: ActivityLog) => void;
  emptyMessage?: string;
}

/** Libellés métier des actions (aucun terme technique en colonne). */
const ACTION_LABELS: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  status: 'Changement de statut',
};

/** Libellés métier des modules. */
const MODULE_LABELS: Record<string, string> = {
  users: 'Utilisateurs',
  admissions: 'Admissions',
  formations: 'Formations',
  projects: 'Projets',
  news: 'Actualités',
  partners: 'Partenaires',
  messages: 'Messages',
  'ressources-humaines': 'Ressources humaines',
  upload: 'Fichiers',
  documents: 'Documents',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ActivityLogTable({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  emptyMessage = 'Aucune action trouvée',
}: Readonly<ActivityLogTableProps>) {
  const columns: Column<ActivityLog>[] = [
    {
      id: 'createdAt',
      label: 'Date',
      minWidth: 130,
      render: (row) => (
        <span data-numeric className="whitespace-nowrap text-sm text-ink-600">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      id: 'user',
      label: 'Utilisateur',
      minWidth: 150,
      render: (row) => (
        <span className="font-medium text-ink-900">
          {row.userName?.trim() || (row.userId ? `Utilisateur #${row.userId}` : 'Système')}
        </span>
      ),
    },
    {
      id: 'description',
      label: 'Action',
      minWidth: 240,
      render: (row) => (
        <span className="line-clamp-2 text-sm text-ink-700">
          {row.description || ACTION_LABELS[row.action] || row.action}
        </span>
      ),
    },
    {
      id: 'module',
      label: 'Module',
      minWidth: 140,
      render: (row) => (
        <span className="text-sm text-ink-600">{MODULE_LABELS[row.module] ?? row.module}</span>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(row)}
          aria-label="Voir le détail de l'action"
        >
          <Eye className="size-4" />
        </Button>
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
      emptyMessage={emptyMessage}
      getRowId={(row) => row.id}
    />
  );
}
