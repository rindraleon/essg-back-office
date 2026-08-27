export { queryKeys } from './queries/keys';
export { useActivityLogsQuery } from './queries/useActivityLogsQuery';
export {
  useActualitesQuery,
  useCreateActualite,
  useUpdateActualite,
  useDeleteActualite,
} from './queries/useActualitesQuery';
export {
  useRecentAdmissionsQuery,
  useAdmissionsQuery,
  useAdmissionDetailQuery,
  useUpdateAdmissionStatus,
  useDeleteAdmission,
  useDeleteAdmissionFile,
} from './queries/useAdmissionsQuery';
export { useDashboardStatsQuery, useRecentActivitiesQuery } from './queries/useDashboardQuery';
export { useFormationMentionsQuery } from './queries/useFormationMentionsQuery';
export {
  useFormationsQuery,
  useCreateFormation,
  useUpdateFormation,
  useDeleteFormation,
} from './queries/useFormationsQuery';
export {
  useRecentMessagesQuery,
  useMessagesQuery,
  useMarkMessageRead,
  useReplyToMessage,
  useDeleteMessage,
} from './queries/useMessagesQuery';
export {
  usePartenairesQuery,
  useCreatePartenaire,
  useUpdatePartenaire,
  useDeletePartenaire,
} from './queries/usePartenairesQuery';
export {
  useProjetsQuery,
  useCreateProjet,
  useUpdateProjet,
  useDeleteProjet,
} from './queries/useProjetsQuery';
export {
  useRessourcesHumainesQuery,
  useCreateRessourceHumaine,
  useUpdateRessourceHumaine,
  useDeleteRessourceHumaine,
} from './queries/useRessourcesHumainesQuery';
export { useSettingsQuery, useUpdateSettings } from './queries/useSettingsQuery';
export {
  useUsersQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from './queries/useUsersQuery';
export { default as useDebounce } from './useDebounce';
export { useFilter } from './useFilter';
export { default as useFormationFilter } from './useFormationFilter';
export { useFormValidation } from './useFormValidation';
export type {
  ValidationRule,
  FieldConfig,
  FieldValidators,
  UseFormValidationOptions,
  UseFormValidationReturn,
} from './useFormValidation';
export { default as usePagination } from './usePagination';
export { usePartenaireFilter } from './usePartenaireFilter';
export { useProjetFilter } from './useProjetFilter';
export { useRessourceHumaineFilter } from './useRessourceHumaineFilter';
export { default as useScrollToTop } from './useScrollToTop';
export { useTitle } from './useTitle';
