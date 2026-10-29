import { Archive, Download, Eye, EyeOff, Trash2 } from 'lucide-react';
import React from 'react';
import type { ResultatPublication } from '@/services';
import DataTable from '../common/DataTable';
import type { Column } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const STATUT_BADGE: Record<string, string> = {
  brouillon: 'bg-amber-100 text-amber-800 border border-amber-200',
  publie: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  archive: 'bg-slate-100 text-slate-800 border border-slate-200',
};

const STATUT_LABEL: Record<string, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  archive: 'Archivé',
};

const TYPE_LABEL: Record<string, string> = {
  excel: 'Excel',
  pdf: 'PDF',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('fr-MG') : '—';

interface ResultatsTableProps {
  data: ResultatPublication[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (resultat: ResultatPublication) => void;
  onDelete?: (resultat: ResultatPublication) => void;
  onPublish?: (resultat: ResultatPublication) => void;
  onUnpublish?: (resultat: ResultatPublication) => void;
  onArchive?: (resultat: ResultatPublication) => void;
  onDownload?: (resultat: ResultatPublication) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const ResultatsTable: React.FC<ResultatsTableProps> = ({
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onDelete,
  onPublish,
  onUnpublish,
  onArchive,
  onDownload,
  loading = false,
  error = false,
  onRetry,
}) => {
  const columns: Column<ResultatPublication>[] = [
    {
      id: 'titre',
      label: 'Intitulé',
      minWidth: 260,
      render: (row) => (
        <div className="max-w-md">
          <span className="font-semibold text-ink-900 line-clamp-1">{row.titre}</span>
          <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{row.fichierOriginal}</p>
        </div>
      ),
    },
    {
      id: 'anneeScolaire',
      label: 'Année / Période',
      minWidth: 150,
      render: (row) => (
        <div className="text-sm text-ink-700">
          <p className="font-medium">{row.anneeScolaire}</p>
          <p className="text-xs text-ink-500">{row.periode || '—'}</p>
        </div>
      ),
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 90,
      render: (row) => (
        <Badge variant="outline" className="text-xs">
          {TYPE_LABEL[row.type] ?? row.type}
        </Badge>
      ),
    },
    {
      id: 'totaux',
      label: 'Résultats',
      minWidth: 170,
      render: (row) => (
        <div className="text-xs text-ink-600 space-y-0.5">
          <p>
            <span data-numeric className="font-semibold text-ink-900">
              {row.totalIndividuels}
            </span>{' '}
            lignes
          </p>
          <p>
            <span className="text-emerald-700">{row.totalAdmis} admis</span>
            {' · '}
            <span className="text-red-700">{row.totalAjourne} ajourné(s)</span>
          </p>
        </div>
      ),
    },
    {
      id: 'consultation',
      label: 'Consultation',
      minWidth: 120,
      render: (row) => (
        <span className="text-xs text-ink-600">
          {row.modeConsultation === 'protege' ? 'Protégée (matricule + code)' : 'Publique'}
        </span>
      ),
    },
    {
      id: 'statut',
      label: 'Statut',
      minWidth: 110,
      render: (row) => (
        <Badge variant="outline" className={`text-xs ${STATUT_BADGE[row.statutPublication] ?? ''}`}>
          {STATUT_LABEL[row.statutPublication] ?? row.statutPublication}
        </Badge>
      ),
    },
    {
      id: 'creeLe',
      label: 'Créé le',
      minWidth: 120,
      render: (row) => <span className="text-sm text-ink-600">{formatDate(row.creeLe)}</span>,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 170,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onView(row)}
            className="h-8 w-8"
            aria-label={`Consulter ${row.titre}`}
            title="Consulter les détails"
          >
            <Eye className="size-4 h-4 w-4" />
          </Button>
          {onDownload && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDownload(row)}
              className="h-8 w-8"
              aria-label={`Télécharger le fichier de ${row.titre}`}
              title="Télécharger le fichier"
            >
              <Download className="size-4 h-4 w-4" />
            </Button>
          )}
          {onPublish && row.statutPublication === 'brouillon' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onPublish(row)}
              className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
              aria-label={`Publier ${row.titre}`}
              title="Publier"
            >
              <Eye className="size-4 h-4 w-4" />
            </Button>
          )}
          {onUnpublish && row.statutPublication === 'publie' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onUnpublish(row)}
              className="h-8 w-8 text-amber-600 hover:text-amber-700"
              aria-label={`Dépublier ${row.titre}`}
              title="Dépublier"
            >
              <EyeOff className="size-4 h-4 w-4" />
            </Button>
          )}
          {onArchive && row.statutPublication !== 'archive' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onArchive(row)}
              className="h-8 w-8 text-slate-600 hover:text-slate-700"
              aria-label={`Archiver ${row.titre}`}
              title="Archiver"
            >
              <Archive className="size-4 h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(row)}
              className="h-8 w-8 text-red-600 hover:text-red-700"
              aria-label={`Supprimer ${row.titre}`}
              title="Supprimer"
            >
              <Trash2 className="size-4 h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<ResultatPublication>
      loading={loading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      getRowId={(row) => row.id}
      emptyMessage="Aucun résultat trouvé"
    />
  );
};

export default ResultatsTable;
