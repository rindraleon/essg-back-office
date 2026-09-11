import {
  BadgeCheck,
  Banknote,
  Eye,
  FileText,
  GraduationCap,
  LoaderCircle,
  Mail,
  ScanSearch,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { formatBacSerie, formatBacType } from '@/constants';
import AdmissionVerificationSection from './AdmissionVerificationSection';
import { useVerifyAdmission } from '@/hooks';
import { ApiError } from '@/api';
import type { Admission, AdmissionFile } from '@/types';
import {
  ADMISSION_FILE_TYPE_LABELS,
  ADMISSION_GENRE_LABELS,
  ADMISSION_SOURCE_LABELS,
  REQUIRED_ADMISSION_FILE_TYPES,
} from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { formatFullName, formatFileSize, getFileExtension } from '@/utils';

interface AdmissionDetailDialogProps {
  admission: Admission;
  open: boolean;
  onClose: () => void;
  onEditStatus: () => void;
  onPreviewFile?: (file: AdmissionFile) => void;
  onDeleteFile?: (file: AdmissionFile) => void;
}

const getStatusColor = (statut: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (statut) {
    case 'accepte':
      return 'default';
    case 'en_attente':
      return 'secondary';
    case 'en_cours_etude':
      return 'outline';
    case 'refuse':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (statut: string): string => {
  switch (statut) {
    case 'accepte':
      return 'Accepté';
    case 'en_attente':
      return 'En attente';
    case 'en_cours_etude':
      return "En cours d'étude";
    case 'refuse':
      return 'Refusé';
    default:
      return statut;
  }
};

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="mb-4 flex items-center gap-2 pb-2 text-base font-semibold text-ink-900 border-b border-ink-100">
      <span className="text-brand-600">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="mb-1 text-xs font-medium text-ink-500">{label}</p>
    <p className="text-sm text-ink-900">{value || '—'}</p>
  </div>
);

function getVerificationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur lors de la vérification';
}

const AdmissionDetailDialog: React.FC<AdmissionDetailDialogProps> = ({
  admission,
  open,
  onClose,
  onEditStatus,
  onPreviewFile,
  onDeleteFile,
}) => {
  const files = admission.files ?? [];
  const missingRequiredFiles = REQUIRED_ADMISSION_FILE_TYPES.filter(
    (type) => !files.some((file) => file.type === type)
  );
  const statutBadge = (
    <Badge variant={getStatusColor(admission.statut)} className="text-xs">
      {getStatusLabel(admission.statut)}
    </Badge>
  );

  // Vérification directe — bouton visible directement dans ce fichier (demande utilisateur)
  const verifyMutation = useVerifyAdmission();
  const [directVerifying, setDirectVerifying] = useState(false);
  const handleDirectVerify = async (): Promise<void> => {
    setDirectVerifying(true);
    try {
      await verifyMutation.mutateAsync(admission.id);
      toast.success('Vérification des pièces lancée avec succès');
    } catch (error: unknown) {
      console.warn('Échec dans handleDirectVerify — poursuite en mode dégradé', error instanceof Error ? error.message : error);
      const msg = getVerificationErrorMessage(error);
      toast.error(msg);
    } finally {
      setDirectVerifying(false);
    }
  };
  const isVerifying = verifyMutation.isPending || directVerifying;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent size="2xl">
        <DialogHeader
          icon={<FileText aria-hidden="true" />}
          title="Détails de la candidature"
          description={`Référence ESSG-${admission.id} · Déposée le ${new Date(
            admission.creeLe
          ).toLocaleDateString('fr-FR')}`}
        />

        <DialogBody className="space-y-8">
          <Section icon={<UserIcon className="size-4" />} title="Informations personnelles">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nom complet" value={formatFullName(admission)} />
              <Field label="Email" value={admission.email} />
              <Field label="Téléphone" value={admission.telephone} />
              <Field
                label="Date de naissance"
                value={new Date(admission.dateNaissance).toLocaleDateString('fr-FR')}
              />
              <Field label="Lieu de naissance" value={admission.lieuNaissance} />
              <Field label="Nationalité" value={admission.nationalite} />
              <Field
                label="Genre"
                value={ADMISSION_GENRE_LABELS[admission.genre ?? ''] ?? admission.genre}
              />
              <div className="md:col-span-2">
                <Field label="Adresse" value={admission.adresse} />
              </div>
            </div>
          </Section>

          <Section icon={<GraduationCap className="size-4" />} title="Informations académiques">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Niveau" value={admission.niveau} />
              <Field label="Mention" value={admission.mention} />
              <Field
                label="Parcours / formation"
                value={admission.formation || admission.parcours}
              />
              <Field label="Type de Bac" value={formatBacType(admission.bacType)} />
              <Field label="Série du Bac" value={formatBacSerie(admission.bacSerie)} />
              <Field label="Catégorie du Bac" value={admission.bacCategorie} />
              <Field label="Numéro d'inscription au Bac" value={admission.numeroBaccalaureat} />
              <Field label="Année d'obtention du Bac" value={admission.bacAnneeObtention} />
              <Field label="Centre d'examen du Bac" value={admission.bacCentreExamen} />
              {/* <Field
                label="Ancien établissement"
                value={admission.ancienEtablissement || admission.licenceEtablissement}
              />
              <Field label="Numéro matricule" value={admission.numeroMatricule} />
              <Field label="Mention de la Licence" value={admission.licenceMention} />
              <Field
                label="Année d'obtention de la Licence"
                value={admission.licenceAnneeObtention}
              /> */}
            </div>
          </Section>

          <Section icon={<Banknote className="size-4" />} title="Paiement">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Numéro de bordereau de versement" value={admission.numeroBordereau} />
              <Field
                label="Comment le candidat a connu l'ESSG"
                value={
                  ADMISSION_SOURCE_LABELS[admission.sourceReconnaissance ?? ''] ??
                  admission.sourceReconnaissance
                }
              />
              <div>
                <p className="mb-1 text-xs font-medium text-ink-500">Statut de la candidature</p>
                {statutBadge}
              </div>
            </div>
            {admission.commentaire && (
              <div className="mt-4 rounded-lg bg-ink-50 p-3">
                <p className="mb-1 text-xs font-medium text-ink-500">Commentaire</p>
                <p className="whitespace-pre-wrap text-sm text-ink-900">{admission.commentaire}</p>
              </div>
            )}
          </Section>

          <Section icon={<FileText className="size-4" />} title="Pièces justificatives">
            {missingRequiredFiles.length > 0 && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Pièce(s) obligatoire(s) manquante(s) :{' '}
                {missingRequiredFiles
                  .map((type) => ADMISSION_FILE_TYPE_LABELS[type] ?? type)
                  .join(', ')}
                .
              </p>
            )}
            {files.length === 0 ? (
              <p className="text-sm text-ink-500">Aucun fichier joint à cette candidature.</p>
            ) : (
              <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100">
                {files.map((file) => (
                  <li key={file.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink-900">
                        {ADMISSION_FILE_TYPE_LABELS[file.type] ?? file.type}
                        <Badge
                          variant={
                            REQUIRED_ADMISSION_FILE_TYPES.includes(file.type)
                              ? 'default'
                              : 'outline'
                          }
                          className="text-[0.65rem]"
                        >
                          {REQUIRED_ADMISSION_FILE_TYPES.includes(file.type)
                            ? 'Obligatoire'
                            : 'Facultatif'}
                        </Badge>
                      </p>
                      <p className="truncate text-xs text-ink-500">
                        {file.originalName} · {getFileExtension(file.originalName)} ·{' '}
                        {formatFileSize(file.size)} ·{' '}
                        {new Date(file.creeLe).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onPreviewFile?.(file)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Aperçu
                      </Button>
                      {onDeleteFile && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteFile(file)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Supprimer ${ADMISSION_FILE_TYPE_LABELS[file.type]}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
              <Mail className="size-3.5" />
              Les fichiers sont consultables directement dans le back-office.
            </p>
          </Section>

          <Section icon={<ScanSearch className="size-4" />} title="Vérification des pièces">
            {/* Bouton directement dans AdmissionDetailDialog — visible dans ce fichier unique (exigence) */}
            <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">
                    Contrôle automatique des documents
                  </p>
                  <p className="text-xs leading-relaxed text-ink-500">
                    Le système identifie les pièces (diplôme, relevé, bordereau...), extrait le
                    texte (PDF natif → OCR si nécessaire) et compare avec les données saisies.
                  </p>
                </div>
                <Button
                  onClick={() => void handleDirectVerify()}
                  disabled={isVerifying}
                  className="shrink-0 gap-2 bg-brand-700 text-white hover:bg-brand-800"
                  size="default"
                >
                  {isVerifying ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ScanSearch className="size-4" />
                  )}
                  Vérifier les pièces
                </Button>
              </div>
              {isVerifying && (
                <div className="mt-3 rounded-lg border border-brand-200 bg-white px-3 py-2">
                  <p className="flex items-center gap-2 text-xs font-medium text-brand-700">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Analyse des documents...
                  </p>
                  <ol className="mt-2 grid grid-cols-1 gap-1 text-xs text-ink-500 sm:grid-cols-5">
                    <li>1. Identification</li>
                    <li>2. Extraction</li>
                    <li>3. OCR</li>
                    <li>4. Comparaison</li>
                    <li>5. Résultat</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Détails / résultats — logique conservée dans le service dédié */}
            <AdmissionVerificationSection admission={admission} hideButton />
          </Section>
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
          <Button onClick={onEditStatus}>
            <BadgeCheck className="size-4" aria-hidden="true" />
            Modifier le statut
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdmissionDetailDialog;
