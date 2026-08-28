// Google Analytics 4 (Data API v1beta) client — server-side only, called
// from netlify/functions/get-page-seo.mts on demand (one page at a time,
// per the "fetch when the page loads" model — see app/README.md). Auth is
// a service account with the GA4 property added as a "Viewer" (Admin →
// Property Access Management), scoped to
// https://www.googleapis.com/auth/analytics.readonly.
import { GoogleAuth } from 'google-auth-library';

interface RunReportRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

interface RunReportResponse {
  rows?: RunReportRow[];
}

/** GA4_SERVICE_ACCOUNT_JSON is expected base64-encoded (of the full
 * service-account JSON key file). A multi-line secret like a PEM private
 * key stored as plain JSON has repeatedly gotten mangled somewhere in
 * Netlify's env var storage/injection path in practice (embedded
 * newlines turning into literal line breaks, breaking JSON.parse) —
 * base64 has no characters that path can corrupt. Still tries a raw
 * JSON.parse first in case the value was set unencoded. */
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

async function runReport(body: Record<string, unknown>): Promise<RunReportResponse> {
  const propertyId = Netlify.env.get('GA4_PROPERTY_ID');
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is not set');

  const auth = new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const client = await auth.getClient();

  const res = await client.request<RunReportResponse>({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    method: 'POST',
    data: body,
  });
  return res.data;
}

function pageFilter(path: string) {
  return { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT' as const, value: path } } };
}

export interface ReferrerRow {
  source: string;
  sessions: number;
}

export interface PageTraffic {
  sessions: number;
  previousSessions: number;
  organicSessions: number;
  previousOrganicSessions: number;
  /** Average time (seconds) users engaged with the page per session,
   * current period — GA4's userEngagementDuration / sessions. */
  avgEngagementSeconds: number;
  /** Top sources sending sessions to this page, current period,
   * highest first. */
  topReferrers: ReferrerRow[];
}

const EMPTY_TRAFFIC: PageTraffic = {
  sessions: 0,
  previousSessions: 0,
  organicSessions: 0,
  previousOrganicSessions: 0,
  avgEngagementSeconds: 0,
  topReferrers: [],
};

/** This page's traffic for the trailing `days` days plus the equal-length
 * period before that (for a period-over-period comparison), split out by
 * organic vs all-channel, plus its top referring sources. Two runReport
 * calls, both filtered server-side to exactly this page path — cheap
 * enough to run fresh on every page open, no caching needed (unlike SE
 * Ranking's bulk-only API — see seRankingProjectPull.ts). */
export async function getPageTraffic(path: string, days = 28): Promise<PageTraffic> {
  const [byPeriod, byReferrer] = await Promise.all([
    runReport({
      dateRanges: [
        { name: 'current', startDate: `${days}daysAgo`, endDate: 'today' },
        { name: 'previous', startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` },
      ],
      dimensions: [{ name: 'dateRange' }, { name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'userEngagementDuration' }],
      dimensionFilter: pageFilter(path),
      limit: 50,
    }),
    runReport({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: pageFilter(path),
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 5,
    }),
  ]);

  const out = { ...EMPTY_TRAFFIC };
  let currentEngagementSeconds = 0;
  for (const row of byPeriod.rows || []) {
    const period = row.dimensionValues[0]?.value; // 'current' | 'previous'
    const channel = row.dimensionValues[1]?.value ?? '';
    const sessions = Number(row.metricValues[0]?.value || 0);
    const engagement = Number(row.metricValues[1]?.value || 0);
    const isOrganic = channel === 'Organic Search';

    if (period === 'current') {
      out.sessions += sessions;
      currentEngagementSeconds += engagement;
      if (isOrganic) out.organicSessions += sessions;
    } else if (period === 'previous') {
      out.previousSessions += sessions;
      if (isOrganic) out.previousOrganicSessions += sessions;
    }
  }
  out.avgEngagementSeconds = out.sessions > 0 ? Math.round(currentEngagementSeconds / out.sessions) : 0;

  out.topReferrers = (byReferrer.rows || [])
    .map((row) => ({ source: row.dimensionValues[0]?.value || '(direct)', sessions: Number(row.metricValues[0]?.value || 0) }))
    .filter((r) => r.sessions > 0);

  return out;
}
