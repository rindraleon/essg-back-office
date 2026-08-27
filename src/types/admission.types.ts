export type AdmissionFileType =
  | 'cv'
  | 'lettre'
  | 'releve_bac'
  | 'attestation_bac'
  | 'releve_l3'
  | 'bordereau'
  | 'demande_inscription'
  | 'photo_identite'
  | 'acte_etat_civil'
  | 'diplome_bac'
  | 'attestation_etablissement';

export type AdmissionFile = {
  id: number;
  admissionId: number;
  type: AdmissionFileType;
  originalName: string;
  objectPath: string;
  mimetype: string;
  size: number;
  creeLe: string;
};

export type Admission = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance: string;
  lieuNaissance?: string | null;
  nationalite?: string | null;
  sexe?: string | null;
  niveau: string;
  formation: string;
  diplomePrecedent: string;
  adresse?: string | null;
  bacType?: string | null;
  bacSerie?: string | null;
  bacCategorie?: string | null;
  numeroBaccalaureat?: string | null;
  bacAnneeObtention?: string | null;
  bacCentreExamen?: string | null;
  mention?: string | null;
  parcours?: string | null;
  ancienEtablissement?: string | null;
  numeroMatricule?: string | null;
  licenceEtablissement?: string | null;
  licenceMention?: string | null;
  licenceAnneeObtention?: string | null;
  numeroBordereau?: string | null;
  cvPath?: string;
  lettreMotivationPath?: string;
  files: AdmissionFile[];
  statut: 'en_attente' | 'en_cours_etude' | 'accepte' | 'refuse';
  commentaire?: string;
  reponseDate?: string | null;
  reponseHeure?: string | null;
  reponseLieu?: string | null;
  reponseInstructions?: string | null;
  reponseMessage?: string | null;
  creeLe: string;
  misAJourLe: string;
};

export type AdmissionStatus = 'en_attente' | 'en_cours_etude' | 'accepte' | 'refuse';

export const ADMISSION_FILE_TYPE_LABELS: Record<AdmissionFileType, string> = {
  cv: 'CV',
  lettre: 'Lettre de motivation',
  releve_bac: 'Relevé de notes du baccalauréat',
  attestation_bac: 'Attestation de réussite au baccalauréat',
  releve_l3: 'Relevé de notes de Licence',
  bordereau: 'Reçu de versement',
  demande_inscription: "Demande d'inscription",
  photo_identite: "Photo d'identité",
  acte_etat_civil: "Acte d'état civil",
  diplome_bac: 'Diplôme du baccalauréat',
  attestation_etablissement: "Attestation de l'ancien établissement",
};
