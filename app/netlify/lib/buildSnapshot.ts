import { computeLocalSeoScore, type KeywordQuery, type PageSeoData, type SeoSnapshot } from '../../src/data/seoTypes.js';
import { currentSitePaths, projectedPaths } from './seoConfig.js';
import { getKeywordPositions, getPageAudit } from './seRankingClient.js';
import { getSessionsByPath } from './ga4Client.js';

const PROJECTION_FACTOR = 0.15; // future page starts at ~15% of its parent's potential traffic

function buildRealRows(
  keywordRows: Awaited<ReturnType<typeof getKeywordPositions>>,
  auditRows: Awaited<ReturnType<typeof getPageAudit>>,
  sessionsByPath: Record<string, number>,
  paths: string[],
): Record<string, PageSeoData> {
  const byPath: Record<string, PageSeoData> = {};

  for (const path of paths) {
    byPath[path] = {
      path,
      totalSearchVolume: 0,
      potentialTraffic: 0,
      actualTraffic: sessionsByPath[path] ?? null,
      contentScore: 0,
      localSeoScore: 0,
      keywordCount: 0,
      top3Keywords: 0,
      issues: [],
      topQueries: [],
      recommendations: [],
      projected: false,
    };
  }

  const queriesByPath = new Map<string, KeywordQuery[]>();
  for (const row of keywordRows) {
    const entry = byPath[row.url];
    if (!entry) continue; // keyword tracked against a URL outside our sitemap (e.g. old redirect)
    entry.keywordCount += 1;
    entry.totalSearchVolume += row.volume;
    if (row.position != null && row.position <= 3) entry.top3Keywords += 1;
    if (row.position != null) entry.potentialTraffic += estimateClicks(row.volume, row.position);
    const list = queriesByPath.get(row.url) || [];
    list.push({ query: row.keyword, volume: row.volume, position: row.position });
    queriesByPath.set(row.url, list);
  }
  // Every tracked keyword for the page, most-searched first — this is the
  // "current rank for tracked keywords" list, not a trimmed preview.
  for (const [path, queries] of queriesByPath) {
    byPath[path].topQueries = queries.sort((a, b) => b.volume - a.volume);
  }

  for (const row of auditRows) {
    const entry = byPath[row.url];
    if (!entry) continue;
    entry.contentScore = row.score;
    entry.issues = row.issues;
  }

  for (const path of paths) {
    const entry = byPath[path];
    entry.localSeoScore = computeLocalSeoScore(entry.topQueries, entry.contentScore);
    // Recommendations are entirely SE Ranking-derived (content score + audit
    // issues); an empty keywordRows/auditRows pull (source down) already
    // leaves them at their zero/empty defaults, so recommendationsFor would
    // otherwise emit a misleading "no urgent issues" for a page we simply
    // have no data on. Only synthesize them when SE Ranking actually
    // returned something for this run.
    if (keywordRows.length > 0 || auditRows.length > 0) {
      entry.recommendations = recommendationsFor(entry);
    }
  }

  return byPath;
}

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

function addProjectedRows(rows: Record<string, PageSeoData>): void {
  for (const { path, parentPath } of projectedPaths()) {
    const parent = parentPath ? rows[parentPath] : undefined;
    rows[path] = {
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
      recommendations: ['Build out content once this page ships — projected from the parent page\'s query cluster'],
      projected: true,
    };
  }
}

/** Runs one source's pull in isolation: a failure here (bad credentials, an
 * endpoint that's changed, a rate limit) never takes down the other
 * source's data — the snapshot still gets written with whatever succeeded,
 * and `ok` tells the frontend which fields are real vs. not-yet-connected. */
async function safely<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<{ value: T; ok: boolean }> {
  try {
    return { value: await fn(), ok: true };
  } catch (err) {
    console.error(`[buildSnapshot] ${label} failed — leaving this source disconnected for this run:`, err);
    return { value: fallback, ok: false };
  }
}

export async function buildSnapshot(): Promise<SeoSnapshot> {
  const paths = currentSitePaths();

  const [keywords, audit, sessions] = await Promise.all([
    safely('SE Ranking getKeywordPositions', [], getKeywordPositions),
    safely('SE Ranking getPageAudit', [], getPageAudit),
    safely('GA4 getSessionsByPath', {}, getSessionsByPath),
  ]);

  const pages = buildRealRows(keywords.value, audit.value, sessions.value, paths);
  addProjectedRows(pages);

  return {
    generatedAt: new Date().toISOString(),
    sources: { seRanking: keywords.ok && audit.ok, ga4: sessions.ok },
    pages,
  };
}
