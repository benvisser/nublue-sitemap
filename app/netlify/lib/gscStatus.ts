// Same idea as ga4Status.ts: GSC is fetched fresh per-page with no shared
// pull to read a success flag off, so this tiny record tracks "did the
// most recent Search Console call, from any page, succeed" for the
// toolbar/inspector to report.
import { getStore } from '@netlify/blobs';

interface GscStatus {
  ok: boolean;
  lastAttempt: string;
}

function store() {
  return getStore('gsc-status');
}

export async function recordGscAttempt(ok: boolean): Promise<void> {
  await store().setJSON('current', { ok, lastAttempt: new Date().toISOString() } satisfies GscStatus);
}

export async function peekGscStatus(): Promise<GscStatus | null> {
  return (await store().get('current', { type: 'json' })) as GscStatus | null;
}
