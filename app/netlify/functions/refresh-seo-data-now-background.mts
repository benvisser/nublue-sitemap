// Manual trigger for the same pull refresh-seo-data-background.mts does on
// its schedule — hit this once after wiring up credentials to populate the
// first snapshot instead of waiting for the next 06:00 UTC run. Runs as a
// background function, so the request returns immediately (202) — check
// the function's logs in the Netlify UI, or just poll get-seo-snapshot
// until `generatedAt` updates, to see when it's actually done.
//
// Not linked from the UI; call it directly:
//   curl -X POST https://<your-site>.netlify.app/.netlify/functions/refresh-seo-data-now-background \
//     -H "x-refresh-secret: $REFRESH_TRIGGER_SECRET"
// (if REFRESH_TRIGGER_SECRET is unset, the endpoint is open — set it once you deploy)
import { getStore } from '@netlify/blobs';
import { buildSnapshot } from '../lib/buildSnapshot.js';

export default async (req: Request) => {
  const expected = Netlify.env.get('REFRESH_TRIGGER_SECRET');
  if (expected && req.headers.get('x-refresh-secret') !== expected) {
    console.warn('[refresh-seo-data-now] rejected: missing/incorrect x-refresh-secret header');
    return;
  }
  try {
    const snapshot = await buildSnapshot();
    const store = getStore('seo-snapshot');
    await store.setJSON('current.json', snapshot);
    console.log(`[refresh-seo-data-now] wrote snapshot for ${Object.keys(snapshot.pages).length} pages at ${snapshot.generatedAt}`);
  } catch (err) {
    console.error('[refresh-seo-data-now] failed:', err);
  }
};
