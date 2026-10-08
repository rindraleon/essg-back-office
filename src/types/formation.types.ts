/* eslint-disable @typescript-eslint/no-explicit-any */
export type FormationLevel = 'Licence' | 'Master' | 'Doctorat';

/** Mention imbriquée dans le parcours d'une formation (lecture API). */
export interface FormationMentionRef {
  id: number;
  nom: string;
  slug: string;
}

/** Parcours rattaché à une formation — source de vérité de la hiérarchie. */
export interface FormationParcoursRef {
  id: number;
  nom: string;
  slug: string;
  isActive?: boolean;
  mentionId?: number;
  mention?: FormationMentionRef | null;
}

export interface Formation {
  id: number;
  slug: string;
  /** @deprecated Miroir calculé côté backend depuis le parcours rattaché. */
  mention?: string;
  /** Identifiant du parcours rattaché (Domaine → Mention → Parcours → Formation). */
  parcoursId?: number | null;
  /** Parcours imbriqué renvoyé en lecture par l'API. */
  parcours?: FormationParcoursRef | null;
  domaine: string[];
  titre: string;
  niveau: FormationLevel;
  duree: string;
  description: string;
  objectifs: string[];
  debouches: string[];
  conditionsAcces?: string;
  conditions?: string[];
  competences?: string[];
  modules?: any[];
  credits: number;
  responsable?: string;
  responsableId?: number | null;
  email?: string;
  programme: string[];
  image: string;
  enVedette: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

export type FormationFormData = Omit<
  Formation,
  'id' | 'slug' | 'creeLe' | 'misAJourLe' | 'domaine' | 'parcours' | 'titre'
> & {
  /** Parcours rattaché — obligatoire ; titre, mention et domaine en dérivent côté backend. */
  parcoursId: number;
  /** @deprecated Ne plus saisir : le titre suit le nom du parcours rattaché. */
  titre?: string;
};

export interface FormationFilterOptions {
  niveau: string;
  /** Nom de la mention rattachée (via le parcours). */
  mention: string;
  enVedette: string;
}

export interface FormationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormationFormData) => void | Promise<void>;
  initialData?: Formation | null;
  mode: 'create' | 'edit';
}

export interface FormErrors {
  titre?: string;
  mention?: string;
  domaine?: string;
  niveau?: string;
  duree?: string;
  description?: string;
  credits?: string;
  responsable?: string;
  responsableId?: string;
  email?: string;
  objectifs?: string;
  debouches?: string;
  conditions?: string;
}
