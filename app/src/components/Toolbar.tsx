import type { ColorMode } from '../data/seoTypes';
import type { RefreshState } from '../hooks/useSeoSnapshot';
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
  refreshState: RefreshState;
  onRefresh: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const REFRESH_LABEL: Record<RefreshState, string> = {
  idle: 'Refresh SEO Data',
  triggering: 'Starting…',
  waiting: 'Refreshing… (~1–2 min)',
  done: 'Refreshed ✓',
  error: 'Refresh failed — check logs',
};

export function Toolbar({
  version,
  pageCount,
  newCount,
  colorMode,
  onColorModeChange,
  snapshotGeneratedAt,
  hasSnapshot,
  refreshState,
  onRefresh,
  onExpandAll,
  onCollapseAll,
}: ToolbarProps) {
  const refreshBusy = refreshState === 'triggering' || refreshState === 'waiting';
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
        <span className="toolbar__freshness" title="Last SE Ranking + GA4 pull">
          <span className="toolbar__freshness-dot" />
          SEO data as of {formatRelativeDate(snapshotGeneratedAt)}
        </span>
      ) : (
        <span className="toolbar__freshness toolbar__freshness--sample" title="No SE Ranking/GA4 pull has completed yet">
          <span className="toolbar__freshness-dot" />
          No SEO data pulled yet
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
        <button
          type="button"
          className={`pill-btn pill-btn--outline-navy ${refreshState === 'error' ? 'pill-btn--error' : ''}`}
          onClick={onRefresh}
          disabled={refreshBusy}
          title="Triggers a fresh SE Ranking + GA4 pull. Takes ~1-2 minutes; this button polls and updates automatically."
        >
          {REFRESH_LABEL[refreshState]}
        </button>
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
