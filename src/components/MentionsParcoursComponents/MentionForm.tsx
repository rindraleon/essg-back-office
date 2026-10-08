import { Loader2, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Mention, MentionFormProps, MentionParcoursInput } from '@/types';
import { normalizeMentionNom } from '@/utils';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import ConfirmDialog from '../common/ConfirmDialog';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { useMentionDomainesQuery } from '@/hooks';

interface ParcoursRow {
  /** Clé React stable, indépendante du parcours backend. */
  key: number;
  /** Identifiant backend si le parcours existe déjà (mode édition). */
  id?: number;
  nom: string;
  /** Nombre de formations utilisant ce parcours (protection à la suppression). */
  formationCount: number;
}

function toRows(initialData: Mention | null | undefined): ParcoursRow[] {
  const parcours = (initialData?.parcours ?? []) as {
    id?: number;
    nom: string;
    formationCount?: number;
  }[];
  if (parcours.length === 0) {
    return [{ key: 0, nom: '', formationCount: 0 }];
  }
  return parcours.map((item, index) => ({
    key: index,
    id: item.id,
    nom: item.nom,
    formationCount: item.formationCount ?? 0,
  }));
}

const MentionForm: React.FC<MentionFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
  submitting = false,
}) => {
  const nextKey = useRef(1);
  const [nom, setNom] = useState('');
  const [domaine, setDomaine] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rows, setRows] = useState<ParcoursRow[]>([{ key: 0, nom: '', formationCount: 0 }]);
  const [submitted, setSubmitted] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<ParcoursRow | null>(null);

  const { data: domaines = [] } = useMentionDomainesQuery({ enabled: open });
  const datalistId = 'mention-domaines-suggestions';

  useEffect(() => {
    if (!open) return;
    setNom(initialData?.nom ?? '');
    setDomaine(initialData?.domaine ?? '');
    setIsActive(initialData?.isActive ?? true);
    setRows(toRows(initialData));
    nextKey.current = Math.max(0, ...toRows(initialData).map((r) => r.key)) + 1;
    setSubmitted(false);
    setPendingRemoval(null);
  }, [open, initialData]);

  const errors = useMemo(() => {
    const trimmedNom = nom.trim();
    const nomError =
      trimmedNom.length < 2
        ? 'Le nom de la mention doit contenir au moins 2 caractères.'
        : undefined;

    const seen = new Map<string, number>();
    const rowErrors: (string | undefined)[] = [];
    let validCount = 0;
    rows.forEach((row, index) => {
      const value = row.nom.trim();
      if (!value) {
        rowErrors[index] = 'Veuillez saisir un nom ou retirer cette ligne.';
        return;
      }
      const key = normalizeMentionNom(value);
      if (seen.has(key)) {
        rowErrors[index] = 'Ce parcours est déjà présent dans la liste.';
        return;
      }
      seen.set(key, index);
      validCount += 1;
    });

    const parcoursError =
      validCount === 0 ? 'Une mention doit contenir au moins un parcours.' : undefined;
    return { nom: nomError, rows: rowErrors, parcours: parcoursError, parcoursCount: validCount };
  }, [nom, rows]);

  const hasErrors = Boolean(errors.nom) || Boolean(errors.parcours) || errors.rows.some(Boolean);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, { key: nextKey.current++, nom: '', formationCount: 0 }]);
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveRow = useCallback(
    (index: number) => {
      const row = rows[index];
      if (!row) return;
      // Un parcours déjà utilisé par des formations mérite un avertissement
      // explicite ; la suppression effective reste validée par le backend.
      if (row.id !== undefined && row.formationCount > 0) {
        setPendingRemoval(row);
        return;
      }
      removeRow(index);
    },
    [rows, removeRow]
  );

  const handleConfirmRemoval = useCallback(() => {
    if (!pendingRemoval) return;
    setRows((prev) => prev.filter((row) => row.key !== pendingRemoval.key));
    setPendingRemoval(null);
  }, [pendingRemoval]);

  const handleChangeRow = useCallback((index: number, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, nom: value } : row)));
  }, []);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors || submitting) return;

    const parcours: MentionParcoursInput[] = rows
      .map((row) => ({ id: row.id, nom: row.nom.trim() }))
      .filter((item) => item.nom.length > 0);

    await onSubmit({
      nom: nom.trim(),
      domaine: domaine.trim() || undefined,
      isActive,
      parcours,
    });
  };

  const dialogTitle = mode === 'create' ? 'Créer une mention' : 'Modifier la mention';

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !submitting && onClose()}>
        <DialogContent className="w-[95vw] gap-0 overflow-hidden bg-card p-0 sm:max-w-2xl">
          <DialogHeader className="border-b bg-ink-50/80 px-5 py-4">
            <DialogTitle className="text-lg font-bold text-ink-900">{dialogTitle}</DialogTitle>
            <p className="mt-1 text-xs text-ink-500">
              Une mention regroupe plusieurs parcours. Ajoutez chaque parcours dans un champ dédié.
            </p>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FloatingInput
                id="mention-nom"
                label="Nom de la mention *"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                error={submitted || nom ? errors.nom : undefined}
                autoComplete="off"
              />
              <FloatingInput
                id="mention-domaine"
                label="Domaine (optionnel)"
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                list={domaines.length > 0 ? datalistId : undefined}
                hint="Renseigne la hiérarchie Domaine → Mention"
                autoComplete="off"
              />
            </div>
            {domaines.length > 0 && (
              <datalist id={datalistId}>
                {domaines.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            )}

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-ink-700">
                Parcours <span className="text-red-500">*</span>
              </legend>

              <div className="space-y-2">
                {rows.map((row, index) => (
                  <div key={row.key} className="flex items-start gap-2">
                    <div className="flex-1">
                      <FloatingInput
                        id={`mention-parcours-${row.key}`}
                        label={`Parcours ${index + 1}`}
                        value={row.nom}
                        onChange={(e) => handleChangeRow(index, e.target.value)}
                        error={submitted ? errors.rows[index] : undefined}
                        autoComplete="off"
                      />
                      {row.id !== undefined && row.formationCount > 0 && (
                        <p className="mt-1 text-[11px] text-ink-400">
                          Utilisé par {row.formationCount} formation(s)
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Retirer le parcours ${index + 1}`}
                      onClick={() => handleRemoveRow(index)}
                      className="mt-1.5 h-9 w-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRow}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Ajouter un parcours
              </Button>

              {submitted && errors.parcours && (
                <p className="text-sm text-red-500">{errors.parcours}</p>
              )}
            </fieldset>

            <div className="flex items-center gap-2">
              <Checkbox
                id="mention-isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                className="bg-card"
              />
              <Label htmlFor="mention-isActive" className="cursor-pointer text-sm">
                Mention active (visible dans les formulaires)
              </Label>
            </div>
          </div>

          <DialogFooter className="mx-4 mb-4 border-t bg-ink-50/80 px-5 py-3">
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="min-w-36"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {mode === 'create' ? 'Créer la mention' : 'Enregistrer'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title="Retirer ce parcours ?"
        message={
          pendingRemoval
            ? `Ce parcours est utilisé par ${pendingRemoval.formationCount} formation(s). Le retirer de la mention échouera tant que ces formations ne seront pas réaffectées. Voulez-vous réellement le supprimer ?`
            : ''
        }
        confirmLabel="Retirer"
        cancelLabel="Conserver"
        severity="error"
        onConfirm={handleConfirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </>
  );
};

export default MentionForm;
