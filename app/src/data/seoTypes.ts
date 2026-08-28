// Shape of the nightly SEO/traffic snapshot. This is written by the Netlify
// scheduled function (netlify/functions/refresh-seo-data.mts) from SE Ranking
// + GA4 data, and read by the app at runtime — the app never calls either API
// directly. See app/README.md for the full data flow.

export interface KeywordQuery {
  query: string;
  /** Monthly search volume, from SE Ranking */
  volume: number;
  /** Current tracked rank position, 1-based; null if not ranking top 100 */
  position: number | null;
}

export interface ReferrerRow {
  source: string;
  sessions: number;
}

/** A query Google Search Console actually recorded impressions/clicks for
 * on this page — real measured performance, distinct from SE Ranking's
 * topQueries (which carries search *volume*, something GSC doesn't
 * report). The two are complementary: SE Ranking says what's worth
 * targeting, GSC says what's actually happening in search. */
export interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/** Real per-page crawl details from SE Ranking's Website Audit tool (the
 * "Crawled pages" section) — on-page facts as their crawler actually
 * found them on this page, not a derived score. Null fields mean SE
 * Ranking didn't report that field for this page, not that it's zero. */
export interface AuditDetail {
  /** HTTP status the crawler got for this URL, e.g. 200, 404 */
  status: number | null;
  title: string | null;
  description: string | null;
  h1: string | null;
  wordsCount: number | null;
  /** e.g. "indexable", "noindex", "canonicalized" */
  indexableStatus: string | null;
  canonicalUrl: string | null;
  /** Internal links pointing at this page */
  inlinks: number | null;
  outlinksInternal: number | null;
  outlinksExternal: number | null;
  /** SE Ranking's own estimated monthly organic traffic for this page */
  trafficForecast: number | null;
  /** Keywords SE Ranking associates with this page in the audit (may
   * differ from topQueries.length, which counts domain-wide tracked
   * keywords whose target URL matches this path) */
  numKeywords: number | null;
}

export interface PageSeoData {
  /** URL path key, matches PageNode.url exactly, e.g. "/electrical/panels/" */
  path: string;
  /** Total monthly search volume summed across every keyword tracked for
   * this page (SE Ranking) — "how much search demand exists", independent
   * of how well the page currently ranks for it. */
  totalSearchVolume: number;
  /** Estimated monthly organic clicks from tracked keywords (SE Ranking) —
   * totalSearchVolume adjusted for each keyword's current rank via a
   * position → CTR curve, so it reflects demand actually being captured. */
  potentialTraffic: number;
  /** Measured sessions landing on this path over the trailing 28 days (GA4) */
  actualTraffic: number | null;
  /** Same, trailing 28 days before that — for the period-over-period
   * comparison shown next to actualTraffic. */
  previousTraffic: number | null;
  /** Sessions from organic search specifically (GA4's "Organic Search"
   * channel group), current and previous period — the slice of
   * actualTraffic actually attributable to SEO rather than all traffic
   * sources. */
  organicTraffic: number | null;
  previousOrganicTraffic: number | null;
  /** Average engaged seconds per session on this page, trailing 28 days (GA4) */
  avgEngagementSeconds: number | null;
  /** Top sources sending sessions to this page, trailing 28 days (GA4) */
  topReferrers: ReferrerRow[];
  /** Real measured Search Console performance, trailing 28 days */
  searchClicks: number | null;
  searchImpressions: number | null;
  searchCtr: number | null;
  avgSearchPosition: number | null;
  topSearchQueries: SearchQuery[];
  /** Website/page audit content score, 0-100 (SE Ranking) */
  contentScore: number;
  /**
   * 0-100 composite, computed here (not a single SE Ranking field): blends
   * this page's average tracked-keyword rank strength with its content
   * score, so it reads as "how strong is this page's local SEO overall"
   * rather than one narrow metric. See `computeLocalSeoScore` below for the
   * exact formula.
   */
  localSeoScore: number;
  keywordCount: number;
  top3Keywords: number;
  issues: string[];
  /** This page's raw Website Audit crawl record, or null if the most
   * recent SE Ranking Website Audit didn't crawl this exact path (e.g. it
   * hasn't been recrawled since the page was added, or it 404'd/redirected
   * during the crawl) — distinct from SE Ranking simply not being
   * connected at all, which is `!sources.seRanking` on the API response. */
  auditDetail: AuditDetail | null;
  /** Every keyword SE Ranking tracks against this page, sorted by volume
   * descending — current rank position for each is the whole point of
   * this list, not just the top few. */
  topQueries: KeywordQuery[];
  recommendations: string[];
  /**
   * True when this row has no real SE Ranking/GA4 data (e.g. a future-state
   * page that doesn't exist yet) and the numbers are projected from the
   * parent path's query cluster instead of measured.
   */
  projected: boolean;
}

export interface SourceStatus {
  seRanking: boolean;
  ga4: boolean;
  gsc: boolean;
}

export interface SeoSnapshot {
  /** ISO timestamp of when this snapshot was generated */
  generatedAt: string;
  sources: SourceStatus;
  pages: Record<string, PageSeoData>;
}

export type ColorMode = 'none' | 'traffic' | 'score' | 'local' | 'opportunity';

/** Opportunity is a simple, clearly-labelled estimate: traffic left on the
 * table if the page's content score caught up to 100. Not a metric either
 * API reports directly. */
export function opportunityScore(d: Pick<PageSeoData, 'potentialTraffic' | 'contentScore'>): number {
  return Math.round(d.potentialTraffic * (1 - d.contentScore / 100));
}

/**
 * "Local SEO score" — 60% average rank strength across this page's tracked
 * keywords (position 1 = 100 points, decaying ~3pts per position, floor 0),
 * 40% the page's content/audit score. Deliberately a computed blend rather
 * than a single opaque API field: SE Ranking's plan-dependent Local
 * Marketing tools (Google Business Profile / local-pack tracking) aren't
 * wired up here, so this is the honest "how strong is this page doing
 * locally" signal built from data we actually pull (keyword positions +
 * page audit). Swap in a native local-pack metric here if/when that's
 * available instead.
 */
export function computeLocalSeoScore(topQueries: KeywordQuery[], contentScore: number): number {
  const ranked = topQueries.filter((q): q is KeywordQuery & { position: number } => q.position != null);
  const rankStrength = ranked.length ? ranked.reduce((sum, q) => sum + Math.max(0, 100 - (q.position - 1) * 3), 0) / ranked.length : 0;
  return Math.round(rankStrength * 0.6 + contentScore * 0.4);
}
