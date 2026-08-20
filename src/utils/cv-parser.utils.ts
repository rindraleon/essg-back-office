/**
 * Analyse heuristique d'un CV en texte brut (issu de l'OCR ou d'un PDF texte).
 *
 * L'objectif n'est pas une extraction parfaite mais un **préremplissage** :
 * l'utilisateur vérifie et corrige toujours les données avant enregistrement.
 * Les heuristiques sont pensées pour des CV francophones (sections « Expérience
 * professionnelle », « Formation », « Compétences », « Langues »...).
 */

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
  /**
   * Texte de présentation du candidat, repris tel quel dans le champ
   * « Description » de la fiche. Alimenté par la section « Profil »,
   * « À propos », « Objectif »… du CV lorsqu'elle existe.
   */
  description?: string;
  experiences: ParsedExperience[];
  formations: string[];
  diplomes: string[];
  competences: string[];
  langues: string[];
  /** Texte brut conservé pour alimenter la description et permettre un contrôle. */
  texteBrut: string;
  /** Indice de confiance global (0–1) calculé sur les champs clés trouvés. */
  confiance: number;
}

/* ─────────────────────────── Expressions régulières ─────────────────────────── */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/;

/** Formats malgaches (+261 34 12 345 67) et internationaux courants. */
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{2,3}(?:[\s.-]?\d{2,3}){2,4}/;

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

/** En-têtes de section reconnus, normalisés sans accents. */
/**
 * En-têtes de section reconnus (normalisés : sans accent, en minuscules).
 *
 * Les variantes couvrent les usages francophones courants ainsi que les
 * intitulés anglais fréquents dans les CV du secteur.
 */
const SECTION_PATTERNS: Record<string, RegExp> = {
  experience:
    /^(experiences?|experiences? (professionnelles?|pro)|parcours( professionnel)?|emplois?|work experience|employment)\b/,
  formation:
    /^(formations?|parcours academique|etudes|scolarite|cursus|education|academic background)\b/,
  diplome:
    /^(diplomes?|titres? et diplomes?|certifications?|certificats?|qualifications?)\b/,
  competence:
    /^(competences?( techniques?| cles)?|savoir[- ]faire|skills|aptitudes|expertises?|technologies)\b/,
  /*
    « langues » et « languages » uniquement — jamais « language ».

    Le motif `languages?` acceptait le singulier anglais, si bien que le
    sous-titre « Language de programmation : » (fréquent sur les CV
    d'informaticiens) était pris pour la section « Langues » : toutes les
    compétences techniques qui suivaient basculaient dans le champ Langues,
    et la section Compétences ressortait vide.

    La négation `(?! de )` écarte en outre « Langues de travail : … » suivi
    d'un complément, qui n'est pas un en-tête.
  */
  langue: /^(langues?( parlees?| vivantes?)?|linguistique|languages)\b(?! de )/,
  contact: /^(contacts?|coordonnees|informations? personnelles?|etat civil)\b/,
  interet:
    /^(centres? d.?interets?|interets?|loisirs|hobbies|divers|interests?|qualites?|soft skills|activites?)\b/,
  /**
   * Texte de présentation. Les intitulés varient beaucoup d'un modèle à
   * l'autre ; tous alimentent le même champ « description ».
   */
  profil:
    /^(profils?( professionnel)?|a propos( de moi)?|presentation|resume|objectifs?( professionnels?)?|profile|about( me)?|summary|career objective)\b/,
};

/* ─────────────────────────────── Utilitaires ─────────────────────────────── */

/**
 * Répare les adresses email coupées par une mise en page étroite.
 *
 * Dans une colonne latérale, pdf.js renvoie souvent l'adresse sur deux
 * fragments (« salohyharentsoa00@g » puis « mail.com »). Le recollage général
 * insère un espace entre les deux, si bien qu'aucune adresse valide n'est
 * détectée et que le champ email reste vide.
 *
 * On ne recolle que si le résultat forme une adresse plausible : la coupure
 * doit se situer après l'arobase, ou juste avant, et le domaine reconstitué
 * doit comporter un point suivi d'une extension.
 */
function repairSplitEmails(text: string): string {
  return (
    text
      // « nom@g mail.com » → « nom@gmail.com » (coupure après l'arobase)
      .replace(/([\w.+-]+@[\w-]*)\s+([\w-]*\.[a-z]{2,})/gi, (match, head: string, tail: string) => {
        const candidate = `${head}${tail}`;
        return EMAIL_RE.test(candidate) ? candidate : match;
      })
      // « nom @ domaine.com » → « nom@domaine.com » (espaces autour de @)
      .replace(/([\w.+-]+)\s*@\s*([\w-]+\.[\w.-]{2,})/g, '$1@$2')
  );
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Identifie la section correspondant à une ligne d'en-tête, sinon `null`. */
function matchSection(line: string): string | null {
  const cleaned = normalize(line).replace(/[:•\-–—_*]+$/g, '').trim();

  // Un en-tête est court : on évite de confondre avec une phrase.
  if (cleaned.length === 0 || cleaned.length > 45) return null;

  // Un en-tête ne comporte pas de séparateur de contenu (virgule,
  // point-virgule, tiret entouré d'espaces) ni de chiffre : sans ce garde-fou,
  // une ligne comme « Certification ESRI ArcGIS Desktop Associate » serait
  // interprétée comme le début de la section « certifications ».
  if (/[,;|]|\s[-–—]\s|\d/.test(cleaned)) return null;

  // Au-delà de 4 mots, il s'agit d'une phrase, pas d'un titre de section.
  if (cleaned.split(/\s+/).length > 4) return null;

  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(cleaned)) return section;
  }
  return null;
}

/** Nettoie une puce de liste (« • », « - », « * », numérotation). */
function stripBullet(line: string): string {
  return line.replace(/^\s*(?:[•▪◦*\-–—]|\d+[.)])\s*/, '').trim();
}

/**
 * Découpe une valeur multi-éléments : « Python, SQL ; QGIS » → 3 entrées.
 * Le découpage sur « / » n'est fait que si les fragments restent plausibles.
 */
function splitInline(value: string): string[] {
  return value
    .split(/[,;•|]|\s{3,}/)
    .map((item) => item.trim().replace(/[.:]+$/, ''))
    // Longueur minimale de 1 : certains langages et outils s'écrivent sur un
    // seul caractère (R, C). Le filtre haut évite les phrases entières.
    .filter((item) => item.length >= 1 && item.length <= 80);
}

/** Vrai si la ligne ressemble à un nom propre (« RAKOTO Jean », « Jean RAKOTO »). */
function looksLikeName(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 4 || trimmed.length > 60) return false;
  if (EMAIL_RE.test(trimmed) || /\d/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  // Au moins un mot en capitales ou chaque mot capitalisé.
  return words.every((word) => /^[A-ZÀ-Ý][\w'À-ÿ-]*$/.test(word) || /^[A-ZÀ-Ý'-]{2,}$/.test(word));
}

/* ────────────────────────────── Analyse principale ────────────────────────────── */

/* ────────────────── Extracteurs unitaires ──────────────────
   Chaque étape de l'analyse est isolée dans sa propre fonction : cela
   maintient la complexité cognitive de `parseCvText` sous le seuil de 20
   (règle SonarJS `cognitive-complexity`) et rend chaque heuristique
   testable indépendamment.
   ────────────────────────────────────────────────────────── */

/**
 * Téléphone : recherché sur les lignes courtes, celles préfixées « Tél » et
 * celles contenant un email (en-tête de contact « email | téléphone »).
 * Ce ciblage évite de capturer une date ou un numéro de rue.
 */
function extractTelephone(lines: string[]): string | undefined {
  for (const line of lines) {
    const isPhoneLine =
      /t[ée]l|phone|mobile|portable|gsm|contact/i.test(line) ||
      line.length <= 30 ||
      EMAIL_RE.test(line);
    if (!isPhoneLine) continue;

    // Sur une ligne combinée, l'email est retiré avant la recherche : sa
    // partie locale peut contenir des chiffres et produire un faux positif.
    const candidate = PHONE_RE.exec(line.replace(EMAIL_RE, ' '))?.[0]?.trim();
    if (candidate && candidate.replace(/\D/g, '').length >= 8) {
      return candidate;
    }
  }
  return undefined;
}

/** Adresse : première ligne contenant un marqueur d'adresse connu. */
function extractAdresse(lines: string[]): string | undefined {
  const line = lines.find((item) =>
    /\b(adresse|lot\s|rue|avenue|villa|appartement|bp\s|antananarivo|madagascar)\b/i.test(item),
  );
  return line?.replace(/^adresse\s*:?\s*/i, '').trim().slice(0, 300);
}

/** Nom et prénom : champs explicites, sinon déduction depuis l'en-tête. */
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

  /*
    Nom coupé par une colonne étroite (« RAJONOELY Anna » puis « Christinà »).
    La ligne suivante est rattachée si elle tient en un ou deux mots
    capitalisés, sans chiffre : sans cela, le prénom composé est perdu et
    le fragment orphelin devient à tort le poste du candidat.
  */
  const next = header[nameIndex + 1];
  const isNameOverflow =
    next !== undefined &&
    next.length <= 24 &&
    !/\d/.test(next) &&
    !EMAIL_RE.test(next) &&
    matchSection(next) === null &&
    next.split(/\s+/).length <= 2 &&
    next.split(/\s+/).every((word) => /^[A-ZÀ-Ý][\w'À-ÿ-]*$/.test(word)) &&
    // Un intitulé de poste tout en capitales n'est pas un fragment de nom.
    next !== next.toUpperCase();

  if (isNameOverflow) nameLine = `${nameLine} ${next}`;

  const words = nameLine.trim().split(/\s+/);
  // Convention courante : le patronyme est écrit en capitales.
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

/** Poste : intitulé explicite, sinon ligne suivant le nom. */
function extractPoste(lines: string[]): string | undefined {
  const explicit = lines.find((line) =>
    /^(poste(\s+(recherch[ée]|actuel|vis[ée]))?|fonction|titre|intitul[ée])\s*:/i.test(line),
  );
  if (explicit) return explicit.split(':')[1]?.trim();

  const headerLines = lines.slice(0, 8);
  const nameIndex = headerLines.findIndex(looksLikeName);
  if (nameIndex < 0) return undefined;

  /*
    On repart de l'identité réellement retenue : si le nom débordait sur la
    ligne suivante, celle-ci en fait partie et ne doit pas être prise pour
    l'intitulé du poste (« Christinà » n'est pas une fonction).
  */
  const { nom, prenom } = extractIdentite(lines);
  const nameWords = new Set(`${nom ?? ''} ${prenom ?? ''}`.trim().split(/\s+/).filter(Boolean));

  for (const candidate of headerLines.slice(nameIndex + 1)) {
    if (!candidate || EMAIL_RE.test(candidate) || candidate.length > 70) continue;
    // Un en-tête de section clôt la zone d'identité : on passe au repli.
    if (matchSection(candidate)) break;
    // Ligne entièrement composée de mots du nom : c'est la suite du nom.
    const words = candidate.split(/\s+/);
    if (words.every((word) => nameWords.has(word))) continue;
    return candidate;
  }

  /*
    Repli : sur les modèles à colonne latérale, l'intitulé de poste est
    souvent isolé plus bas, en capitales, hors de l'en-tête. On retient la
    première ligne courte entièrement capitalisée qui n'est ni un titre de
    section ni un simple mot isolé.
  */
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

/** Une ligne de la section « Expérience » → entrée structurée. */
/** Une ligne « Entreprise : X », « Société : X », « Employeur : X ». */
const ORGANISATION_RE = /^(?:entreprise|societe|société|employeur|organisation|structure)\s*:\s*(.+)$/i;

/** Une ligne « Période : X », « Dates : X ». */
const PERIODE_RE = /^(?:p[ée]riode|dates?|dur[ée]e)\s*:\s*(.+)$/i;

/* Fragments réutilisés pour composer la plage de dates, plutôt que de
   répéter la liste des mois (complexité signalée par SonarJS). */
const MOIS = 'janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre';
const DATE_POINT = `(?:\\d{2}/)?(?:${MOIS})?\\s*\\d{4}`;
/** Année scolaire condensée : « 2024/25 », « 2023-24 ». */
const ANNEE_SCOLAIRE_RE = /\b(20\d{2})\s*[/–—-]\s*(\d{2}|20\d{2})\b/;
const DATE_FIN = `${DATE_POINT}|aujourd'?hui|pr[ée]sent|actuel(?:lement)?`;

/** Une plage de dates détectée directement dans le texte. */
const PLAGE_DATES_RE = new RegExp(
  `${DATE_POINT}\\s*(?:[-–—à]|jusqu'?[àa])\\s*(?:${DATE_FIN})`,
  'i',
);

/**
 * Vrai si la ligne décrit une mission plutôt qu'un intitulé de poste.
 *
 * Un intitulé est court, commence par une majuscule et ne se termine pas par
 * une ponctuation de phrase. Les descriptions issues de puces sont souvent
 * longues, coupées en fin de ligne (virgule finale) ou commencent par un verbe
 * à l'infinitif / un mot en minuscule (suite de la ligne précédente).
 */
function isDetailLine(line: string): boolean {
  // Puce explicite : c'est une mission, jamais un intitulé de poste.
  if (/^\s*[•▪◦*\-–—]\s+/.test(line)) return true;
  // Ligne d'outillage (« Stack : Flask · PostgreSQL ») : elle qualifie le
  // poste précédent et n'en est pas un.
  if (/^(stack|technologies?|outils?|environnement|langages?)\s*:/i.test(line)) return true;
  // Trop longue pour un intitulé de poste.
  if (line.length > 70) return true;
  // Ponctuation de phrase, y compris une virgule de continuation.
  if (/[.;,]$/.test(line)) return true;
  // Continuation d'une phrase entamée à la ligne précédente.
  if (/^[a-zà-ÿ]/.test(line)) return true;
  /*
    Substantif d'action EN TÊTE de ligne, suivi d'un complément : c'est une
    mission (« Gestion complète du processus de recrutement »).

    Le test portait auparavant sur la présence du mot n'importe où dans la
    ligne : « Licence en Gestion et Administration des Entreprises » était
    alors écartée comme un détail, si bien que ce diplôme disparaissait des
    formations. L'ancrage en début de ligne lève l'ambiguïté.
  */
  if (
    /^(gestion|suivi|mise à jour|[ée]laboration|supervision|conduite|r[ée]daction|pilotage|animation|organisation)\b/i.test(
      line,
    ) &&
    line.length > 45
  ) {
    return true;
  }
  /*
    Phrase descriptive commençant par un substantif d'action
    (« Développement d'une application… », « Création d'une plateforme… »,
    « Conception et déploiement… »). Ces lignes racontent ce qui a été fait ;
    l'intitulé du poste, lui, se limite à une fonction.
  */
  if (
    /^(d[ée]veloppement|conception|cr[ée]ation|r[ée]alisation|impl[ée]mentation|mise en (place|œuvre|oeuvre)|participation|analyse|maintenance|int[ée]gration|automatisation|migration|d[ée]ploiement)\b/i.test(
      line,
    ) &&
    line.length > 40
  ) {
    return true;
  }
  return false;
}

/**
 * Regroupe les lignes d'une section « Expériences » en entrées structurées.
 *
 * Deux formats sont pris en charge :
 *
 *  1. Format compact — tout sur une ligne :
 *     « 2021 - 2024 : Ingénieur SIG — Ministère de l'Aménagement »
 *
 *  2. Format bloc — un intitulé suivi de lignes qualifiantes :
 *     « Responsable Ressources Humaines »
 *     « Entreprise : Groupe ABC »
 *     « Période : Janvier 2021 – Présent »
 *     « • Gestion complète du recrutement… »   ← détail, ignoré
 *
 * Sans ce regroupement, chaque ligne devenait une « expérience » distincte :
 * un CV de 2 postes produisait 17 entrées parasites.
 */
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

    // Ligne qualifiant l'entrée en cours.
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

    // Format compact : période et poste sur la même ligne.
    const periode = PLAGE_DATES_RE.exec(line)?.[0]?.trim();
    if (periode) {
      const reste = line.replace(periode, '').replace(/^[\s:,–—-]+/, '').trim();
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
        // La ligne ne portait que la période : elle qualifie l'entrée en cours.
        current.periode = periode.slice(0, 60);
      }
      continue;
    }

    // Ligne de détail : on la rattache à rien, elle décrit le poste courant.
    if (isDetailLine(line)) continue;

    /*
      Sous-titre de contexte : de nombreux CV font suivre l'intitulé d'une
      ligne d'organisation sans étiquette (« Projet fin d'année M1 — ENI
      Fianarantsoa » sous « Réfrigérateur Intelligent »). Si l'entrée en
      cours n'a pas encore d'organisation, cette ligne la renseigne au lieu
      de créer une entrée distincte.
    */
    const contexte = current as ParsedExperience | null;
    if (contexte && !contexte.organisation && line.length <= 70) {
      const segments = line.split(/\s*[–—|]\s*|\s*[-:]\s+/).filter(Boolean);
      contexte.organisation = (segments.at(-1) ?? line).trim().slice(0, 150);
      continue;
    }

    // Nouvel intitulé de poste : on clôture le précédent.
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

/**
 * Ajoute une ligne à la section « Formations ».
 *
 * Trois cas coexistent selon les modèles de CV :
 *  - ligne descriptive (projet mené pendant l'année) → ignorée ;
 *  - qualifiant de la formation précédente (établissement, année) → fusionné ;
 *  - nouvelle formation → ajoutée telle quelle.
 */
function collectFormationLine(result: ParsedCv, content: string): void {
  if (content.length < 4) return;

  /*
    Une section « Formations » contient souvent, sous chaque diplôme, la
    liste des projets menés pendant l'année. Ces lignes décrivent des
    travaux, pas un cursus : les retenir produisait 17 « formations » pour
    4 diplômes réels.
  */
  if (isDetailLine(content)) return;

  /*
    Ligne qualifiant la formation précédente.

    Deux formes coexistent :
      « Établissement : Université de X »  → étiquette suivie de « : »
      « Ecole Nationale d'Informatique »   → nom d'établissement seul

    Dans le second cas la ligne est conservée ENTIÈREMENT : capturer le
    groupe après le mot-clé transformait « Ecole Nationale d'Informatique »
    en « Nationale d'Informatique ».
  */
  const etiquette =
    /^(?:[ée]tablissement|ann[ée]e|obtenu(?:e)?\s+en|dipl[ôo]me)\s*:\s*(.+)$/i.exec(content);
  const etablissementSeul =
    /^(?:universit[ée]|[ée]cole|institut|lyc[ée]e|facult[ée]|centre)\b/i.test(content);

  const precedente = result.formations.at(-1);
  /*
    Un qualifiant ne se rattache qu'à une entrée qui n'en a pas déjà reçu un
    du même type. Sans ce garde-fou, la seconde formation venait s'agréger à
    la première, déjà complétée : deux diplômes distincts fusionnaient.
  */
  const dejaQualifiee =
    precedente !== undefined && precedente.split('—').length > (etiquette ? 2 : 1);

  if (precedente && (etiquette || etablissementSeul) && !dejaQualifiee) {
    const complement = etiquette ? etiquette[1].trim() : content;
    result.formations[result.formations.length - 1] =
      `${precedente} — ${complement}`.slice(0, 200);
    return;
  }

  if (precedente && etiquette && dejaQualifiee) {
    // Qualifiant surnuméraire (l'année après l'établissement) : ajouté en
    // fin de libellé, sans créer d'entrée parasite.
    result.formations[result.formations.length - 1] =
      `${precedente} — ${etiquette[1].trim()}`.slice(0, 200);
    return;
  }

  result.formations.push(content.slice(0, 200));
}

/**
 * Valeurs de compétence portées par une ligne.
 *
 * Les CV techniques regroupent les compétences par catégorie :
 *
 *   Language de programmation :
 *     Python, PHP, JavaScript
 *
 * La ligne de catégorie n'est pas une compétence : elle annonce la suite au
 * lieu de la porter. On la reconnaît à ce qu'elle se termine par « : » sans
 * rien après. Lorsqu'elle porte déjà des valeurs (« Frameworks : Django »),
 * seule l'étiquette est retirée.
 */
function extractCompetences(content: string): string[] {
  if (/^(.{2,40}?)\s*:\s*$/.test(content)) return [];
  const withValues = /^(.{2,40}?)\s*:\s*(.+)$/.exec(content);
  return splitInline(withValues ? withValues[2] : content);
}

/** Répartit une ligne dans la section courante. */
function collectSectionLine(
  result: ParsedCv,
  section: string,
  content: string,
  buffer: string[],
  descriptionBuffer: string[],
): void {
  switch (section) {
    case 'profil':
      // Le texte de présentation est conservé mot pour mot : le reformuler
      // ferait perdre la voix du candidat, que le recruteur veut lire.
      descriptionBuffer.push(content);
      break;
    case 'experience':
      // Accumulation brute : le regroupement en blocs a lieu en fin d'analyse,
      // car une entrée s'étend sur plusieurs lignes.
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
      // « Français : Courant / Bilingue » → on conserve « Français ».
      // Le niveau varie trop d'un CV à l'autre pour être exploité tel quel.
      const values = splitInline(content).map((item) => item.split(/\s*:\s*/)[0].trim());
      const known = values.filter((item) =>
        LANGUES_CONNUES.some((langue) => normalize(item).includes(langue)),
      );
      /*
        Seules les langues reconnues sont retenues.

        Sur les CV à colonne latérale, la section « Langues » est souvent
        suivie immédiatement de « Qualités » ou « Divers » ; si l'en-tête
        suivant n'est pas identifié, son contenu (« Créativité », « Esprit
        d'équipe »…) se déversait dans les langues. Ne garder que les valeurs
        connues élimine cette contamination — quitte à ignorer une langue
        rare, ce que l'utilisateur corrige d'un mot.
      */
      result.langues.push(...known);
      break;
    }
    default:
      break;
  }
}

/**
 * Compose le texte de présentation destiné au champ « Description ».
 *
 * Deux sources, par ordre de préférence :
 *
 *  1. La section « Profil » / « À propos » / « Résumé » du CV, si elle existe.
 *  2. À défaut, le premier paragraphe rédigé de l'en-tête. Beaucoup de CV
 *     (comme les modèles à colonne latérale) placent leur présentation juste
 *     sous le nom, sans titre de section. Sans ce repli, la description
 *     resterait vide alors que le texte est bien présent.
 *
 * Le repli est volontairement prudent : il exige une phrase longue, contenant
 * un verbe à la première personne ou une formule de présentation, afin de ne
 * jamais confondre un intitulé de poste avec une présentation.
 */
function buildDescription(sectionLines: string[], allLines: string[]): string | undefined {
  const fromSection = sectionLines.join(' ').replace(/\s+/g, ' ').trim();
  if (fromSection.length >= 40) return fromSection.slice(0, 2000);

  // Repli : paragraphe de présentation en tête de document.
  const header = allLines.slice(0, 14);
  const sentences: string[] = [];
  for (const line of header) {
    if (matchSection(line)) break;
    const isPresentation =
      line.length >= 60 &&
      /\b(je suis|je me|passionn|sp[ée]cialis[ée]|dipl[ôo]m[ée]|exp[ée]rience|motiv[ée]|professionnel(le)?\s+d)/i.test(
        line,
      );
    if (isPresentation) sentences.push(line);
    // On s'arrête au premier bloc rédigé : la suite relève des sections.
    else if (sentences.length > 0) break;
  }

  const fallback = sentences.join(' ').replace(/\s+/g, ' ').trim();
  return fallback.length >= 40 ? fallback.slice(0, 2000) : undefined;
}

/**
 * Regroupe les lignes d'une même formation.
 *
 * Certains CV répartissent une formation sur trois lignes consécutives :
 *
 *   2024–2025
 *   ENI — Université de Fianarantsoa
 *   Master 1 Informatique
 *
 * Prises séparément, elles produisent trois « formations » dont deux ne sont
 * ni un diplôme ni un établissement complet. On rattache donc une ligne
 * d'année isolée à l'entrée qui la suit, en la plaçant en fin de libellé —
 * l'ordre « diplôme, établissement, année » se lit mieux.
 */
function mergeFormationLines(items: string[]): string[] {
  /** « 2024–2025 », « 2025–2026 (en cours) », « 2023 ». */
  const ANNEE_SEULE = /^\(?\s*\d{4}\s*(?:[–—-]\s*(?:\d{2,4}|en cours))?\s*\)?(?:\s*\(?\s*en cours\s*\)?)?$/i;
  /** Ligne d'établissement seul, sans intitulé de diplôme. */
  const ETABLISSEMENT =
    /^(?:eni\b|universit[ée]|[ée]cole|institut|lyc[ée]e|facult[ée]|centre)\b/i;
  /** Ligne portant un niveau de diplôme. */
  const DIPLOME =
    /\b(licence|master|doctorat|dut|bts|dts|baccalaur[ée]at|ing[ée]nieur|mast[èe]re|dipl[ôo]me)\b/i;

  const merged: string[] = [];
  let pendingYear: string | null = null;

  for (const item of items) {
    const value = item.trim();
    if (!value) continue;

    if (ANNEE_SEULE.test(value)) {
      // Les parenthèses encadrant toute la valeur sont retirées, mais pas
      // celles d'une mention interne (« 2025–2026 (en cours) »).
      pendingYear = value.replace(/^\((.*)\)$/, '$1').trim();
      continue;
    }

    const previous = merged.at(-1);
    /*
      Diplôme suivant immédiatement un établissement : les deux décrivent la
      même formation. On place le diplôme en tête, l'établissement ensuite —
      c'est le diplôme qui identifie la formation.
    */
    /*
      Le rattachement n'a lieu que si la ligne précédente est UNIQUEMENT un
      établissement, sans mention de diplôme : « Master … — Université X » a
      déjà été assemblée, une nouvelle formation qui la suit doit rester
      distincte (sinon deux diplômes fusionnent en une seule entrée).
    */
    if (previous && DIPLOME.test(value) && !DIPLOME.test(previous) && ETABLISSEMENT.test(previous)) {
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

  // Année orpheline en fin de liste : conservée plutôt que perdue.
  if (pendingYear) merged.push(pendingYear);
  return merged;
}

/**
 * Vrai si la ligne est un titre de bloc non répertorié.
 *
 * Sur une mise en page à colonnes, la colonne latérale est concaténée après
 * la colonne principale. La dernière section ouverte (souvent « Formations »)
 * absorbait alors le début de cette colonne tant qu'aucun en-tête connu
 * n'apparaissait — d'où des entrées comme « STAGIAIRE FULLSTACK » parmi les
 * formations.
 *
 * Un titre court entièrement en capitales, sans ponctuation et composé de
 * plusieurs mots marque un nouveau bloc. La condition sur le nombre de mots
 * est essentielle : « PHP », « SGBD » ou « MYSQL » sont des valeurs de
 * compétence, pas des titres.
 */
function isUnknownHeading(line: string): boolean {
  if (line.length < 6 || line.length > 40) return false;
  if (line !== line.toUpperCase()) return false;
  if (!/[A-ZÀ-Ý]/.test(line)) return false;
  if (/[.,;:!?/+]/.test(line)) return false;

  const words = line.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  // Un sigle technique isolé reste une valeur, pas un titre.
  return words.every((word) => word.length >= 2);
}

/** Dédoublonnage insensible à la casse et aux accents. */
function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalize(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Indice de confiance : proportion de champs clés effectivement trouvés. */
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

/**
 * Analyse un CV en texte brut et renvoie les données structurées.
 * Orchestre les extracteurs ci-dessus ; aucune logique d'heuristique ici.
 */
export function parseCvText(rawText: string): ParsedCv {
  const texteBrut = repairSplitEmails(
    rawText.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' '),
  ).trim();
  const rawLines = texteBrut
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Recollage des lignes coupées par la mise en page du PDF : une ligne
  // commençant par une minuscule et suivant une ligne sans ponctuation finale
  // est la continuation de celle-ci (« Administration du » + « personnel. »).
  const lines: string[] = [];
  for (const line of rawLines) {
    const previous = lines.at(-1);
    const isContinuation =
      previous !== undefined &&
      /^[a-zà-ÿ(]/.test(line) &&
      !/[.:;!?]$/.test(previous) &&
      !matchSection(line) &&
      // Une ligne de contact est autonome : une adresse email commence par
      // une minuscule mais ne prolonge jamais la ligne précédente.
      !EMAIL_RE.test(line) &&
      !PHONE_RE.test(line) &&
      // Une ligne « champ : valeur » est également autonome.
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

  /* ── Contact et identité ── */
  result.email = EMAIL_RE.exec(texteBrut)?.[0]?.toLowerCase();
  result.telephone = extractTelephone(lines);
  result.adresse = extractAdresse(lines);

  const { nom, prenom } = extractIdentite(lines);
  result.nom = nom;
  result.prenom = prenom;
  result.poste = extractPoste(lines);

  /* ── Parcours des sections ── */
  // Les lignes d'expérience sont mises de côté : une entrée peut s'étendre
  // sur plusieurs lignes (intitulé, entreprise, période), le regroupement a
  // donc lieu une fois la section entièrement lue.
  const experienceLines: string[] = [];
  const descriptionLines: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    const section = matchSection(line);
    if (section) {
      current = section;
      continue;
    }

    // Titre de bloc non répertorié : il referme la section en cours.
    if (current !== null && isUnknownHeading(line)) {
      current = null;
      continue;
    }

    if (!current) continue;

    /*
      La puce est retirée pour toutes les sections sauf « expérience » :
      là, elle distingue une mission (« • Suivi à distance du frigo ») d'un
      intitulé de poste. Sans cette information, chaque puce devenait une
      expérience distincte.
    */
    const content = current === 'experience' ? line : stripBullet(line);
    if (content.length >= 2) {
      collectSectionLine(result, current, content, experienceLines, descriptionLines);
    }
  }

  result.experiences = parseExperienceBlock(experienceLines);
  result.description = buildDescription(descriptionLines, lines);

  /* ── Repli : langues détectées hors section dédiée ── */
  if (result.langues.length === 0) {
    const normalized = normalize(texteBrut);
    result.langues = LANGUES_CONNUES.filter((langue) => normalized.includes(langue)).map(
      (langue) => langue.charAt(0).toUpperCase() + langue.slice(1),
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

/**
 * Compose une description lisible à partir des sections extraites.
 * Elle alimente le champ `description` de la ressource humaine, que
 * l'utilisateur reste libre de réécrire.
 */
export function buildDescriptionFromCv(parsed: ParsedCv): string {
  /*
    Le texte de présentation du candidat prime sur toute reconstitution.

    Auparavant, la description était systématiquement recomposée à partir des
    listes extraites (« Expériences : - … / Formations : - … »), ce qui
    produisait un inventaire redondant avec les champs Expériences,
    Formations et Compétences affichés juste à côté — et faisait perdre le
    paragraphe rédigé par le candidat, qui est précisément ce qu'un
    recruteur lit en premier.

    La reconstitution reste le repli lorsque le CV ne comporte aucune
    section de présentation.
  */
  if (parsed.description && parsed.description.length >= 40) {
    return parsed.description.slice(0, 1000);
  }

  const blocks: string[] = [];

  if (parsed.experiences.length > 0) {
    blocks.push(
      'Expériences :\n' +
        parsed.experiences
          .map((experience) => {
            const details = [experience.organisation, experience.periode]
              .filter(Boolean)
              .join(', ');
            const suffix = details ? ` (${details})` : '';
            return `- ${experience.poste}${suffix}`;
          })
          .join('\n')
    );
  }

  const cursus = [...parsed.diplomes, ...parsed.formations];
  if (cursus.length > 0) {
    blocks.push('Formations et diplômes :\n' + cursus.map((item) => `- ${item}`).join('\n'));
  }

  if (parsed.competences.length > 0) {
    blocks.push('Compétences : ' + parsed.competences.join(', '));
  }

  if (parsed.langues.length > 0) {
    blocks.push('Langues : ' + parsed.langues.join(', '));
  }

  // Le champ description du backend est limité à 1000 caractères.
  return blocks.join('\n\n').slice(0, 1000);
}
