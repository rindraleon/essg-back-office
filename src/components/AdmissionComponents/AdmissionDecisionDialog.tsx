import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Admission, AdmissionStatus } from '../../types/admission.types';
import { formatFullName } from '../../utils/name.utils';

interface AdmissionDecisionDialogProps {
  admission: Admission;
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    statut: AdmissionStatus;
    commentaire?: string;
    reponseDate?: string;
    reponseHeure?: string;
    reponseLieu?: string;
    reponseInstructions?: string;
    reponseMessage?: string;
  }) => Promise<void>;
}

const AdmissionDecisionDialog = ({
  admission,
  open,
  submitting,
  onClose,
  onSubmit,
}: AdmissionDecisionDialogProps) => {
  const [statut, setStatut] = useState<AdmissionStatus>(admission.statut);
  const [reponseDate, setReponseDate] = useState(admission.reponseDate ?? '');
  const [reponseHeure, setReponseHeure] = useState(admission.reponseHeure ?? '');
  const [reponseLieu, setReponseLieu] = useState(admission.reponseLieu ?? '');
  const [reponseInstructions, setReponseInstructions] = useState(admission.reponseInstructions ?? '');
  const [reponseMessage, setReponseMessage] = useState(
    admission.reponseMessage ?? admission.commentaire ?? '',
  );

  useEffect(() => {
    if (!open) return;
    setStatut(admission.statut === 'en_attente' ? 'accepte' : admission.statut);
    setReponseDate(admission.reponseDate ?? '');
    setReponseHeure(admission.reponseHeure ?? '');
    setReponseLieu(admission.reponseLieu ?? '');
    setReponseInstructions(admission.reponseInstructions ?? '');
    setReponseMessage(admission.reponseMessage ?? admission.commentaire ?? '');
  }, [open, admission]);

  if (!open) return null;

  const accepted = statut === 'accepte';

  const handleSubmit = async () => {
    await onSubmit({
      statut,
      commentaire: reponseMessage || undefined,
      reponseDate: accepted ? reponseDate || undefined : undefined,
      reponseHeure: accepted ? reponseHeure || undefined : undefined,
      reponseLieu: accepted ? reponseLieu || undefined : undefined,
      reponseInstructions: accepted ? reponseInstructions || undefined : undefined,
      reponseMessage: reponseMessage || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="border-b border-ink-100 px-6 py-4">
          <h2 className="text-xl font-bold text-ink-900">Réponse au candidat</h2>
          <p className="mt-1 text-sm text-ink-600">
            {formatFullName(admission)} — {admission.formation}
          </p>
        </div>

        <div className="space-y-4 p-6">
          <label className="block text-sm font-medium text-ink-700">
            Décision
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as AdmissionStatus)}
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-brand-500"
              disabled={submitting}
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours_etude">En cours d'étude</option>
              <option value="accepte">Accepté — valider l'admission</option>
              <option value="refuse">Refusé</option>
            </select>
          </label>

          {accepted && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reponseDate">Date</Label>
                  <Input
                    id="reponseDate"
                    type="date"
                    value={reponseDate}
                    onChange={(e) => setReponseDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reponseHeure">Heure</Label>
                  <Input
                    id="reponseHeure"
                    type="time"
                    value={reponseHeure}
                    onChange={(e) => setReponseHeure(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reponseLieu">Lieu</Label>
                <Input
                  id="reponseLieu"
                  value={reponseLieu}
                  onChange={(e) => setReponseLieu(e.target.value)}
                  placeholder="Campus ESSG, Andrainjato"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reponseInstructions">Instructions</Label>
                <textarea
                  id="reponseInstructions"
                  value={reponseInstructions}
                  onChange={(e) => setReponseInstructions(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-ink-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-brand-500"
                  placeholder="Documents à apporter, tenue, etc."
                  disabled={submitting}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reponseMessage">{accepted ? 'Message personnalisé' : 'Message / commentaire'}</Label>
            <textarea
              id="reponseMessage"
              value={reponseMessage}
              onChange={(e) => setReponseMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-ink-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-brand-500"
              placeholder="Ce texte sera inclus dans l'email envoyé au candidat."
              disabled={submitting}
            />
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 text-xs text-brand-800">
            Vérifiez le contenu avant l'envoi. L'email part uniquement après confirmation.
          </div>
        </div>

        <div className="flex gap-3 border-t border-ink-100 px-6 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button type="button" className="flex-1" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? 'Envoi...' : accepted ? 'Valider et envoyer' : 'Enregistrer et notifier'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDecisionDialog;
