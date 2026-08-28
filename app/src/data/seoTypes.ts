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
  /** Estimated monthly organic clicks from tracked keywords (SE Ranking) */
  potentialTraffic: number;
  /** Measured sessions landing on this path over the trailing 28 days (GA4) */
  actualTraffic: number | null;
  /** Website/page audit content score, 0-100 (SE Ranking) */
  contentScore: number;
  keywordCount: number;
  top3Keywords: number;
  issues: string[];
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

export type ColorMode = 'none' | 'traffic' | 'score' | 'opportunity';

/** Opportunity is a simple, clearly-labelled estimate: traffic left on the
 * table if the page's content score caught up to 100. Not a metric either
 * API reports directly. */
export function opportunityScore(d: Pick<PageSeoData, 'potentialTraffic' | 'contentScore'>): number {
  return Math.round(d.potentialTraffic * (1 - d.contentScore / 100));
}
