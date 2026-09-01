export interface FormationMention {
  code: string;
  label: string;
  titres: string[];
}

export const FORMATION_MENTIONS: FormationMention[] = [
  {
    code: 'geomatique-et-applications',
    label: 'GÉOMATIQUE ET APPLICATIONS',
    titres: [
      'Géomatique et agriculture durable',
      'Géomatique et santé',
      'Géomatique, ressources naturelles et assainissement',
      'Cartographie numérique et développement',
    ],
  },
  {
    code: 'geomatique-et-management',
    label: 'GÉOMATIQUE ET MANAGEMENT',
    titres: [
      "Géomatique pour l'équité-genre",
      'Géomatique et économie',
      'Géomatique et bonne gouvernance',
      'Géomatique, communication et marketing',
      'Géo-entreprenariat',
    ],
  },
  {
    code: 'informatique-et-donnees-spatiales',
    label: 'INFORMATIQUE ET DONNÉES SPATIALES',
    titres: [
      "Système d'Information Géomatique et Décision",
      "Ingénierie Géospatiale et Technologie d'Informations",
      'Géomatique et Intelligence Artificielle',
      'Télédétection et SIG',
    ],
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findMention(
  value: string | undefined | null,
  mentions: FormationMention[] = FORMATION_MENTIONS
): FormationMention | undefined {
  if (!value) return undefined;
  const needle = normalize(value);
  return mentions.find(
    (mention) => normalize(mention.label) === needle || normalize(mention.code) === needle
  );
}

export function findMentionByTitre(
  titre: string | undefined | null,
  mentions: FormationMention[] = FORMATION_MENTIONS
): FormationMention | undefined {
  if (!titre) return undefined;
  const needle = normalize(titre);
  return mentions.find((mention) => mention.titres.some((item) => normalize(item) === needle));
}

export function getTitreOptions(
  mentionValue: string | undefined | null,
  mentions: FormationMention[] = FORMATION_MENTIONS
): { value: string; label: string }[] {
  const mention = findMention(mentionValue, mentions);
  if (!mention) return [];
  return mention.titres.map((titre) => ({ value: titre, label: titre }));
}

export function isTitreInMention(
  mentionValue: string | undefined | null,
  titre: string | undefined | null,
  mentions: FormationMention[] = FORMATION_MENTIONS
): boolean {
  const mention = findMention(mentionValue, mentions);
  if (!mention || !titre) return false;
  const needle = normalize(titre);
  return mention.titres.some((item) => normalize(item) === needle);
}

export const NIVEAU_OPTIONS = [
  { label: 'Licence', value: 'Licence' },
  { label: 'Master', value: 'Master' },
  { label: 'Doctorat', value: 'Doctorat' },
];

export const DUREE_OPTIONS = [
  { label: '2 ans', value: '2 ans' },
  { label: '3 ans', value: '3 ans' },
  { label: '5 ans', value: '5 ans' },
];

export const CONDITION_ACCES_OPTIONS = [
  'Baccalauréat série C ou D',
  'Baccalauréat toutes séries',
  'Baccalauréat série scientifique',
  'Licence en géomatique ou équivalent',
  'Licence dans un domaine scientifique',
  'Master 1 validé dans un domaine connexe',
  'Diplôme de niveau Bac +2 (BTS, DTS, DUT)',
  'Dossier de candidature complet',
  'Lettre de motivation',
  'Curriculum vitae détaillé',
  'Relevés de notes des trois dernières années',
  'Entretien de motivation',
  'Test écrit de sélection',
  'Expérience professionnelle de deux ans minimum',
  'Maîtrise du français',
  "Notions d'anglais technique",
  'Bases en informatique',
  'Validation des acquis de l’expérience (VAE)',
];
