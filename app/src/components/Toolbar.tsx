import type { ColorMode } from '../data/seoTypes';
import { formatRelativeDate } from '../lib/format';
import type { SiteVersion } from '../data/sitemapTree';

interface ToolbarProps {
  version: SiteVersion;
  pageCount: number;
  newCount: number;
  colorMode: ColorMode;
  onColorModeChange: (m: ColorMode) => void;
  snapshotGeneratedAt: string;
  hasSnapshot: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function Toolbar({
  version,
  pageCount,
  newCount,
  colorMode,
  onColorModeChange,
  snapshotGeneratedAt,
  hasSnapshot,
  onExpandAll,
  onCollapseAll,
}: ToolbarProps) {
  const title = version === 'current' ? 'Current sitemap — callnublue.com' : 'Future state — proposed structure';
  const countLabel =
    version === 'current'
      ? `${pageCount} pages mapped · 170 blog posts collapsed · city variants grouped`
      : `${pageCount} pages · ${newCount} new pages proposed (yellow)`;

  return (
    <div className="toolbar">
      <span className="toolbar__title">{title}</span>
      <span className="toolbar__count">{countLabel}</span>

      {hasSnapshot ? (
        <span className="toolbar__freshness" title="Most recently opened page's SE Ranking + GA4 pull">
          <span className="toolbar__freshness-dot" />
          Heat map last updated {formatRelativeDate(snapshotGeneratedAt)}
        </span>
      ) : (
        <span className="toolbar__freshness toolbar__freshness--sample" title="Open a page's inspector to pull its SE Ranking/GA4 data">
          <span className="toolbar__freshness-dot" />
          No pages inspected yet — click a node to pull its data
        </span>
      )}

      <div className="toolbar__spacer">
        <select className="color-mode-select" value={colorMode} onChange={(e) => onColorModeChange(e.target.value as ColorMode)} title="Color nodes by">
          <option value="none">Color: off</option>
          <option value="traffic">Color by traffic</option>
          <option value="score">Color by content score</option>
          <option value="local">Color by local SEO score</option>
          <option value="opportunity">Color by opportunity</option>
        </select>
        <button type="button" className="pill-btn pill-btn--outline-red" onClick={onExpandAll}>
          Expand All
        </button>
        <button type="button" className="pill-btn pill-btn--outline-navy" onClick={onCollapseAll}>
          Collapse All
        </button>
      </div>
    </div>
  );
}
