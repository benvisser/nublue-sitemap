// Scheduled + background function: pulls SE Ranking + GA4 data server-side
// once a night and writes one snapshot to Netlify Blobs. The frontend never
// calls this directly — it reads the result via get-seo-snapshot.mts. This
// is the pattern the design chat asked for specifically so the API key
// never reaches the browser and we don't hit either API's rate limits on
// every page load.
//
// Runs as a background function (15-minute wall-clock limit, not the
// standard 30s scheduled-function limit) because pulling keyword
// positions, an audit, and a GA4 report for ~300 pages can run long
// depending on both APIs' response times.
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { buildSnapshot } from '../lib/buildSnapshot.js';

export default async () => {
  try {
    const snapshot = await buildSnapshot();
    const store = getStore('seo-snapshot');
    await store.setJSON('current.json', snapshot);
    console.log(`[refresh-seo-data] wrote snapshot for ${Object.keys(snapshot.pages).length} pages at ${snapshot.generatedAt}`);
  } catch (err) {
    // Fail loudly in the function log, but don't throw past Netlify's
    // retry/alerting — a bad night shouldn't take down the last good
    // snapshot the app is still serving.
    console.error('[refresh-seo-data] failed:', err);
  }
};

export const config: Config = {
  // 06:00 UTC nightly. Adjust to your preferred off-peak hour.
  schedule: '0 6 * * *',
};
