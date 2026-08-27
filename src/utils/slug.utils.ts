export function generateSlug(text: string): string {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
  return normalized.split('-').filter(Boolean).join('-');
}

export function toUpperName(value: string): string {
  return value.toLocaleUpperCase('fr-FR');
}
