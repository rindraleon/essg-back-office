import type { FormationLevel } from './formation.types';

/** Parcours résumé rattaché à une mention. */
export interface MentionParcoursSummary {
  id: number;
  nom: string;
  slug: string;
  isActive: boolean;
  formationCount: number;
}

/** Formation légère affichée dans le détail d'une mention. */
export interface MentionFormationSummary {
  id: number;
  titre: string;
  slug: string;
  niveau: FormationLevel;
  enVedette: boolean;
}

export interface MentionParcoursDetail extends MentionParcoursSummary {
  mentionId: number;
  creeLe: Date | string;
  misAJourLe: Date | string;
  formations?: MentionFormationSummary[] | null;
}

export interface Mention {
  id: number;
  nom: string;
  slug: string;
  domaine: string | null;
  description: string | null;
  isActive: boolean;
  parcoursCount: number;
  creeLe: Date | string;
  misAJourLe: Date | string;
  parcours?: MentionParcoursDetail[] | MentionParcoursSummary[] | null;
}

/** Élément parcours du formulaire dynamique (création/édition de mention). */
export interface MentionParcoursInput {
  /** Présent pour un parcours déjà enregistré (mode édition). */
  id?: number;
  nom: string;
}

export interface MentionFormData {
  nom: string;
  domaine?: string;
  isActive: boolean;
  parcours: MentionParcoursInput[];
}

export interface Parcours {
  id: number;
  nom: string;
  slug: string;
  isActive: boolean;
  mentionId: number;
  mention: { id: number; nom: string; slug: string } | null;
  formationCount: number;
  creeLe: Date | string;
  misAJourLe: Date | string;
}

/** Cible d'édition rapide d'un parcours (liste ou détail). */
export type ParcoursEditTarget = Pick<Parcours, 'id'> & Partial<Parcours>;

export interface ParcoursFormData {
  mentionId: number;
  nom: string;
  isActive?: boolean;
}

/** Option légère retournée par GET /mentions/options (listes déroulantes). */
export interface MentionOption {
  id: number;
  nom: string;
  slug: string;
  domaine: string | null;
}

export interface MentionQueryFilters {
  isActive?: 'true' | 'false' | '';
  domaine?: string;
}

export interface MentionFilterOptions {
  isActive: string;
  domaine: string;
}

export interface MentionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MentionFormData) => void | Promise<void>;
  initialData?: Mention | null;
  mode: 'create' | 'edit';
  submitting?: boolean;
}

export interface ParcoursFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ParcoursFormData) => void | Promise<void>;
  /** Mention imposée (création depuis le détail d'une mention). */
  lockedMentionId?: number | null;
  /** Libellé de la mention verrouillée, affiché sans requête supplémentaire. */
  lockedMentionName?: string | null;
  initialData?: ParcoursEditTarget | null;
  mode: 'create' | 'edit';
  submitting?: boolean;
}

export interface MentionTableProps {
  data: Mention[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onView: (mention: Mention) => void;
  onEdit: (mention: Mention) => void;
  onDelete: (mention: Mention) => void;
}

export interface MentionViewDialogProps {
  open: boolean;
  onClose: () => void;
  mention: Mention | null;
  onEdit: (mention: Mention) => void;
  onAddParcours: (mention: { id: number; nom: string }) => void;
  onEditParcours: (parcours: ParcoursEditTarget, mention: { id: number; nom: string }) => void;
}
