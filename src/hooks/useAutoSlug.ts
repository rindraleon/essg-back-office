import { useCallback, useRef } from 'react';
import { generateSlug } from '../utils/slug.utils';

export function useAutoSlug() {
  const lockedRef = useRef(false);

  const reset = useCallback((existingSlug?: string) => {
    lockedRef.current = Boolean(existingSlug);
  }, []);

  const fromTitle = useCallback((title: string): string | undefined => {
    if (lockedRef.current) return undefined;
    return generateSlug(title);
  }, []);

  const lock = useCallback(() => {
    lockedRef.current = true;
  }, []);

  return { reset, fromTitle, lock };
}
