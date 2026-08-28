import { useCallback, useEffect, useState } from 'react';
import type { PageSeoData, SourceStatus } from '../data/seoTypes';

interface PageSeoResponse {
  page: PageSeoData;
  sources: SourceStatus;
  fetchedAt: string;
}

export type PageSeoStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Fetches SEO/traffic data for exactly one page — called by Inspector.tsx
 * whenever a node is opened. Backed by
 * netlify/functions/get-page-seo.mts: GA4 is queried fresh (cheap, one
 * page filtered server-side); SE Ranking comes from a shared, periodically
 * refreshed project-wide pull, since their API has no cheap per-page
 * lookup. This replaces reading from a nightly full-site snapshot with
 * "fetch it when you actually open the page".
 */
export function usePageSeo(path: string | null, onLoaded?: () => void) {
  const [status, setStatus] = useState<PageSeoStatus>('idle');
  const [result, setResult] = useState<PageSeoResponse | null>(null);

  const load = useCallback(
    (p: string, force: boolean) => {
      setStatus('loading');
      const url = `/.netlify/functions/get-page-seo?path=${encodeURIComponent(p)}${force ? '&force=1' : ''}`;
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`get-page-seo returned ${res.status}`);
          return res.json();
        })
        .then((data: PageSeoResponse) => {
          setResult(data);
          setStatus('ready');
          onLoaded?.();
        })
        .catch(() => {
          setStatus('error');
        });
    },
    [onLoaded],
  );

  useEffect(() => {
    if (!path) {
      setStatus('idle');
      setResult(null);
      return;
    }
    load(path, false);
  }, [path, load]);

  const refresh = useCallback(
    (force = true) => {
      if (path) load(path, force);
    },
    [path, load],
  );

  return { status, result, refresh };
}
