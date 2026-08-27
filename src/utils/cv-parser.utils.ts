export interface ParsedExperience {
  poste: string;
  organisation?: string;
  periode?: string;
}

export interface ParsedCv {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  poste?: string;
  description?: string;
  experiences: ParsedExperience[];
  formations: string[];
  diplomes: string[];
  competences: string[];
  langues: string[];
  texteBrut: string;
  confiance: number;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/;

const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{2,3}(?:[\s.-]?\d{2,3}){2,4}/;

const LANGUES_CONNUES = [
  'français',
  'francais',
  'anglais',
  'malagasy',
  'malgache',
  'espagnol',
  'allemand',
  'italien',
  'portugais',
  'chinois',
  'arabe',
  'russe',
  'japonais',
];

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience:
    /^(experiences?|experiences? (professionnelles?|pro)|parcours( professionnel)?|emplois?|work experience|employment)\b/,
  formation:
    /^(formations?|parcours academique|etudes|scolarite|cursus|education|academic background)\b/,
  diplome: /^(diplomes?|titres? et diplomes?|certifications?|certificats?|qualifications?)\b/,
  competence:
    /^(competences?( techniques?| cles)?|savoir[- ]faire|skills|aptitudes|expertises?|technologies)\b/,
  langue: /^(langues?( parlees?| vivantes?)?|linguistique|languages)\b(?! de )/,
  contact: /^(contacts?|coordonnees|informations? personnelles?|etat civil)\b/,
  interet:
    /^(?:centres? d['’]?interets?|interets?|loisirs|hobbies|divers|interests?|qualites?|soft skills|activites?)\b/,
  profil:
    /^(profils?( professionnel)?|a propos( de moi)?|presentation|resume|objectifs?( professionnels?)?|profile|about( me)?|summary|career objective)\b/,
};

function repairSplitEmails(text: string): string {
  return text
    .replace(/([\w.+-]+@[\w-]*)\s+([\w-]*\.[a-z]{2,})/gi, (match, head: string, tail: string) => {
      const candidate = `${head}${tail}`;
      return EMAIL_RE.test(candidate) ? candidate : match;
    })
    .replace(/([\w.+-]+)\s*@\s*([\w-]+\.[\w.-]{2,})/g, '$1@$2');
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchSection(line: string): string | null {
  const cleaned = normalize(line)
    .replace(/[:•\-–—_*]+$/g, '')
    .trim();

  if (cleaned.length === 0 || cleaned.length > 45) return null;

  if (/[,;|]|\s[-–—]\s|\d/.test(cleaned)) return null;

  if (cleaned.split(/\s+/).length > 4) return null;

  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(cleaned)) return section;
  }
  return null;
}

function stripBullet(line: string): string {
  return line.replace(/^\s*(?:[•▪◦*\-–—]|\d+[.)])\s*/, '').trim();
}

function splitInline(value: string): string[] {
  return value
    .split(/[,;•|]|\s{3,}/)
    .map((item) => item.trim().replace(/[.:]+$/, ''))
    .filter((item) => item.length >= 1 && item.length <= 80);
}

function looksLikeName(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 60) return false;
  if (EMAIL_RE.test(trimmed) || /\d/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  return words.every((word) => /^[A-ZÀ-Ý][\w'À-ÿ-]*$/.test(word) || /^[A-ZÀ-Ý'-]{2,}$/.test(word));
}

function extractTelephone(lines: string[]): string | undefined {
  for (const line of lines) {
    const isPhoneLine =
      /t[ée]l|phone|mobile|portable|gsm|contact/i.test(line) ||
      line.length <= 30 ||
      EMAIL_RE.test(line);
    if (!isPhoneLine) continue;

    const candidate = PHONE_RE.exec(line.replace(EMAIL_RE, ' '))?.[0]?.trim();
    if (candidate && candidate.replace(/\D/g, '').length >= 8) {
      return candidate;
    }
  }
  return undefined;
}

function extractAdresse(lines: string[]): string | undefined {
  const line = lines.find((item) =>
    /\b(adresse|lot\s|rue|avenue|villa|appartement|bp\s|antananarivo|madagascar)\b/i.test(item)
  );
  return line
    ?.replace(/^adresse\s*:?\s*/i, '')
    .trim()
    .slice(0, 300);
}

function extractIdentite(lines: string[]): { nom?: string; prenom?: string } {
  const explicitNom = lines.find((line) => /^nom\s*:/i.test(line));
  const explicitPrenom = lines.find((line) => /^pr[ée]noms?\s*:/i.test(line));

  let nom = explicitNom?.split(':')[1]?.trim();
  let prenom = explicitPrenom?.split(':')[1]?.trim();

  if (nom && prenom) return { nom, prenom };

  const header = lines.slice(0, 8);
  const nameIndex = header.findIndex(looksLikeName);
  if (nameIndex < 0) return { nom, prenom };

  let nameLine = header[nameIndex];

  const next = header[nameIndex + 1];
  const isNameOverflow =
    next !== undefined &&
    next.length <= 24 &&
    !/\d/.test(next) &&
    !EMAIL_RE.test(next) &&
    matchSection(next) === null &&
    next.split(/\s+/).length <= 2 &&
    next.split(/\s+/).every((word) => /^[A-ZÀ-Ý][\w'À-ÿ-]*$/.test(word)) &&
    next !== next.toUpperCase();

  if (isNameOverflow) nameLine = `${nameLine} ${next}`;

  const words = nameLine.trim().split(/\s+/);
  const upper = words.filter((word) => word === word.toUpperCase() && word.length > 1);
  const others = words.filter((word) => !upper.includes(word));

  if (upper.length > 0 && others.length > 0) {
    nom ??= upper.join(' ');
    prenom ??= others.join(' ');
  } else {
    prenom ??= words[0];
    nom ??= words.slice(1).join(' ');
  }

  return { nom, prenom };
}

function extractPoste(lines: string[]): string | undefined {
  const explicit = lines.find((line) =>
    /^(poste(\s+(recherch[ée]|actuel|vis[ée]))?|fonction|titre|intitul[ée])\s*:/i.test(line)
  );
  if (explicit) return explicit.split(':')[1]?.trim();

  const headerLines = lines.slice(0, 8);
  const nameIndex = headerLines.findIndex(looksLikeName);
  if (nameIndex < 0) return undefined;

  const { nom, prenom } = extractIdentite(lines);
  const nameWords = new Set(`${nom ?? ''} ${prenom ?? ''}`.trim().split(/\s+/).filter(Boolean));

  for (const candidate of headerLines.slice(nameIndex + 1)) {
    if (!candidate || EMAIL_RE.test(candidate) || candidate.length > 70) continue;
    if (matchSection(candidate)) break;
    const words = candidate.split(/\s+/);
    if (words.every((word) => nameWords.has(word))) continue;
    return candidate;
  }

  const upperTitle = lines.find((line) => {
    if (line.length < 6 || line.length > 45) return false;
    if (/\d/.test(line) || EMAIL_RE.test(line)) return false;
    if (matchSection(line)) return false;
    if (line !== line.toUpperCase()) return false;
    const words = line.split(/\s+/);
    return words.length >= 2 && words.length <= 5 && !words.some((word) => nameWords.has(word));
  });

  return upperTitle;
}

const ORGANISATION_RE =
  /^(?:entreprise|societe|société|employeur|organisation|structure)\s*:\s*(.+)$/i;

const PERIODE_RE = /^(?:p[ée]riode|dates?|dur[ée]e)\s*:\s*(.+)$/i;

const MOIS =
  'janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre';
const DATE_POINT = `(?:\\d{2}/)?(?:${MOIS})?\\s*\\d{4}`;
const ANNEE_SCOLAIRE_RE = /\b(20\d{2})\s*[/–—-]\s*(\d{2}|20\d{2})\b/;
const DATE_FIN = `${DATE_POINT}|aujourd'?hui|pr[ée]sent|actuel(?:lement)?`;

const PLAGE_DATES_RE = new RegExp(
  `${DATE_POINT}\\s*(?:[-–—à]|jusqu'?[àa])\\s*(?:${DATE_FIN})`,
  'i'
);

function isDetailLine(line: string): boolean {
  if (/^\s*[•▪◦*\-–—]\s+/.test(line)) return true;
  if (/^(stack|technologies?|outils?|environnement|langages?)\s*:/i.test(line)) return true;
  if (line.length > 70) return true;
  if (/[.;,]$/.test(line)) return true;
  if (/^[a-zà-ÿ]/.test(line)) return true;
  if (
    /^(gestion|suivi|mise à jour|[ée]laboration|supervision|conduite|r[ée]daction|pilotage|animation|organisation)\b/i.test(
      line
    ) &&
    line.length > 45
  ) {
    return true;
  }
  if (
    /^(d[ée]veloppement|conception|cr[ée]ation|r[ée]alisation|impl[ée]mentation|mise en (place|œuvre|oeuvre)|participation|analyse|maintenance|int[ée]gration|automatisation|migration|d[ée]ploiement)\b/i.test(
      line
    ) &&
    line.length > 40
  ) {
    return true;
  }
  return false;
}

function parseExperienceBlock(lines: string[]): ParsedExperience[] {
  const experiences: ParsedExperience[] = [];
  let current: ParsedExperience | null = null;

  const flush = () => {
    if (current && current.poste.length >= 3) experiences.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const organisation = ORGANISATION_RE.exec(line)?.[1]?.trim();
    if (organisation && current) {
      current.organisation = organisation.slice(0, 150);
      continue;
    }

    const periodeLabel = PERIODE_RE.exec(line)?.[1]?.trim();
    if (periodeLabel && current) {
      current.periode = periodeLabel.slice(0, 60);
      continue;
    }

    const periode = PLAGE_DATES_RE.exec(line)?.[0]?.trim();
    if (periode) {
      const reste = line
        .replace(periode, '')
        .replace(/^[\s:,–—-]+/, '')
        .trim();
      if (reste.length >= 3) {
        flush();
        const parts = reste.split(/\s*[–—|]\s*|\s*[-:]\s+/).filter(Boolean);
        current = {
          poste: (parts[0] ?? reste).slice(0, 150),
          organisation: parts[1]?.trim().slice(0, 150),
          periode: periode.slice(0, 60),
        };
        flush();
      } else if (current) {
        current.periode = periode.slice(0, 60);
      }
      continue;
    }

    if (isDetailLine(line)) continue;

    const contexte = current as ParsedExperience | null;
    if (contexte && !contexte.organisation && line.length <= 70) {
      const segments = line.split(/\s*[–—|]\s*|\s*[-:]\s+/).filter(Boolean);
      contexte.organisation = (segments.at(-1) ?? line).trim().slice(0, 150);
      continue;
    }

    flush();
    const parts = line.split(/\s*[–—|]\s*|\s*[-:]\s+/).filter(Boolean);
    const anneeScolaire = ANNEE_SCOLAIRE_RE.exec(line)?.[0];
    current = {
      poste: (parts[0] ?? line).replace(/^[:,\s]+/, '').slice(0, 150),
      organisation: parts[1]?.trim().slice(0, 150),
      periode: anneeScolaire,
    };
  }

  flush();
  return experiences;
}

function collectFormationLine(result: ParsedCv, content: string): void {
  if (content.length < 4) return;

  if (isDetailLine(content)) return;

  const etiquette = /^(?:[ée]tablissement|ann[ée]e|obtenu(?:e)?\s+en|dipl[ôo]me)\s*:\s*(.+)$/i.exec(
    content
  );
  const etablissementSeul =
    /^(?:universit[ée]|[ée]cole|institut|lyc[ée]e|facult[ée]|centre)\b/i.test(content);

  const precedente = result.formations.at(-1);
  const dejaQualifiee =
    precedente !== undefined && precedente.split('—').length > (etiquette ? 2 : 1);

  if (precedente && (etiquette || etablissementSeul) && !dejaQualifiee) {
    const complement = etiquette ? etiquette[1].trim() : content;
    result.formations[result.formations.length - 1] = `${precedente} — ${complement}`.slice(0, 200);
    return;
  }

  if (precedente && etiquette && dejaQualifiee) {
    result.formations[result.formations.length - 1] =
      `${precedente} — ${etiquette[1].trim()}`.slice(0, 200);
    return;
  }

  result.formations.push(content.slice(0, 200));
}

function extractCompetences(content: string): string[] {
  if (/^(.{2,40}?)\s*:\s*$/.test(content)) return [];
  const withValues = /^(.{2,40}?)\s*:\s*(.+)$/.exec(content);
  return splitInline(withValues ? withValues[2] : content);
}

function collectSectionLine(
  result: ParsedCv,
  section: string,
  content: string,
  buffer: string[],
  descriptionBuffer: string[]
): void {
  switch (section) {
    case 'profil':
      descriptionBuffer.push(content);
      break;
    case 'experience':
      buffer.push(content);
      break;
    case 'formation':
      collectFormationLine(result, content);
      break;
    case 'diplome':
      if (content.length >= 3) result.diplomes.push(content.slice(0, 200));
      break;
    case 'competence':
      result.competences.push(...extractCompetences(content));
      break;
    case 'langue': {
      const values = splitInline(content).map((item) => item.split(/\s*:\s*/)[0].trim());
      const known = values.filter((item) =>
        LANGUES_CONNUES.some((langue) => normalize(item).includes(langue))
      );
      result.langues.push(...known);
      break;
    }
    default:
      break;
  }
}

function buildDescription(sectionLines: string[], allLines: string[]): string | undefined {
  const fromSection = sectionLines.join(' ').replace(/\s+/g, ' ').trim();
  if (fromSection.length >= 40) return fromSection.slice(0, 2000);

  const header = allLines.slice(0, 14);
  const sentences: string[] = [];
  for (const line of header) {
    if (matchSection(line)) break;
    const isPresentation =
      line.length >= 60 &&
      /\b(je suis|je me|passionn|sp[ée]cialis[ée]|dipl[ôo]m[ée]|exp[ée]rience|motiv[ée]|professionnel(le)?\s+d)/i.test(
        line
      );
    if (isPresentation) sentences.push(line);
    else if (sentences.length > 0) break;
  }

  const fallback = sentences.join(' ').replace(/\s+/g, ' ').trim();
  return fallback.length >= 40 ? fallback.slice(0, 2000) : undefined;
}

function mergeFormationLines(items: string[]): string[] {
  const ANNEE_SEULE =
    /^\(?\s*\d{4}\s*(?:[–—-]\s*(?:\d{2,4}|en cours))?\s*\)?(?:\s*\(?\s*en cours\s*\)?)?$/i;
  const ETABLISSEMENT = /^(?:eni\b|universit[ée]|[ée]cole|institut|lyc[ée]e|facult[ée]|centre)\b/i;
  const DIPLOME =
    /\b(licence|master|doctorat|dut|bts|dts|baccalaur[ée]at|ing[ée]nieur|mast[èe]re|dipl[ôo]me)\b/i;

  const merged: string[] = [];
  let pendingYear: string | null = null;

  for (const item of items) {
    const value = item.trim();
    if (!value) continue;

    if (ANNEE_SEULE.test(value)) {
      pendingYear = value.replace(/^\((.*)\)$/, '$1').trim();
      continue;
    }

    const previous = merged.at(-1);
    if (
      previous &&
      DIPLOME.test(value) &&
      !DIPLOME.test(previous) &&
      ETABLISSEMENT.test(previous)
    ) {
      merged[merged.length - 1] = `${value} — ${previous}`.slice(0, 200);
      continue;
    }

    if (pendingYear) {
      merged.push(`${value} — ${pendingYear}`.slice(0, 200));
      pendingYear = null;
    } else {
      merged.push(value);
    }
  }

  if (pendingYear) merged.push(pendingYear);
  return merged;
}

function isUnknownHeading(line: string): boolean {
  if (line.length < 6 || line.length > 40) return false;
  if (line !== line.toUpperCase()) return false;
  if (!/[A-ZÀ-Ý]/.test(line)) return false;
  if (/[.,;:!?/+]/.test(line)) return false;

  const words = line.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  return words.every((word) => word.length >= 2);
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function computeConfiance(result: ParsedCv): number {
  const checks = [
    Boolean(result.nom),
    Boolean(result.prenom),
    Boolean(result.email),
    Boolean(result.telephone),
    result.experiences.length > 0,
    result.formations.length > 0 || result.diplomes.length > 0,
    result.competences.length > 0,
  ];
  return checks.filter(Boolean).length / checks.length;
}

export function parseCvText(rawText: string): ParsedCv {
  const texteBrut = repairSplitEmails(
    rawText.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ')
  ).trim();
  const rawLines = texteBrut
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const lines: string[] = [];
  for (const line of rawLines) {
    const previous = lines.at(-1);
    const isContinuation =
      previous !== undefined &&
      /^[a-zà-ÿ(]/.test(line) &&
      !/[.:;!?]$/.test(previous) &&
      !matchSection(line) &&
      !EMAIL_RE.test(line) &&
      !PHONE_RE.test(line) &&
      !/^[\w\s]{3,20}\s*:/.test(line);

    if (isContinuation) {
      lines[lines.length - 1] = `${previous} ${line}`;
    } else {
      lines.push(line);
    }
  }

  const result: ParsedCv = {
    experiences: [],
    formations: [],
    diplomes: [],
    competences: [],
    langues: [],
    texteBrut,
    confiance: 0,
  };

  result.email = EMAIL_RE.exec(texteBrut)?.[0]?.toLowerCase();
  result.telephone = extractTelephone(lines);
  result.adresse = extractAdresse(lines);

  const { nom, prenom } = extractIdentite(lines);
  result.nom = nom;
  result.prenom = prenom;
  result.poste = extractPoste(lines);

  const experienceLines: string[] = [];
  const descriptionLines: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    const section = matchSection(line);
    if (section) {
      current = section;
      continue;
    }

    if (current !== null && isUnknownHeading(line)) {
      current = null;
      continue;
    }

    if (!current) continue;

    const content = current === 'experience' ? line : stripBullet(line);
    if (content.length >= 2) {
      collectSectionLine(result, current, content, experienceLines, descriptionLines);
    }
  }

  result.experiences = parseExperienceBlock(experienceLines);
  result.description = buildDescription(descriptionLines, lines);

  if (result.langues.length === 0) {
    const normalized = normalize(texteBrut);
    result.langues = LANGUES_CONNUES.filter((langue) => normalized.includes(langue)).map(
      (langue) => langue.charAt(0).toUpperCase() + langue.slice(1)
    );
  }

  result.formations = dedupe(mergeFormationLines(result.formations)).slice(0, 20);
  result.diplomes = dedupe(result.diplomes).slice(0, 20);
  result.competences = dedupe(result.competences).slice(0, 40);
  result.langues = dedupe(result.langues).slice(0, 10);
  result.experiences = result.experiences.slice(0, 20);
  result.confiance = computeConfiance(result);

  return result;
}
