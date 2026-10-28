import React, { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FormationFilters,
  FormationForm,
  FormationTable,
  FormationViewDialog,
  ConfirmDialog,
  ListPageHeader,
} from '@/components';
import {
  usePagination,
  useFormationFilter,
  formationMentionNom,
  useScrollToTop,
  useCreateFormation,
  useDeleteFormation,
  useFormationsQuery,
  useUpdateFormation,
  useTitle,
} from '@/hooks';
import type { FormationFormData, Formation } from '@/types';
import { useAuth } from '@/contexts';
import { PERMISSIONS } from '@/constants';

const Formations: React.FC = () => {
  useScrollToTop();
  useTitle('Formations');
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.CONTENT_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.CONTENT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CONTENT_DELETE);
  const { data = [], isLoading, isError, refetch } = useFormationsQuery();
  const createMutation = useCreateFormation();
  const updateMutation = useUpdateFormation();
  const deleteMutation = useDeleteFormation();
  const [searchTerm, setSearchTerm] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null);

  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } =
    useFormationFilter({
      data,
      searchTerm,
    });

  const mentionOptions = useMemo(
    () =>
      [...new Set(data.map(formationMentionNom).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'fr')
      ),
    [data]
  );

  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  } = usePagination({ data: filteredData, initialRowsPerPage: 5 });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      resetPage();
    },
    [resetPage]
  );

  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setSelectedFormation(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((formation: Formation) => {
    setFormMode('edit');
    setSelectedFormation(formation);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((formation: Formation) => {
    setSelectedFormation(formation);
    setViewDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((formation: Formation) => {
    setFormationToDelete(formation);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (formationToDelete) {
      try {
        await deleteMutation.mutateAsync(formationToDelete.id);
        toast.success(`« ${formationToDelete.titre} » supprimée avec succès.`);
        setDeleteDialogOpen(false);
        setFormationToDelete(null);
      } catch (error) {
        // Les messages du backend sont déjà rédigés pour l'utilisateur ;
        // les détails techniques restent dans la console.
        console.error('Error deleting formation:', error);
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : 'Impossible de supprimer la formation. Veuillez réessayer.'
        );
      }
    }
  }, [formationToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: FormationFormData) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(formData);
          toast.success('Formation créée avec succès.');
        } else if (selectedFormation) {
          await updateMutation.mutateAsync({ id: selectedFormation.id, data: formData });
          toast.success('Formation modifiée avec succès.');
        }
        setFormOpen(false);
      } catch (error) {
        console.error('Error saving formation:', error);
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Impossible d'enregistrer la formation. Vérifiez les informations puis réessayez."
        );
        throw error;
      }
    },
    [formMode, selectedFormation, createMutation, updateMutation]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
    resetPage();
  }, [resetFilters, resetPage]);

  const handleToggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev);
  }, []);

  return (
    <div className="mx-auto max-w-7xl py-4 space-y-2 mx-auto min-w-0">
      <ListPageHeader
        loading={isLoading}
        title="Liste des formations"
        totalCount={filteredData.length}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par titre, mention, parcours..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel={canCreate ? 'Nouvelle formation' : undefined}
        onAction={canCreate ? handleOpenCreate : undefined}
      />

      {filtersOpen && (
        <div className="rounded-xl border border-ink-100 bg-card p-4 shadow-card">
          <FormationFilters
            filters={filters}
            mentionOptions={mentionOptions}
            onUpdateFilter={(key, value) => {
              updateFilter(key, value);
              resetPage();
            }}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
            open={filtersOpen}
            onToggle={handleToggleFilters}
          />
        </div>
      )}

      <FormationTable
        loading={isLoading}

        error={isError}

        onRetry={() => void refetch()}
        data={paginatedData}
        totalCount={filteredData.length}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onView={handleView}
        onEdit={canUpdate ? handleOpenEdit : undefined}
        onDelete={canDelete ? handleDeleteRequest : undefined}
      />

      <FormationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedFormation}
        mode={formMode}
      />

      <FormationViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        formation={selectedFormation}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer la formation"
        message={
          formationToDelete
            ? `Êtes-vous sûr de vouloir supprimer "${formationToDelete.titre}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setFormationToDelete(null);
        }}
        severity="error"
      />
    </div>
  );
};

export default Formations;
