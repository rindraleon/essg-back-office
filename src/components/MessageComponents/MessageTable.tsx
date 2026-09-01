import { Eye, Mail, Reply, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import type { Message } from '@/services';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { formatFullName } from '@/utils';

interface MessageTableProps {
  data: Message[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (message: Message) => void;
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onReply?: (message: Message) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const getSujetLabel = (sujet: string): string => {
  const labels: Record<string, string> = {
    information: "Demande d'information",
    admission: 'Admission',
    partenariat: 'Partenariat',
    autre: 'Autre',
  };
  return labels[sujet] || sujet;
};

const getSujetColor = (sujet: string): 'default' | 'secondary' | 'outline' => {
  switch (sujet) {
    case 'information':
      return 'default';
    case 'admission':
      return 'secondary';
    case 'partenariat':
      return 'outline';
    default:
      return 'outline';
  }
};

const MessageTable: React.FC<MessageTableProps> = ({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onDelete,
  onMarkAsRead,
  onReply,
  loading = false,
  emptyMessage = 'Aucun message trouvé',
}) => {
  const columns = useMemo<Column<Message>[]>(
    () => [
      {
        id: 'expediteur',
        label: 'Expéditeur',
        minWidth: 250,
        render: (row) => (
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  row.lu ? 'bg-ink-100' : 'bg-brand-100'
                }`}
              >
                <Mail />
              </div>
              <div className="min-w-0">
                <span
                  className={`block ${row.lu ? 'font-medium text-ink-700' : 'font-bold text-ink-900'}`}
                >
                  {formatFullName(row)}
                </span>
                <p className="text-xs text-ink-500 truncate">{row.email}</p>
                {row.telephone && <p className="text-xs text-ink-500">{row.telephone}</p>}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'sujet',
        label: 'Sujet',
        minWidth: 180,
        render: (row) => (
          <div>
            <Badge variant={getSujetColor(row.sujet)} className="text-xs mb-1">
              {getSujetLabel(row.sujet)}
            </Badge>
            <p className="text-sm text-ink-600 line-clamp-2 mt-1">{row.message}</p>
          </div>
        ),
      },
      {
        id: 'statut',
        label: 'Statut',
        minWidth: 100,
        align: 'center',
        render: (row) =>
          row.lu ? (
            <Badge variant="secondary" className="text-xs">
              Lu
            </Badge>
          ) : (
            <Badge variant="default" className="text-xs">
              Nouveau
            </Badge>
          ),
      },
      {
        id: 'date',
        label: 'Date',
        minWidth: 150,
        render: (row) => (
          <span className="text-sm text-ink-600">
            {new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(row.creeLe))}
          </span>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 150,
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
              {onReply && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onReply(row)}
                      className="h-8 w-8"
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Répondre</TooltipContent>
                </Tooltip>
              )}
              {!row.lu && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onMarkAsRead(row.id)}
                      className="h-8 w-8"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Marquer comme lu</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(row.id)}
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
    [onView, onDelete, onMarkAsRead, onReply]
  );

  if (loading) {
    return (
      <div className="border border-ink-100 rounded-xl overflow-hidden bg-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-ink-300 border-t-brand-600"></div>
          <p className="mt-2 text-ink-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <DataTable<Message>
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
};

export default MessageTable;
