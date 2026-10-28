export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_UPDATE: 'content.update',
  CONTENT_DELETE: 'content.delete',
  MEDIA_UPLOAD: 'media.upload',
  ADMISSION_VIEW: 'admission.view',
  ADMISSION_DOWNLOAD: 'admission.download',
  ADMISSION_MANAGE: 'admission.manage',
  ADMISSION_DELETE: 'admission.delete',
  CONTACT_VIEW: 'contact.view',
  CONTACT_MANAGE: 'contact.manage',
  CONTACT_DELETE: 'contact.delete',
  SETTINGS_ADMISSION: 'settings.admission',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
