import { useCallback, useEffect, useState } from 'react';
import type { SeoSnapshot } from '../data/seoTypes';

const EMPTY_SNAPSHOT: SeoSnapshot = {
  generatedAt: '',
  sources: { seRanking: false, ga4: false, gsc: false },
  pages: {},
};

/**
 * Aggregate view for the node-map heat map, List View's sortable columns,
 * and the toolbar's freshness stamp — see
 * netlify/functions/get-seo-snapshot.mts. Under the per-page "fetch when
 * the page loads" model (see usePageSeo.ts, which is what the inspector
 * actually uses), this only ever reflects pages someone has opened at
 * least once; it starts empty and fills in as the sitemap gets used,
 * rather than requiring a full nightly pull of every page first.
 *
 * `reload()` is called by App.tsx after the inspector finishes loading a
 * page, so the heat map/list view pick up that page without a manual
 * refresh or a poll loop.
 */
export function useSeoSnapshot() {
  const [snapshot, setSnapshot] = useState<SeoSnapshot>(EMPTY_SNAPSHOT);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  const reload = useCallback(() => {
    fetch('/.netlify/functions/get-seo-snapshot')
      .then((res) => {
        if (!res.ok) throw new Error(`snapshot endpoint returned ${res.status}`);
        return res.json();
      })
      .then((data: SeoSnapshot) => {
        setSnapshot(data);
        setHasSnapshot(data.generatedAt !== '');
      })
      .catch(() => {
        setSnapshot(EMPTY_SNAPSHOT);
        setHasSnapshot(false);
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { snapshot, hasSnapshot, reload };
}
