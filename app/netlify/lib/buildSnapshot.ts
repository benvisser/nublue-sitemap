// Per-page SEO row computation — called by get-page-seo.mts for exactly
// one path at a time. See seRankingProjectPull.ts, ga4Client.ts, and
// gscClient.ts for where keywordRows/auditRows/traffic/search performance
// actually come from; this file only does the math once you have them.
import { computeLocalSeoScore, type AuditIssue, type KeywordQuery, type PageSeoData } from '../../src/data/seoTypes.js';
import type { PageTraffic } from './ga4Client.js';
import type { PageSearchPerformance } from './gscClient.js';
import type { SeRankingAuditPage, SeRankingKeywordRow, SeRankingPageIssues } from './seRankingClient.js';

const PROJECTION_FACTOR = 0.15; // future page starts at ~15% of its parent's potential traffic

/** Rough CTR-by-position curve — good enough for a "potential traffic"
 * estimate; not a metric SE Ranking returns directly. */
function estimateClicks(volume: number, position: number): number {
  const ctrByPosition: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.1, 4: 0.07, 5: 0.05 };
  const ctr = ctrByPosition[position] ?? (position <= 10 ? 0.03 : position <= 20 ? 0.01 : 0.003);
  return Math.round(volume * ctr);
}

/** SE Ranking's per-issue `snippet` shape varies by issue code (a list of
 * redirecting URLs, an oversized file with its size, etc.) — this turns
 * whatever comes back into one readable line rather than the UI needing
 * to know every shape. Falls back to nothing rather than guessing at a
 * shape it doesn't recognize. */
function summarizeSnippet(snippet: unknown): string {
  if (!snippet || typeof snippet !== 'object') return '';
  const value = (snippet as { value?: unknown }).value;
  if (!Array.isArray(value) || value.length === 0) return '';
  const first = value[0];
  if (!first || typeof first !== 'object') return String(value.length);
  const f = first as Record<string, unknown>;
  const parts: string[] = [];
  if (f.url) parts.push(String(f.url));
  if (f.status) parts.push(`(${f.status})`);
  if (f.size) parts.push(`${Math.round(Number(f.size) / 1024).toLocaleString()}KB`);
  const summary = parts.join(' ');
  const remaining = value.length - 1;
  return remaining > 0 ? `${summary} +${remaining} more` : summary;
}

/** Turns a code like "css_big" into "Css big" — not a real translation
 * of SE Ranking's issue codes (they don't publish a code → label
 * dictionary), just enough to read as words instead of a snake_case
 * token until/unless a real mapping is worth building. */
function humanizeCode(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function mapIssues(pageIssues: SeRankingPageIssues | null): AuditIssue[] | null {
  if (!pageIssues) return null;
  return pageIssues.issues.map((i) => ({
    code: humanizeCode(i.code),
    severity: i.type,
    group: i.group,
    detail: summarizeSnippet(i.snippet),
  }));
}

function recommendationsFor(row: PageSeoData): string[] {
  const recs: string[] = [];
  if (row.contentScore < 60) recs.push('Expand and restructure content — score is below the 60-point healthy threshold');
  if (row.top3Keywords === 0 && row.keywordCount > 0) recs.push('No keywords ranking top 3 yet — review search intent match and on-page targeting');
  if (row.issues.length > 0) recs.push(`Resolve top audit issue: ${row.issues[0]}`);
  if (recs.length === 0) recs.push('No urgent issues — monitor position trend');
  return recs;
}

/** Builds the full row for one real (non-projected) page, given the
 * project-wide SE Ranking pull (filtered here to this path), this page's
 * GA4 traffic, and its Search Console performance. `seRankingOk` reflects
 * whether the project pull actually succeeded recently — with it false,
 * keywordRows/auditRows are empty by construction (see
 * seRankingProjectPull.ts), so recommendations are skipped rather than
 * emitting a misleading "no urgent issues" for a page we simply have no
 * data on. `traffic`/`search` are null when their source failed for this
 * request (see get-page-seo.mts). */
export function computePageRow(
  path: string,
  keywordRows: SeRankingKeywordRow[],
  auditRows: SeRankingAuditPage[],
  traffic: PageTraffic | null,
  search: PageSearchPerformance | null,
  seRankingOk: boolean,
  pageIssues: SeRankingPageIssues | null = null,
): PageSeoData {
  const row: PageSeoData = {
    path,
    totalSearchVolume: 0,
    potentialTraffic: 0,
    actualTraffic: traffic?.sessions ?? null,
    previousTraffic: traffic?.previousSessions ?? null,
    organicTraffic: traffic?.organicSessions ?? null,
    previousOrganicTraffic: traffic?.previousOrganicSessions ?? null,
    avgEngagementSeconds: traffic?.avgEngagementSeconds ?? null,
    engagementRate: traffic?.engagementRate ?? null,
    previousEngagementRate: traffic?.previousEngagementRate ?? null,
    topReferrers: traffic?.topReferrers ?? [],
    searchClicks: search?.clicks ?? null,
    searchImpressions: search?.impressions ?? null,
    searchCtr: search?.ctr ?? null,
    avgSearchPosition: search?.position ?? null,
    topSearchQueries: search?.topQueries ?? [],
    contentScore: 0,
    localSeoScore: 0,
    keywordCount: 0,
    top3Keywords: 0,
    issues: [],
    auditDetail: null,
    auditIssues: mapIssues(pageIssues),
    topQueries: [],
    recommendations: [],
    projected: false,
  };

  const queries: KeywordQuery[] = [];
  for (const kw of keywordRows) {
    if (kw.url !== path) continue;
    row.keywordCount += 1;
    row.totalSearchVolume += kw.volume;
    if (kw.position != null && kw.position <= 3) row.top3Keywords += 1;
    if (kw.position != null) row.potentialTraffic += estimateClicks(kw.volume, kw.position);
    queries.push({ query: kw.keyword, volume: kw.volume, position: kw.position });
  }
  row.topQueries = queries.sort((a, b) => b.volume - a.volume);

  const audit = auditRows.find((a) => a.url === path);
  if (audit) {
    row.contentScore = audit.score;
    row.issues = audit.issues;
    row.auditDetail = {
      status: audit.status,
      title: audit.title,
      description: audit.description,
      h1: audit.h1,
      wordsCount: audit.wordsCount,
      indexableStatus: audit.indexableStatus,
      canonicalUrl: audit.canonicalUrl,
      inlinks: audit.inlinks,
      outlinksInternal: audit.outlinksInternal,
      outlinksExternal: audit.outlinksExternal,
      trafficForecast: audit.trafficForecast,
      numKeywords: audit.numKeywords,
    };
  }

  row.localSeoScore = computeLocalSeoScore(row.topQueries, row.contentScore);
  if (seRankingOk) row.recommendations = recommendationsFor(row);

  return row;
}

/** A future-state page that doesn't exist on the live site yet — never
 * pulled from any source, just a rough estimate from its real parent
 * page's numbers. */
export function computeProjectedRow(path: string, parent: PageSeoData | null): PageSeoData {
  return {
    path,
    totalSearchVolume: parent ? Math.round(parent.totalSearchVolume * PROJECTION_FACTOR) : 0,
    potentialTraffic: parent ? Math.round(parent.potentialTraffic * PROJECTION_FACTOR) : 0,
    actualTraffic: null,
    previousTraffic: null,
    organicTraffic: null,
    previousOrganicTraffic: null,
    avgEngagementSeconds: null,
    engagementRate: null,
    previousEngagementRate: null,
    topReferrers: [],
    searchClicks: null,
    searchImpressions: null,
    searchCtr: null,
    avgSearchPosition: null,
    topSearchQueries: [],
    contentScore: 0,
    localSeoScore: 0,
    keywordCount: 0,
    top3Keywords: 0,
    issues: [],
    auditDetail: null,
    auditIssues: null,
    topQueries: parent ? parent.topQueries.slice(0, 3) : [],
    recommendations: ["Build out content once this page ships — projected from the parent page's query cluster"],
    projected: true,
  };
}
