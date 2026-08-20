import {
  BadgeCheck,
  Banknote,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import React from 'react';
import type { Admission, AdmissionFile } from '../../types/admission.types';
import { ADMISSION_FILE_TYPE_LABELS } from '../../types/admission.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFullName } from '../../utils/name.utils';
import { formatFileSize, getFileExtension } from '../../utils/admission.utils';

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
  if (!open) return null;

  const files = admission.files ?? [];
  const statutBadge = (
    <Badge variant={getStatusColor(admission.statut)} className="text-xs">
      {getStatusLabel(admission.statut)}
    </Badge>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-ink-900">Détails de la candidature</h2>
            <p className="truncate text-sm text-ink-500">
              Référence ESSG-{admission.id} · Déposée le{' '}
              {new Date(admission.creeLe).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
            type="button"
            aria-label="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <Section icon={<UserIcon className="size-4" />} title="Informations personnelles">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nom complet" value={formatFullName(admission)} />
              <Field label="Email" value={admission.email} />
              <Field label="Téléphone" value={admission.telephone} />
              <Field
                label="Date de naissance"
                value={new Date(admission.dateNaissance).toLocaleDateString('fr-FR')}
              />
              <div className="md:col-span-2">
                <Field label="Adresse" value={admission.adresse} />
              </div>
            </div>
          </Section>

          <Section icon={<GraduationCap className="size-4" />} title="Informations académiques">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Formation souhaitée" value={admission.formation} />
              <Field label="Niveau" value={admission.niveau} />
              <Field label="Dernier diplôme obtenu" value={admission.diplomePrecedent} />
              <Field
                label="Numéro d'inscription au baccalauréat"
                value={admission.numeroBaccalaureat}
              />
              <Field label="Établissement de la Licence" value={admission.licenceEtablissement} />
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

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row">
            <Button onClick={onEditStatus} className="flex-1 bg-brand-600 hover:bg-brand-700">
              <BadgeCheck className="mr-2 size-4" />
              Modifier le statut
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDetailDialog;
