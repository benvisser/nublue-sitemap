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

/** Same auth/base as getAudit(), but never throws and returns the raw
 * status + body text regardless of outcome — for debug-seranking-audit.mts
 * to probe candidate endpoint paths we're not sure exist yet, without a
 * failed guess blowing up the whole request. */
export async function rawAuditRequest(path: string, params: Record<string, string | number> = {}): Promise<{ status: number; body: string }> {
  const url = new URL(AUDIT_BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  try {
    const res = await fetch(url, { headers: { Authorization: `Token ${apiKey()}` } });
    const body = await res.text().catch(() => '');
    return { status: res.status, body: body.slice(0, 4000) };
  } catch (err) {
    return { status: 0, body: String(err) };
  }
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
  status: number | null;
  title: string | null;
  description: string | null;
  h1: string | null;
  wordsCount: number | null;
  indexableStatus: string | null;
  canonicalUrl: string | null;
  inlinks: number | null;
  outlinksInternal: number | null;
  outlinksExternal: number | null;
  trafficForecast: number | null;
  numKeywords: number | null;
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

export interface AuditListItem {
  id: number | string;
  url: string;
  status?: string;
  stats?: { score?: number; errors?: number; warnings?: number; notices?: number; crawled?: number };
}

export interface AuditListResponse {
  items: AuditListItem[];
  total: number;
}

export interface AuditPageItem {
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
  // These come back as the strings "0"/"1", not real booleans — see
  // isTruthyFlag(). Typed loosely here rather than claiming `boolean`.
  title_duplicate?: string | boolean | number;
  description_duplicate?: string | boolean | number;
  h1_duplicate?: string | boolean | number;
  traffic_forecast?: number;
  num_keywords?: number;
  inlinks?: number;
  outlinks_internal?: number;
  outlinks_external?: number;
}

interface AuditPagesResponse {
  total: number;
  items: AuditPageItem[];
}

/** Finds the Website Audit already set up for callnublue.com in SE
 * Ranking (an audit has to have been created/run in their UI or API
 * first — this just locates it by domain). Returns null if none exists
 * yet, which is non-fatal — see seRankingProjectPull.ts. Exported for
 * debug-seranking-audit.mts. */
export async function findAudit(): Promise<AuditListItem | null> {
  const data = await getAudit<AuditListResponse>('', { limit: 50, search: DOMAIN });
  const items = data.items || [];
  const match = items.find((a) => String(a.url ?? '').includes(DOMAIN));
  if (!match) {
    console.log('[seRankingClient] findAudit: no audit found for', DOMAIN, `(${items.length} audits returned by search) — has a Website Audit been created for this site in SE Ranking?`);
    return null;
  }
  return match;
}

/** Every audit on the account, unfiltered — for debugging findAudit()
 * when the `search` param doesn't behave as expected. */
export async function listAllAudits(): Promise<AuditListResponse> {
  return getAudit<AuditListResponse>('', { limit: 50 });
}

/** Fetches one audit by id directly (GET /project-management/audits/{id}),
 * bypassing the search/list step entirely. Useful since a leftover
 * SERANKING_PROJECT_ID env var from an earlier architecture might
 * actually be a valid audit id. Returns null on any failure (unknown id,
 * wrong auth, etc) rather than throwing, since this is a debug-only path. */
export async function getAuditById(id: string | number): Promise<AuditListItem | null> {
  try {
    return await getAudit<AuditListItem>(`/${id}`);
  } catch (err) {
    console.log('[seRankingClient] getAuditById failed for', id, ':', err);
    return null;
  }
}

/** Pages a Website Audit's full crawled-page list (GET
 * /project-management/audits/pages?audit_id=). Exported for
 * debug-seranking-audit.mts. */
export async function fetchAllAuditPages(auditId: number | string): Promise<AuditPageItem[]> {
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
export function toRelativePath(rawUrl: string): string {
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

/** SE Ranking's Website Audit API returns every field as a string,
 * booleans included — confirmed against a real response:
 * `"title_duplicate": "0"`. A bare `if (page.title_duplicate)` check
 * treats the string "0" as truthy (only "" is falsy in JS), so it was
 * flagging every page as a duplicate regardless of the real value. This
 * normalizes "0"/"1"/real booleans/numbers alike. */
function isTruthyFlag(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v !== '' && v !== '0' && v.toLowerCase() !== 'false';
  return Boolean(v);
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
  // ⚠️ SE Ranking's healthy value here is "ok", not the "indexable" this
  // originally assumed — that mismatch was flagging every indexable page
  // as "Not indexable (ok)". Checking against a denylist of the values
  // that actually mean something's wrong, rather than an allowlist of
  // the one healthy value, since the full enum isn't documented.
  if (page.indexable_status && /noindex|canonical|redirect|blocked|disallow|error/i.test(page.indexable_status)) {
    issues.push(`Not indexable (${page.indexable_status})`);
  }
  if (!page.title) issues.push('Missing title tag');
  else if (isTruthyFlag(page.title_duplicate)) issues.push('Duplicate title tag');
  if (!page.description) issues.push('Missing meta description');
  else if (isTruthyFlag(page.description_duplicate)) issues.push('Duplicate meta description');
  if (!page.h1) issues.push('Missing H1');
  else if (isTruthyFlag(page.h1_duplicate)) issues.push('Duplicate H1');
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
  return pages.map((p) => {
    const status = Number(p.status);
    return {
      url: toRelativePath(p.url),
      score: scoreFor(p),
      issues: issuesFor(p),
      status: Number.isFinite(status) ? status : null,
      title: p.title || null,
      description: p.description || null,
      h1: p.h1 || null,
      wordsCount: p.words_count ?? null,
      indexableStatus: p.indexable_status ?? null,
      canonicalUrl: p.canonical_url ?? null,
      inlinks: p.inlinks ?? null,
      outlinksInternal: p.outlinks_internal ?? null,
      outlinksExternal: p.outlinks_external ?? null,
      trafficForecast: p.traffic_forecast ?? null,
      numKeywords: p.num_keywords ?? null,
    };
  });
}
