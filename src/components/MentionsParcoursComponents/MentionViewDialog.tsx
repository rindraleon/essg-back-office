import { GraduationCap, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { MentionFormationSummary, MentionViewDialogProps, ParcoursEditTarget } from '@/types';
import { formatDateLong } from '@/utils/date.utils';
import { useDeleteParcours } from '@/hooks';
import ConfirmDialog from '../common/ConfirmDialog';
import { DetailField, DetailSection } from '../common/DetailSection';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

type MentionParcoursRow = ParcoursEditTarget & {
  creeLe?: Date | string;
  formations?: MentionFormationSummary[] | null;
};

function deleteParcoursMessage(row: MentionParcoursRow | null): string {
  if (!row) return '';
  const used = row.formationCount ?? 0;
  if (used > 0) {
    return `Ce parcours est utilisé par ${used} formation(s). Voulez-vous réellement le supprimer ? La suppression sera refusée tant que ces formations ne seront pas réaffectées.`;
  }
  return `« ${row.nom} » sera définitivement supprimé de la mention.`;
}

const MentionViewDialog: React.FC<MentionViewDialogProps> = ({
  open,
  onClose,
  mention,
  onEdit,
  onAddParcours,
  onEditParcours,
}) => {
  const deleteParcours = useDeleteParcours();
  const [parcoursToDelete, setParcoursToDelete] = useState<MentionParcoursRow | null>(null);

  const handleConfirmParcoursDelete = useCallback(async () => {
    if (!parcoursToDelete) return;
    try {
      await deleteParcours.mutateAsync(parcoursToDelete.id);
      toast.success('Parcours supprimé avec succès.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer le parcours.');
    } finally {
      setParcoursToDelete(null);
    }
  }, [parcoursToDelete, deleteParcours]);

  if (!mention) return null;

  const parcours = (mention.parcours ?? []) as MentionParcoursRow[];
  const totalFormations = parcours.reduce((sum, item) => sum + (item.formationCount ?? 0), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="w-[95vw] gap-0 overflow-hidden bg-card p-0 sm:max-w-2xl">
          <DialogHeader className="border-b bg-ink-50/80 px-5 py-4">
            <DialogTitle className="text-lg font-bold text-ink-900">{mention.nom}</DialogTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <Badge variant={mention.isActive ? 'default' : 'outline'} className="text-xs">
                {mention.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {mention.domaine && <span>Domaine : {mention.domaine}</span>}
            </div>
          </DialogHeader>

          <div className="max-h-[62vh] space-y-4 overflow-y-auto px-5 py-4">
            {mention.description && (
              <p className="text-sm leading-relaxed text-ink-700">{mention.description}</p>
            )}

            <DetailSection
              title={`Parcours (${parcours.length})`}
              icon={<Layers className="h-4 w-4" />}
            >
              {parcours.length === 0 ? (
                <p className="text-sm text-ink-500">
                  Cette mention ne possède encore aucun parcours.
                </p>
              ) : (
                <ul className="space-y-3" aria-label="Liste des parcours de la mention">
                  {parcours.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-ink-100 bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">{item.nom}</p>
                          <p className="mt-0.5 text-xs text-ink-500">
                            {item.formationCount ?? 0} formation
                            {(item.formationCount ?? 0) > 1 ? 's' : ''} associée
                            {(item.formationCount ?? 0) > 1 ? 's' : ''}
                            {item.creeLe ? ` — créée le ${formatDateLong(item.creeLe)}` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.formationCount ?? 0}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`Modifier le parcours ${item.nom}`}
                            onClick={() =>
                              onEditParcours(item, { id: mention.id, nom: mention.nom })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700"
                            aria-label={`Supprimer le parcours ${item.nom}`}
                            onClick={() => setParcoursToDelete(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {item.formations && item.formations.length > 0 && (
                        <div className="mt-2 border-t border-ink-100 pt-2">
                          <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                            <GraduationCap className="h-3 w-3" aria-hidden="true" />
                            Formations rattachées
                          </p>
                          <ul className="space-y-1">
                            {item.formations.map((formation) => (
                              <li
                                key={formation.id}
                                className="flex items-center justify-between gap-2 text-xs text-ink-700"
                              >
                                <span className="truncate">{formation.titre}</span>
                                <span className="shrink-0 text-ink-400">{formation.niveau}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3 gap-1.5"
                onClick={() => onAddParcours({ id: mention.id, nom: mention.nom })}
              >
                <Plus className="h-4 w-4" />
                Ajouter un parcours
              </Button>
            </DetailSection>

            <DetailSection title="Informations système" icon={<Layers className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <DetailField label="Slug" value={mention.slug} />
                <DetailField label="Nombre de parcours" value={parcours.length} />
                <DetailField label="Formations liées" value={totalFormations} />
                <DetailField label="Créée le" value={formatDateLong(mention.creeLe)} />
                <DetailField
                  label="Dernière modification"
                  value={formatDateLong(mention.misAJourLe)}
                />
              </div>
            </DetailSection>
          </div>

          <DialogFooter className="mx-4 mb-4 border-t bg-ink-50/80 px-5 py-3">
            <div className="flex w-full items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Fermer
              </Button>
              <Button type="button" size="sm" onClick={() => onEdit(mention)}>
                <Pencil className="h-3.5 w-3.5" />
                Modifier la mention
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={parcoursToDelete !== null}
        title="Supprimer ce parcours ?"
        message={deleteParcoursMessage(parcoursToDelete)}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        severity="error"
        loading={deleteParcours.isPending}
        onConfirm={handleConfirmParcoursDelete}
        onCancel={() => setParcoursToDelete(null)}
      />
    </>
  );
};

export default MentionViewDialog;
