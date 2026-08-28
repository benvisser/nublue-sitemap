import { useEffect, useState } from 'react';
import type { SeoSnapshot } from '../data/seoTypes';

const EMPTY_SNAPSHOT: SeoSnapshot = {
  generatedAt: '',
  sources: { seRanking: false, ga4: false },
  pages: {},
};

/**
 * Loads the SEO/traffic snapshot from the Netlify function (which itself
 * just reads the file the nightly job last wrote — see
 * netlify/functions/get-seo-snapshot.mts). There is no fabricated fallback
 * here on purpose: if the endpoint 404s (no snapshot has ever run) or is
 * unreachable (local `npm run dev` without linking to the site), the app
 * shows an empty snapshot — every node reads as "no data yet" rather than
 * a plausible-looking made-up number. `hasSnapshot` tells callers whether
 * what they're looking at came from a real pull at all.
 */
export function useSeoSnapshot() {
  const [snapshot, setSnapshot] = useState<SeoSnapshot>(EMPTY_SNAPSHOT);
  const [hasSnapshot, setHasSnapshot] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/.netlify/functions/get-seo-snapshot')
      .then((res) => {
        if (!res.ok) throw new Error(`snapshot endpoint returned ${res.status}`);
        return res.json();
      })
      .then((data: SeoSnapshot) => {
        if (!cancelled) {
          setSnapshot(data);
          setHasSnapshot(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(EMPTY_SNAPSHOT);
          setHasSnapshot(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, hasSnapshot };
}
