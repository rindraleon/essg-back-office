export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'à l’instant';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;

  return formatDate(dateString);
}
