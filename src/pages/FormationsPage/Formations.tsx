import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  FormationFilters,
  FormationForm,
  FormationTable,
  FormationViewDialog,
  ConfirmDialog,
} from '../../components';
import { usePagination, useFormationFilter, useScrollToTop } from '../../hooks';
import {
  useCreateFormation,
  useDeleteFormation,
  useFormationsQuery,
  useUpdateFormation,
} from '../../hooks/queries';
import type { FormationFormData, Formation } from '../../types';
import { useTitle } from '@/hooks/useTitle';
import ListPageHeader from '../../components/common/ListPageHeader';

const Formations: React.FC = () => {
  useScrollToTop();
  useTitle('Formations');
  const { data = [] } = useFormationsQuery();
  const createMutation = useCreateFormation();
  const updateMutation = useUpdateFormation();
  const deleteMutation = useDeleteFormation();
  const [searchTerm, setSearchTerm] = useState('');

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null);

  // Hooks
  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } =
    useFormationFilter({
      data,
      searchTerm,
    });

  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  } = usePagination({ data: filteredData, initialRowsPerPage: 5 });

  // Handlers
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
        toast.success(`"${formationToDelete.titre}" a été supprimée avec succès`);
        setDeleteDialogOpen(false);
        setFormationToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Error deleting formation:', error);
      }
    }
  }, [formationToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: FormationFormData) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(formData);
          toast.success('Formation créée avec succès');
        } else if (selectedFormation) {
          await updateMutation.mutateAsync({ id: selectedFormation.id, data: formData });
          toast.success('Formation modifiée avec succès');
        }
        // Close the dialog only after successful API call
        setFormOpen(false);
      } catch (error) {
        toast.error("Erreur lors de l'enregistrement");
        console.error('Error saving formation:', error);
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
        title="Liste des formations"
        totalCount={filteredData.length}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par titre, domaine..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel="Nouvelle formation"
        onAction={handleOpenCreate}
      />

      {/* Filters - Full Width Below */}
      {filtersOpen && (
        <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
          <FormationFilters
            filters={filters}
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

      {/* Table */}
      <FormationTable
        data={paginatedData}
        totalCount={filteredData.length}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onView={handleView}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Form Dialog (Create / Edit) */}
      <FormationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedFormation}
        mode={formMode}
      />

      {/* View Dialog */}
      <FormationViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        formation={selectedFormation}
      />

      {/* Delete Confirmation Dialog */}
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
