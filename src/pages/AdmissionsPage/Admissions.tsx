import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button ,
  ListPageHeader,
  AdmissionFilters,
  ConfirmDialog,
  AdmissionTable,
  AdmissionDetailDialog,
  AdmissionDecisionDialog,
} from '@/components';
import { ApiError } from '@/api';
import {
  useDebounce,
  useScrollToTop,
  useAdmissionDetailQuery,
  useAdmissionsQuery,
  useDeleteAdmission,
  useDeleteAdmissionFile,
  useUpdateAdmissionStatus,
  useTitle,
} from '@/hooks';
import { getAdmissionFileBlob } from '@/services';
import { ADMISSION_PARCOURS } from '@/constants';
import { exportAdmissionsByParcours, formatFullName } from '@/utils';
import {
  type Admission,
  type AdmissionFile,
  type AdmissionStatus,
  ADMISSION_FILE_TYPE_LABELS,
} from '@/types';

const PdfPreviewDialog = lazy(() => import('@/components/common/PdfPreviewDialog'));

const ITEMS_PER_PAGE = 10;

const Admissions = () => {
  useScrollToTop();
  useTitle('Admissions');

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ admission: Admission; file: AdmissionFile } | null>(
    null
  );
  const [fileToDelete, setFileToDelete] = useState<{
    admission: Admission;
    file: AdmissionFile;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Admission | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNiveau, setFilterNiveau] = useState('all');
  const [filterFormation, setFilterFormation] = useState('all');
  const [filterDateDebut, setFilterDateDebut] = useState('');
  const [filterDateFin, setFilterDateFin] = useState('');

  const activeFilterCount = [
    filterStatus !== 'all',
    filterNiveau !== 'all',
    filterFormation !== 'all',
    Boolean(filterDateDebut),
    Boolean(filterDateFin),
  ].filter(Boolean).length;

  const { data, isLoading, isError, error, refetch } = useAdmissionsQuery({
    page: currentPage + 1,
    limit: rowsPerPage,
    q: debouncedSearch || undefined,
    statut: filterStatus,
    niveau: filterNiveau,
    formation: filterFormation,
    dateDebut: filterDateDebut || undefined,
    dateFin: filterDateFin || undefined,
    sortBy: 'creeLe',
    sortOrder: 'DESC',
  });
  const updateStatusMutation = useUpdateAdmissionStatus();
  const deleteMutation = useDeleteAdmission();
  const deleteFileMutation = useDeleteAdmissionFile();
  const detailQuery = useAdmissionDetailQuery(detailId);
  const admissions = data?.data ?? [];
  const totalItems = data?.total ?? 0;
  const detailAdmission = detailQuery.data ?? selectedAdmission;
  const niveaux = useMemo(
    () =>
      Array.from(new Set(admissions.map((item) => item.niveau))).sort((a, b) => a.localeCompare(b)),
    [admissions]
  );
  const formations = useMemo(
    () =>
      Array.from(
        new Set([...ADMISSION_PARCOURS, ...admissions.map((item) => item.formation)])
      ).sort((a, b) => a.localeCompare(b)),
    [admissions]
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [
    debouncedSearch,
    filterStatus,
    filterNiveau,
    filterFormation,
    filterDateDebut,
    filterDateFin,
  ]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterNiveau('all');
    setFilterFormation('all');
    setFilterDateDebut('');
    setFilterDateFin('');
    setCurrentPage(0);
  }, []);

  const handleSaveDecision = async (payload: {
    statut: AdmissionStatus;
    commentaire?: string;
    reponseDate?: string;
    reponseHeure?: string;
    reponseLieu?: string;
    reponseInstructions?: string;
    reponseMessage?: string;
  }) => {
    if (!selectedAdmission) return;
    setUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedAdmission.id,
        ...payload,
      });
      setShowStatusModal(false);
      setShowDetailModal(false);
      setSelectedAdmission(null);
      toast.success(
        payload.statut === 'accepte'
          ? 'Admission validée. L’email a été transmis au candidat.'
          : 'Décision enregistrée. L’email a été transmis au candidat.'
      );
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Impossible d'envoyer l'email";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const openPreview = (admission: Admission, file: AdmissionFile) => {
    setPreview({ admission, file });
  };

  const loadPreview = useCallback(async () => {
    if (!preview) throw new Error('Document introuvable');
    return getAdmissionFileBlob(preview.admission.id, preview.file.id);
  }, [preview]);

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      await deleteFileMutation.mutateAsync({
        id: fileToDelete.admission.id,
        fileId: fileToDelete.file.id,
      });
      toast.success('Fichier supprimé avec succès');
      setFileToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Erreur lors de la suppression du fichier'
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Candidature supprimée avec succès');
      setDeleteTarget(null);
    } catch {
      toast.error('Une erreur est survenue lors de la suppression.');
    }
  };

  const handleExport = async () => {
    if (filterFormation === 'all') {
      toast.error("Sélectionnez d'abord un parcours dans les filtres.");
      setFiltersOpen(true);
      return;
    }
    setExporting(true);
    try {
      const count = await exportAdmissionsByParcours(filterFormation, {
        q: debouncedSearch || undefined,
        statut: filterStatus,
        niveau: filterNiveau,
        dateDebut: filterDateDebut || undefined,
        dateFin: filterDateFin || undefined,
      });
      toast.success(
        `${count} candidature${count !== 1 ? 's' : ''} exportée${count !== 1 ? 's' : ''}.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de générer l'export Excel.");
    } finally {
      setExporting(false);
    }
  };

  function getEmptyMessage(): string | undefined {
    const hasSearch = Boolean(searchTerm.trim());
    const hasFilters =
      filterStatus !== 'all' ||
      filterNiveau !== 'all' ||
      filterFormation !== 'all' ||
      Boolean(filterDateDebut.trim()) ||
      Boolean(filterDateFin.trim());

    if (hasSearch || hasFilters) {
      return 'Aucune admission ne correspond à votre recherche ou aux filtres appliqués.';
    }

    return 'Aucune admission enregistrée pour le moment.';
  }

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-2 mx-auto min-w-0">
      <ListPageHeader
        title="Liste des admissions"
        totalCount={totalItems}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, prénom, email, téléphone..."
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleExport()}
          disabled={exporting || filterFormation === 'all'}
          title={
            filterFormation === 'all'
              ? "Sélectionnez d'abord un parcours"
              : `Exporter ${filterFormation}`
          }
        >
          {exporting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Exporter Excel
        </Button>
      </ListPageHeader>

      <AdmissionFilters
        filters={{
          search: searchTerm,
          status: filterStatus,
          niveau: filterNiveau,
          formation: filterFormation,
          dateDebut: filterDateDebut,
          dateFin: filterDateFin,
        }}
        onUpdateFilter={(key, value) => {
          if (key === 'status') setFilterStatus(value);
          if (key === 'niveau') setFilterNiveau(value);
          if (key === 'formation') setFilterFormation(value);
          if (key === 'dateDebut') setFilterDateDebut(value);
          if (key === 'dateFin') setFilterDateFin(value);
        }}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((prev) => !prev)}
        niveaux={niveaux}
        formations={formations}
      />

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Erreur lors du chargement des admissions'}
          <Button variant="outline" size="sm" className="ml-3" onClick={() => void refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      <AdmissionTable
        data={admissions}
        totalCount={totalItems}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        loading={isLoading}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(0);
        }}
        onView={(admission) => {
          setSelectedAdmission(admission);
          setDetailId(admission.id);
          setShowDetailModal(true);
        }}
        onEdit={(admission) => {
          setSelectedAdmission(admission);
          setShowStatusModal(true);
        }}
        onDelete={(id) => {
          const admission = admissions.find((item) => item.id === id);
          if (admission) setDeleteTarget(admission);
        }}
        onPreviewFile={openPreview}
        emptyMessage={getEmptyMessage()}
      />

      {showDetailModal && detailAdmission && (
        <AdmissionDetailDialog
          admission={detailAdmission}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setDetailId(null);
          }}
          onEditStatus={() => {
            setShowDetailModal(false);
            setShowStatusModal(true);
          }}
          onPreviewFile={(file) => openPreview(detailAdmission, file)}
          onDeleteFile={(file) => setFileToDelete({ admission: detailAdmission, file })}
        />
      )}

      {selectedAdmission && (
        <AdmissionDecisionDialog
          admission={selectedAdmission}
          open={showStatusModal}
          submitting={updating}
          onClose={() => setShowStatusModal(false)}
          onSubmit={handleSaveDecision}
        />
      )}

      {preview && (
        <Suspense fallback={null}>
          <PdfPreviewDialog
            open={true}
            title={`${ADMISSION_FILE_TYPE_LABELS[preview.file.type] ?? 'Document'} — ${formatFullName(preview.admission)}`}
            fileName={preview.file.originalName || 'document'}
            loadDocument={loadPreview}
            onClose={() => setPreview(null)}
            showDownload={true}
          />
        </Suspense>
      )}

      <ConfirmDialog
        open={Boolean(fileToDelete)}
        title="Supprimer le fichier"
        message={
          fileToDelete
            ? `Êtes-vous sûr de vouloir supprimer « ${ADMISSION_FILE_TYPE_LABELS[fileToDelete.file.type] ?? 'ce document'} » de la candidature de ${formatFullName(fileToDelete.admission)} ?`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
        severity="error"
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la candidature"
        message={
          deleteTarget
            ? `Êtes-vous sûr de vouloir supprimer la candidature de "${formatFullName(deleteTarget)}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        severity="error"
      />
    </div>
  );
};

export default Admissions;
