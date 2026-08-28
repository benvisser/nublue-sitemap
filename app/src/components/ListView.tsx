import { useMemo, useState } from 'react';
import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import { opportunityScore, type SeoSnapshot } from '../data/seoTypes';
import { formatNumber } from '../lib/format';
import { LinkIcon } from './LinkIcon';

type SortKey = 'name' | 'traffic' | 'score' | 'opportunity';
type SortDir = 'asc' | 'desc';

interface ListViewProps {
  allNodes: PageNode[];
  seo: SeoSnapshot | null;
  selectedPath: string | null;
  onSelectNode: (n: PageNode) => void;
}

function dotColor(n: PageNode): string {
  if (n.isNew) return 'var(--gold)';
  if (n.kind === 'cluster') return 'var(--blue)';
  return 'var(--green)';
}

export function ListView({ allNodes, seo, selectedPath, onSelectNode }: ListViewProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allNodes.filter((n) => !q || n.name.toLowerCase().includes(q) || (n.url || '').toLowerCase().includes(q));
    if (sortKey === 'name') {
      // Default order is document order (matches the tree), only re-sorted
      // when a metric column is chosen.
      return filtered;
    }
    const withMetric = filtered.map((n) => {
      const row = n.url ? seo?.pages[n.url] : undefined;
      const metric = !row ? -1 : sortKey === 'traffic' ? row.potentialTraffic : sortKey === 'score' ? row.contentScore : opportunityScore(row);
      return { n, metric };
    });
    withMetric.sort((a, b) => (sortDir === 'desc' ? b.metric - a.metric : a.metric - b.metric));
    return withMetric.map((w) => w.n);
  }, [allNodes, query, sortKey, sortDir, seo]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortArrow = (key: SortKey) => (sortKey === key ? (sortDir === 'desc' ? '↓' : '↑') : '');

  return (
    <div className="list-view">
      <div className="list-view__inner">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter pages by name or URL path"
          className="list-view__filter"
        />

        <div className="list-header">
          <span style={{ width: 9 }} />
          <span style={{ flex: '0 0 auto', width: 0 }} />
          <span style={{ flex: 1 }}>Page</span>
          <button type="button" className="list-header__sort" style={{ width: 76 }} onClick={() => toggleSort('traffic')}>
            Traffic {sortArrow('traffic')}
          </button>
          <button type="button" className="list-header__sort" style={{ width: 76 }} onClick={() => toggleSort('score')}>
            Score {sortArrow('score')}
          </button>
          <span style={{ width: 26 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((n) => {
            const row = n.url ? seo?.pages[n.url] : undefined;
            const fw = n.depth <= 1 ? 700 : n.depth === 2 ? 600 : 400;
            return (
              <div key={n.id} className="list-row" onClick={() => onSelectNode(n)} style={{ background: selectedPath === n.url ? 'var(--gray-100)' : undefined }}>
                <span className="list-row__dot" style={{ background: dotColor(n) }} />
                <span className="list-row__indent" style={{ width: Math.min(n.depth, 6) * 22 }} />
                <span className="list-row__name" style={{ fontWeight: fw }}>
                  {n.name}
                </span>
                <span className="list-row__path">{n.url || (n.kind === 'cluster' ? 'group' : '—')}</span>
                <span className="list-row__metric">{row ? formatNumber(row.potentialTraffic) : '—'}</span>
                <span className="list-row__metric">{row ? `${row.contentScore}` : '—'}</span>
                {n.url ? (
                  <a
                    href={`${BASE_URL}${n.url}`}
                    target="_blank"
                    rel="noopener"
                    className="list-row__link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon size={15} />
                  </a>
                ) : (
                  <span style={{ width: 26 }} />
                )}
              </div>
            );
          })}
        </div>
        <p className="list-view__footnote">
          City service pages follow the <strong>/service/city/</strong> pattern. A handful of legacy URLs differ and will redirect.
        </p>
      </div>
    </div>
  );
}
