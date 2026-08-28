// GA4 is fetched fresh per-page (see ga4Client.ts's getSessionsForPath) —
// there's no shared pull to read a success flag off like SE Ranking has
// (seRankingProjectPull.ts). This tiny record is just "did the most recent
// GA4 call, from any page, succeed", for the toolbar/inspector to report.
import { getStore } from '@netlify/blobs';

interface Ga4Status {
  ok: boolean;
  lastAttempt: string;
}

function store() {
  return getStore('ga4-status');
}

export async function recordGa4Attempt(ok: boolean): Promise<void> {
  await store().setJSON('current', { ok, lastAttempt: new Date().toISOString() } satisfies Ga4Status);
}

export async function peekGa4Status(): Promise<Ga4Status | null> {
  return (await store().get('current', { type: 'json' })) as Ga4Status | null;
}
