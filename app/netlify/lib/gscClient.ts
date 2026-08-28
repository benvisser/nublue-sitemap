// Google Search Console (Search Analytics) client — server-side only,
// called per-page from get-page-seo.mts, same pattern as ga4Client.ts's
// getPageTraffic. Reuses the same service account as GA4
// (GA4_SERVICE_ACCOUNT_JSON) — it just also needs to be added as a user
// on the Search Console property (Settings → Users and permissions →
// Add user, "Restricted" is enough for read-only Search Analytics
// access) and the Search Console API enabled on the same GCP project.
//
// This is real, measured Google ranking data (clicks/impressions/CTR/
// average position, per query) — complementary to SE Ranking's topQueries
// (which carries search *volume*, something GSC doesn't report) rather
// than a replacement for it.
import { GoogleAuth } from 'google-auth-library';
import type { SearchQuery } from '../../src/data/seoTypes.js';

interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

function serviceAccountCredentials(): Record<string, unknown> {
  const raw = Netlify.env.get('GA4_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON is not set');
  try {
    return JSON.parse(raw);
  } catch {
    // fall through to base64 attempt
  }
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    throw new Error('GA4_SERVICE_ACCOUNT_JSON is not valid JSON (tried both raw and base64-decoded)');
  }
}

export interface PageSearchPerformance {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: SearchQuery[];
}

const EMPTY: PageSearchPerformance = { clicks: 0, impressions: 0, ctr: 0, position: 0, topQueries: [] };

/** Per-query Search Console performance for one page, trailing `days`
 * days, plus that page's own aggregate (summed/weighted from the same
 * query rows — one API call covers both). */
export async function getPageSearchPerformance(path: string, days = 28): Promise<PageSearchPerformance> {
  const siteUrl = Netlify.env.get('GSC_SITE_URL');
  if (!siteUrl) throw new Error('GSC_SITE_URL is not set');
  const pageUrl = `https://callnublue.com${path}`;

  const end = new Date();
  end.setDate(end.getDate() - 2); // GSC data typically lags ~2 days
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const auth = new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const client = await auth.getClient();

  const res = await client.request<SearchAnalyticsResponse>({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    method: 'POST',
    data: {
      startDate: iso(start),
      endDate: iso(end),
      dimensions: ['query'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }] }],
      rowLimit: 25,
    },
  });

  const rows = res.data.rows || [];
  if (rows.length === 0) return EMPTY;

  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  const topQueries: SearchQuery[] = rows.map((r) => {
    clicks += r.clicks;
    impressions += r.impressions;
    weightedPosition += r.position * r.impressions;
    return { query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: Math.round(r.position * 10) / 10 };
  });

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? Math.round((weightedPosition / impressions) * 10) / 10 : 0,
    topQueries: topQueries.sort((a, b) => b.impressions - a.impressions),
  };
}
