import { CompatCard as Card, CompatCardContent as CardContent ,
  ProjetFilters,
  ProjetForm,
  ProjetTable,
  ProjetViewDialog,
  ConfirmDialog,
  ListPageHeader,
} from '@/components';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  usePagination,
  useProjetFilter,
  useScrollToTop,
  useTitle,
  useCreateProjet,
  useDeleteProjet,
  useProjetsQuery,
  useUpdateProjet,
} from '@/hooks';
import type { ProjetFormData, Projet } from '@/types';

const Projets: React.FC = () => {
  useScrollToTop();
  useTitle('Projets');
  const { data = [] } = useProjetsQuery();
  const createMutation = useCreateProjet();
  const updateMutation = useUpdateProjet();
  const deleteMutation = useDeleteProjet();
  const [searchTerm, setSearchTerm] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projetToDelete, setProjetToDelete] = useState<Projet | null>(null);

  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } = useProjetFilter({
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

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      resetPage();
    },
    [resetPage]
  );

  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setSelectedProjet(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((projet: Projet) => {
    setFormMode('edit');
    setSelectedProjet(projet);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((projet: Projet) => {
    setSelectedProjet(projet);
    setViewDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((projet: Projet) => {
    setProjetToDelete(projet);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (projetToDelete) {
      try {
        await deleteMutation.mutateAsync(projetToDelete.id);
        toast.success(`"${projetToDelete.titre}" a été supprimé avec succès`);
        setDeleteDialogOpen(false);
        setProjetToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Error deleting projet:', error);
      }
    }
  }, [projetToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: ProjetFormData) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(formData);
          toast.success('Projet créé avec succès');
        } else if (selectedProjet) {
          await updateMutation.mutateAsync({ id: selectedProjet.id, data: formData });
          toast.success('Projet modifié avec succès');
        }
        setFormOpen(false);
      } catch (error) {
        toast.error("Erreur lors de l'enregistrement");
        console.error('Error saving projet:', error);
      }
    },
    [formMode, selectedProjet]
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
        title="Liste des projets"
        totalCount={filteredData.length}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par titre, description..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel="Nouveau projet"
        onAction={handleOpenCreate}
      />

      {filtersOpen && (
        <Card variant="outlined">
          <CardContent>
            <ProjetFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
              open={filtersOpen}
              onToggle={handleToggleFilters}
            />
          </CardContent>
        </Card>
      )}

      <ProjetTable
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

      <ProjetForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedProjet}
        mode={formMode}
      />

      <ProjetViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        projet={selectedProjet}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer le projet"
        message={
          projetToDelete
            ? `Êtes-vous sûr de vouloir supprimer "${projetToDelete.titre}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProjetToDelete(null);
        }}
        severity="error"
      />
    </div>
  );
};

export default Projets;
