import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { useDebounce, useTitle, useScrollToTop } from '@/hooks';
import { useAuth } from '@/contexts';
import { PERMISSIONS } from '@/constants';
import { ConfirmDialog, ListPageHeader } from '@/components';
import ResultatsTable from '@/components/ResultatsComponents/ResultatsTable';
import ResultatsFilter from '@/components/ResultatsComponents/ResultatsFilter';
import type { ResultatFilters } from '@/components/ResultatsComponents/ResultatsFilter';
import ResultatsImportDialog from '@/components/ResultatsComponents/ResultatsImportDialog';
import ResultatsViewDialog from '@/components/ResultatsComponents/ResultatsViewDialog';
import {
  archiverResultat,
  depublierResultat,
  downloadModeleResultats,
  getAllResultats,
  getResultatFileBlob,
  publierResultat,
  supprimerResultat,
  type ResultatPublication,
} from '@/services';

const EMPTY_FILTERS: ResultatFilters = {
  anneeScolaire: '',
  type: '',
  statutPublication: '',
};

export default function ResultatsPage() {
  useScrollToTop();
  useTitle('Résultats');
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const canCreate = hasPermission(PERMISSIONS.RESULTAT_CREATE);
  const canDelete = hasPermission(PERMISSIONS.RESULTAT_DELETE);
  const canPublish = hasPermission(PERMISSIONS.RESULTAT_PUBLISH);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ResultatFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'resultats',
      page,
      rowsPerPage,
      debouncedSearch,
      filters.anneeScolaire,
      filters.type,
      filters.statutPublication,
    ],
    queryFn: () =>
      getAllResultats({
        page: page + 1,
        limit: rowsPerPage,
        q: debouncedSearch || undefined,
        anneeScolaire: filters.anneeScolaire || undefined,
        type: filters.type || undefined,
        statutPublication: filters.statutPublication || undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['resultats'] });

  const actionMutation = useMutation({
    mutationFn: ({ action, id }: { action: 'publier' | 'depublier' | 'archiver'; id: number }) => {
      if (action === 'publier') return publierResultat(id);
      if (action === 'depublier') return depublierResultat(id);
      return archiverResultat(id);
    },
    onSuccess: (_data, variables) => {
      void invalidate();
      const labels = {
        publier: 'Publication effectuée.',
        depublier: 'Dépublication effectuée.',
        archiver: 'Archivage effectué.',
      } as const;
      toast.success(labels[variables.action]);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'L’action a échoué.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supprimerResultat(id),
    onSuccess: () => {
      void invalidate();
      toast.success('Publication supprimée.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'La suppression a échoué.');
    },
  });

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewResultatId, setViewResultatId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResultatPublication | null>(null);

  const resultats = useMemo(() => data?.data ?? [], [data?.data]);

  const telechargerModele = useCallback(async () => {
    try {
      const blob = await downloadModeleResultats();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modele-resultats.xlsx';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de télécharger le modèle.');
    }
  }, []);

  const handleDownload = useCallback(async (resultat: ResultatPublication) => {
    try {
      const blob = await getResultatFileBlob(resultat.id, true);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resultat.fichierOriginal;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de télécharger le fichier.');
    }
  }, []);

  const handleView = (resultat: ResultatPublication) => {
    setViewResultatId(resultat.id);
    setViewDialogOpen(true);
  };

  const handleUpdateFilter = (key: keyof ResultatFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-3 min-w-0">
      <ListPageHeader
        loading={isLoading}
        title="Résultats scolaires"
        totalCount={data?.total ?? 0}
        countLabel="publication"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Rechercher un intitulé, une année…"
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel={canCreate ? 'Importer un fichier' : undefined}
        onAction={canCreate ? () => setImportDialogOpen(true) : undefined}
        actionIcon={<Upload className="h-4 w-4" />}
      >
        <button
          type="button"
          onClick={() => void telechargerModele()}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
        >
          <Download className="h-4 w-4" />
          Modèle Excel
        </button>
      </ListPageHeader>

      <ResultatsFilter
        filters={filters}
        onUpdateFilter={handleUpdateFilter}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        open={filtersOpen}
        onToggle={() => setFiltersOpen(false)}
      />

      <ResultatsTable
        data={resultats}
        totalCount={data?.total ?? 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        onView={handleView}
        onDelete={canDelete ? (row) => setDeleteTarget(row) : undefined}
        onPublish={
          canPublish ? (row) => actionMutation.mutate({ action: 'publier', id: row.id }) : undefined
        }
        onUnpublish={
          canPublish
            ? (row) => actionMutation.mutate({ action: 'depublier', id: row.id })
            : undefined
        }
        onArchive={
          canPublish
            ? (row) => actionMutation.mutate({ action: 'archiver', id: row.id })
            : undefined
        }
        onDownload={(row) => void handleDownload(row)}
        loading={isLoading}
        error={!!error}
        onRetry={() => void refetch()}
      />

      {canCreate && (
        <ResultatsImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onSuccess={() => void refetch()}
        />
      )}

      <ResultatsViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        resultatId={viewResultatId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer la publication"
        message={
          <>
            Voulez-vous vraiment supprimer «&nbsp;{deleteTarget?.titre}&nbsp;» ? Cette action est
            irréversible et supprime également toutes les lignes de résultats associées.
          </>
        }
        confirmLabel="Supprimer"
        severity="error"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
