export { getActivityLogs } from './activity-logs.service';
export {
  getAllActualites,
  createActualite,
  updateActualite,
  deleteActualite,
} from './actualites.service';
export {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  getAdmissionFileBlob,
  downloadAdmissionArchive,
  deleteAdmissionFile,
  deleteAdmission,
  verifyAdmissionDocuments,
  getAdmissionVerifications,
  getLatestAdmissionVerification,
  getAdmissionVerification,
} from './admissions.service';
export type {
  AdmissionArchive,
  AdmissionQuery,
  AdmissionsListResponse,
  AdmissionDecisionPayload,
  AdmissionVerification,
  VerificationFieldResult,
  VerificationDocumentInfo,
  VerificationFieldStatus,
  VerificationGlobalStatus,
} from './admissions.service';
export { login, verifyToken } from './auth.service';
export {
  getMentions,
  getMentionById,
  getMentionOptions,
  getMentionDomaines,
  getParcoursByMention,
  createMention,
  updateMention,
  deleteMention,
  createParcours,
  updateParcours,
  deleteParcours,
} from './mentions.service';
export { getDashboardStats, getRecentActivities } from './dashboard.service';
export {
  getAllResultats,
  getResultatById,
  getResultatIndividuels,
  getResultatFileBlob,
  downloadModeleResultats,
  importResultat,
  confirmerImportResultat,
  publierResultat,
  depublierResultat,
  archiverResultat,
  supprimerResultat,
} from './results.service';
export type {
  ResultatPublication,
  ResultatIndividuel,
  ResultatsListResponse,
  ResultatsIndividuelsResponse,
  ResultatQuery,
  ResultatIndividuelQuery,
  ImportResultatPayload,
  ImportResultatResponse,
  ImportResultatPreview,
  ImportResultatPreviewRow,
  ConfirmationImportResultat,
  ResultatPublicationType,
  ResultatPublicationStatus,
  StatutAcademique,
} from './results.service';
export {
  getAllFormations,
  createFormation,
  updateFormation,
  deleteFormation,
} from './formations.service';
export {
  getAllMessages,
  searchMessages,
  updateMessage,
  replyToMessage,
  deleteMessage,
} from './messages.service';
export type { Message, PaginationResponse, PaginationQuery } from './messages.service';
export { ACCEPTED_CV_TYPES, OcrError, analyzeCv } from './ocr.service';
export type { OcrProgress, OcrResult } from './ocr.service';
export {
  getAllPartenaires,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
} from './partenaires.service';
export {
  getAllProjets,
  createProjet,
  updateProjet,
  deleteProjet,
  uploadImage,
} from './projets.service';
export {
  getAllRessourcesHumaines,
  createRessourceHumaine,
  updateRessourceHumaine,
  deleteRessourceHumaine,
} from './ressources-humaines.service';
export { getSettings, updateSettings } from './settings.service';
export type { Settings } from './settings.service';
export { getAllUsers, createUser, updateUser, uploadAvatar, deleteUser } from './users.service';
export type { UsersListResponse } from './users.service';
export {
  getCurrentSession,
  getMySessions,
  logoutCurrentSession,
  getUsersPresence,
  getUserPresenceById,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
} from './session.service';
