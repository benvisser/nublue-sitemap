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
// Tries three things, all reported in the response so a single call
// tells you which one actually works:
//   1. findAudit() — the production path: list audits with ?search=callnublue.com
//   2. listAllAudits() — every audit on the account, unfiltered, in case
//      `search` isn't behaving as expected or the audit's `url` field
//      doesn't literally contain "callnublue.com"
//   3. getAuditById(SERANKING_PROJECT_ID) — a leftover env var from an
//      earlier (guessed) architecture; if it happens to BE a valid audit
//      id, this finds the audit even if #1 and #2 don't
//
// Whichever of those resolves an audit, its full crawled-page list is
// fetched and searched for `path`, returning both the raw SE Ranking
// record (every field, unmapped) and our current mapped interpretation
// of it, side by side.
import { fetchAllAuditPages, findAudit, getAuditById, listAllAudits, rawAuditRequest, toRelativePath } from '../lib/seRankingClient.js';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json' } });
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/careers/';

  const report: Record<string, unknown> = { path };

  try {
    report.viaSearch = await findAudit().catch((err) => ({ error: String(err) }));
  } catch (err) {
    report.viaSearch = { error: String(err) };
  }

  try {
    const all = await listAllAudits();
    report.viaListAll = { total: all.total, items: all.items };
  } catch (err) {
    report.viaListAll = { error: String(err) };
  }

  const projectId = Netlify.env.get('SERANKING_PROJECT_ID');
  if (projectId) {
    try {
      report.viaProjectIdEnvVar = await getAuditById(projectId);
    } catch (err) {
      report.viaProjectIdEnvVar = { error: String(err) };
    }
  } else {
    report.viaProjectIdEnvVar = null;
  }

  // Whichever approach actually returned an audit, use it to fetch pages
  // and look for the requested path.
  const resolvedAudit =
    (report.viaSearch as { id?: unknown } | null)?.id != null
      ? (report.viaSearch as { id: number | string })
      : (report.viaProjectIdEnvVar as { id?: unknown } | null)?.id != null
        ? (report.viaProjectIdEnvVar as { id: number | string })
        : ((report.viaListAll as { items?: Array<{ id: number | string }> })?.items || [])[0];

  if (resolvedAudit) {
    try {
      const pages = await fetchAllAuditPages(resolvedAudit.id);
      report.resolvedAuditId = resolvedAudit.id;
      report.totalPagesInAudit = pages.length;
      report.samplePaths = pages.slice(0, 25).map((p) => toRelativePath(String((p as { url?: unknown }).url ?? '')));
      const match = pages.find((p) => toRelativePath(String((p as { url?: unknown }).url ?? '')) === path);
      report.matchedRawPage = match ?? null;
      report.matchedPageAllFieldNames = match ? Object.keys(match) : [];

      // The /pages list only gives issue COUNTS (errors/warnings/notices),
      // not a free-text list of what those issues actually are. Probing a
      // few plausible per-URL/per-issue endpoint shapes here — using the
      // real audit id and this page's real numeric id — to see if SE
      // Ranking exposes actual issue descriptions ("recommendations")
      // anywhere, rather than guessing blind and redeploying repeatedly.
      const matchId = (match as { id?: unknown } | undefined)?.id;
      const fullUrl = `https://callnublue.com${path}`;
      const candidates: Array<{ label: string; path: string; params: Record<string, string | number> }> = [
        { label: 'issues-by-url (url param)', path: '/issues-by-url', params: { audit_id: resolvedAudit.id, url: fullUrl } },
        { label: 'issues-by-url (page_id param)', path: '/issues-by-url', params: { audit_id: resolvedAudit.id, page_id: String(matchId ?? '') } },
        { label: 'pages-by-issue (list, no filter)', path: '/pages-by-issue', params: { audit_id: resolvedAudit.id } },
        { label: 'page issues via /pages/{id}/issues', path: `/pages/${matchId}/issues`, params: { audit_id: resolvedAudit.id } },
      ];
      report.endpointProbes = {};
      for (const c of candidates) {
        (report.endpointProbes as Record<string, unknown>)[c.label] = await rawAuditRequest(c.path, c.params);
      }
    } catch (err) {
      report.pagesFetchError = String(err);
    }
  } else {
    report.resolvedAuditId = null;
  }

  return json(report);
};
