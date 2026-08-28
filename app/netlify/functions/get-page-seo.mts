// Called when the frontend opens a node's inspector — fetches (or reuses
// a cached) SEO/traffic row for exactly one page, instead of relying on a
// nightly batch pull for all ~300 pages. GA4 is cheap enough to query
// fresh per page every time; SE Ranking is bulk-only, so it comes from
// seRankingProjectPull.ts's shared, periodically-refreshed cache. See
// app/README.md for the full rationale.
//
//   GET /.netlify/functions/get-page-seo?path=/electrical/panels/
//   GET /.netlify/functions/get-page-seo?path=/electrical/panels/&force=1   (bypass the SE Ranking cache TTL)
import { computePageRow, computeProjectedRow } from '../lib/buildSnapshot.js';
import { getSessionsForPath } from '../lib/ga4Client.js';
import { recordGa4Attempt } from '../lib/ga4Status.js';
import { setCachedPage } from '../lib/pageSeoCache.js';
import { getProjectPull } from '../lib/seRankingProjectPull.js';
import { currentSitePaths, projectedPaths } from '../lib/seoConfig.js';
import type { PageSeoData } from '../../src/data/seoTypes.js';

interface Sources {
  seRanking: boolean;
  ga4: boolean;
}

async function computeRealRow(path: string, force: boolean): Promise<{ row: PageSeoData; sources: Sources }> {
  const [pull, ga4Result] = await Promise.all([
    getProjectPull(force),
    getSessionsForPath(path).then(
      (n) => ({ ok: true, value: n }) as const,
      (err) => {
        console.error('[get-page-seo] GA4 getSessionsForPath failed:', err);
        return { ok: false, value: null } as const;
      },
    ),
  ]);
  await recordGa4Attempt(ga4Result.ok);

  const row = computePageRow(path, pull.keywordRows, pull.auditRows, ga4Result.value, pull.ok);
  await setCachedPage(path, row);
  return { row, sources: { seRanking: pull.ok, ga4: ga4Result.ok } };
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
    let sources: Sources;

    if (projected) {
      // Future-state page — no real pull, no source calls at all; just an
      // estimate off its nearest real ancestor's already-computed numbers.
      let parentRow: PageSeoData | null = null;
      sources = { seRanking: false, ga4: false };
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
