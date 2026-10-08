import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type { ParcoursFormDialogProps } from '@/types';
import { useMentionOptionsQuery } from '@/hooks';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect } from '../ui/floating-select';

/**
 * Formulaire « parcours seul » : sélection obligatoire de la mention puis
 * nom du parcours. Le backend garantit l'unicité du nom dans la mention.
 */
const ParcoursFormDialog: React.FC<ParcoursFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  lockedMentionId,
  lockedMentionName,
  mode,
  submitting = false,
}) => {
  const [mentionId, setMentionId] = useState<string>('');
  const [nom, setNom] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: mentions = [], isLoading: loadingMentions } = useMentionOptionsQuery({
    enabled: open && lockedMentionId === undefined,
  });

  const mentionOptions = useMemo(
    () => mentions.map((mention) => ({ value: String(mention.id), label: mention.nom })),
    [mentions]
  );

  useEffect(() => {
    if (!open) return;
    const initialMentionId = initialData?.mentionId ?? lockedMentionId;
    setMentionId(initialMentionId ? String(initialMentionId) : '');
    setNom(initialData?.nom ?? '');
    setSubmitted(false);
  }, [open, initialData, lockedMentionId]);

  const normalizedNom = nom.trim();
  const nomError =
    normalizedNom.length < 2
      ? 'Le nom du parcours doit contenir au moins 2 caractères.'
      : undefined;
  const mentionError = mentionId ? undefined : 'La mention est obligatoire.';

  const lockedMentionLabel = useMemo(() => {
    if (lockedMentionId === undefined || lockedMentionId === null) return null;
    return (
      lockedMentionName ??
      mentionOptions.find((option) => option.value === String(lockedMentionId))?.label ??
      initialData?.mention?.nom ??
      null
    );
  }, [lockedMentionId, lockedMentionName, mentionOptions, initialData]);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (nomError || mentionError || submitting) return;
    await onSubmit({
      mentionId: Number(mentionId),
      nom: normalizedNom,
      ...(mode === 'edit' ? { isActive: initialData?.isActive } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !submitting && onClose()}>
      <DialogContent className="w-[95vw] gap-0 overflow-hidden bg-card p-0 sm:max-w-md">
        <DialogHeader className="border-b bg-ink-50/80 px-5 py-4">
          <DialogTitle className="text-lg font-bold text-ink-900">
            {mode === 'create' ? 'Créer un parcours' : 'Modifier le parcours'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          {lockedMentionLabel !== null ? (
            <div className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-sm text-ink-700">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Mention
              </span>
              {lockedMentionLabel}
            </div>
          ) : (
            <FloatingSelect
              label="Mention *"
              value={mentionId}
              onValueChange={(value) => value !== null && setMentionId(value)}
              options={mentionOptions}
              error={submitted ? mentionError : undefined}
              placeholder={
                loadingMentions ? 'Chargement des mentions…' : 'Sélectionner une mention'
              }
              hint="Un parcours appartient obligatoirement à une mention."
            />
          )}

          <FloatingInput
            id="parcours-nom"
            label="Nom du parcours *"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            error={submitted || nom ? nomError : undefined}
            autoComplete="off"
          />
        </div>

        <DialogFooter className="mx-4 mb-4 border-t bg-ink-50/80 px-5 py-3">
          <div className="flex w-full items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {mode === 'create' ? 'Créer le parcours' : 'Enregistrer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParcoursFormDialog;
