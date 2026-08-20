import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ACCEPTED_CV_TYPES,
  OcrError,
  analyzeCv,
  type OcrProgress,
  type OcrResult,
} from '../../services/ocr.service';
import type { RessourceHumaineFormData } from '../../types/ressource-humaine.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CvImportPanelProps {
  /**
   * Applique les données extraites au formulaire.
   * `champs` liste les clés effectivement renseignées par l'OCR, afin que le
   * formulaire puisse les signaler visuellement à l'utilisateur.
   */
  onApply: (
    data: Partial<RessourceHumaineFormData>,
    champs: Set<keyof RessourceHumaineFormData>,
  ) => void;
  disabled?: boolean;
}

type Status = 'idle' | 'analyzing' | 'done' | 'error';

/**
 * Import de CV avec OCR (cahier des charges §8).
 *
 * Workflow : Upload → OCR → extraction → préremplissage → vérification par
 * l'utilisateur → envoi au backend.
 *
 * L'analyse est 100 % locale (tesseract.js + pdf.js) : aucun document n'est
 * transmis à un service tiers. Les données extraites ne sont JAMAIS envoyées
 * directement : elles remplissent le formulaire, que l'utilisateur valide.
 */
const CvImportPanel: React.FC<CvImportPanelProps> = ({ onApply, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState<OcrProgress>({ percent: 0, label: '' });
  const [result, setResult] = useState<OcrResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const run = useCallback(async (candidate: File) => {
    setFile(candidate);
    setStatus('analyzing');
    setErrorMessage(null);
    setResult(null);
    setProgress({ percent: 0, label: 'Initialisation…' });

    try {
      const analysis = await analyzeCv(candidate, setProgress);
      setResult(analysis);
      setStatus('done');
      toast.success('CV analysé — vérifiez les données avant enregistrement');
    } catch (error) {
      const message =
        error instanceof OcrError
          ? error.message
          : "L'analyse du document a échoué. Réessayez.";
      setErrorMessage(message);
      setStatus('error');
      toast.error(message);
    }
  }, []);

  const handleFile = (candidate?: File | null) => {
    if (!candidate) return;
    void run(candidate);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || status === 'analyzing') return;
    handleFile(event.dataTransfer.files?.[0]);
  };

  /**
   * Génère les champs du formulaire à partir des données extraites.
   *
   * Chaque élément détecté (expérience, diplôme, compétence, langue...) donne
   * lieu à un input dédié : l'utilisateur obtient un formulaire déjà structuré
   * qu'il n'a plus qu'à relire et corriger. Rien n'est envoyé au backend à ce
   * stade — la soumission reste une action explicite.
   */
  const applyToForm = () => {
    if (!result) return;
    const { parsed } = result;

    const patch: Partial<RessourceHumaineFormData> = {};
    const champs = new Set<keyof RessourceHumaineFormData>();

    /** N'écrit que les valeurs réellement détectées (jamais de champ vide). */
    const set = <K extends keyof RessourceHumaineFormData>(
      key: K,
      value: RessourceHumaineFormData[K] | undefined,
    ) => {
      if (value === undefined) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (typeof value === 'string' && !value.trim()) return;
      patch[key] = value;
      champs.add(key);
    };

    /* Identité et contact */
    set('nom', parsed.nom?.toLocaleUpperCase('fr-FR'));
    set('prenom', parsed.prenom);
    set('email', parsed.email);
    set('telephone', parsed.telephone);
    set('adresse', parsed.adresse);
    set('poste', parsed.poste);

    /* Parcours : un input est généré par entrée détectée */
    set('experiences', parsed.experiences);
    set('formations', parsed.formations);
    set('diplomes', parsed.diplomes);
    set('competences', parsed.competences);
    set('langues', parsed.langues);

    onApply(patch, champs);

    const total = champs.size;
    toast.success(
      `${total} champ${total > 1 ? 's' : ''} prérempli${total > 1 ? 's' : ''} — vérifiez avant d'enregistrer`,
    );
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setFile(null);
    setErrorMessage(null);
    setProgress({ percent: 0, label: '' });
    if (inputRef.current) inputRef.current.value = '';
  };

  const confidencePercent = result ? Math.round(result.parsed.confiance * 100) : 0;

  return (
    <section className="space-y-2 rounded-md border border-dashed border-brand-200 bg-brand-50/40 p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-brand-600" />
        <Label className="text-xs font-semibold uppercase tracking-wide text-brand-800">
          Import de CV (OCR)
        </Label>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_CV_TYPES.join(',')}
        onChange={(event) => handleFile(event.target.files?.[0])}
        className="hidden"
      />

      {/* ─── État initial : zone de dépôt ─── */}
      {status === 'idle' && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center gap-1.5 rounded-md border-2 border-dashed px-4 py-5 text-center transition-colors ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/50'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Upload className="size-5 text-brand-600" />
          <span className="text-sm font-medium text-ink-800">
            Déposez un CV ou cliquez pour parcourir
          </span>
          <span className="text-xs text-ink-500">
            PDF ou image (JPG, PNG, WebP) — 10 Mo max. Analyse locale, aucun envoi externe.
          </span>
        </button>
      )}

      {/* ─── État : analyse en cours ─── */}
      {status === 'analyzing' && (
        <div className="space-y-2 rounded-md border border-ink-100 bg-white p-3">
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <Loader2 className="size-4 shrink-0 animate-spin text-brand-600" />
            <span className="min-w-0 flex-1 truncate">{progress.label || 'Analyse en cours…'}</span>
            <span data-numeric className="shrink-0 text-xs font-medium text-ink-500">
              {progress.percent}%
            </span>
          </div>
          {/* Barre de progression : hauteur fixe, aucun décalage de layout */}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="truncate text-xs text-ink-400">{file?.name}</p>
        </div>
      )}

      {/* ─── État : erreur ─── */}
      {status === 'error' && (
        <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {file && (
              <Button type="button" variant="outline" size="sm" onClick={() => void run(file)}>
                <RefreshCw className="size-3.5" />
                Refaire l'analyse
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Choisir un autre fichier
            </Button>
          </div>
          <p className="text-xs text-red-600/80">
            Vous pouvez aussi saisir les informations manuellement ci-dessous.
          </p>
        </div>
      )}

      {/* ─── État : succès ─── */}
      {status === 'done' && result && (
        <div className="space-y-2.5 rounded-md border border-ink-100 bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 text-sm text-ink-800">
              <CheckCircle2 className="size-4 shrink-0 text-brand-600" />
              <FileText className="size-4 shrink-0 text-ink-400" />
              <span className="truncate font-medium">{file?.name}</span>
            </p>
            <button
              type="button"
              onClick={reset}
              aria-label="Retirer le CV"
              className="grid size-6 shrink-0 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Récapitulatif de ce qui a été détecté */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:grid-cols-3">
            <Detected label="Nom" value={result.parsed.nom} />
            <Detected label="Prénom" value={result.parsed.prenom} />
            <Detected label="Email" value={result.parsed.email} />
            <Detected label="Téléphone" value={result.parsed.telephone} />
            <Detected label="Poste" value={result.parsed.poste} />
            <Detected
              label="Expériences"
              value={
                result.parsed.experiences.length
                  ? `${result.parsed.experiences.length} détectée(s)`
                  : undefined
              }
            />
            <Detected
              label="Formations"
              value={
                result.parsed.formations.length + result.parsed.diplomes.length
                  ? `${result.parsed.formations.length + result.parsed.diplomes.length} détectée(s)`
                  : undefined
              }
            />
            <Detected
              label="Compétences"
              value={
                result.parsed.competences.length
                  ? `${result.parsed.competences.length} détectée(s)`
                  : undefined
              }
            />
            <Detected
              label="Langues"
              value={result.parsed.langues.length ? result.parsed.langues.join(', ') : undefined}
            />
          </dl>

          <p className="text-xs text-ink-500">
            Fiabilité estimée : <span data-numeric>{confidencePercent}%</span>
            {result.usedOcr ? ' — document scanné (OCR)' : ' — texte extrait directement'}
            {confidencePercent < 50 && ' · vérifiez attentivement les champs.'}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={applyToForm}>
              <Sparkles className="size-3.5" />
              Préremplir le formulaire
            </Button>
            {file && (
              <Button type="button" variant="outline" size="sm" onClick={() => void run(file)}>
                <RefreshCw className="size-3.5" />
                Refaire l'analyse
              </Button>
            )}
          </div>

          <p className="text-xs text-ink-400">
            Les données ne sont pas enregistrées automatiquement : vérifiez et corrigez les champs
            avant de valider.
          </p>
        </div>
      )}
    </section>
  );
};

/** Ligne du récapitulatif : valeur détectée ou mention « non détecté ». */
const Detected: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-ink-400">{label}</dt>
    <dd className={`truncate ${value ? 'font-medium text-ink-800' : 'italic text-ink-400'}`}>
      {value || 'non détecté'}
    </dd>
  </div>
);

export default CvImportPanel;
