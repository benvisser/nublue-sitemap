// Aggregate view for the node-map heat map, List View's sortable columns,
// and the toolbar's freshness stamp. Assembled from whatever get-page-seo.mts
// has computed and cached so far (see pageSeoCache.ts) — under the
// per-page "fetch when the page loads" model, that means it only reflects
// pages someone has actually opened at least once, not a full nightly
// pull of every page. Starts empty on a fresh deploy and fills in as the
// sitemap gets used.
import { listCachedPages } from '../lib/pageSeoCache.js';
import { peekProjectPull } from '../lib/seRankingProjectPull.js';
import { peekGa4Status } from '../lib/ga4Status.js';
import { peekGscStatus } from '../lib/gscStatus.js';

export default async () => {
  const cachedPages = await listCachedPages();
  const [seRanking, ga4, gsc] = await Promise.all([peekProjectPull(), peekGa4Status(), peekGscStatus()]);

  const pages: Record<string, unknown> = {};
  let generatedAt = '';
  for (const { data, fetchedAt } of cachedPages) {
    pages[data.path] = data;
    if (fetchedAt > generatedAt) generatedAt = fetchedAt;
  }

  const snapshot = {
    generatedAt,
    sources: {
      seRanking: Boolean(seRanking?.ok),
      ga4: Boolean(ga4?.ok),
      gsc: Boolean(gsc?.ok),
    },
    pages,
  };

  return new Response(JSON.stringify(snapshot), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
