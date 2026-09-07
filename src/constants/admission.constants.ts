export const ADMISSION_PARCOURS = [
  'Géomatique et Télédétection',
  'Géomatique et Géologie économique',
  'Géomatique et Agriculture durable',
  'Géomatique, Écosystèmes terrestres et aquatiques',
  'Géomatique, Communication et Marketing',
  'Géomatique, Genre, Inclusion et Développement durable',
] as const;

export const BAC_TYPE_LABELS: Record<string, string> = {
  general: 'Baccalauréat Général',
  technologique: 'Baccalauréat Technique / Technologique',
};

export const BAC_SERIES: Record<string, readonly string[]> = {
  general: ['a1', 'a2', 'c', 'd', 'l', 's', 'ose'],
  technologique: ['tgc', 'tgi', 'tter'],
};

export const BAC_SERIE_LABELS: Record<string, string> = {
  a1: 'Série A1',
  a2: 'Série A2',
  c: 'Série C',
  d: 'Série D',
  l: 'Série L',
  s: 'Série S',
  ose: 'Série OSE',
  tgc: 'TGC — Génie Civil',
  tgi: 'TGI — Industriel',
  tter: 'TTER — Tertiaire',
};

export const formatBacType = (type?: string | null): string =>
  (type && (BAC_TYPE_LABELS[type.toLowerCase()] ?? type)) || '—';

export const formatBacSerie = (serie?: string | null): string =>
  (serie && (BAC_SERIE_LABELS[serie.toLowerCase()] ?? serie)) || '—';
