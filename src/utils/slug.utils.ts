export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    // Ancrages séparés plutôt que l'alternance /^-+|-+$/ : cette dernière est
    // signalée « super-linear » par SonarJS (backtracking). Deux passes
    // ancrées sont linéaires par construction. Doit rester strictement
    // aligné sur backend-essg/src/common/utils/text.util.ts#slugify.
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function toUpperName(value: string): string {
  return value.toLocaleUpperCase('fr-FR');
}
