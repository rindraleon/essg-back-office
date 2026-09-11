export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRuleState {
  id: string;
  label: string;
  satisfied: boolean;
}

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'motdepasse',
  'motdepasse123',
  'azerty123',
  'qwerty123',
  'admin123',
  '12345678',
  '123456789',
  '1234567890',
]);

const SEQUENTIAL_PATTERN = /(?:0123|1234|2345|3456|4567|5678|6789|abcd|azerty|qwerty)/i;

export function isCommonOrGuessable(password: string): boolean {
  const lowered = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lowered)) return true;
  if (SEQUENTIAL_PATTERN.test(lowered)) return true;
  return /^(.)\1+$/.test(password);
}

export function getPasswordRules(password: string): PasswordRuleState[] {
  return [
    {
      id: 'length',
      label: `Au moins ${PASSWORD_MIN_LENGTH} caractères`,
      satisfied: password.length >= PASSWORD_MIN_LENGTH,
    },
    { id: 'uppercase', label: 'Au moins une lettre majuscule', satisfied: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Au moins une lettre minuscule', satisfied: /[a-z]/.test(password) },
    { id: 'digit', label: 'Au moins un chiffre', satisfied: /\d/.test(password) },
    {
      id: 'special',
      label: 'Au moins un caractère spécial',
      satisfied: /[^A-Za-z0-9]/.test(password),
    },
    {
      id: 'notCommon',
      label: 'Pas un mot de passe courant ou devinable',
      satisfied: password.length > 0 && !isCommonOrGuessable(password),
    },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRules(password).every((rule) => rule.satisfied);
}
