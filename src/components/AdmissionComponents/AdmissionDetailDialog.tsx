import {
  BadgeCheck,
  Banknote,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import React from 'react';
import type { Admission, AdmissionFile } from '@/types';
import { ADMISSION_FILE_TYPE_LABELS } from '@/types';
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

const AdmissionDetailDialog: React.FC<AdmissionDetailDialogProps> = ({
  admission,
  open,
  onClose,
  onEditStatus,
  onPreviewFile,
  onDeleteFile,
}) => {
  const files = admission.files ?? [];
  const statutBadge = (
    <Badge variant={getStatusColor(admission.statut)} className="text-xs">
      {getStatusLabel(admission.statut)}
    </Badge>
  );

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
              <Field label="Sexe" value={admission.sexe} />
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
              <Field label="Type de Bac" value={admission.bacType} />
              <Field label="Série du Bac" value={admission.bacSerie} />
              <Field label="Catégorie du Bac" value={admission.bacCategorie} />
              <Field label="Numéro d'inscription au Bac" value={admission.numeroBaccalaureat} />
              <Field label="Année d'obtention du Bac" value={admission.bacAnneeObtention} />
              <Field label="Centre d'examen du Bac" value={admission.bacCentreExamen} />
              <Field
                label="Ancien établissement"
                value={admission.ancienEtablissement || admission.licenceEtablissement}
              />
              <Field label="Numéro matricule" value={admission.numeroMatricule} />
              <Field label="Mention de la Licence" value={admission.licenceMention} />
              <Field
                label="Année d'obtention de la Licence"
                value={admission.licenceAnneeObtention}
              />
            </div>
          </Section>

          <Section icon={<Banknote className="size-4" />} title="Paiement">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Numéro de bordereau de versement" value={admission.numeroBordereau} />
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
                      <p className="truncate text-sm font-medium text-ink-900">
                        {ADMISSION_FILE_TYPE_LABELS[file.type] ?? file.type}
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
