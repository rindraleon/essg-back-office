export type FormationLevel = 'Licence' | 'Master' | 'Doctorat';

export interface Formation {
  id: number;
  /** Généré côté backend depuis le titre — jamais saisi ni affiché. */
  slug: string;
  /** Mention / domaine (niveau 1 de la hiérarchie pédagogique). */
  mention?: string;
  /** @deprecated Conservé pour compatibilité ; aligné sur [mention]. */
  domaine: string[];
  /** Titre de formation (niveau 2), rattaché à `mention`. */
  titre: string;
  niveau: FormationLevel;
  duree: string;
  description: string;
  objectifs: string[];
  debouches: string[];
  /** @deprecated Fusionné dans `conditions` : ne plus alimenter. */
  conditionsAcces?: string;
  /** Conditions et prérequis d'accès — champ unique. */
  conditions?: string[];
  competences?: string[];
  modules?: any[];
  credits: number;
  /** Nom affiché du responsable (dénormalisé par le backend). */
  responsable?: string;
  /** Ressource humaine responsable, sélectionnée via SearchSelect. */
  responsableId?: number | null;
  email?: string;
  programme: string[];
  image: string;
  enVedette: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

/** Le slug n'est ni saisi ni envoyé : il est dérivé du titre par le backend. */
export type FormationFormData = Omit<Formation, 'id' | 'slug' | 'creeLe' | 'misAJourLe'>;

export interface FormationFilterOptions {
  niveau: string;
  domaine: string;
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
