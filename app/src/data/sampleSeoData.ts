// Deterministic sample SEO snapshot used in local dev and as a fallback
// before the first real nightly snapshot exists. Shaped exactly like the
// real thing (see seoTypes.ts) so swapping in netlify/functions output is a
// no-op for every component that reads it.
//
// Numbers here are NOT real SE Ranking / GA4 data — every value is derived
// from a hash of the URL path so the demo is stable across reloads. Real
// values come from netlify/functions/refresh-seo-data.mts once credentials
// are configured (see app/README.md).

import { flattenTree, getSiteTree, type PageNode } from './sitemapTree';
import { computeLocalSeoScore, type KeywordQuery, type PageSeoData, type SeoSnapshot } from './seoTypes';

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rand(seed: number, salt: number): number {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const SAMPLE_QUERIES: Record<string, string[]> = {
  electrical: [
    'emergency electrician near me',
    'panel upgrade cost',
    'circuit breaker keeps tripping',
    'licensed electrician near me',
    'electrical panel replacement cost',
    'why does my breaker keep tripping',
    'electrician same day service',
  ],
  plumbing: [
    'emergency plumber near me',
    'sewer line repair cost',
    'water heater not working',
    'licensed plumber near me',
    'tankless water heater installation cost',
    'low water pressure fix',
    'plumber same day service',
  ],
  hvac: [
    'ac repair near me',
    'furnace not heating',
    'hvac maintenance plan',
    'hvac company near me',
    'ac not cooling fix',
    'heat pump installation cost',
    'emergency hvac repair',
  ],
  service: ['electrician near me', 'plumber near me', 'hvac company near me', 'home service company near me', 'licensed contractor near me'],
  default: ['home service company near me', 'licensed contractor near me', 'same day repair', 'trusted home services', 'local contractor reviews'],
};

function queriesFor(path: string, seed: number): KeywordQuery[] {
  const bucket = path.includes('electrical')
    ? 'electrical'
    : path.includes('plumbing') || path.includes('drain') || path.includes('water-heater')
      ? 'plumbing'
      : path.includes('hvac') || path.includes('air-condition') || path.includes('heating')
        ? 'hvac'
        : path.includes('service-area')
          ? 'service'
          : 'default';
  return SAMPLE_QUERIES[bucket].map((q, i) => ({
    query: q,
    volume: Math.round(150 + rand(seed, i + 1) * 2200),
    position: Math.round(1 + rand(seed, i + 10) * 40),
  }));
}

const ISSUE_POOL = [
  'Thin content — under 400 words',
  'Missing H2/H3 structure',
  'No FAQ schema markup',
  'Duplicate title tag with a sibling page',
  'No internal links from the blog',
  'Meta description missing',
  'Slow LCP on mobile (>3.5s)',
  'No location-specific content beyond the city name',
];

const RECS = [
  'Add a city-specific FAQ block targeting long-tail queries',
  'Expand service description to 600+ words with local landmarks',
  'Add internal links from top 3 related blog posts',
  'Add schema.org LocalBusiness + Service markup',
  'Compress hero image and lazy-load below-the-fold media',
  'Add customer review snippets specific to this service',
];

function pick<T>(pool: T[], seed: number, salt: number, count: number): T[] {
  const scored = pool.map((item, i) => ({ item, r: rand(seed, salt + i) }));
  scored.sort((a, b) => b.r - a.r);
  return scored.slice(0, count).map((s) => s.item);
}

function buildRow(node: PageNode): PageSeoData | null {
  if (!node.url || node.kind === 'cluster') return null;
  const seed = hash(node.url);
  const isNew = !!node.isNew;
  const contentScore = isNew ? 0 : Math.round(35 + rand(seed, 2) * 60);
  const potentialTraffic = Math.round((node.depth <= 1 ? 400 : node.depth === 2 ? 150 : 60) * (0.4 + rand(seed, 3) * 1.4));
  const topQueries = isNew ? [] : queriesFor(node.url, seed);
  const totalSearchVolume = topQueries.reduce((sum, q) => sum + q.volume, 0);
  return {
    path: node.url,
    totalSearchVolume,
    potentialTraffic,
    actualTraffic: isNew ? null : Math.round(potentialTraffic * (0.25 + rand(seed, 4) * 0.5)),
    contentScore,
    localSeoScore: computeLocalSeoScore(topQueries, contentScore),
    keywordCount: isNew ? 0 : Math.round(4 + rand(seed, 5) * 40),
    top3Keywords: isNew ? 0 : Math.round(rand(seed, 6) * 6),
    issues: isNew ? [] : pick(ISSUE_POOL, seed, 7, 2 + Math.round(rand(seed, 20) * 2)),
    topQueries,
    recommendations: pick(RECS, seed, 30, 3),
    projected: isNew,
  };
}

export function buildSampleSnapshot(): SeoSnapshot {
  const pages: Record<string, PageSeoData> = {};
  for (const version of ['current', 'future'] as const) {
    const all = flattenTree(getSiteTree(version));
    for (const node of all) {
      const row = buildRow(node);
      if (row && !pages[row.path]) pages[row.path] = row;
    }
  }
  return {
    generatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    sources: { seRanking: false, ga4: false },
    pages,
  };
}
