export { ACTUALITE_CATEGORIES, ACTUALITE_STATUTS } from './actualite.constants';
export {
  ADMISSION_PARCOURS,
  BAC_SERIES,
  BAC_SERIE_LABELS,
  BAC_TYPE_LABELS,
  formatBacSerie,
  formatBacType,
} from './admission.constants';
export {
  FORMATION_MENTIONS,
  findMentionByTitre,
  getTitreOptions,
  isTitreInMention,
  NIVEAU_OPTIONS,
  DUREE_OPTIONS,
  CONDITION_ACCES_OPTIONS,
} from './formation.constants';
export type { FormationMention } from './formation.constants';
export { isNavActive, isAdminRole, getVisibleNavItems } from './navigation';
export {
  PARTENAIRE_TYPES,
  PARTENAIRE_TYPE_COLORS,
  DEFAULT_PARTENAIRE_FORM_DATA,
  INITIAL_PARTENAIRE_FILTERS,
} from './partenaire.constants';
export {
  PROJET_TYPES,
  PROJET_STATUTS,
  PROJET_TYPE_COLORS,
  DEFAULT_FORM_DATA,
  INITIAL_FILTERS,
} from './projet.constants';
export { RESSOURCE_HUMAINE_POSTES } from './ressource-humaine.constants';
export {
  BORDEREAU_PATTERN,
  BAC_NUMBER_PATTERN,
  DIPLOMA_YEAR_MIN,
  EMAIL_ERROR_MESSAGE,
  EMAIL_MAX_LENGTH,
  EMAIL_PATTERN,
  EMAIL_REGEX,
  PERSON_NAME_PATTERN,
  PLACE_NAME_PATTERN,
  URL_PATTERN,
  VALIDATION_MESSAGES,
  YEAR_4_DIGITS_PATTERN,
  currentYear,
  isValidInternationalDigits,
  isValidNationalMgNumber,
  isValidPhoneNumber,
  validateEmail,
  validateFirstName,
  validateName,
  validateOptionalAddress,
  validateOptionalBacNumber,
  validateOptionalDiplomaYear,
  validateOptionalEmail,
  validateOptionalEmailOrPhone,
  validateOptionalFirstName,
  validateOptionalPhone,
  validateOptionalUrl,
  validatePhone,
} from './validation.constants';
