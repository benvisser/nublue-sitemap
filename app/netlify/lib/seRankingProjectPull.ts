// SE Ranking's API is bulk-only — there's no cheap "just this one page's
// keywords" endpoint, so unlike GA4 (see ga4Client.ts's getSessionsForPath)
// we can't afford to call it fresh on every page open. Instead we pull the
// whole domain's keyword positions + page audit once, cache it in Netlify
// Blobs, and every get-page-seo.mts call reuses that cache until it goes
// stale — one pull serves however many pages get opened in that window.
import { getStore } from '@netlify/blobs';
import { findAudit, getKeywordPositions, getPageAudit, type SeRankingAuditPage, type SeRankingKeywordRow } from './seRankingClient.js';

const TTL_MS = 12 * 60 * 60 * 1000; // 12h

export interface ProjectPull {
  keywordRows: SeRankingKeywordRow[];
  auditRows: SeRankingAuditPage[];
  /** The Website Audit's own id, cached alongside everything else so
   * get-page-seo.mts can fetch per-page issue detail (see
   * seRankingClient.ts's getPageIssues) without re-resolving the audit
   * on every single page open — null if no audit was found for the
   * domain, in which case per-page issue detail is simply unavailable. */
  auditId: number | string | null;
  fetchedAt: string;
  /** True as long as keyword/position data came through — that's the
   * bulk of what "SE Ranking connected" means for the UI. The Website
   * Audit call (content score/issues) is a separate, independently
   * fallible call: if it fails, auditRows is just empty (content score
   * reads 0, no issues) rather than taking down the whole pull, since
   * keyword data alone is still valuable. */
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
 * refresh). A failed keyword re-pull falls back to the last good cached
 * pull (stale-but-real beats nothing) rather than wiping it out. */
export async function getProjectPull(force = false): Promise<ProjectPull> {
  const cached = (await store().get('current', { type: 'json' })) as ProjectPull | null;
  if (cached && !force && isFresh(cached)) return cached;

  const [keywordResult, auditResult, auditIdResult] = await Promise.allSettled([getKeywordPositions(), getPageAudit(), findAudit()]);

  if (keywordResult.status === 'rejected') {
    console.error('[seRankingProjectPull] keyword pull failed — leaving SE Ranking disconnected for this request:', keywordResult.reason);
    if (cached) return { ...cached, ok: false };
    return { keywordRows: [], auditRows: [], auditId: null, fetchedAt: new Date().toISOString(), ok: false };
  }

  if (auditResult.status === 'rejected') {
    console.error('[seRankingProjectPull] audit pull failed — keyword data is still good, content score/issues will read empty:', auditResult.reason);
  }
  if (auditIdResult.status === 'rejected') {
    console.error('[seRankingProjectPull] findAudit (for per-page issue lookups) failed:', auditIdResult.reason);
  }

  const fresh: ProjectPull = {
    keywordRows: keywordResult.value,
    auditRows: auditResult.status === 'fulfilled' ? auditResult.value : [],
    auditId: auditIdResult.status === 'fulfilled' && auditIdResult.value ? auditIdResult.value.id : null,
    fetchedAt: new Date().toISOString(),
    ok: true,
  };
  await store().setJSON('current', fresh);
  return fresh;
}
