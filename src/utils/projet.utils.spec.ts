import { describe, expect, it } from 'vitest';
import { isValidSourceUrl, normalizeSourceUrl } from './projet.utils';

describe('projet.utils', () => {
  describe('normalizeSourceUrl', () => {
    it('prepends https:// when no protocol is present', () => {
      expect(normalizeSourceUrl('data.gov.mg/dataset')).toBe('https://data.gov.mg/dataset');
    });

    it('keeps an existing http protocol', () => {
      expect(normalizeSourceUrl('http://example.com')).toBe('http://example.com');
    });

    it('keeps an existing https protocol', () => {
      expect(normalizeSourceUrl('https://example.com/x')).toBe('https://example.com/x');
    });

    it('returns empty string for blank input', () => {
      expect(normalizeSourceUrl('   ')).toBe('');
    });
  });

  describe('isValidSourceUrl', () => {
    it('accepts http and https urls', () => {
      expect(isValidSourceUrl('https://example.com')).toBe(true);
      expect(isValidSourceUrl('http://example.com/x')).toBe(true);
    });

    it('accepts urls without protocol', () => {
      expect(isValidSourceUrl('example.com/data')).toBe(true);
    });

    it('rejects invalid urls', () => {
      expect(isValidSourceUrl('not a url')).toBe(false);
      expect(isValidSourceUrl('')).toBe(false);
      expect(isValidSourceUrl('ftp://example.com')).toBe(false);
    });
  });
});
