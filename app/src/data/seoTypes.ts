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

export interface SeoSnapshot {
  /** ISO timestamp of when this snapshot was generated */
  generatedAt: string;
  sources: { seRanking: boolean; ga4: boolean };
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
