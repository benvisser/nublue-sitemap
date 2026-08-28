// Diagnostic-only endpoint for testing SE Ranking's Website Audit APIs
// directly, one URL at a time, without going through the inspector UI.
// This exists because the outbound-egress-restricted sandbox that built
// this app cannot reach api.seranking.com directly, but this function
// runs on Netlify's own infrastructure and can.
//
//   GET /.netlify/functions/debug-seranking-audit?path=/careers/
//
// Only reports audits that actually belong to callnublue.com (the
// account this API key has ~14 different clients' audits on) — not the
// full unfiltered list, which would leak other clients' site names and
// scores for no reason.
import { fetchAllAuditPages, getPageIssues, listAllAudits, toRelativePath } from '../lib/seRankingClient.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json' } });
}

const DOMAIN = 'callnublue.com';

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/careers/';
  const fullUrl = `https://${DOMAIN}${path}`;

  const report: Record<string, unknown> = { path };

  let allAudits: Array<{ id: number | string; url: string; has_project?: boolean }> = [];
  try {
    const all = await listAllAudits();
    allAudits = all.items || [];
    report.totalAuditsOnAccount = all.total;
  } catch (err) {
    report.listAllAuditsError = String(err);
    return json(report, 200);
  }

  const matchingAudits = allAudits.filter((a) => String(a.url ?? '').toLowerCase().includes(DOMAIN));
  report.matchingAudits = matchingAudits;

  const resolvedAudit = matchingAudits.find((a) => a.has_project) ?? matchingAudits[0] ?? null;
  if (!resolvedAudit) {
    report.resolvedAuditId = null;
    return json(report);
  }
  report.resolvedAuditId = resolvedAudit.id;

  try {
    const pages = await fetchAllAuditPages(resolvedAudit.id);
    report.totalPagesInAudit = pages.length;
    const match = pages.find((p) => toRelativePath(String((p as { url?: unknown }).url ?? '')) === path);
    report.matchedRawPage = match ?? null;
  } catch (err) {
    report.pagesFetchError = String(err);
  }

  // The real endpoint, confirmed against SE Ranking's own docs:
  // GET https://api.seranking.com/v1/site-audit/audits/issues?audit_id=&url=
  report.mappedIssues = await getPageIssues(resolvedAudit.id, fullUrl);

  return json(report);
};
