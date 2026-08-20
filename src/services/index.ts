export { getNews, getNewsBySlug } from './news.service';
export { login, verifyToken, logout } from './auth.service';
export {
  getAllFormations,
  getFormationById,
  searchFormations,
  createFormation,
  updateFormation,
  deleteFormation,
} from './formations.service';
export {
  getAllActualites,
  getActualiteById,
  createActualite,
  updateActualite,
  deleteActualite,
} from './actualites.service';
export {
  getAllRessourcesHumaines,
  getRessourceHumaineById,
  createRessourceHumaine,
  updateRessourceHumaine,
  deleteRessourceHumaine,
} from './ressources-humaines.service';
export {
  getAllProjets,
  getProjetById,
  createProjet,
  updateProjet,
  deleteProjet,
  uploadImage,
} from './projets.service';
export {
  getAllPartenaires,
  getPartenaireById,
  createPartenaire,
  updatePartenaire,
  deletePartenaire,
} from './partenaires.service';
export { getDashboardStats, getRecentActivities, getDashboardOverview } from './dashboard.service';
export {
  getAllUsers,
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
} from './users.service';

export {
  getAllAdmissions,
  searchAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission,
} from './admissions.service';

export {
  getActivityLogs,
  getActivityLogById,
} from './activity-logs.service';

export {
  getAllMessages,
  searchMessages,
  getMessageById,
  updateMessage,
  replyToMessage,
  deleteMessage,
  type Message,
  type PaginationResponse,
  type PaginationQuery,
} from './messages.service';
