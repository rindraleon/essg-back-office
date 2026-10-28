import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '@/components/ui/save-button';

const SUCCESS_FEEDBACK_MS = 1800;

export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const runningRef = useRef(false);

  useEffect(() => {
    if (status !== 'success') return;
    const timeout = window.setTimeout(() => setStatus('idle'), SUCCESS_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const run = useCallback(async (action: () => unknown) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setStatus('loading');
    try {
      await action();
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      runningRef.current = false;
    }
  }, []);

  return { status, run };
}
