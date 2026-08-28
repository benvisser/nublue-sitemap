// SE Ranking client. This product has (at least) two separate API
// surfaces with DIFFERENT auth mechanisms — confirmed the hard way, by
// finding the real docs for each rather than guessing:
//
//  1. "Data API" (github.com/seranking/openapi, data-api.yaml) — Domain
//     Analysis, Backlinks, Keyword Research, etc. Base api.seranking.com/v1,
//     auth is an `apikey` QUERY PARAMETER. getKeywordPositions() uses this.
//
//  2. "Website Audit" (api.seranking.com/v1/project-management/audits) —
//     the "Crawled pages" data behind SE Ranking's Website Audit tool.
//     Base .../v1/project-management/audits, auth is an
//     `Authorization: Token API_KEY` HEADER — different from #1. Confirmed
//     against the real published docs (not the OpenAPI spec, which doesn't
//     cover this product). getPageAudit() uses this.
//
// Both reuse the same SERANKING_API_KEY value; only the auth transport
// differs per endpoint.
const BASE_URL = Netlify.env.get('SERANKING_API_BASE_URL') || 'https://api.seranking.com/v1';
const AUDIT_BASE_URL = Netlify.env.get('SERANKING_AUDIT_API_BASE_URL') || 'https://api.seranking.com/v1/project-management/audits';
const DOMAIN = 'callnublue.com';

function apiKey(): string {
  const key = Netlify.env.get('SERANKING_API_KEY');
  if (!key) throw new Error('SERANKING_API_KEY is not set');
  return key;
}

/** Data API — auth via `apikey` query param. */
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

/** Website Audit API — auth via `Authorization: Token` header, and the
 * base URL already includes the full /project-management/audits prefix. */
async function getAudit<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(AUDIT_BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { Authorization: `Token ${apiKey()}` } });
  if (!res.ok) {
    throw new Error(`SE Ranking audit ${path} -> ${res.status} ${await res.text().catch(() => '')}`);
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

interface AuditListItem {
  id: number | string;
  url: string;
  status?: string;
  stats?: { score?: number; errors?: number; warnings?: number; notices?: number; crawled?: number };
}

interface AuditListResponse {
  items: AuditListItem[];
  total: number;
}

interface AuditPageItem {
  url: string;
  status?: number | string;
  title?: string;
  description?: string;
  h1?: string;
  words_count?: number;
  issues?: unknown;
  errors?: unknown;
  warnings?: unknown;
  notices?: unknown;
  canonical_url?: string;
  indexable_status?: string;
  title_duplicate?: boolean;
  description_duplicate?: boolean;
  h1_duplicate?: boolean;
  traffic_forecast?: number;
  num_keywords?: number;
}

interface AuditPagesResponse {
  total: number;
  items: AuditPageItem[];
}

/** Finds the Website Audit already set up for callnublue.com in SE
 * Ranking (an audit has to have been created/run in their UI or API
 * first — this just locates it by domain). Returns null if none exists
 * yet, which is non-fatal — see seRankingProjectPull.ts. */
async function findAudit(): Promise<AuditListItem | null> {
  const data = await getAudit<AuditListResponse>('', { limit: 50, search: DOMAIN });
  const items = data.items || [];
  const match = items.find((a) => String(a.url ?? '').includes(DOMAIN));
  if (!match) {
    console.log('[seRankingClient] findAudit: no audit found for', DOMAIN, `(${items.length} audits returned by search) — has a Website Audit been created for this site in SE Ranking?`);
    return null;
  }
  return match;
}

/** Pages a Website Audit's full crawled-page list (GET
 * /project-management/audits/pages?audit_id=). */
async function fetchAllAuditPages(auditId: number | string): Promise<AuditPageItem[]> {
  const pageSize = 250;
  const items: AuditPageItem[] = [];
  let offset = 0;
  for (;;) {
    const data = await getAudit<AuditPagesResponse>('/pages', { audit_id: auditId, limit: pageSize, offset });
    const batch = data.items || [];
    items.push(...batch);
    offset += batch.length;
    if (batch.length === 0 || offset >= data.total) break;
  }
  return items;
}

/** Turns a full crawled URL into the site-relative path the rest of the
 * app keys pages by (e.g. "https://callnublue.com/electrical/" -> "/electrical/"). */
function toRelativePath(rawUrl: string): string {
  try {
    return new URL(rawUrl).pathname;
  } catch {
    return rawUrl;
  }
}

function issueCount(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** SE Ranking's audit doesn't hand back a single 0-100 "content score" per
 * page — this derives one from real per-page issue counts so the gauge in
 * the UI still means something: start at 100, dock more for errors than
 * warnings than notices, floor at 0. */
function scoreFor(page: AuditPageItem): number {
  const errors = issueCount(page.errors);
  const warnings = issueCount(page.warnings);
  const notices = issueCount(page.notices);
  const score = 100 - errors * 15 - warnings * 5 - notices * 1;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Human-readable issue list derived from the real per-page audit fields
 * (title/description/H1 duplicates, thin content, non-indexable status,
 * HTTP errors) plus whatever SE Ranking's own `issues` array names. */
function issuesFor(page: AuditPageItem): string[] {
  const issues: string[] = [];
  const status = Number(page.status);
  if (Number.isFinite(status) && status >= 400) issues.push(`HTTP ${status} error`);
  if (page.indexable_status && !/^indexable$/i.test(page.indexable_status)) issues.push(`Not indexable (${page.indexable_status})`);
  if (!page.title) issues.push('Missing title tag');
  else if (page.title_duplicate) issues.push('Duplicate title tag');
  if (!page.description) issues.push('Missing meta description');
  else if (page.description_duplicate) issues.push('Duplicate meta description');
  if (!page.h1) issues.push('Missing H1');
  else if (page.h1_duplicate) issues.push('Duplicate H1');
  if (page.words_count != null && page.words_count < 300) issues.push(`Thin content (${page.words_count} words)`);
  if (Array.isArray(page.issues)) {
    for (const issue of page.issues) {
      const label = String(issue);
      if (label && !issues.includes(label)) issues.push(label);
    }
  }
  return issues;
}

/** Crawled-page data from SE Ranking's Website Audit tool — the "Crawled
 * pages" section of the product. Failing here (no audit set up yet, API
 * hiccup) is non-fatal by design (see seRankingProjectPull.ts): keyword
 * data still comes through independently, and content score/issues just
 * read empty until an audit exists. */
export async function getPageAudit(): Promise<SeRankingAuditPage[]> {
  const audit = await findAudit();
  if (!audit) return [];

  const pages = await fetchAllAuditPages(audit.id);
  if (pages.length === 0) console.log('[seRankingClient] getPageAudit: audit', audit.id, 'returned 0 crawled pages');
  return pages.map((p) => ({
    url: toRelativePath(p.url),
    score: scoreFor(p),
    issues: issuesFor(p),
  }));
}
