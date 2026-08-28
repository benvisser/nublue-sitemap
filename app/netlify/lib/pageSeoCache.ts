// Write-through record of every page get-page-seo.mts has computed. This
// is NOT used to decide whether to re-fetch (get-page-seo always computes
// fresh on open — GA4's per-page call is cheap, and SE Ranking's data
// comes from the separately-cached project pull) — it exists purely so
// get-seo-snapshot.mts has something to assemble for the node-map heat
// map and List View's sortable columns, which only ever reflect pages
// that have actually been opened at least once.
import { getStore } from '@netlify/blobs';
import type { PageSeoData } from '../../src/data/seoTypes.js';

export interface CachedPage {
  data: PageSeoData;
  fetchedAt: string;
}

function store() {
  return getStore('seo-pages');
}

// Blob keys can't start with "/" — every real page path does
// (sitemapTree.ts's URLs are all "/foo/bar/"), so strip it; "/" itself
// (the home page) needs a non-empty placeholder.
function keyFor(path: string): string {
  const stripped = path.replace(/^\/+/, '');
  return stripped === '' ? '__home__' : stripped;
}

export async function setCachedPage(path: string, data: PageSeoData): Promise<void> {
  await store().setJSON(keyFor(path), { data, fetchedAt: new Date().toISOString() } satisfies CachedPage);
}

export async function listCachedPages(): Promise<CachedPage[]> {
  const { blobs } = await store().list();
  const out: CachedPage[] = [];
  for (const b of blobs) {
    const entry = (await store().get(b.key, { type: 'json' })) as CachedPage | null;
    if (entry) out.push(entry);
  }
  return out;
}
