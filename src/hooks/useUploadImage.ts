import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '../services';

export function useUploadImage(folder = 'images') {
  return useMutation({
    mutationKey: ['upload', 'image', folder],
    mutationFn: (file: File) => uploadImage(file, folder),
  });
}
