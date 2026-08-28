import type { SiteVersion } from '../data/sitemapTree';

export type ViewMode = 'map' | 'list';

interface HeaderProps {
  version: SiteVersion;
  onVersionChange: (v: SiteVersion) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function Header({ version, onVersionChange, view, onViewChange, zoom, onZoomIn, onZoomOut, onZoomReset }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__eyebrow">NuBlue Electric, Plumbing &amp; Air</span>
        <span className="app-header__title">Website Sitemap</span>
      </div>

      <div className="segmented">
        <button
          type="button"
          className={`segmented__btn ${version === 'current' ? 'segmented__btn--active' : ''}`}
          onClick={() => onVersionChange('current')}
        >
          Current Site
        </button>
        <button
          type="button"
          className={`segmented__btn ${version === 'future' ? 'segmented__btn--active' : ''}`}
          onClick={() => onVersionChange('future')}
        >
          Future State
        </button>
      </div>

      <div className="segmented">
        <button type="button" className={`segmented__btn ${view === 'map' ? 'segmented__btn--active' : ''}`} onClick={() => onViewChange('map')}>
          Node Map
        </button>
        <button type="button" className={`segmented__btn ${view === 'list' ? 'segmented__btn--active' : ''}`} onClick={() => onViewChange('list')}>
          List View
        </button>
      </div>

      <div className="legend">
        <div className="legend__group">
          <span className="legend__dot" style={{ background: 'var(--green)' }} />
          <span>Live page</span>
          <span className="legend__dot" style={{ background: 'var(--gold)', marginLeft: 10 }} />
          <span>New page</span>
          <span className="legend__swatch" />
          <span>Collapsed group</span>
        </div>
        {view === 'map' && (
          <div className="zoom-controls">
            <button type="button" className="zoom-controls__btn" onClick={onZoomOut} aria-label="Zoom out">
              −
            </button>
            <span className="zoom-controls__label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="zoom-controls__btn" onClick={onZoomIn} aria-label="Zoom in">
              +
            </button>
            <button type="button" className="zoom-controls__reset" onClick={onZoomReset}>
              Fit
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
