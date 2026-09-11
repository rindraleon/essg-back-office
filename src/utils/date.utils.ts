
const TIMEZONE = 'Indian/Antananarivo';
const LOCALE = 'fr-FR';

const MOIS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export type DateInput = string | Date | number | null | undefined;

function parseDate(input: DateInput): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/** Court : 09/09/2026 */
export function formatDateCourt(input: DateInput): string {
  const d = parseDate(input);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/** Long : 9 septembre 2026 — jour sans zéro, mois français */
export function formatDateLong(input: DateInput): string {
  const d = parseDate(input);
  if (!d) return '—';
  const day = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, day: 'numeric' }).format(d);
  const monthIndex = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, month: 'numeric' }).format(d),
    10
  );
  const year = new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, year: 'numeric' }).format(d);
  const mois = MOIS_FR[monthIndex - 1] || '';
  return `${day} ${mois} ${year}`;
}

/** Alias historique : formatDate → long pour compat */
export function formatDate(dateString: string): string {
  return formatDateLong(dateString);
}

/** Datetime court : 09/09/2026 14:30 */
export function formatDateTimeCourt(input: DateInput): string {
  const d = parseDate(input);
  if (!d) return '—';
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Datetime long : 9 septembre 2026 à 14:30 */
export function formatDateTimeLong(input: DateInput): string {
  const d = parseDate(input);
  if (!d) return '—';
  const datePart = formatDateLong(d);
  const timePart = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return `${datePart} à ${timePart}`;
}

/** Pour comparaisons : ISO YYYY-MM-DD en timezone Antananarivo */
export function formatDateISO(input: DateInput): string | null {
  const d = parseDate(input);
  if (!d) return null;
  const y = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric' }).format(d);
  const m = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, month: '2-digit' }).format(d);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, day: '2-digit' }).format(d);
  return `${y}-${m}-${day}`;
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = parseDate(dateString);
  if (!date) return '—';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'à l’instant';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return formatDateLong(dateString);
}
