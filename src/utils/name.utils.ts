/**
 * Convention d'affichage des personnes — source unique du back-office.
 *
 * Règle métier : partout où une personne possède un nom et un prénom,
 * l'affichage est « Nom Prénom » (et jamais « Prénom Nom »).
 * Centraliser la règle ici évite qu'une page diverge des autres :
 * tableaux, listes, selects, dialogs et messages de confirmation
 * appellent tous `formatFullName`.
 */

interface PersonLike {
  nom?: string | null;
  prenom?: string | null;
}

/**
 * « Nom Prénom », insensible aux valeurs manquantes.
 *
 * - `formatFullName({ nom: 'DUPONT', prenom: 'Jean' })` → « DUPONT Jean »
 * - une seule des deux valeurs renseignée → cette valeur seule (pas d'espace
 *   superflu, ce qui évite les libellés « DUPONT  » dans les tableaux).
 */
export function formatFullName(person: PersonLike | null | undefined): string {
  if (!person) return '';
  return [person.nom, person.prenom]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * Initiales pour les avatars, dans le même ordre que l'affichage : N puis P.
 * Retourne au plus deux caractères, en majuscules.
 */
export function getPersonInitials(person: PersonLike | null | undefined): string {
  if (!person) return '';
  const nom = (person.nom ?? '').trim();
  const prenom = (person.prenom ?? '').trim();
  return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase() || nom.charAt(0).toUpperCase();
}
