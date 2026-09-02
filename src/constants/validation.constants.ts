export const PERSON_NAME_PATTERN = /^\p{L}(?:[\p{L}'’ -]*\p{L})?$/u;

export const PLACE_NAME_PATTERN = /^\p{L}(?:[\p{L}'’ ,.-]*[\p{L}.])?$/u;

export const ADDRESS_PATTERN = /^[\p{L}0-9][\p{L}0-9\s,.'’\-/()]*$/u;

export const BAC_NUMBER_PATTERN = /^\d{4,20}$/;

export const YEAR_4_DIGITS_PATTERN = /^\d{4}$/;

export const BORDEREAU_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9\-_/.\s]*[A-Za-z0-9])?$/;

export const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export const EMAIL_REGEX =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export const EMAIL_PATTERN = EMAIL_REGEX;

export const EMAIL_MAX_LENGTH = 50;

export const DIPLOMA_YEAR_MIN = 1980;

export const currentYear = (): number => new Date().getFullYear();

export const VALIDATION_MESSAGES = {
  required: 'Ce champ est obligatoire.',
  nomInvalid: 'Le nom ne peut contenir que des lettres, espaces, apostrophes ou traits d’union.',
  prenomInvalid:
    'Le prénom ne peut contenir que des lettres, espaces, apostrophes ou traits d’union.',
  emailInvalid: 'Veuillez saisir une adresse email valide.',
  phoneInvalid: 'Veuillez saisir un numéro de téléphone valide.',
  addressInvalid: 'L’adresse contient des caractères non autorisés.',
  placeInvalid: 'Veuillez saisir un lieu valide (lettres, espaces, apostrophes, traits d’union).',
  bacNumberInvalid: 'Le numéro du baccalauréat doit contenir uniquement des chiffres.',
  yearInvalid: 'L’année doit être composée de 4 chiffres.',
  bordereauInvalid: 'Le numéro de bordereau contient des caractères non autorisés.',
  urlInvalid: 'Veuillez saisir une adresse web valide (https://…).',
  emailOrPhoneInvalid: 'Veuillez saisir un email ou un numéro de téléphone valide.',
} as const;

export const EMAIL_ERROR_MESSAGE = VALIDATION_MESSAGES.emailInvalid;

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && !value.trim());

export const validateName = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return VALIDATION_MESSAGES.required;
  if (!PERSON_NAME_PATTERN.test(trimmed) || trimmed.length > 100) {
    return VALIDATION_MESSAGES.nomInvalid;
  }
  return undefined;
};

export const validateFirstName = validateName;

export const validateOptionalFirstName = (value: string): string | undefined =>
  isEmpty(value) ? undefined : validateFirstName(value);

export const validateEmail = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return VALIDATION_MESSAGES.emailInvalid;
  if (trimmed.length > EMAIL_MAX_LENGTH) return VALIDATION_MESSAGES.emailInvalid;
  if (!EMAIL_REGEX.test(trimmed)) return VALIDATION_MESSAGES.emailInvalid;
  return undefined;
};

export const validateOptionalEmail = (value: string): string | undefined =>
  isEmpty(value) ? undefined : validateEmail(value);

export const isValidNationalMgNumber = (digits: string): boolean => /^0[2-9]\d{8}$/.test(digits);

export const isValidInternationalDigits = (digits: string): boolean => {
  if (digits.length < 8 || digits.length > 15) return false;
  if (digits.startsWith('261')) return /^261[2-9]\d{8}$/.test(digits);
  return true;
};

export const isValidPhoneNumber = (value: string): boolean => {
  const compact = value.replace(/\s+/g, '');
  if (!compact || !/^\+?\d+$/.test(compact)) return false;
  if (compact.startsWith('+')) return isValidInternationalDigits(compact.slice(1));
  if (compact.startsWith('00')) {
    const rest = compact.slice(2);
    return /^\d+$/.test(rest) && isValidInternationalDigits(rest);
  }
  return isValidNationalMgNumber(compact);
};

export const validatePhone = (value: string): string | undefined =>
  isValidPhoneNumber(String(value ?? '')) ? undefined : VALIDATION_MESSAGES.phoneInvalid;

export const validateOptionalPhone = (value: string): string | undefined =>
  isEmpty(value) ? undefined : validatePhone(value);

export const validateOptionalEmailOrPhone = (value: string): string | undefined => {
  if (isEmpty(value)) return undefined;
  const trimmed = value.trim();
  if (EMAIL_REGEX.test(trimmed)) return undefined;
  if (isValidPhoneNumber(trimmed)) return undefined;
  return VALIDATION_MESSAGES.emailOrPhoneInvalid;
};

export const validateOptionalAddress = (value: string): string | undefined => {
  if (isEmpty(value)) return undefined;
  const trimmed = value.trim();
  if (!ADDRESS_PATTERN.test(trimmed) || trimmed.length > 300) {
    return VALIDATION_MESSAGES.addressInvalid;
  }
  return undefined;
};

export const validateOptionalUrl = (value: string): string | undefined => {
  if (isEmpty(value)) return undefined;
  return URL_PATTERN.test(value.trim()) ? undefined : VALIDATION_MESSAGES.urlInvalid;
};

export const validateOptionalDiplomaYear = (value: string | number): string | undefined => {
  if (isEmpty(value)) return undefined;
  const trimmed = String(value).trim();
  if (!YEAR_4_DIGITS_PATTERN.test(trimmed)) return VALIDATION_MESSAGES.yearInvalid;
  const year = Number(trimmed);
  if (year < DIPLOMA_YEAR_MIN || year > currentYear()) return VALIDATION_MESSAGES.yearInvalid;
  return undefined;
};

export const validateOptionalBacNumber = (value: string): string | undefined => {
  if (isEmpty(value)) return undefined;
  return BAC_NUMBER_PATTERN.test(String(value).trim())
    ? undefined
    : VALIDATION_MESSAGES.bacNumberInvalid;
};
