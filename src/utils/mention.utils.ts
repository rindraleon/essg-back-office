/** Normalisation des libellés mention/parcours (accents, casse et espaces ignorés). */
export function normalizeMentionNom(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
