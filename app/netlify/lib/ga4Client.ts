// Google Analytics 4 (Data API v1beta) client — server-side only, called
// from the nightly refresh function. Auth is a service account with the
// GA4 property added as a "Viewer" (Admin → Property Access Management),
// scoped to https://www.googleapis.com/auth/analytics.readonly.
import { GoogleAuth } from 'google-auth-library';

interface RunReportRow {
  dimensionValues: Array<{ value: string }>;
  metricValues: Array<{ value: string }>;
}

interface RunReportResponse {
  rows?: RunReportRow[];
}

function serviceAccountCredentials(): Record<string, unknown> {
  const raw = Netlify.env.get('GA4_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('GA4_SERVICE_ACCOUNT_JSON is not set');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('GA4_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

/** Sessions per landing page path over the trailing `days` days. */
export async function getSessionsByPath(days = 28): Promise<Record<string, number>> {
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
    data: {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }],
      limit: 100000,
    },
  });

  const out: Record<string, number> = {};
  for (const row of res.data.rows || []) {
    const path = row.dimensionValues[0]?.value;
    const sessions = Number(row.metricValues[0]?.value || 0);
    if (path) out[path] = (out[path] || 0) + sessions;
  }
  return out;
}
