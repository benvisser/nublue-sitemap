// SE Ranking's API is bulk-only — there's no cheap "just this one page's
// keywords" endpoint, so unlike GA4 (see ga4Client.ts's getSessionsForPath)
// we can't afford to call it fresh on every page open. Instead we pull the
// whole project's keyword positions + page audit once, cache it in Netlify
// Blobs, and every get-page-seo.mts call reuses that cache until it goes
// stale — one pull serves however many pages get opened in that window.
import { getStore } from '@netlify/blobs';
import { getKeywordPositions, getPageAudit, type SeRankingAuditPage, type SeRankingKeywordRow } from './seRankingClient.js';

const TTL_MS = 12 * 60 * 60 * 1000; // 12h

export interface ProjectPull {
  keywordRows: SeRankingKeywordRow[];
  auditRows: SeRankingAuditPage[];
  fetchedAt: string;
  ok: boolean;
}

function store() {
  return getStore('seranking-project-pull');
}

function isFresh(pull: ProjectPull): boolean {
  return Date.now() - new Date(pull.fetchedAt).getTime() < TTL_MS;
}

/** Reads whatever's cached without triggering a pull — used by
 * get-seo-snapshot.mts, which just wants to report current status, not
 * cause a live SE Ranking call on every toolbar render. */
export async function peekProjectPull(): Promise<ProjectPull | null> {
  return (await store().get('current', { type: 'json' })) as ProjectPull | null;
}

/** Returns the cached pull if it's still fresh; otherwise re-pulls from SE
 * Ranking. `force` bypasses the TTL (used by the inspector's manual
 * refresh). A failed re-pull falls back to the last good cached pull
 * (stale-but-real beats nothing) rather than wiping it out. */
export async function getProjectPull(force = false): Promise<ProjectPull> {
  const cached = (await store().get('current', { type: 'json' })) as ProjectPull | null;
  if (cached && !force && isFresh(cached)) return cached;

  try {
    const [keywordRows, auditRows] = await Promise.all([getKeywordPositions(), getPageAudit()]);
    const fresh: ProjectPull = { keywordRows, auditRows, fetchedAt: new Date().toISOString(), ok: true };
    await store().setJSON('current', fresh);
    return fresh;
  } catch (err) {
    console.error('[seRankingProjectPull] pull failed — leaving SE Ranking disconnected for this request:', err);
    if (cached) return { ...cached, ok: false };
    return { keywordRows: [], auditRows: [], fetchedAt: new Date().toISOString(), ok: false };
  }
}
