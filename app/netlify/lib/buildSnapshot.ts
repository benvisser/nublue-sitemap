// Per-page SEO row computation — called by get-page-seo.mts for exactly
// one path at a time. See seRankingProjectPull.ts and ga4Client.ts for
// where keywordRows/auditRows/actualTraffic actually come from; this file
// only does the math once you have them.
import { computeLocalSeoScore, type KeywordQuery, type PageSeoData } from '../../src/data/seoTypes.js';
import type { SeRankingAuditPage, SeRankingKeywordRow } from './seRankingClient.js';

const PROJECTION_FACTOR = 0.15; // future page starts at ~15% of its parent's potential traffic

/** Rough CTR-by-position curve — good enough for a "potential traffic"
 * estimate; not a metric SE Ranking returns directly. */
function estimateClicks(volume: number, position: number): number {
  const ctrByPosition: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.1, 4: 0.07, 5: 0.05 };
  const ctr = ctrByPosition[position] ?? (position <= 10 ? 0.03 : position <= 20 ? 0.01 : 0.003);
  return Math.round(volume * ctr);
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
 * project-wide SE Ranking pull (filtered here to this path) and this
 * page's own GA4 session count. `seRankingOk` reflects whether the
 * project pull actually succeeded recently — with it false, keywordRows/
 * auditRows are empty by construction (see seRankingProjectPull.ts), so
 * recommendations are skipped rather than emitting a misleading "no
 * urgent issues" for a page we simply have no data on. */
export function computePageRow(
  path: string,
  keywordRows: SeRankingKeywordRow[],
  auditRows: SeRankingAuditPage[],
  actualTraffic: number | null,
  seRankingOk: boolean,
): PageSeoData {
  const row: PageSeoData = {
    path,
    totalSearchVolume: 0,
    potentialTraffic: 0,
    actualTraffic,
    contentScore: 0,
    localSeoScore: 0,
    keywordCount: 0,
    top3Keywords: 0,
    issues: [],
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
  }

  row.localSeoScore = computeLocalSeoScore(row.topQueries, row.contentScore);
  if (seRankingOk) row.recommendations = recommendationsFor(row);

  return row;
}

/** A future-state page that doesn't exist on the live site yet — never
 * pulled from SE Ranking/GA4, just a rough estimate from its real parent
 * page's numbers. */
export function computeProjectedRow(path: string, parent: PageSeoData | null): PageSeoData {
  return {
    path,
    totalSearchVolume: parent ? Math.round(parent.totalSearchVolume * PROJECTION_FACTOR) : 0,
    potentialTraffic: parent ? Math.round(parent.potentialTraffic * PROJECTION_FACTOR) : 0,
    actualTraffic: null,
    contentScore: 0,
    localSeoScore: 0,
    keywordCount: 0,
    top3Keywords: 0,
    issues: [],
    topQueries: parent ? parent.topQueries.slice(0, 3) : [],
    recommendations: ["Build out content once this page ships — projected from the parent page's query cluster"],
    projected: true,
  };
}
