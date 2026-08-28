export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
