import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavigationPending() {
  const { pathname } = useLocation();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const startNavigation = (path: string, event: MouseEvent) => {
    const isPlainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (!isPlainClick || path === pathname) return;
    setPendingPath(path);
  };

  const isPending = (path: string) => pendingPath === path && path !== pathname;

  return { isPending, startNavigation };
}
