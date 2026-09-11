import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSearch,
  ScanSearch,
  LoaderCircle,
  Calendar,
  MapPin,
  GraduationCap,
  Receipt,
  FileText,
  Eye,
  Search,
  RefreshCw,
  Info,
  CircleHelp,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  useVerifyAdmission,
  useLatestAdmissionVerification,
  useAdmissionVerifications,
} from '@/hooks';
import type { Admission, AdmissionVerification, VerificationFieldResult } from '@/types';
import { ApiError } from '@/api';
import { formatDateLong, formatDateTimeLong } from '@/utils/date.utils';

interface Props {
  admission: Admission;
  hideButton?: boolean;
}

const STEPS = [
  { id: 1, label: 'Identification des documents', icon: FileSearch },
  { id: 2, label: 'Extraction du texte', icon: FileText },
  { id: 3, label: 'Analyse OCR', icon: ScanSearch },
  { id: 4, label: 'Comparaison des données', icon: Search },
  { id: 5, label: 'Génération du résultat', icon: CheckCircle },
] as const;

type GlobalStatus =
  'conforme' | 'verification_manuelle' | 'incompatible' | 'impossible' | (string & {});

function globalMeta(statut: GlobalStatus) {
  switch (statut) {
    case 'conforme':
      return {
        label: 'Vérifié — Conforme',
        short: 'Conforme',
        icon: CheckCircle,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'default' as const,
        desc: 'Données saisies cohérentes avec les documents fournis.',
      };
    case 'verification_manuelle':
      return {
        label: 'À vérifier',
        short: 'À vérifier',
        icon: AlertTriangle,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'outline' as const,
        desc: 'Correspondance partielle ou qualité OCR limitée — contrôle manuel recommandé.',
      };
    case 'incompatible':
      return {
        label: 'Incohérent',
        short: 'Incohérent',
        icon: XCircle,
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'destructive' as const,
        desc: 'Au moins une information ne correspond pas aux documents.',
      };
    case 'impossible':
      return {
        label: 'Lecture impossible',
        short: 'Lecture impossible',
        icon: ScanSearch,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'secondary' as const,
        desc: 'Documents absents, illisibles ou non exploitables.',
      };
    default:
      return {
        label: statut,
        short: statut,
        icon: CircleHelp,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'secondary' as const,
        desc: '',
      };
  }
}

type FieldDisplay = {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badgeLabel: string;
};

function fieldMeta(statut: string, details?: Record<string, unknown>): FieldDisplay {
  const isLectureImpossible = details && (details as { lecture?: string }).lecture === 'impossible';
  if (isLectureImpossible) {
    return {
      label: 'Lecture impossible',
      icon: ScanSearch,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      badgeLabel: 'Lecture impossible',
    };
  }
  switch (statut) {
    case 'conforme':
      return {
        label: 'Vérifié',
        icon: CheckCircle,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badgeLabel: 'Vérifié',
      };
    case 'a_verifier':
      return {
        label: 'À vérifier',
        icon: AlertTriangle,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badgeLabel: 'À vérifier',
      };
    case 'non_conforme':
      return {
        label: 'Incohérent',
        icon: XCircle,
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badgeLabel: 'Incohérent',
      };
    case 'non_detecte':
    default:
      return {
        label: 'Non trouvé',
        icon: CircleHelp,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badgeLabel: 'Non trouvé',
      };
  }
}

function scoreColor(statut: string): string {
  if (statut === 'conforme') return '#059669';
  if (statut === 'incompatible') return '#dc2626';
  if (statut === 'verification_manuelle') return '#d97706';
  return '#64748b';
}

function getBadgeVariant(statut: string): 'default' | 'outline' | 'destructive' | 'secondary' {
  if (statut === 'conforme') return 'default';
  if (statut === 'a_verifier') return 'outline';
  if (statut === 'non_conforme') return 'destructive';
  return 'secondary';
}

function getStepClasses(active: boolean, done: boolean): string {
  if (active) return 'bg-white shadow-sm border border-brand-200 text-brand-700';
  if (done) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  return 'text-ink-400 bg-ink-50/50 border border-transparent';
}
function getStepIconClasses(active: boolean, done: boolean): string {
  if (active) return 'bg-brand-700 text-white';
  if (done) return 'bg-emerald-600 text-white';
  return 'bg-ink-200 text-ink-500';
}
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur lors de la vérification';
}

/* --------- Sous-composants --------- */

const ScoreCircle: React.FC<{ score: number; statut: string }> = ({ score, statut }) => {
  const meta = globalMeta(statut);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(statut);
  return (
    <div
      className="relative grid h-28 w-28 shrink-0 place-items-center"
      role="img"
      aria-label={`Score global ${score} pour cent, statut ${meta.short}`}
    >
      <svg className="absolute h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms ease' }}
        />
      </svg>
      <div className="text-center">
        <div className={`text-2xl font-extrabold ${meta.color}`}>{score}%</div>
        <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-400">
          Score global
        </div>
      </div>
    </div>
  );
};

interface FieldRowProps {
  result: VerificationFieldResult;
  icon?: React.ElementType;
}

const FieldRow: React.FC<FieldRowProps> = ({ result, icon: CustomIcon }) => {
  const [open, setOpen] = useState(false);
  const meta = fieldMeta(result.statut, result.details as Record<string, unknown> | undefined);
  const Icon = CustomIcon || meta.icon;
  const badgeVariant = getBadgeVariant(result.statut);

  // Détection lecture impossible
  const isLectureImpossible =
    (result.details as { lecture?: string } | undefined)?.lecture === 'impossible';

  return (
    <div className={`overflow-hidden rounded-xl border ${meta.border} ${meta.bg}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`field-${result.champ}`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0"
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white shadow-sm ${meta.color}`}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${meta.color}`}>{result.label}</p>
          <p className="truncate text-xs leading-snug text-ink-600">{result.explication}</p>
          {/* Aperçu valeurs sur mobile */}
          <p className="mt-1 flex items-center gap-1 truncate text-[0.7rem] font-mono text-ink-500 sm:hidden">
            <span className="truncate">Saisie: {result.valeurSaisie || '—'}</span>
            <span aria-hidden="true">→</span>
            <span className="truncate">Détectée: {result.valeurExtraite || '—'}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={badgeVariant} className="hidden text-[0.65rem] sm:inline-flex">
            {meta.badgeLabel}
          </Badge>
          <Badge variant={badgeVariant} className="sm:hidden text-[0.6rem] px-1.5">
            {isLectureImpossible ? '—' : meta.badgeLabel.slice(0, 4)}
          </Badge>
          <span className="text-ink-400" aria-hidden="true">
            {open ? (
              <Search className="size-4 rotate-180 transition" />
            ) : (
              <Eye className="size-4" />
            )}
          </span>
        </div>
      </button>

      {open && (
        <div id={`field-${result.champ}`} className="border-t border-ink-100 bg-white px-4 py-3">
          {/* Format explicite Valeur saisie → Valeur détectée → Résultat */}
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
            <div className="rounded-lg bg-ink-50 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink-500">
                <FileText className="size-3" /> Valeur saisie
              </p>
              <p className="mt-1 break-all font-mono text-sm font-medium text-ink-900">
                {result.valeurSaisie || '—'}
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink-500">
                <ScanSearch className="size-3" /> Valeur détectée
              </p>
              <p className="mt-1 break-all font-mono text-sm font-medium text-ink-900">
                {result.valeurExtraite || '—'}
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink-500">
                <Info className="size-3" /> Résultat
              </p>
              <p
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${meta.bg} ${meta.color} border ${meta.border}`}
              >
                <Icon className="size-3" /> {meta.badgeLabel}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full bg-brand-600 transition-all"
                    style={{ width: `${Math.round(result.confiance * 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-[0.7rem] font-medium text-ink-600">
                  {Math.round(result.confiance * 100)}% confiance
                </span>
              </div>
              <p className="mt-1 text-[0.7rem] text-ink-500">Score: {result.score}/100</p>
            </div>
          </div>

          {/* Détails bordereau enrichis */}
          {result.champ === 'bordereau' && result.details && (
            <BordereauDetails details={result.details as Record<string, unknown>} />
          )}

          {/* Détails relevé notes */}
          {result.champ === 'releveNotes' && result.details && (
            <ReleveDetails details={result.details as Record<string, unknown>} />
          )}

          {result.details && result.champ !== 'bordereau' && result.champ !== 'releveNotes' && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-brand-700 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Détails techniques
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900 p-2.5 text-[0.7rem] leading-relaxed text-slate-100">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

const BordereauDetails: React.FC<{ details: Record<string, unknown> }> = ({ details }) => {
  const numbers = (details.allNumbers as string[] | undefined) ?? [];
  const alphanumerics = (details.allAlphanumerics as string[] | undefined) ?? [];
  const dates = (details.dates as string[] | undefined) ?? [];
  const montants = (details.montants as string[] | undefined) ?? [];
  const candidates = (details.candidates as string[] | undefined) ?? [];
  const isDuplicate = (details.isDuplicate as boolean | undefined) ?? false;

  if (numbers.length === 0 && alphanumerics.length === 0) return null;
  return (
    <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
      <h6 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-900">
        <Receipt className="size-3.5" /> Extraction complète — bordereau (chiffres, alphanumériques,
        dates, montants)
      </h6>
      {isDuplicate && (
        <p className="mb-2 rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
          ⚠️ Unicité violée : bordereau déjà utilisé par une autre candidature
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 text-[0.7rem] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-ink-700">Chiffres détectés</p>
          <p className="mt-1 font-mono text-ink-900 break-all">
            {numbers.slice(0, 8).join(', ') || '—'}
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink-700">Alphanumériques</p>
          <p className="mt-1 font-mono text-ink-900 break-all">
            {alphanumerics.slice(0, 8).join(', ') || '—'}
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink-700">Dates</p>
          <p className="mt-1 font-mono text-ink-900">{dates.join(', ') || '—'}</p>
        </div>
        <div>
          <p className="font-semibold text-ink-700">Montants</p>
          <p className="mt-1 font-mono text-ink-900">{montants.join(', ') || '—'}</p>
        </div>
      </div>
      {candidates.length > 0 && (
        <p className="mt-2 text-[0.7rem] text-ink-500">
          Candidats bordereau :{' '}
          <span className="font-mono font-medium text-ink-700">{candidates.join(', ')}</span>
        </p>
      )}
    </div>
  );
};

const ReleveDetails: React.FC<{ details: Record<string, unknown> }> = ({ details }) => {
  const matieres =
    (details.matieres as
      | Array<{
          matiere: string;
          note: number | null;
          noteRaw: string | null;
          coefficient: number | null;
          coefficientRaw: string | null;
          observation: string | null;
        }>
      | undefined) ?? [];
  const moyenneCalculee = details.moyenneCalculee as number | null | undefined;
  const moyenneExtraite = details.moyenneExtraite as string | null | undefined;
  const estimatedPages = details.estimatedPages as number | undefined;
  const warnings = (details.warnings as string[] | undefined) ?? [];

  if (matieres.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="overflow-hidden rounded-lg border border-ink-200">
        <div className="flex items-center justify-between bg-ink-50 px-3 py-2">
          <h6 className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
            <FileText className="size-3.5" /> Relevé — {matieres.length} matière(s) ·{' '}
            {estimatedPages ? `${estimatedPages} page(s) estimée(s)` : ''} · Moyenne{' '}
            {moyenneCalculee ?? moyenneExtraite ?? '—'}
          </h6>
          {warnings.length > 0 && (
            <span className="text-[0.65rem] text-amber-700">{warnings[0]}</span>
          )}
        </div>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white text-[0.65rem] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Matière</th>
                <th className="px-2 py-2 font-semibold text-center">Note</th>
                <th className="px-2 py-2 font-semibold text-center">Coeff</th>
                <th className="px-3 py-2 font-semibold">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {matieres.map((m, idx) => (
                <tr
                  key={`${m.matiere}-${idx}`}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-ink-50/40'}
                >
                  <td className="px-3 py-2 font-medium text-ink-900">{m.matiere}</td>
                  <td className="px-2 py-2 text-center font-mono font-semibold text-ink-800">
                    {m.note !== null ? m.note.toFixed(2).replace('.00', '') : m.noteRaw || '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-mono text-ink-700">
                    {m.coefficient ?? m.coefficientRaw ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-ink-600">{m.observation || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-brand-50 font-bold">
              <tr>
                <td className="px-3 py-2 text-ink-900">Moyenne</td>
                <td className="px-2 py-2 text-center text-ink-900">
                  {moyenneCalculee !== null && moyenneCalculee !== undefined
                    ? moyenneCalculee.toFixed(2)
                    : moyenneExtraite || '—'}
                </td>
                <td colSpan={2} className="px-3 py-2 text-[0.7rem] font-normal text-ink-600">
                  {moyenneExtraite && moyenneCalculee !== null
                    ? `Extraite: ${moyenneExtraite} · Calculée: ${moyenneCalculee}`
                    : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const Block: React.FC<{
  title: string;
  icon: React.ElementType;
  count?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon: Icon, count, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-ink-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        <span className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-bold text-ink-900">{title}</span>
          {count && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.65rem] font-semibold text-ink-600">
              {count}
            </span>
          )}
        </span>
        <span className="text-ink-400">
          {open ? <Eye className="size-4" /> : <Search className="size-4" />}
        </span>
      </button>
      {open && (
        <div className="border-t border-ink-100 p-3 sm:p-4 space-y-2 bg-ink-50/20">{children}</div>
      )}
    </div>
  );
};

/* --------- Composant principal --------- */

export const AdmissionVerificationSection: React.FC<Props> = ({ admission, hideButton }) => {
  const verifyMutation = useVerifyAdmission();
  const latestQuery = useLatestAdmissionVerification(admission.id);
  const historyQuery = useAdmissionVerifications(admission.id);
  const [showHistory, setShowHistory] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const latest: AdmissionVerification | null | undefined = latestQuery.data;
  const history: AdmissionVerification[] = historyQuery.data ?? [];

  const handleVerify = async (): Promise<void> => {
    setProgressStep(1);
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);
    try {
      await verifyMutation.mutateAsync(admission.id);
      toast.success('Vérification des pièces effectuée');
      await Promise.all([latestQuery.refetch(), historyQuery.refetch()]);
    } catch (error: unknown) {
      console.warn('Échec dans handleVerify — poursuite en mode dégradé', error instanceof Error ? error.message : error);
      const msg = getErrorMessage(error);
      toast.error(msg);
    } finally {
      clearInterval(interval);
      setProgressStep(0);
    }
  };

  const isVerifying = verifyMutation.isPending;

  // Grouper résultats par bloc
  const grouped = useMemo(() => {
    if (!latest) return null;
    const byChamp = new Map(latest.resultats.map((r) => [r.champ, r]));
    return {
      perso: ['nom', 'prenom', 'dateNaissance', 'lieuNaissance']
        .map((k) => byChamp.get(k))
        .filter(Boolean) as VerificationFieldResult[],
      bac: ['numeroBac', 'bacAnnee', 'centreExamen']
        .map((k) => byChamp.get(k))
        .filter(Boolean) as VerificationFieldResult[],
      paiement: ['bordereau']
        .map((k) => byChamp.get(k))
        .filter(Boolean) as VerificationFieldResult[],
      releve: ['releveNotes']
        .map((k) => byChamp.get(k))
        .filter(Boolean) as VerificationFieldResult[],
      autres: latest.resultats.filter(
        (r) =>
          ![
            'nom',
            'prenom',
            'dateNaissance',
            'lieuNaissance',
            'numeroBac',
            'bacAnnee',
            'centreExamen',
            'bordereau',
            'releveNotes',
          ].includes(r.champ)
      ),
    };
  }, [latest]);

  const summary = useMemo(() => {
    if (!latest) return null;
    const counts = { verifie: 0, aVerifier: 0, incoherent: 0, nonTrouve: 0, lectureImpossible: 0 };
    for (const r of latest.resultats) {
      const d = r.details as { lecture?: string } | undefined;
      if (d?.lecture === 'impossible') counts.lectureImpossible++;
      else if (r.statut === 'conforme') counts.verifie++;
      else if (r.statut === 'a_verifier') counts.aVerifier++;
      else if (r.statut === 'non_conforme') counts.incoherent++;
      else counts.nonTrouve++;
    }
    return counts;
  }, [latest]);

  return (
    <div className="rounded-2xl border border-brand-100 bg-white shadow-sm">
      {!hideButton && (
        <div className="flex flex-col gap-3 border-b border-ink-100 bg-brand-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white shadow-sm"
              aria-hidden="true"
            >
              <ScanSearch className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-tight text-ink-900">
                Vérification des pièces
              </h3>
              <p className="text-xs leading-snug text-ink-500">
                Contrôle automatique : identité, date/lieu, BAC, bordereau (unicité), relevé
                complet. Tolérant aux accents/casse, strict sur les incohérences.
              </p>
            </div>
          </div>
          <Button
            onClick={() => void handleVerify()}
            disabled={isVerifying}
            className="w-full gap-2 bg-brand-700 hover:bg-brand-800 sm:w-auto shrink-0"
          >
            {isVerifying ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {isVerifying ? 'Vérification…' : 'Vérifier les pièces'}
          </Button>
        </div>
      )}

      <div className="space-y-4 p-4 sm:p-5">
        {isVerifying && (
          <div
            className="rounded-xl border border-brand-200 bg-brand-50 p-4"
            role="status"
            aria-live="polite"
            aria-label="Analyse en cours"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-800">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Analyse des documents…
            </p>
            <ol className="space-y-2" aria-label="Étapes de vérification">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const active = progressStep === step.id;
                const done = progressStep > step.id;
                const stepClass = getStepClasses(active, done);
                const iconClass = getStepIconClasses(active, done);
                return (
                  <li
                    key={step.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${stepClass}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${iconClass}`}
                      aria-hidden="true"
                    >
                      {done ? <CheckCircle className="size-4" /> : <Icon className="size-3.5" />}
                    </span>
                    <span className="flex-1 font-medium">
                      {step.id}. {step.label}
                    </span>
                    {active && (
                      <LoaderCircle
                        className="size-4 animate-spin text-brand-600"
                        aria-hidden="true"
                      />
                    )}
                    {done && <CheckCircle className="size-4 text-emerald-600" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {latestQuery.isLoading && !isVerifying && (
          <div
            className="flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-500"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Chargement de la
            dernière vérification…
          </div>
        )}

        {latest && !isVerifying && (
          <div className="space-y-4">
            {/* En-tête global */}
            <div
              className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${globalMeta(latest.statut).border} ${globalMeta(latest.statut).bg}`}
            >
              <ScoreCircle score={latest.score} statut={latest.statut} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={globalMeta(latest.statut).badge}
                    className="gap-1.5 text-xs font-bold"
                  >
                    {React.createElement(globalMeta(latest.statut).icon, {
                      className: 'size-3.5',
                      'aria-hidden': true,
                    } as unknown as Record<string, unknown>)}
                    {globalMeta(latest.statut).label}
                  </Badge>
                  <span className="text-xs text-ink-500">
                    Vérifié le {formatDateTimeLong(latest.creeLe)} par{' '}
                    {latest.adminEmail || (latest.adminId ? `admin #${latest.adminId}` : 'système')}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-900">
                  Score : {latest.score}% — Statut : {globalMeta(latest.statut).label}
                </p>
                <p className="text-xs leading-snug text-ink-600">
                  {globalMeta(latest.statut).desc}
                </p>
                {summary && (
                  <p className="mt-1 flex flex-wrap gap-1.5 text-[0.7rem] font-medium">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-emerald-700">
                      <CheckCircle className="size-3" /> {summary.verifie} vérifié(s)
                    </span>
                    {summary.aVerifier > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-amber-700">
                        <AlertTriangle className="size-3" /> {summary.aVerifier} à vérifier
                      </span>
                    )}
                    {summary.incoherent > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-red-700">
                        <XCircle className="size-3" /> {summary.incoherent} incohérent(s)
                      </span>
                    )}
                    {summary.nonTrouve > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-slate-600">
                        <CircleHelp className="size-3" /> {summary.nonTrouve} non trouvé(s)
                      </span>
                    )}
                    {summary.lectureImpossible > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-slate-600">
                        <ScanSearch className="size-3" /> {summary.lectureImpossible} lecture
                        impossible
                      </span>
                    )}
                  </p>
                )}
                {latest.dureeMs !== null && latest.dureeMs !== undefined && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
                    <Calendar className="size-3" aria-hidden="true" /> Durée : {latest.dureeMs} ms ·{' '}
                    {latest.documentsAnalyses.length} document(s) analysé(s)
                  </p>
                )}
                {latest.erreurs && latest.erreurs.length > 0 && (
                  <div className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs text-amber-800">
                    <p className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="size-3.5" /> Anomalies OCR / extraction :
                    </p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {latest.erreurs.map((e: string) => (
                        <li key={e} className="break-all">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau synthétique Valeur saisie → Détectée → Résultat */}
            <div className="overflow-hidden rounded-xl border border-ink-100">
              <div className="bg-ink-50 px-4 py-2.5">
                <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-600">
                  <Info className="size-3.5" /> Synthèse — Valeur saisie → Valeur détectée →
                  Résultat
                </h5>
                <p className="text-[0.65rem] text-ink-400">
                  Chaque ligne compare la saisie candidature avec le texte extrait (OCR) ; la
                  confiance reflète la qualité d’extraction.
                </p>
              </div>
              <div className="divide-y divide-ink-100">
                <div className="hidden grid-cols-12 gap-2 bg-white px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-400 sm:grid">
                  <span className="col-span-3">Élément</span>
                  <span className="col-span-3">Saisie</span>
                  <span className="col-span-3">Détectée (OCR)</span>
                  <span className="col-span-2">Résultat</span>
                  <span className="col-span-1 text-right">Confiance</span>
                </div>
                {latest.resultats.map((r: VerificationFieldResult) => {
                  const fm = fieldMeta(r.statut, r.details as Record<string, unknown> | undefined);
                  const FIcon = fm.icon;
                  return (
                    <div
                      key={r.champ}
                      className="grid grid-cols-1 gap-1 px-4 py-3 text-xs sm:grid-cols-12 sm:items-center sm:gap-2"
                    >
                      <span className="font-semibold text-ink-900 sm:col-span-3 flex items-center gap-1.5">
                        <FIcon className={`size-3.5 shrink-0 ${fm.color}`} aria-hidden="true" />
                        {r.label}
                      </span>
                      <span className="font-mono text-ink-700 break-all sm:col-span-3 bg-ink-50 rounded px-1.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
                        <span className="sm:hidden text-[0.65rem] font-sans font-semibold text-ink-400 uppercase mr-1">
                          Saisie:
                        </span>
                        {r.valeurSaisie || '—'}
                      </span>
                      <span className="font-mono text-ink-700 break-all sm:col-span-3 bg-ink-50 rounded px-1.5 py-1 sm:bg-transparent sm:px-0 sm:py-0">
                        <span className="sm:hidden text-[0.65rem] font-sans font-semibold text-ink-400 uppercase mr-1">
                          Détectée:
                        </span>
                        {r.valeurExtraite || '—'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold sm:col-span-2 ${fm.color}`}
                      >
                        {fm.badgeLabel}
                      </span>
                      <span className="flex items-center gap-2 sm:col-span-1 sm:justify-end">
                        <span className="h-1.5 flex-1 max-w-[80px] overflow-hidden rounded-full bg-ink-100 sm:hidden">
                          <span
                            className="block h-full bg-brand-600"
                            style={{ width: `${Math.round(r.confiance * 100)}%` }}
                          />
                        </span>
                        <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-ink-100 sm:block">
                          <span
                            className="block h-full bg-brand-600"
                            style={{ width: `${Math.round(r.confiance * 100)}%` }}
                          />
                        </span>
                        <span className="text-xs font-medium text-ink-700">
                          {Math.round(r.confiance * 100)}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blocs détaillés */}
            <div className="grid grid-cols-1 gap-3">
              {grouped && grouped.perso.length > 0 && (
                <Block
                  title="Infos personnelles"
                  icon={Calendar}
                  count={`${grouped.perso.length} champs`}
                >
                  <div className="space-y-2">
                    {grouped.perso.map((r) => {
                      let icon: React.ElementType | undefined;
                      if (r.champ === 'lieuNaissance') icon = MapPin;
                      if (r.champ === 'dateNaissance') icon = Calendar;
                      return <FieldRow key={r.champ} result={r} icon={icon} />;
                    })}
                  </div>
                </Block>
              )}

              {grouped && grouped.bac.length > 0 && (
                <Block title="BAC" icon={GraduationCap} count={`${grouped.bac.length} champs`}>
                  <div className="space-y-2">
                    {grouped.bac.map((r) => (
                      <FieldRow key={r.champ} result={r} icon={GraduationCap} />
                    ))}
                  </div>
                </Block>
              )}

              {grouped && grouped.paiement.length > 0 && (
                <Block
                  title="Paiement — Bordereau"
                  icon={Receipt}
                  count={`${grouped.paiement.length} champ`}
                >
                  <div className="space-y-2">
                    {grouped.paiement.map((r) => (
                      <FieldRow key={r.champ} result={r} icon={Receipt} />
                    ))}
                  </div>
                  <p className="flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[0.7rem] leading-snug text-slate-600">
                    <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    Unicité stricte : un même numéro de bordereau ne peut servir qu’à une seule
                    candidature. Le système extrait tous les chiffres/alphanumériques, dates et
                    montants du document pour fiabiliser la détection.
                  </p>
                </Block>
              )}

              {grouped && grouped.releve.length > 0 && (
                <Block
                  title="Relevé de notes"
                  icon={FileText}
                  count={`${grouped.releve.length} champ`}
                >
                  <div className="space-y-2">
                    {grouped.releve.map((r) => (
                      <FieldRow key={r.champ} result={r} icon={FileText} />
                    ))}
                  </div>
                </Block>
              )}

              {grouped && grouped.autres.length > 0 && (
                <Block
                  title="Autres vérifications"
                  icon={FileSearch}
                  count={`${grouped.autres.length} champ`}
                >
                  <div className="space-y-2">
                    {grouped.autres.map((r) => (
                      <FieldRow key={r.champ} result={r} />
                    ))}
                  </div>
                </Block>
              )}
            </div>
          </div>
        )}

        {!latest && !latestQuery.isLoading && !isVerifying && (
          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-4 py-8 text-center">
            <ScanSearch className="mx-auto mb-2 size-8 text-ink-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink-700">Aucune vérification effectuée</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-snug text-ink-500">
              Cliquez sur <strong>« Vérifier les pièces »</strong> pour lancer l’analyse automatique
              : identification des documents, extraction (PDF natif → OCR), comparaison tolérante
              (accents/casse) mais stricte sur les incohérences, génération du score.
            </p>
            <ul className="mx-auto mt-3 max-w-md list-disc list-inside text-left text-xs text-ink-500">
              <li>Infos personnelles (date/lieu avec formats multiples)</li>
              <li>BAC (numéro, année 4 chiffres, centre)</li>
              <li>Bordereau complet (chiffres, refs, dates, montants — unicité)</li>
              <li>Relevé détaillé (toutes matières, coeffs, moyenne fiable)</li>
            </ul>
          </div>
        )}

        {/* Historique */}
        <div className="border-t border-ink-100 pt-4">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            aria-controls="verification-history"
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="flex items-center gap-2">
              <Calendar className="size-4" aria-hidden="true" /> Historique des vérifications (
              {history.length})
            </span>
            <span className="flex items-center gap-1 text-xs font-normal text-ink-400">
              {showHistory ? 'Masquer' : 'Afficher'}{' '}
              {showHistory ? <Eye className="size-3" /> : <Search className="size-3" />}
            </span>
          </button>
          {showHistory && (
            <div id="verification-history" className="mt-3 space-y-2">
              {history.length === 0 ? (
                <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">
                  Aucun historique.
                </p>
              ) : (
                history.map((v: AdmissionVerification) => {
                  const m = globalMeta(v.statut);
                  const Icon = m.icon;
                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink-900">
                          <Badge variant={m.badge} className="gap-1 text-[0.65rem]">
                            <Icon className="size-3" aria-hidden="true" /> {m.short}
                          </Badge>
                          <span className="font-bold">{v.score}%</span>
                          <span className="hidden text-xs font-normal text-ink-400 sm:inline">
                            · {formatDateTimeLong(v.creeLe)}
                          </span>
                          <span className="sm:hidden text-xs font-normal text-ink-400">
                            {formatDateLong(v.creeLe)}
                          </span>
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {v.adminEmail || (v.adminId ? `admin #${v.adminId}` : 'système')} ·{' '}
                          {v.documentsAnalyses.length} doc(s) · {v.dureeMs ? `${v.dureeMs} ms` : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 gap-1 text-[0.65rem]">
                        <FileText className="size-3" aria-hidden="true" /> {v.resultats.length}{' '}
                        champs
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-snug text-amber-900">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Ne jamais présenter une déduction OCR incertaine comme vérité absolue. Les résultats « À
            vérifier », « Non trouvé » ou « Lecture impossible » nécessitent une vérification
            manuelle. La tolérance porte sur casse/accents/espaces et formats de dates, pas sur les
            incohérences réelles.
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdmissionVerificationSection;
