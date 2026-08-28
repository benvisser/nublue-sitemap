import { useEffect, useState } from 'react';
import { buildSampleSnapshot } from '../data/sampleSeoData';
import type { SeoSnapshot } from '../data/seoTypes';

/**
 * Loads the SEO/traffic snapshot from the Netlify function (which itself
 * just reads the file the nightly job last wrote — see
 * netlify/functions/get-seo-snapshot.mts). Falls back to deterministic
 * sample data if the endpoint 404s (no snapshot yet) or is unreachable
 * (local `vite dev` without `netlify dev`), so the SEO layer is always
 * demoable and the app never breaks on a missing snapshot.
 */
export function useSeoSnapshot() {
  const [snapshot, setSnapshot] = useState<SeoSnapshot | null>(null);
  const [isSample, setIsSample] = useState(false);

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
          setIsSample(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(buildSampleSnapshot());
          setIsSample(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { snapshot, isSample };
}
