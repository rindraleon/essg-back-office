/**
 * Règles de validation partagées par les formulaires du back-office.
 *
 * Centralisées ici pour éviter la duplication : la même expression d'email
 * était recopiée dans cinq fichiers (Login, Profil, Formation, Ressource
 * humaine, Utilisateur), avec le risque qu'elles divergent au fil du temps.
 */

/**
 * Validation d'adresse email.
 *
 * Volontairement permissive : elle écarte les fautes de frappe évidentes
 * (absence de « @ » ou de domaine) sans prétendre implémenter la RFC 5322,
 * qu'aucune expression régulière raisonnable ne couvre. La validation
 * définitive reste celle du backend (`class-validator` + `@IsEmail`).
 *
 * Les quantificateurs portent sur des classes disjointes (`[^\s@]` exclut
 * l'arobase et les espaces) : chaque caractère ne peut être consommé que par
 * un seul segment, ce qui évite tout retour arrière coûteux.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Message affiché lorsqu'une adresse ne respecte pas `EMAIL_PATTERN`. */
export const EMAIL_ERROR_MESSAGE = 'Email invalide';

/** Longueur minimale d'un mot de passe, alignée sur la règle du backend. */
export const PASSWORD_MIN_LENGTH = 6;
