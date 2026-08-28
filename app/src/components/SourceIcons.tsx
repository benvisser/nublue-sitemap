/** Small source-attribution icons for the inspector — each SEO/traffic
 * section is grouped under one of these so it's clear at a glance which
 * API a number came from, without repeating "(SE Ranking)" in every
 * label. Plain stroked SVGs (same style as LinkIcon) rather than the
 * real product logos — no trademarked marks, just a distinct shape per
 * source. */

interface IconProps {
  size?: number;
}

/** Google Analytics — a simple ascending bar chart. */
export function Ga4Icon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="18" y1="20" x2="18" y2="4" />
    </svg>
  );
}

/** Search Console — a magnifying glass. */
export function SearchConsoleIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <line x1="21" y1="21" x2="14.65" y2="14.65" />
    </svg>
  );
}

/** SE Ranking — a trending-up line, for rank/keyword data. */
export function SeRankingIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  );
}
