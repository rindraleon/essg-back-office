import { describe, expect, it } from 'vitest';
import { formatFileSize, getFileExtension } from '../../utils/admission.utils';

describe('AdmissionDetailDialog helpers', () => {
  describe('getFileExtension', () => {
    it('returns the uppercase extension', () => {
      expect(getFileExtension('releve.pdf')).toBe('PDF');
      expect(getFileExtension('photo.PNG')).toBe('PNG');
    });

    it('returns — when no extension', () => {
      expect(getFileExtension('document')).toBe('—');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes, KB and MB', () => {
      expect(formatFileSize(512)).toBe('512 o');
      expect(formatFileSize(2048)).toBe('2 Ko');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 Mo');
    });

    it('returns — when size is missing', () => {
      expect(formatFileSize(0)).toBe('—');
    });
  });
});
