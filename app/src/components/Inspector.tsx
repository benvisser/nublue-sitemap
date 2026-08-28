import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import type { SeoSnapshot } from '../data/seoTypes';
import { opportunityScore } from '../data/seoTypes';
import { formatNumber } from '../lib/format';
import { LinkIcon } from './LinkIcon';
import { ScoreGauge } from './ScoreGauge';

interface InspectorProps {
  node: PageNode;
  seo: SeoSnapshot | null;
  isSample: boolean;
  onClose: () => void;
}

export function Inspector({ node, seo, isSample, onClose }: InspectorProps) {
  const row = node.url ? seo?.pages[node.url] : undefined;

  return (
    <>
      <div className="inspector-backdrop" onClick={onClose} />
      <aside className="inspector" role="dialog" aria-label={`SEO details for ${node.name}`}>
        <div className="inspector__header">
          <button type="button" className="inspector__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="inspector__title-row">
            <span className="inspector__dot" style={{ background: node.isNew ? 'var(--gold)' : 'var(--green)' }} />
            <span className="inspector__name">{node.name}</span>
          </div>
          <span className="inspector__path">{node.url || '—'}</span>
          {node.url && (
            <a href={`${BASE_URL}${node.url}`} target="_blank" rel="noopener" className="inspector__open-link">
              <LinkIcon size={13} /> Open live page
            </a>
          )}
          {row?.projected && <span className="badge badge--projected">Projected estimate</span>}
          {isSample && <span className="badge badge--sample">Sample data — not live SE Ranking/GA4</span>}
        </div>

        <div className="inspector__body">
          {!row ? (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>
              No SEO/traffic data for this node yet{node.kind === 'cluster' ? ' — open a page inside this group to inspect it.' : '.'}
            </p>
          ) : (
            <>
              <div className="stat-tiles">
                <div className="stat-tile">
                  <span className="stat-tile__label">Potential search volume</span>
                  <span className="stat-tile__value">{formatNumber(row.totalSearchVolume)}</span>
                  <span className="stat-tile__sub">monthly searches, all tracked keywords</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Potential traffic</span>
                  <span className="stat-tile__value">{formatNumber(row.potentialTraffic)}</span>
                  <span className="stat-tile__sub">est. monthly clicks at current rank</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Actual traffic</span>
                  <span className="stat-tile__value">{row.actualTraffic == null ? '—' : formatNumber(row.actualTraffic)}</span>
                  <span className="stat-tile__sub">sessions, trailing 28d (GA4)</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Keywords tracked</span>
                  <span className="stat-tile__value">{row.keywordCount}</span>
                  <span className="stat-tile__sub">{row.top3Keywords} ranking top 3</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Opportunity</span>
                  <span className="stat-tile__value">{formatNumber(opportunityScore(row))}</span>
                  <span className="stat-tile__sub">traffic if score hit 100</span>
                </div>
              </div>

              <div className="score-row">
                <div>
                  <h3 className="section-title" title="Composite: 60% average rank strength across this page's tracked keywords, 40% content/audit score — not a single SE Ranking field.">
                    Local SEO score ⓘ
                  </h3>
                  <div className="gauge-row">
                    <ScoreGauge score={row.localSeoScore} />
                    <span className="gauge-row__label">Blend of keyword rank strength + content score — see tooltip</span>
                  </div>
                </div>
                <div>
                  <h3 className="section-title">Content score</h3>
                  <div className="gauge-row">
                    <ScoreGauge score={row.contentScore} />
                    <div>
                      {row.issues.length === 0 ? (
                        <span className="gauge-row__label">No open issues</span>
                      ) : (
                        <ul className="issue-list">
                          {row.issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {row.topQueries.length > 0 && (
                <div>
                  <h3 className="section-title">Tracked keywords &amp; current rank ({row.topQueries.length})</h3>
                  <div className="query-table-scroll">
                    <table className="query-table">
                      <thead>
                        <tr>
                          <th>Query</th>
                          <th className="num">Volume</th>
                          <th className="num">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.topQueries.map((q) => (
                          <tr key={q.query}>
                            <td>{q.query}</td>
                            <td className="num">{formatNumber(q.volume)}</td>
                            <td className="num">{q.position ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {row.recommendations.length > 0 && (
                <div>
                  <h3 className="section-title">Recommendations</h3>
                  <ol className="rec-list">
                    {row.recommendations.map((rec, i) => (
                      <li key={rec}>
                        <span className="rec-list__num">{i + 1}</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
