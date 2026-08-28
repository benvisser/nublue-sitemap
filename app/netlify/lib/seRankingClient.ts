// SE Ranking API client used only by seRankingProjectPull.ts (which shares
// one pull across every page view via a TTL cache — see that file for
// why) — never called from the browser, so the API key never leaves the
// server.
//
// ⚠️ VERIFY BEFORE FIRST REAL RUN: this project could not reach
// seranking.com's docs from this sandbox (egress to that domain is
// blocked here), so the endpoint paths and response field names below are
// written from general knowledge of SE Ranking's REST API, not confirmed
// against current docs. Before relying on this, log into SE Ranking →
// Account → API, compare against the "Keyword rank tracking" and "Website
// / Page Audit" endpoints for your plan, and adjust SERANKING_API_BASE_URL
// or the paths below if they've changed. Everything that touches the wire
// is isolated to this one file on purpose, so that fix stays a one-file
// change.

const BASE_URL = Netlify.env.get('SERANKING_API_BASE_URL') || 'https://api4.seranking.com/v1';

function apiKey(): string {
  const key = Netlify.env.get('SERANKING_API_KEY');
  if (!key) throw new Error('SERANKING_API_KEY is not set');
  return key;
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url, { headers: { Authorization: `Token ${apiKey()}` } });
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

/** Keyword positions + search volume for every tracked keyword in the
 * project, so we can group them by landing-page URL client-side. */
export async function getKeywordPositions(): Promise<SeRankingKeywordRow[]> {
  const projectId = Netlify.env.get('SERANKING_PROJECT_ID');
  if (!projectId) throw new Error('SERANKING_PROJECT_ID is not set');
  const data = await get<{ keywords?: Array<Record<string, unknown>> }>(`/projects/${projectId}/keywords`, { limit: 1000 });
  const rows = data.keywords || [];
  return rows.map((k) => ({
    keyword: String(k.keyword ?? k.name ?? ''),
    volume: Number(k.volume ?? k.search_volume ?? 0),
    position: k.position == null ? null : Number(k.position),
    url: String(k.url ?? k.target_url ?? ''),
  }));
}

/** Page-level audit score + issue list from SE Ranking's Website/Page Audit
 * tool for the same project. */
export async function getPageAudit(): Promise<SeRankingAuditPage[]> {
  const projectId = Netlify.env.get('SERANKING_PROJECT_ID');
  if (!projectId) throw new Error('SERANKING_PROJECT_ID is not set');
  const data = await get<{ pages?: Array<Record<string, unknown>> }>(`/audit/${projectId}/pages`);
  const rows = data.pages || [];
  return rows.map((p) => ({
    url: String(p.url ?? ''),
    score: Number(p.score ?? p.content_score ?? 0),
    issues: Array.isArray(p.issues) ? p.issues.map(String) : [],
  }));
}
