import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ActualiteFilters,
  ActualiteForm,
  ActualiteTable,
  ActualiteViewDialog,
  ConfirmDialog,
} from '../../components';
import { useFilter } from '../../hooks/useFilter';
import { usePagination, useScrollToTop } from '../../hooks';
import type { ActualiteFormData, ActualiteItem } from '../../types';
import {
  useActualitesQuery,
  useCreateActualite,
  useDeleteActualite,
  useUpdateActualite,
} from '../../hooks/queries';
import { useTitle } from '@/hooks/useTitle';
import ListPageHeader from '../../components/common/ListPageHeader';

const Actualites: React.FC = () => {
  useScrollToTop();
  useTitle('Actualités');
  // Data state
  const { data = [] } = useActualitesQuery();
  const createMutation = useCreateActualite();
  const updateMutation = useUpdateActualite();
  const deleteMutation = useDeleteActualite();
  const [searchTerm, setSearchTerm] = useState('');

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedActualite, setSelectedActualite] = useState<ActualiteItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actualiteToDelete, setActualiteToDelete] = useState<ActualiteItem | null>(null);

  // Hooks
  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } = useFilter({
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
    setSelectedActualite(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((actualite: ActualiteItem) => {
    setFormMode('edit');
    setSelectedActualite(actualite);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((actualite: ActualiteItem) => {
    setSelectedActualite(actualite);
    setViewDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((actualite: ActualiteItem) => {
    setActualiteToDelete(actualite);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (actualiteToDelete) {
      try {
        await deleteMutation.mutateAsync(actualiteToDelete.id);
        toast.success(`"${actualiteToDelete.titre}" a été supprimée avec succès`);
        setDeleteDialogOpen(false);
        setActualiteToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Error deleting actualite:', error);
      }
    }
  }, [actualiteToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: ActualiteFormData) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(formData);
          toast.success('Actualité créée avec succès');
        } else if (selectedActualite) {
          await updateMutation.mutateAsync({ id: selectedActualite.id, data: formData });
          toast.success('Actualité modifiée avec succès');
        }
        setFormOpen(false);
      } catch (error) {
        toast.error("Erreur lors de l'enregistrement");
        console.error('Error saving actualite:', error);
      }
    },
    [formMode, selectedActualite]
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
        title="Liste des actualités"
        totalCount={filteredData.length}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par titre, auteur..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel="Nouvelle actualité"
        onAction={handleOpenCreate}
      />

      {/* Filters - Full Width Below */}
      {filtersOpen && (
        <div className="bg-white rounded-xl border border-ink-100 p-4 shadow-card">
          <ActualiteFilters
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
      <ActualiteTable
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
      <ActualiteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedActualite}
        mode={formMode}
      />

      {/* View Dialog */}
      <ActualiteViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        actualite={selectedActualite}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer l'actualité"
        message={
          actualiteToDelete
            ? `Êtes-vous sûr de vouloir supprimer "${actualiteToDelete.titre}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setActualiteToDelete(null);
        }}
        severity="error"
      />
    </div>
  );
};

export default Actualites;
