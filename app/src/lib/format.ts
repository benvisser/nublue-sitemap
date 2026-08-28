export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

/** e.g. formatDelta(184, 164) -> "+12%"; null when there's no prior
 * period to compare against or the prior period was zero (a % change
 * from zero is meaningless). */
export function formatDelta(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

export function formatSeconds(n: number | null | undefined): string {
  if (n == null) return '—';
  const m = Math.floor(n / 60);
  const s = n % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n == null) return '—';
  return `${(n * 100).toFixed(digits)}%`;
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
