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
  deleteAdmissionFile,
  deleteAdmission,
} from './admissions.service';
export type {
  AdmissionQuery,
  AdmissionsListResponse,
  AdmissionDecisionPayload,
} from './admissions.service';
export { login, verifyToken } from './auth.service';
export { getDashboardStats, getRecentActivities } from './dashboard.service';
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
