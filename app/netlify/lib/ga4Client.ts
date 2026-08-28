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

/** Sessions for exactly one page path over the trailing `days` days —
 * filtered server-side by GA4, so this is cheap enough to call on every
 * page open instead of needing its own cache/TTL. */
export async function getSessionsForPath(path: string, days = 28): Promise<number> {
  const data = await runReport({
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: { fieldName: 'pagePath', stringFilter: { matchType: 'EXACT', value: path } },
    },
    limit: 10,
  });

  let total = 0;
  for (const row of data.rows || []) {
    total += Number(row.metricValues[0]?.value || 0);
  }
  return total;
}
