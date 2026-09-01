function resolveApiBase(): string {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_APP_URL as string | undefined) ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '').replace(/\/api$/, '');
}

export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024;

export const isAcceptedImage = (file: File): boolean =>
  (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);

export const isRemoteImage = (imagePath?: string | null): boolean => {
  if (!imagePath) return false;
  return (
    imagePath.startsWith('http') ||
    imagePath.startsWith('/media/') ||
    imagePath.startsWith('/uploads/') ||
    imagePath.startsWith('/images/')
  );
};

export const getImageUrl = (imagePath?: string | null): string => {
  const value = imagePath?.trim();
  if (!value) return '';
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }
  const baseUrl = resolveApiBase();
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${path}`;
};
