import { useCallback, useEffect, useRef, useState } from 'react';
import type { SeoSnapshot } from '../data/seoTypes';

const EMPTY_SNAPSHOT: SeoSnapshot = {
  generatedAt: '',
  sources: { seRanking: false, ga4: false },
  pages: {},
};

const POLL_INTERVAL_MS = 8000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

export type RefreshState = 'idle' | 'triggering' | 'waiting' | 'done' | 'error';

/**
 * Loads the SEO/traffic snapshot from the Netlify function (which itself
 * just reads the file the nightly job last wrote — see
 * netlify/functions/get-seo-snapshot.mts). There is no fabricated fallback
 * here on purpose: if the endpoint 404s (no snapshot has ever run) or is
 * unreachable (local `npm run dev` without linking to the site), the app
 * shows an empty snapshot — every node reads as "no data yet" rather than
 * a plausible-looking made-up number. `hasSnapshot` tells callers whether
 * what they're looking at came from a real pull at all.
 *
 * `triggerRefresh` kicks off refresh-seo-data-now-background.mts (a
 * background function — the POST returns immediately, the actual pull
 * keeps running) and polls get-seo-snapshot until `generatedAt` changes
 * or POLL_TIMEOUT_MS passes, so the "Refresh SEO Data" button doesn't
 * need the user to check Netlify's logs themselves for the common case.
 */
export function useSeoSnapshot() {
  const [snapshot, setSnapshot] = useState<SeoSnapshot>(EMPTY_SNAPSHOT);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/.netlify/functions/get-seo-snapshot');
    if (!res.ok) throw new Error(`snapshot endpoint returned ${res.status}`);
    const data: SeoSnapshot = await res.json();
    setSnapshot(data);
    setHasSnapshot(true);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {
      if (!cancelled) {
        setSnapshot(EMPTY_SNAPSHOT);
        setHasSnapshot(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  }, []);

  // "Done" / "error" are transient UI states — settle back to idle so the
  // button returns to its normal label instead of staying stuck.
  useEffect(() => {
    if (refreshState !== 'done' && refreshState !== 'error') return;
    const t = setTimeout(() => setRefreshState('idle'), 6000);
    return () => clearTimeout(t);
  }, [refreshState]);

  const triggerRefresh = useCallback(async () => {
    if (refreshState === 'triggering' || refreshState === 'waiting') return;
    setRefreshState('triggering');
    const priorGeneratedAt = snapshot.generatedAt;
    try {
      await fetch('/.netlify/functions/refresh-seo-data-now-background', { method: 'POST' });
    } catch {
      setRefreshState('error');
      return;
    }

    setRefreshState('waiting');
    const startedAt = Date.now();
    const poll = () => {
      load()
        .then((data) => {
          if (data.generatedAt !== priorGeneratedAt) {
            setRefreshState('done');
            return;
          }
          scheduleNext();
        })
        .catch(() => scheduleNext());
    };
    const scheduleNext = () => {
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setRefreshState('error');
        return;
      }
      pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    };
    pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [load, refreshState, snapshot.generatedAt]);

  return { snapshot, hasSnapshot, refreshState, triggerRefresh };
}
