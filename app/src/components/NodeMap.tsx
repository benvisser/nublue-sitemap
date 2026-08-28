import type { RefObject } from 'react';
import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import type { Edge, LayoutNode } from '../hooks/useSitemap';
import type { ColorMode, PageSeoData } from '../data/seoTypes';
import { opportunityScore, type SeoSnapshot } from '../data/seoTypes';
import { sequentialColor, textOnSequential } from '../lib/colorScale';
import { LinkIcon } from './LinkIcon';

const MAX_TRAFFIC_FOR_SCALE = 1200;

interface NodeMapProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  edges: Edge[];
  pages: LayoutNode[];
  clusters: LayoutNode[];
  canvasWidth: number;
  canvasHeight: number;
  isOpen: (n: PageNode) => boolean;
  onToggle: (n: PageNode) => void;
  colorMode: ColorMode;
  seo: SeoSnapshot | null;
  selectedPath: string | null;
  onSelectNode: (n: PageNode) => void;
}

function heatFor(row: PageSeoData | undefined, mode: ColorMode): { bg: string; fg: string } | null {
  if (mode === 'none' || !row) return null;
  const t =
    mode === 'score'
      ? row.contentScore / 100
      : mode === 'traffic'
        ? Math.min(1, row.potentialTraffic / MAX_TRAFFIC_FOR_SCALE)
        : Math.min(1, opportunityScore(row) / MAX_TRAFFIC_FOR_SCALE);
  return { bg: sequentialColor(t), fg: textOnSequential(t) };
}

export function NodeMap({
  scrollRef,
  zoom,
  edges,
  pages,
  clusters,
  canvasWidth,
  canvasHeight,
  isOpen,
  onToggle,
  colorMode,
  seo,
  selectedPath,
  onSelectNode,
}: NodeMapProps) {
  const scrollWidth = Math.round((canvasWidth + 80) * zoom);
  const scrollHeight = Math.round((canvasHeight + 64) * zoom);

  return (
    <div ref={scrollRef} className="node-map-scroll">
      <div className="node-map-canvas" style={{ width: scrollWidth, height: scrollHeight }}>
        <div className="node-map-zoomed" style={{ transform: `scale(${zoom})`, width: canvasWidth, height: canvasHeight }}>
          <svg width={canvasWidth} height={canvasHeight} className="node-map-edges">
            {edges.map((e, i) => (
              <path key={i} d={e.d} fill="none" stroke="var(--sky-200)" strokeWidth={1.5} />
            ))}
          </svg>
          <div className="node-map-nodes" style={{ width: canvasWidth, height: canvasHeight }}>
            {pages.map(({ node, x, y }) => {
              const row = node.url ? seo?.pages[node.url] : undefined;
              const heat = heatFor(row, colorMode);
              const fw = node.depth <= 1 ? 700 : node.depth === 2 ? 600 : 400;
              return (
                <div
                  key={node.id}
                  className={`map-node map-node--clickable ${selectedPath === node.url ? 'map-node--selected' : ''}`}
                  style={{ transform: `translate3d(${x}px, ${y}px, 0)`, background: heat?.bg }}
                  onClick={() => onSelectNode(node)}
                >
                  <span className="map-node__dot" style={{ background: node.isNew ? 'var(--gold)' : 'var(--green)' }} />
                  <span title={node.url ?? undefined} className="map-node__name" style={{ fontWeight: fw, color: heat?.fg }}>
                    {node.name}
                  </span>
                  {node.children.length > 0 && (
                    <button
                      type="button"
                      className="map-node__toggle"
                      title="Expand or collapse children"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(node);
                      }}
                    >
                      {isOpen(node) ? '−' : `+${node.children.length}`}
                    </button>
                  )}
                  {node.url && (
                    <a
                      href={`${BASE_URL}${node.url}`}
                      target="_blank"
                      rel="noopener"
                      title={`Open ${node.url}`}
                      className="map-node__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkIcon />
                    </a>
                  )}
                </div>
              );
            })}
            {clusters.map(({ node, x, y }) => (
              <div key={node.id} className="cluster-node" style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}>
                <span className="cluster-node__name">{node.name}</span>
                <span className="cluster-node__count">{node.note || `${node.children.length} pages`}</span>
                <button type="button" className="cluster-node__toggle" title="Expand or collapse group" onClick={() => onToggle(node)}>
                  {isOpen(node) ? '−' : `+${node.children.length}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
