import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Network } from 'lucide-react';
import {
  ConfirmDialog,
  ListPageHeader,
  MentionForm,
  MentionTable,
  MentionViewDialog,
  ParcoursFormDialog,
} from '@/components';
import {
  useCreateMention,
  useCreateParcours,
  useDeleteMention,
  useMentionDetailQuery,
  useMentionDomainesQuery,
  useMentionsQuery,
  usePagination,
  useScrollToTop,
  useTitle,
  useUpdateMention,
  useUpdateParcours,
 useMentionFilter } from '@/hooks';
import type { Mention, MentionFormData, ParcoursEditTarget, ParcoursFormData } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const MentionFiltersPanel: React.FC<{
  value: { isActive: string; domaine: string };
  onChange: (key: 'isActive' | 'domaine', value: string) => void;
  domaines: string[];
}> = ({ value, onChange, domaines }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div className="space-y-2">
      <Label>Statut</Label>
      <Select value={value.isActive} onValueChange={(v) => onChange('isActive', v ?? '')}>
        <SelectTrigger>
          <SelectValue placeholder="Tous" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Actives</SelectItem>
          <SelectItem value="false">Inactives</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Domaine</Label>
      <Select value={value.domaine} onValueChange={(v) => onChange('domaine', v ?? '')}>
        <SelectTrigger>
          <SelectValue placeholder="Tous" />
        </SelectTrigger>
        <SelectContent>
          {domaines.map((domaine) => (
            <SelectItem key={domaine} value={domaine}>
              {domaine}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {domaines.length === 0 && (
        <p className="text-[11px] text-ink-400">
          Aucun domaine enregistré — renseignez le domaine lors de la création d’une mention.
        </p>
      )}
    </div>
  </div>
);

const MentionsParcours: React.FC = () => {
  useScrollToTop();
  useTitle('Mentions / Parcours');

  const { data: mentions = [], isLoading, isError, refetch } = useMentionsQuery();
  const { data: domaines = [] } = useMentionDomainesQuery();

  const createMention = useCreateMention();
  const updateMention = useUpdateMention();
  const deleteMention = useDeleteMention();
  const createParcours = useCreateParcours();
  const updateParcours = useUpdateParcours();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedMention, setSelectedMention] = useState<Mention | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mentionToDelete, setMentionToDelete] = useState<Mention | null>(null);
  const [parcoursFormOpen, setParcoursFormOpen] = useState(false);
  const [parcoursMode, setParcoursMode] = useState<'create' | 'edit'>('create');
  const [selectedParcours, setSelectedParcours] = useState<ParcoursEditTarget | null>(null);
  const [lockedMention, setLockedMention] = useState<{ id: number; nom: string } | null>(null);

  // Le détail (avec formations rattachées par parcours) n'est chargé que si
  // la mention possède un identifiant — jamais de données locales.
  const { data: mentionDetail } = useMentionDetailQuery(
    viewOpen ? (selectedMention?.id ?? null) : null,
    viewOpen
  );
  const mentionForView = useMemo(
    () => mentionDetail ?? selectedMention,
    [mentionDetail, selectedMention]
  );

  const { filters, filteredData, updateFilter, resetFilters, activeFilterCount } = useMentionFilter(
    { data: mentions, searchTerm }
  );

  const {
    currentPage,
    rowsPerPage,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
  } = usePagination({ data: filteredData, initialRowsPerPage: 10 });

  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setSelectedMention(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((mention: Mention) => {
    setFormMode('edit');
    setSelectedMention(mention);
    setFormOpen(true);
  }, []);

  const handleView = useCallback((mention: Mention) => {
    setSelectedMention(mention);
    setViewOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((mention: Mention) => {
    setMentionToDelete(mention);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!mentionToDelete) return;
    try {
      // cascade=true ne retire que des parcours libres : le backend refuse
      // toute mention dont des formations dépendent encore.
      await deleteMention.mutateAsync({ id: mentionToDelete.id, cascade: true });
      toast.success('Mention supprimée avec succès.');
      setDeleteOpen(false);
      setMentionToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer la mention.');
    }
  }, [mentionToDelete, deleteMention]);

  const handleMentionSubmit = useCallback(
    async (formData: MentionFormData) => {
      try {
        if (formMode === 'create') {
          await createMention.mutateAsync(formData);
          toast.success('Mention créée avec succès.');
        } else if (selectedMention) {
          await updateMention.mutateAsync({ id: selectedMention.id, data: formData });
          toast.success('Mention mise à jour avec succès.');
        }
        setFormOpen(false);
      } catch (error) {
        const fallback =
          formMode === 'create'
            ? 'Impossible de créer la mention.'
            : 'Impossible de mettre à jour la mention.';
        toast.error(error instanceof Error ? error.message : fallback);
      }
    },
    [formMode, selectedMention, createMention, updateMention]
  );

  /** La création d'un parcours se fait depuis une mention (fiche ou formulaire). */
  const openParcoursCreate = useCallback((mention: { id: number; nom: string }) => {
    setParcoursMode('create');
    setSelectedParcours(null);
    setLockedMention(mention ?? null);
    setParcoursFormOpen(true);
  }, []);

  const openParcoursEdit = useCallback(
    (parcours: ParcoursEditTarget, mention: { id: number; nom: string }) => {
      setParcoursMode('edit');
      setSelectedParcours(parcours);
      setLockedMention(mention);
      setParcoursFormOpen(true);
    },
    []
  );

  const handleParcoursSubmit = useCallback(
    async (formData: ParcoursFormData) => {
      try {
        if (parcoursMode === 'create') {
          await createParcours.mutateAsync(formData);
          toast.success('Parcours créé avec succès.');
        } else if (selectedParcours) {
          await updateParcours.mutateAsync({ id: selectedParcours.id, data: formData });
          toast.success('Parcours mis à jour avec succès.');
        }
        setParcoursFormOpen(false);
        if (viewOpen && selectedMention) {
          // Rafraîchit le détail ouvert (le cache mention est invalidé par la
          // mutation ; la requête de détail suit automatiquement).
          setSelectedMention({ ...selectedMention });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Impossible d’enregistrer le parcours.'
        );
      }
    },
    [parcoursMode, selectedParcours, createParcours, updateParcours, viewOpen, selectedMention]
  );

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-2 py-4">
      <ListPageHeader
        title="Mentions / Parcours"

        totalCount={filteredData.length}
        countLabel="mention"
        searchValue={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          resetPage();
        }}
        searchPlaceholder="Rechercher une mention ou un parcours..."
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        actionLabel="Nouvelle mention"
        onAction={handleOpenCreate}
        actionIcon={<Network className="h-4 w-4" />}
      />

      {filtersOpen && (
        <div className="rounded-xl border border-ink-100 bg-card p-4 shadow-card">
          <MentionFiltersPanel
            value={filters}
            domaines={domaines}
            onChange={(key, value) => {
              updateFilter(key, value);
              resetPage();
            }}
          />
          {activeFilterCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="destructive" onClick={resetFilters} className="text-xs">
                Réinitialiser tout
              </Button>
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-ink-100 bg-card p-8 text-center shadow-card">
          <p className="text-sm text-ink-600">
            Impossible de charger les mentions. Vérifiez votre connexion ou réessayez.
          </p>
          <Button size="sm" variant="outline" onClick={() => void refetch()} className="mt-3">
            Réessayer
          </Button>
        </div>
      )}

      {!isError && isLoading && (
        <div className="rounded-xl border border-ink-100 bg-card p-8 text-center shadow-card">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-ink-500">Chargement des mentions…</p>
        </div>
      )}

      {!isError && !isLoading && (
        <MentionTable
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
      )}

      <MentionForm
        open={formOpen}
        onClose={() => !createMention.isPending && !updateMention.isPending && setFormOpen(false)}
        onSubmit={handleMentionSubmit}
        initialData={selectedMention}
        mode={formMode}
        submitting={createMention.isPending || updateMention.isPending}
      />

      <MentionViewDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        mention={mentionForView ?? null}
        onEdit={(mention) => {
          setViewOpen(false);
          handleOpenEdit(mention);
        }}
        onAddParcours={(parcoursMention) => openParcoursCreate(parcoursMention)}
        onEditParcours={openParcoursEdit}
      />

      <ParcoursFormDialog
        open={parcoursFormOpen}
        onClose={() =>
          !createParcours.isPending && !updateParcours.isPending && setParcoursFormOpen(false)
        }
        onSubmit={handleParcoursSubmit}
        initialData={selectedParcours}
        lockedMentionId={lockedMention?.id ?? null}
        lockedMentionName={lockedMention?.nom ?? null}
        mode={parcoursMode}
        submitting={createParcours.isPending || updateParcours.isPending}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Supprimer cette mention ?"
        message={
          mentionToDelete
            ? `« ${mentionToDelete.nom} » et ${mentionToDelete.parcoursCount} parcours libre(s) seront supprimés. Cette action est irréversible. Si des formations utilisent encore ces parcours, la suppression sera bloquée.`
            : ''
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        severity="error"
        loading={deleteMention.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setMentionToDelete(null);
        }}
      />
    </div>
  );
};

export default MentionsParcours;
