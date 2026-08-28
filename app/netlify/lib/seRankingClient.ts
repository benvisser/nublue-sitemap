// SE Ranking's real public "Data API" client — confirmed against their
// OpenAPI spec (github.com/seranking/openapi, data-api.yaml) after the
// original guessed endpoints (api4.seranking.com, Authorization header,
// a /projects/{id}/keywords path) all 400'd for real. Two corrections
// that mattered:
//   - Base URL is api.seranking.com (not api4), under /v1.
//   - Auth is an `apikey` QUERY PARAMETER, not an Authorization header.
// There's no "project ID" for these endpoints — /domain/keywords works
// directly off the domain name, and Website Audit results come from an
// audit run's own id, discovered via /audit/list (see getPageAudit).
//
// ⚠️ Response body schemas are NOT specified in SE Ranking's own OpenAPI
// doc (both endpoints just declare `content: application/json: {}`), so
// the field-name guesses below (keyword/position/volume/url,
// score/issues) are our best read of typical REST conventions, not
// confirmed. If numbers still look wrong once this is live, check
// Netlify's function logs — getKeywordPositions/getPageAudit log the raw
// response on an unexpected shape — and adjust the mapping here; this
// file is the one place that touches the wire.
const BASE_URL = Netlify.env.get('SERANKING_API_BASE_URL') || 'https://api.seranking.com/v1';
const DOMAIN = 'callnublue.com';

function apiKey(): string {
  const key = Netlify.env.get('SERANKING_API_KEY');
  if (!key) throw new Error('SERANKING_API_KEY is not set');
  return key;
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE_URL + path);
  url.searchParams.set('apikey', apiKey());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SE Ranking ${path} -> ${res.status} ${await res.text().catch(() => '')}`);
  }
  return res.json() as Promise<T>;
}

export interface SeRankingKeywordRow {
  keyword: string;
  volume: number;
  position: number | null;
  url: string;
}

export interface SeRankingAuditPage {
  url: string;
  score: number;
  issues: string[];
}

/** Every keyword SE Ranking has organic-ranking data for on this domain
 * (GET /v1/domain/keywords) — not a hand-picked "tracked" list, but real
 * position + volume data per keyword, each tied to the page it ranks
 * with. We pull the whole domain once (see seRankingProjectPull.ts) and
 * filter to one page client-side, same as the old per-project model. */
export async function getKeywordPositions(): Promise<SeRankingKeywordRow[]> {
  const data = await get<{ keywords?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>('/domain/keywords', {
    domain: DOMAIN,
    source: 'us',
    type: 'organic',
    limit: 500,
  });
  const rows = Array.isArray(data) ? data : data.keywords || [];
  if (rows.length === 0) console.log('[seRankingClient] getKeywordPositions: 0 rows — check the raw response shape if this is unexpected');
  return rows.map((k) => ({
    keyword: String(k.keyword ?? k.query ?? k.name ?? ''),
    volume: Number(k.volume ?? k.search_volume ?? 0),
    position: k.position == null ? null : Number(k.position),
    url: String(k.url ?? k.page ?? k.target_url ?? ''),
  }));
}

/** ⚠️ UNCONFIRMED — `/audit/list` returned a bare nginx 401 (not a JSON
 * error from SE Ranking's app), and a direct search of their published
 * OpenAPI spec found no "/v1/audit/list" path at all — an earlier read of
 * that spec inferred this endpoint from a category description, not a
 * real path definition. Website Audit may not be part of this public API,
 * may need a different auth scheme, or may need a differently-shaped
 * request; unverified for now. Failing here is non-fatal by design (see
 * seRankingProjectPull.ts) — keyword/position data still comes through
 * independently, and content score/issues just read empty until this is
 * sorted out. If your SE Ranking plan does expose Website Audit some
 * other way, this is the one function to fix. */
export async function getPageAudit(): Promise<SeRankingAuditPage[]> {
  const list = await get<{ audits?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>('/audit/list');
  const audits = Array.isArray(list) ? list : list.audits || [];
  const match = audits.find((a) => String(a.domain ?? a.site ?? a.url ?? '').includes(DOMAIN));
  if (!match) {
    console.log('[seRankingClient] getPageAudit: no audit found for', DOMAIN, '— has a Website Audit ever been run for this site in SE Ranking?');
    return [];
  }
  const auditId = String(match.id ?? match.audit_id ?? '');

  const data = await get<{ pages?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>(`/audit/${auditId}/pages`);
  const rows = Array.isArray(data) ? data : data.pages || [];
  return rows.map((p) => ({
    url: String(p.url ?? p.page_url ?? ''),
    score: Number(p.score ?? p.content_score ?? p.seo_score ?? 0),
    issues: Array.isArray(p.issues) ? p.issues.map(String) : [],
  }));
}
