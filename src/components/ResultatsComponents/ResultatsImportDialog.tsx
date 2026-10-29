import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  Info,
  Table2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib';
import { useAuth } from '@/contexts';
import { PERMISSIONS } from '@/constants';
import {
  confirmerImportResultat,
  downloadModeleResultats,
  importResultat,
  supprimerResultat,
  type ImportResultatPayload,
  type ImportResultatPreviewRow,
  type ImportResultatResponse,
} from '@/services';

interface ResultatsImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'form' | 'preview';
type FormState = Omit<ImportResultatPayload, 'fichier'>;

const ACCEPTED_EXTENSIONS = ['.xlsx', '.pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const PREVIEW_PAGE_SIZE = 10;

const EMPTY_FORM: FormState = {
  titre: '',
  type: 'excel',
  anneeScolaire: '',
  periode: '',
  classeFormation: '',
  modeConsultation: 'public',
  autorisePublicationPublique: true,
};

const STATUT_LABEL: Record<string, string> = {
  admis: 'Admis',
  ajourne: 'Ajourné',
};

const formatSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const inferType = (file: File | null): 'excel' | 'pdf' =>
  file && file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'excel';

const ResultatsImportDialog: React.FC<ResultatsImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canDelete = hasPermission(PERMISSIONS.RESULTAT_DELETE);

  const [step, setStep] = useState<Step>('form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM);
  const [imported, setImported] = useState<ImportResultatResponse | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [onlyIssues, setOnlyIssues] = useState(false);

  const draftIdRef = useRef<number | null>(null);
  const confirmedRef = useRef(false);

  const resetState = () => {
    setStep('form');
    setSelectedFile(null);
    setIsDragging(false);
    setFormData(EMPTY_FORM);
    setImported(null);
    setPreviewPage(0);
    setOnlyIssues(false);
    draftIdRef.current = null;
    confirmedRef.current = false;
  };

  const discardDraft = async () => {
    const draftId = draftIdRef.current;
    draftIdRef.current = null;
    if (!draftId || confirmedRef.current || !canDelete) return;
    try {
      await supprimerResultat(draftId);
    } catch {
      // Le brouillon reste disponible dans la liste ; rien de bloquant.
    }
  };

  const handleClose = async () => {
    if (importMutation.isPending || confirmMutation.isPending) return;
    await discardDraft();
    resetState();
    onClose();
  };

  const importMutation = useMutation({
    mutationFn: (payload: ImportResultatPayload) => importResultat(payload),
    onSuccess: (data) => {
      draftIdRef.current = data.publication.id;
      confirmedRef.current = false;
      setImported(data);
      setPreviewPage(0);
      setOnlyIssues(false);
      setStep('preview');
      if (data.preview.type === 'excel' && data.preview.lignesValides === 0) {
        toast.warning('Aucune ligne valide détectée. Vérifiez le fichier avant de valider.');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Échec de l’analyse du fichier.');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmerImportResultat(id),
    onSuccess: (confirmation) => {
      confirmedRef.current = true;
      void queryClient.invalidateQueries({ queryKey: ['resultats'] });
      toast.success(
        `${confirmation.inseres} résultat(s) importé(s)` +
          (confirmation.doublons > 0 ? `, ${confirmation.doublons} doublon(s) ignoré(s).` : '.')
      );
      resetState();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Échec de la validation de l’importation.'
      );
    },
  });

  const isPending = importMutation.isPending || confirmMutation.isPending;
  const fileType = inferType(selectedFile);

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      toast.error('Format non pris en charge. Utilisez un fichier .xlsx ou .pdf.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier dépasse la taille maximale de 10 Mo.');
      return;
    }

    setSelectedFile(file);
    setFormData((previous) => ({
      ...previous,
      type: inferType(file),
      titre: previous.titre.trim() ? previous.titre : file.name.replace(/\.[^/.]+$/, ''),
    }));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isPending) return;
    handleFileSelection(event.dataTransfer.files?.[0] ?? null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Sélectionnez un fichier à importer.');
      return;
    }
    importMutation.mutate({ ...formData, fichier: selectedFile });
  };

  const handleBackToForm = async () => {
    if (isPending) return;
    await discardDraft();
    setImported(null);
    setStep('form');
  };

  const handleDownloadModele = async () => {
    try {
      const blob = await downloadModeleResultats();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modele-resultats.xlsx';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de télécharger le modèle.');
    }
  };

  const preview = imported?.preview;
  const previewRows: ImportResultatPreviewRow[] = showOnlyIssues(preview?.lignes, onlyIssues);
  const previewPageCount = Math.max(1, Math.ceil(previewRows.length / PREVIEW_PAGE_SIZE));
  const safePreviewPage = Math.min(previewPage, previewPageCount - 1);
  const pagedPreviewRows = previewRows.slice(
    safePreviewPage * PREVIEW_PAGE_SIZE,
    safePreviewPage * PREVIEW_PAGE_SIZE + PREVIEW_PAGE_SIZE
  );

  const isFormValid =
    Boolean(selectedFile) &&
    formData.titre.trim().length > 0 &&
    formData.anneeScolaire.trim().length > 0;

  const canConfirm = useMemo(() => {
    if (!preview) return false;
    if (preview.type === 'pdf') return true;
    return preview.lignesValides > 0;
  }, [preview]);

  const hasIssues =
    preview?.type === 'excel' && (preview.lignesInvalides > 0 || preview.doublons > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isPending) void handleClose();
      }}
    >
      <DialogContent size={step === 'preview' ? 'full' : '2xl'}>
        <DialogHeader
          icon={step === 'form' ? <UploadCloud /> : <ClipboardCheck />}
          title={step === 'form' ? 'Importer des résultats' : 'Aperçu avant importation'}
          description={
            step === 'form'
              ? 'Choisissez un fichier Excel (.xlsx) ou PDF, renseignez la publication puis vérifiez l’aperçu avant de valider.'
              : 'Contrôlez les lignes détectées. Rien n’est encore publié : vous pouvez revenir en arrière ou annuler.'
          }
        />

        <DialogBody className="space-y-5">
          <StepIndicator step={step} />

          {step === 'form' && (
            <form id="resultats-import-form" onSubmit={handleSubmit} className="space-y-5">
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">1. Fichier source</h3>
                    <p className="text-xs text-ink-500">
                      Formats acceptés : .xlsx ou .pdf — 10 Mo maximum.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownloadModele()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
                  >
                    <Download className="size-3.5" />
                    Modèle Excel
                  </button>
                </div>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isPending) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'relative rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
                    isDragging
                      ? 'border-brand-500 bg-brand-50/70'
                      : 'border-ink-200 bg-ink-50/40 hover:border-brand-300 hover:bg-brand-50/40',
                    isPending && 'pointer-events-none opacity-60'
                  )}
                >
                  <input
                    id="resultat-fichier"
                    type="file"
                    accept=".xlsx,.pdf"
                    onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                    disabled={isPending}
                    className="sr-only"
                  />
                  <label
                    htmlFor="resultat-fichier"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <UploadCloud className="size-5" />
                    </span>
                    <span className="text-sm font-medium text-ink-800">
                      Glissez un fichier ici ou cliquez pour parcourir
                    </span>
                    <span className="text-xs text-ink-500">
                      Le fichier est analysé avant tout enregistrement définitif.
                    </span>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5">
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-lg',
                        fileType === 'pdf'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-700'
                      )}
                    >
                      {fileType === 'pdf' ? (
                        <FileText className="size-4" />
                      ) : (
                        <FileSpreadsheet className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-ink-500">
                        {fileType === 'pdf' ? 'PDF' : 'Excel'} · {formatSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isPending}
                      aria-label="Retirer le fichier"
                    >
                      <X />
                    </Button>
                  </div>
                )}
              </section>

              <section className="space-y-3 border-t border-ink-100 pt-5">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">
                    2. Informations de la publication
                  </h3>
                  <p className="text-xs text-ink-500">
                    Ces informations permettent d’identifier les résultats sur le site public.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="resultat-titre"
                      className="mb-1 block text-sm font-medium text-ink-700"
                    >
                      Intitulé <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="resultat-titre"
                      type="text"
                      value={formData.titre}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, titre: event.target.value }))
                      }
                      placeholder="Ex : Concours d’entrée 2026"
                      disabled={isPending}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resultat-annee"
                      className="mb-1 block text-sm font-medium text-ink-700"
                    >
                      Année scolaire <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="resultat-annee"
                      type="text"
                      value={formData.anneeScolaire}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          anneeScolaire: event.target.value,
                        }))
                      }
                      placeholder="Ex : 2025-2026"
                      disabled={isPending}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resultat-periode"
                      className="mb-1 block text-sm font-medium text-ink-700"
                    >
                      Période <span className="text-xs font-normal text-ink-400">(optionnel)</span>
                    </label>
                    <input
                      id="resultat-periode"
                      type="text"
                      value={formData.periode ?? ''}
                      onChange={(event) =>
                        setFormData((previous) => ({ ...previous, periode: event.target.value }))
                      }
                      placeholder="Ex : Semestre 1"
                      disabled={isPending}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resultat-classe"
                      className="mb-1 block text-sm font-medium text-ink-700"
                    >
                      Classe / formation{' '}
                      <span className="text-xs font-normal text-ink-400">(optionnel)</span>
                    </label>
                    <input
                      id="resultat-classe"
                      type="text"
                      value={formData.classeFormation ?? ''}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          classeFormation: event.target.value,
                        }))
                      }
                      placeholder="Ex : L1 Informatique"
                      disabled={isPending}
                      className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <p className="mb-1 block text-sm font-medium text-ink-700">
                      Type de fichier détecté
                    </p>
                    <div className="flex h-[38px] items-center rounded-lg border border-ink-100 bg-ink-50 px-3">
                      {selectedFile ? (
                        <Badge variant="outline" className="text-xs">
                          {fileType === 'pdf' ? 'PDF' : 'Excel'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-400">Aucun fichier sélectionné</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex gap-2 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
                <Globe className="mt-0.5 size-4 shrink-0 text-brand-700" />
                <div className="text-sm">
                  <p className="font-medium text-brand-900">Diffusion publique activée</p>
                  <p className="text-brand-800/80">
                    Aucune protection par matricule ni code de consultation. Les résultats importés
                    seront consultables directement sur le site public dès la publication.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 rounded-xl border border-ink-200 bg-ink-50/60 p-3 text-sm text-ink-600">
                <Info className="mt-0.5 size-4 shrink-0 text-ink-500" />
                <p>
                  Le fichier Excel doit contenir au minimum les colonnes{' '}
                  <span className="font-medium text-ink-800">matricule</span>,{' '}
                  <span className="font-medium text-ink-800">nom</span> et{' '}
                  <span className="font-medium text-ink-800">prénom</span>. Les autres colonnes sont
                  conservées comme notes ou informations complémentaires.
                </p>
              </div>
            </form>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-ink-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-lg',
                      preview.type === 'pdf'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-700'
                    )}
                  >
                    {preview.type === 'pdf' ? (
                      <FileText className="size-5" />
                    ) : (
                      <FileSpreadsheet className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {imported?.publication.fichierOriginal}
                    </p>
                    <p className="text-xs text-ink-500">
                      {formData.titre} · {formData.anneeScolaire}
                      {formData.periode ? ` · ${formData.periode}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {preview.type === 'pdf' ? 'PDF' : 'Excel'}
                  </Badge>
                  {preview.feuille && (
                    <Badge variant="outline" className="text-xs">
                      Feuille : {preview.feuille}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {imported ? formatSize(imported.publication.taille) : '—'}
                  </Badge>
                </div>
              </div>

              {preview.type === 'pdf' ? (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold">Document PDF prêt à être importé</p>
                    <p className="mt-1 text-amber-800">
                      Le contenu d’un PDF n’est pas analysé ligne par ligne. Le document sera publié
                      tel quel sur le site public. Vérifiez qu’il s’agit bien du bon fichier avant
                      de valider.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <SummaryCard
                      label="Lignes détectées"
                      value={preview.totalLignes}
                      icon={<Table2 className="size-4" />}
                      tone="neutral"
                    />
                    <SummaryCard
                      label="Lignes valides"
                      value={preview.lignesValides}
                      icon={<CheckCircle2 className="size-4" />}
                      tone="success"
                    />
                    <SummaryCard
                      label="Lignes invalides"
                      value={preview.lignesInvalides}
                      icon={<X className="size-4" />}
                      tone={preview.lignesInvalides > 0 ? 'danger' : 'neutral'}
                    />
                    <SummaryCard
                      label="Doublons"
                      value={preview.doublons}
                      icon={<AlertTriangle className="size-4" />}
                      tone={preview.doublons > 0 ? 'warning' : 'neutral'}
                    />
                  </div>

                  <div
                    className={cn(
                      'flex gap-3 rounded-xl border p-3 text-sm',
                      hasIssues
                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    )}
                  >
                    {hasIssues ? (
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    )}
                    <div>
                      <p className="font-medium">{preview.message}</p>
                      {hasIssues && (
                        <p className="mt-1 text-amber-800">
                          Seules les lignes valides seront enregistrées. Les lignes en erreur et les
                          doublons seront ignorés.
                        </p>
                      )}
                      {preview.lignesValides === 0 && (
                        <p className="mt-1 font-medium text-red-700">
                          Aucune ligne valide : la validation est désactivée.
                        </p>
                      )}
                    </div>
                  </div>

                  {preview.colonnes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                        Colonnes détectées
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {preview.colonnes
                          .filter((column) => column.trim())
                          .map((column) => (
                            <Badge key={column} variant="outline" className="text-xs">
                              {column}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-semibold text-ink-900">
                        Détail des lignes analysées
                      </h3>
                      <label className="flex items-center gap-2 text-xs text-ink-600">
                        <input
                          type="checkbox"
                          checked={onlyIssues}
                          onChange={(event) => {
                            setOnlyIssues(event.target.checked);
                            setPreviewPage(0);
                          }}
                          className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                        />
                        Afficher uniquement les lignes à corriger
                      </label>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-ink-100">
                      <div className="max-h-[42vh] overflow-auto">
                        <table className="min-w-full divide-y divide-ink-200 text-sm">
                          <thead className="sticky top-0 z-10 bg-ink-50">
                            <tr>
                              {[
                                'Ligne',
                                'Matricule',
                                'Étudiant',
                                'Classe',
                                'Moyenne',
                                'Statut',
                                'État',
                                'Détails',
                              ].map((label) => (
                                <th
                                  key={label}
                                  scope="col"
                                  className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500"
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink-100 bg-white">
                            {pagedPreviewRows.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-3 py-8 text-center text-sm text-ink-500"
                                >
                                  Aucune ligne à afficher avec ce filtre.
                                </td>
                              </tr>
                            ) : (
                              pagedPreviewRows.map((row) => (
                                <tr
                                  key={row.numeroLigne}
                                  className={cn(
                                    'align-top transition-colors hover:bg-ink-50/70',
                                    !row.valide && 'bg-red-50/40'
                                  )}
                                >
                                  <td
                                    data-numeric
                                    className="whitespace-nowrap px-3 py-2.5 text-xs text-ink-500"
                                  >
                                    {row.numeroLigne}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-ink-900">
                                    {row.matricule || '—'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-ink-700">
                                    {row.nom || row.prenom
                                      ? `${row.nom ?? ''} ${row.prenom ?? ''}`.trim()
                                      : '—'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-ink-600">
                                    {row.classe || '—'}
                                  </td>
                                  <td
                                    data-numeric
                                    className="whitespace-nowrap px-3 py-2.5 text-sm text-ink-700"
                                  >
                                    {row.moyenne ?? '—'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5">
                                    {row.statutAcademique ? (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-xs',
                                          row.statutAcademique === 'admis'
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-amber-200 bg-amber-50 text-amber-700'
                                        )}
                                      >
                                        {STATUT_LABEL[row.statutAcademique] ?? row.statutAcademique}
                                      </Badge>
                                    ) : (
                                      <span className="text-sm text-ink-400">—</span>
                                    )}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2.5">
                                    <StatusBadge row={row} />
                                  </td>
                                  <td className="min-w-56 px-3 py-2.5 text-xs text-ink-600">
                                    {row.erreurs.length > 0 ? (
                                      <ul className="space-y-0.5">
                                        {row.erreurs.map((erreur) => (
                                          <li key={erreur} className="flex gap-1">
                                            <span className="text-red-500">•</span>
                                            <span>{erreur}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="text-emerald-600">Aucune erreur</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {previewRows.length > PREVIEW_PAGE_SIZE && (
                      <div className="flex items-center justify-between text-xs text-ink-500">
                        <span>
                          {safePreviewPage * PREVIEW_PAGE_SIZE + 1}–
                          {Math.min((safePreviewPage + 1) * PREVIEW_PAGE_SIZE, previewRows.length)}{' '}
                          sur {previewRows.length} ligne(s)
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewPage((page) => Math.max(0, page - 1))}
                            disabled={safePreviewPage === 0}
                          >
                            Précédent
                          </Button>
                          <span data-numeric>
                            {safePreviewPage + 1} / {previewPageCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPreviewPage((page) => Math.min(previewPageCount - 1, page + 1))
                            }
                            disabled={safePreviewPage >= previewPageCount - 1}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          {step === 'form' ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleClose()}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="resultats-import-form"
                disabled={!isFormValid || isPending}
                loading={importMutation.isPending}
              >
                {importMutation.isPending ? 'Analyse du fichier…' : 'Prévisualiser l’importation'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleBackToForm()}
                disabled={isPending}
              >
                <ArrowLeft />
                Retour
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (imported) confirmMutation.mutate(imported.publication.id);
                }}
                disabled={!canConfirm || isPending}
                loading={confirmMutation.isPending}
              >
                <Check />
                {confirmMutation.isPending ? 'Validation…' : 'Valider l’importation'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const showOnlyIssues = (
  rows: ImportResultatPreviewRow[] | undefined,
  onlyIssues: boolean
): ImportResultatPreviewRow[] => {
  if (!rows) return [];
  if (!onlyIssues) return rows;
  return rows.filter((row) => !row.valide || row.doublon);
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
}

const SUMMARY_TONES: Record<SummaryCardProps['tone'], string> = {
  neutral: 'border-ink-200 bg-white text-ink-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, tone }) => (
  <div className={cn('rounded-xl border p-3', SUMMARY_TONES[tone])}>
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide opacity-80">
      {icon}
      <span>{label}</span>
    </div>
    <p data-numeric className="mt-1 text-2xl font-semibold">
      {value}
    </p>
  </div>
);

const StatusBadge: React.FC<{ row: ImportResultatPreviewRow }> = ({ row }) => {
  if (row.doublon) {
    return (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-700">
        Doublon
      </Badge>
    );
  }
  if (row.valide) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
      >
        Valide
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-red-200 bg-red-50 text-xs text-red-700">
      Erreur
    </Badge>
  );
};

const StepIndicator: React.FC<{ step: Step }> = ({ step }) => (
  <ol className="flex items-center gap-3 text-xs font-medium">
    <StepItem
      number={1}
      label="Fichier & informations"
      state={step === 'form' ? 'current' : 'done'}
    />
    <li className="h-px flex-1 bg-ink-200" aria-hidden="true" />
    <StepItem
      number={2}
      label="Vérification & validation"
      state={step === 'preview' ? 'current' : 'todo'}
    />
  </ol>
);

const StepItem: React.FC<{
  number: number;
  label: string;
  state: 'todo' | 'current' | 'done';
}> = ({ number, label, state }) => (
  <li className="flex items-center gap-2">
    <span
      className={cn(
        'grid size-6 place-items-center rounded-full border text-[11px] font-semibold',
        state === 'current' && 'border-brand-600 bg-brand-600 text-white',
        state === 'done' && 'border-emerald-600 bg-emerald-600 text-white',
        state === 'todo' && 'border-ink-200 bg-white text-ink-400'
      )}
    >
      {state === 'done' ? <Check className="size-3.5" /> : number}
    </span>
    <span
      className={cn(
        state === 'current' ? 'text-ink-900' : 'text-ink-500',
        state === 'done' && 'text-emerald-700'
      )}
    >
      {label}
    </span>
  </li>
);

export default ResultatsImportDialog;
