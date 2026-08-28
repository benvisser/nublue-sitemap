// Diagnostic-only endpoint for testing SE Ranking's Website Audit API
// directly, one URL at a time, without going through the inspector UI
// (which currently hides SE Ranking entirely — see Inspector.tsx). This
// exists because the outbound-egress-restricted sandbox that built this
// app cannot reach api.seranking.com directly, but this function runs on
// Netlify's own infrastructure and can — so it's the fastest way to see
// exactly what SE Ranking returns for a given page, unmapped.
//
//   GET /.netlify/functions/debug-seranking-audit?path=/careers/
//
// Only reports audits that actually belong to callnublue.com (the
// account this API key has ~14 different clients' audits on) — not the
// full unfiltered list, which would leak other clients' site names and
// scores into the response for no reason.
import { fetchAllAuditPages, getAuditById, listAllAudits, rawAuditRequest, toRelativePath } from '../lib/seRankingClient.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json' } });
}

const DOMAIN = 'callnublue.com';

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/careers/';

  const report: Record<string, unknown> = { path };

  // Fetch the account's full audit list once, then filter to just
  // callnublue.com locally — also tells us how many total audits exist
  // on the account (14, as of writing) without printing every one.
  let allAudits: Array<{ id: number | string; url: string; site_id?: number | null }> = [];
  try {
    const all = await listAllAudits();
    allAudits = all.items || [];
    report.totalAuditsOnAccount = all.total;
  } catch (err) {
    report.listAllAuditsError = String(err);
  }

  const matchingAudits = allAudits.filter((a) => String(a.url ?? '').toLowerCase().includes(DOMAIN));
  report.matchingAudits = matchingAudits;

  const projectId = Netlify.env.get('SERANKING_PROJECT_ID');
  if (projectId) {
    report.viaProjectIdEnvVar = await getAuditById(projectId).catch((err) => ({ error: String(err) }));
  } else {
    report.viaProjectIdEnvVar = null;
  }

  // Prefer the one with a live "has_project" pull if there are multiple
  // (the account has both an old standalone audit and a newer
  // project-linked one for this same domain).
  const resolvedAudit =
    matchingAudits.find((a) => (a as { has_project?: boolean }).has_project) ?? matchingAudits[0] ?? null;

  if (!resolvedAudit) {
    report.resolvedAuditId = null;
    return json(report);
  }

  try {
    const pages = await fetchAllAuditPages(resolvedAudit.id);
    report.resolvedAuditId = resolvedAudit.id;
    report.totalPagesInAudit = pages.length;
    const match = pages.find((p) => toRelativePath(String((p as { url?: unknown }).url ?? '')) === path);
    report.matchedRawPage = match ?? null;

    // The /pages list only gives issue COUNTS (errors/warnings/notices),
    // not a free-text list of what those issues actually are. The first
    // round of guesses (issues-by-url, pages-by-issue, /pages/{id}/issues)
    // all 404'd, so this round tries: the exact audit_id-as-query-param
    // convention that DOES work for /pages, against more name variants;
    // audit id embedded in the path itself instead of as a query param
    // (a different REST convention SE Ranking might use for this sub-
    // resource); the single "Get audit" endpoint in case it embeds
    // per-issue detail; and a URL-filtered /pages call in case that's
    // actually how you get one page's full issue breakdown.
    const matchId = (match as { id?: unknown } | undefined)?.id;
    const fullUrl = `https://${DOMAIN}${path}`;
    const candidates: Array<{ label: string; path: string; params: Record<string, string | number> }> = [
      { label: 'GET /{audit_id} (single audit detail)', path: `/${resolvedAudit.id}`, params: {} },
      { label: '/issues?audit_id=', path: '/issues', params: { audit_id: resolvedAudit.id } },
      { label: '/issues?audit_id=&page_id=', path: '/issues', params: { audit_id: resolvedAudit.id, page_id: String(matchId ?? '') } },
      { label: '/audit-issues?audit_id=', path: '/audit-issues', params: { audit_id: resolvedAudit.id } },
      { label: '/checks?audit_id=&page_id=', path: '/checks', params: { audit_id: resolvedAudit.id, page_id: String(matchId ?? '') } },
      { label: '/pages filtered by url= (one page, full detail?)', path: '/pages', params: { audit_id: resolvedAudit.id, url: fullUrl } },
      { label: `/{audit_id}/issues-by-url`, path: `/${resolvedAudit.id}/issues-by-url`, params: { url: fullUrl } },
      { label: `/{audit_id}/pages-by-issue`, path: `/${resolvedAudit.id}/pages-by-issue`, params: {} },
      { label: `/{audit_id}/pages/{page_id}`, path: `/${resolvedAudit.id}/pages/${matchId}`, params: {} },
    ];
    report.endpointProbes = {};
    for (const c of candidates) {
      (report.endpointProbes as Record<string, unknown>)[c.label] = await rawAuditRequest(c.path, c.params);
    }
  } catch (err) {
    report.pagesFetchError = String(err);
  }

  return json(report);
};
