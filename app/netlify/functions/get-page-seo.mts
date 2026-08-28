// Called when the frontend opens a node's inspector — fetches (or reuses
// a cached) SEO/traffic row for exactly one page, instead of relying on a
// nightly batch pull for all ~300 pages. GA4 and Search Console are both
// cheap enough to query fresh per page every time (filtered server-side
// to one path); SE Ranking is bulk-only, so it comes from
// seRankingProjectPull.ts's shared, periodically-refreshed cache. See
// app/README.md for the full rationale.
//
//   GET /.netlify/functions/get-page-seo?path=/electrical/panels/
//   GET /.netlify/functions/get-page-seo?path=/electrical/panels/&force=1   (bypass the SE Ranking cache TTL)
import { computePageRow, computeProjectedRow } from '../lib/buildSnapshot.js';
import { getPageTraffic } from '../lib/ga4Client.js';
import { recordGa4Attempt } from '../lib/ga4Status.js';
import { getPageSearchPerformance } from '../lib/gscClient.js';
import { recordGscAttempt } from '../lib/gscStatus.js';
import { setCachedPage } from '../lib/pageSeoCache.js';
import { getPageIssues } from '../lib/seRankingClient.js';
import { getProjectPull } from '../lib/seRankingProjectPull.js';
import { currentSitePaths, projectedPaths } from '../lib/seoConfig.js';
import type { PageSeoData, SourceStatus } from '../../src/data/seoTypes.js';

const BASE_URL = 'https://callnublue.com';

async function computeRealRow(path: string, force: boolean): Promise<{ row: PageSeoData; sources: SourceStatus }> {
  const [pull, ga4Result, gscResult] = await Promise.all([
    getProjectPull(force),
    getPageTraffic(path).then(
      (v) => ({ ok: true, value: v }) as const,
      (err) => {
        console.error('[get-page-seo] GA4 getPageTraffic failed:', err);
        return { ok: false, value: null } as const;
      },
    ),
    getPageSearchPerformance(path).then(
      (v) => ({ ok: true, value: v }) as const,
      (err) => {
        console.error('[get-page-seo] GSC getPageSearchPerformance failed:', err);
        return { ok: false, value: null } as const;
      },
    ),
  ]);
  await Promise.all([recordGa4Attempt(ga4Result.ok), recordGscAttempt(gscResult.ok)]);

  // Real per-page issue detail (Site Audit "get all issues by URL") —
  // a single-URL lookup SE Ranking's own docs list at 0 credits cost, so
  // it's called fresh per page open rather than folded into the cached
  // bulk pull. Needs pull.auditId, so it runs after the pull above
  // resolves rather than in the same Promise.all; null when there's no
  // audit at all (pull.auditId is null) or the call itself fails.
  const pageIssues = pull.auditId != null ? await getPageIssues(pull.auditId, `${BASE_URL}${path}`) : null;

  const row = computePageRow(path, pull.keywordRows, pull.auditRows, ga4Result.value, gscResult.value, pull.ok, pageIssues);
  await setCachedPage(path, row);
  return { row, sources: { seRanking: pull.ok, ga4: ga4Result.ok, gsc: gscResult.ok } };
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  const force = url.searchParams.get('force') === '1';
  if (!path) {
    return new Response(JSON.stringify({ error: 'missing path' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const projected = projectedPaths().find((p) => p.path === path);
  const isKnown = projected || currentSitePaths().includes(path);
  if (!isKnown) {
    return new Response(JSON.stringify({ error: 'unknown path' }), { status: 404, headers: { 'content-type': 'application/json' } });
  }

  try {
    let row: PageSeoData;
    let sources: SourceStatus;

    if (projected) {
      // Future-state page — no real pull, no source calls at all; just an
      // estimate off its nearest real ancestor's already-computed numbers.
      let parentRow: PageSeoData | null = null;
      sources = { seRanking: false, ga4: false, gsc: false };
      if (projected.parentPath) {
        const parent = await computeRealRow(projected.parentPath, false);
        parentRow = parent.row;
        sources = parent.sources;
      }
      row = computeProjectedRow(path, parentRow);
      await setCachedPage(path, row);
    } else {
      ({ row, sources } = await computeRealRow(path, force));
    }

    return new Response(JSON.stringify({ page: row, sources, fetchedAt: new Date().toISOString() }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('[get-page-seo] failed:', err);
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
