import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import { opportunityScore } from '../data/seoTypes';
import { usePageSeo } from '../hooks/usePageSeo';
import { formatNumber } from '../lib/format';
import { LinkIcon } from './LinkIcon';
import { ScoreGauge } from './ScoreGauge';

interface InspectorProps {
  node: PageNode;
  onClose: () => void;
  onLoaded?: () => void;
}

/** A stat tile that isn't backed by a connected source yet — grayed with a
 * "coming soon" note instead of a fabricated or misleading number. */
function PendingTile({ label }: { label: string }) {
  return (
    <div className="stat-tile stat-tile--pending">
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value">—</span>
      <span className="stat-tile__sub">SE Ranking integration coming soon</span>
    </div>
  );
}

export function Inspector({ node, onClose, onLoaded }: InspectorProps) {
  const { status, result, refresh } = usePageSeo(node.url, onLoaded);
  const row = result?.page;
  const seRankingLive = Boolean(result?.sources.seRanking);
  const ga4Live = Boolean(result?.sources.ga4);

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
          {row && (
            <div className="inspector__badges">
              {row.projected && <span className="badge badge--projected">Projected estimate</span>}
              {!seRankingLive && <span className="badge badge--pending">SE Ranking integration coming soon</span>}
              {!ga4Live && <span className="badge badge--pending">GA4 not connected yet</span>}
              {status === 'ready' && !row.projected && (
                <button type="button" className="inspector__refresh" onClick={() => refresh()} title="Force a fresh pull for this page, bypassing the cache">
                  ↻ Refresh this page
                </button>
              )}
            </div>
          )}
        </div>

        <div className="inspector__body">
          {status === 'idle' && (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>
              No SEO/traffic data for this node{node.kind === 'cluster' ? ' — open a page inside this group to inspect it.' : '.'}
            </p>
          )}

          {status === 'loading' && <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>Loading SEO/traffic data…</p>}

          {status === 'error' && (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>
              Couldn't load data for this page. <button type="button" className="inspector__refresh" onClick={() => refresh(false)}>Try again</button>
            </p>
          )}

          {status === 'ready' && !row && (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>
              No SEO/traffic data for this node{node.kind === 'cluster' ? ' — open a page inside this group to inspect it.' : '.'}
            </p>
          )}

          {status === 'ready' && row && (
            <>
              <div className="stat-tiles">
                {seRankingLive ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <PendingTile label="Potential search volume" />
                    <PendingTile label="Potential traffic" />
                  </>
                )}
                <div className="stat-tile">
                  <span className="stat-tile__label">Actual traffic</span>
                  <span className="stat-tile__value">{ga4Live && row.actualTraffic != null ? formatNumber(row.actualTraffic) : '—'}</span>
                  <span className="stat-tile__sub">{ga4Live ? 'sessions, trailing 28d (GA4)' : 'GA4 not connected yet'}</span>
                </div>
                {seRankingLive ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <PendingTile label="Keywords tracked" />
                    <PendingTile label="Opportunity" />
                  </>
                )}
              </div>

              {seRankingLive ? (
                <div className="score-row">
                  <div>
                    <h3
                      className="section-title"
                      title="Composite: 60% average rank strength across this page's tracked keywords, 40% content/audit score — not a single SE Ranking field."
                    >
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
              ) : (
                <div className="pending-note">Local SEO score &amp; content score — SE Ranking integration coming soon.</div>
              )}

              {seRankingLive ? (
                row.topQueries.length > 0 && (
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
                )
              ) : (
                <div className="pending-note">Tracked keywords &amp; current rank — SE Ranking integration coming soon.</div>
              )}

              {seRankingLive && row.recommendations.length > 0 && (
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
