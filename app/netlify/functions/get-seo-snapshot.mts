// On-demand function the frontend fetches on load. Just serves whatever
// refresh-seo-data-background.mts last wrote — no live SE Ranking/GA4 calls happen
// here, so this stays fast and never touches either API's rate limit.
import { getStore } from '@netlify/blobs';

export default async () => {
  const store = getStore('seo-snapshot');
  const snapshot = await store.get('current.json', { type: 'json' });

  if (!snapshot) {
    // No nightly run has completed yet (fresh deploy, or credentials not
    // configured). The frontend falls back to sample data in this case.
    return new Response('no snapshot yet', { status: 404 });
  }

  return new Response(JSON.stringify(snapshot), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  });
};
