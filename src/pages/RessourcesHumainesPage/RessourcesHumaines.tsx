import { CompatCard as Card, CompatCardContent as CardContent ,
  RessourceHumaineFilters,
  RessourceHumaineForm,
  RessourceHumaineTable,
  RessourceHumaineViewDialog,
  ConfirmDialog,
  ListPageHeader,
} from '@/components';
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  RessourceHumaineFormData,
  RessourceHumaineItem,
  RessourceHumaineFilterOptions,
} from '@/types';
import {
  useCreateRessourceHumaine,
  useDeleteRessourceHumaine,
  useRessourcesHumainesQuery,
  useUpdateRessourceHumaine,
  useTitle,
  usePagination,
  useScrollToTop,
  useRessourceHumaineFilter,
} from '@/hooks';
import { ApiError } from '@/api';
import { formatFullName } from '@/utils';

const RessourcesHumaines: React.FC = () => {
  useScrollToTop();
  useTitle('Ressources humaines');
  const { data = [] } = useRessourcesHumainesQuery();
  const createMutation = useCreateRessourceHumaine();
  const updateMutation = useUpdateRessourceHumaine();
  const deleteMutation = useDeleteRessourceHumaine();
  const [searchTerm, setSearchTerm] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRessource, setSelectedRessource] = useState<RessourceHumaineItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ressourceToDelete, setRessourceToDelete] = useState<RessourceHumaineItem | null>(null);

  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } =
    useRessourceHumaineFilter({
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
    setSelectedRessource(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((ressource: RessourceHumaineItem) => {
    setFormMode('edit');
    setSelectedRessource(ressource);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((ressource: RessourceHumaineItem) => {
    setSelectedRessource(ressource);
    setViewDialogOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((ressource: RessourceHumaineItem) => {
    setRessourceToDelete(ressource);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (ressourceToDelete) {
      try {
        await deleteMutation.mutateAsync(ressourceToDelete.id.toString());
        toast.success(`"${formatFullName(ressourceToDelete)}" a été supprimé(e) avec succès`);
        setDeleteDialogOpen(false);
        setRessourceToDelete(null);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Error deleting ressource humaine:', error);
      }
    }
  }, [ressourceToDelete, deleteMutation]);

  const handleFormSubmit = useCallback(
    async (formData: RessourceHumaineFormData) => {
      try {
        if (formMode === 'create') {
          await createMutation.mutateAsync(formData);
          toast.success('Ressource humaine créée avec succès');
        } else if (selectedRessource) {
          await updateMutation.mutateAsync({
            id: selectedRessource.id.toString(),
            data: formData,
          });
          toast.success('Ressource humaine modifiée avec succès');
        }
        setFormOpen(false);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Erreur lors de l'enregistrement";
        toast.error(message);
        console.error('Error saving ressource humaine:', error);
      }
    },
    [formMode, selectedRessource]
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
        title="Liste des ressources humaines"
        totalCount={filteredData.length}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom, prénom, poste..."
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel="Nouvelle ressource"
        onAction={handleOpenCreate}
      />

      {filtersOpen && (
        <Card variant="outlined">
          <CardContent>
            <RessourceHumaineFilters
              filters={filters}
              onUpdateFilter={(key: keyof RessourceHumaineFilterOptions, value: string) => {
                updateFilter(key, value);
                resetPage();
              }}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
            />
          </CardContent>
        </Card>
      )}

      <RessourceHumaineTable
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

      <RessourceHumaineForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRessource}
        mode={formMode}
      />

      <RessourceHumaineViewDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        ressource={selectedRessource}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer la ressource humaine"
        message={
          ressourceToDelete
            ? `Êtes-vous sûr de vouloir supprimer "${formatFullName(ressourceToDelete)}" ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRessourceToDelete(null);
        }}
        severity="error"
      />
    </div>
  );
};

export default RessourcesHumaines;
