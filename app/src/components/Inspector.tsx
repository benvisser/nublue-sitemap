import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import { opportunityScore } from '../data/seoTypes';
import { usePageSeo } from '../hooks/usePageSeo';
import { formatDelta, formatNumber, formatPercent, formatSeconds } from '../lib/format';
import { LinkIcon } from './LinkIcon';
import { ScoreGauge } from './ScoreGauge';
import { Ga4Icon, SearchConsoleIcon, SeRankingIcon } from './SourceIcons';

interface InspectorProps {
  node: PageNode;
  onClose: () => void;
  onLoaded?: () => void;
}

/** Groups a chunk of the panel under a small source icon + label, so it's
 * clear at a glance which API a section's numbers came from. Only ever
 * rendered for a source that's actually live — see the `*Live` checks
 * below, which gate whether a group appears at all rather than showing
 * a grayed-out placeholder for a source that isn't connected. */
function SourceGroup({
  icon,
  label,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone: 'ga4' | 'gsc' | 'seranking';
  children: React.ReactNode;
}) {
  return (
    <div className="source-group">
      <div className="source-group__header">
        <span className={`source-group__icon source-group__icon--${tone}`}>{icon}</span>
        <span className="source-group__label">{label}</span>
      </div>
      <div className="source-group__body">{children}</div>
    </div>
  );
}

function DeltaTag({ current, previous }: { current: number | null; previous: number | null }) {
  const delta = formatDelta(current, previous);
  if (!delta) return null;
  const isUp = delta.startsWith('+');
  return <span className={`delta-tag ${isUp ? 'delta-tag--up' : 'delta-tag--down'}`}>{delta} vs prior 28d</span>;
}

export function Inspector({ node, onClose, onLoaded }: InspectorProps) {
  const { status, result, refresh } = usePageSeo(node.url, onLoaded);
  const row = result?.page;
  const seRankingLive = Boolean(result?.sources.seRanking);
  const ga4Live = Boolean(result?.sources.ga4);
  const gscLive = Boolean(result?.sources.gsc);
  const anyLive = seRankingLive || ga4Live || gscLive;

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
              {!gscLive && <span className="badge badge--pending">Search Console not connected yet</span>}
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
              Couldn't load data for this page.{' '}
              <button type="button" className="inspector__refresh" onClick={() => refresh(false)}>
                Try again
              </button>
            </p>
          )}

          {status === 'ready' && !row && (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>
              No SEO/traffic data for this node{node.kind === 'cluster' ? ' — open a page inside this group to inspect it.' : '.'}
            </p>
          )}

          {status === 'ready' && row && !anyLive && (
            <p style={{ fontSize: 13.5, color: 'var(--text-body)' }}>No connected data sources have returned data for this page yet.</p>
          )}

          {status === 'ready' && row && ga4Live && (
            <SourceGroup icon={<Ga4Icon />} label="Google Analytics" tone="ga4">
              <div className="stat-tiles">
                <div className="stat-tile">
                  <span className="stat-tile__label">Actual traffic</span>
                  <span className="stat-tile__value">{formatNumber(row.actualTraffic)}</span>
                  <span className="stat-tile__sub">
                    sessions, trailing 28d <DeltaTag current={row.actualTraffic} previous={row.previousTraffic} />
                  </span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Organic traffic</span>
                  <span className="stat-tile__value">{formatNumber(row.organicTraffic)}</span>
                  <span className="stat-tile__sub">
                    from search <DeltaTag current={row.organicTraffic} previous={row.previousOrganicTraffic} />
                  </span>
                </div>
              </div>

              {(row.avgEngagementSeconds != null || row.topReferrers.length > 0) && (
                <div className="score-row">
                  <div>
                    <h3 className="section-title">Engagement</h3>
                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', margin: '4px 0' }}>{formatSeconds(row.avgEngagementSeconds)}</p>
                    <span className="gauge-row__label">avg. engaged time per session</span>
                  </div>
                  <div>
                    <h3 className="section-title">Top referrers</h3>
                    {row.topReferrers.length === 0 ? (
                      <span className="gauge-row__label">No referral traffic, trailing 28d</span>
                    ) : (
                      <ul className="issue-list">
                        {row.topReferrers.map((r) => (
                          <li key={r.source}>
                            {r.source} — {formatNumber(r.sessions)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </SourceGroup>
          )}

          {status === 'ready' && row && gscLive && (
            <SourceGroup icon={<SearchConsoleIcon />} label="Search Console" tone="gsc">
              <div className="stat-tiles">
                <div className="stat-tile">
                  <span className="stat-tile__label">Clicks</span>
                  <span className="stat-tile__value">{formatNumber(row.searchClicks)}</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Impressions</span>
                  <span className="stat-tile__value">{formatNumber(row.searchImpressions)}</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">CTR</span>
                  <span className="stat-tile__value">{formatPercent(row.searchCtr)}</span>
                </div>
                <div className="stat-tile">
                  <span className="stat-tile__label">Avg. position</span>
                  <span className="stat-tile__value">{row.avgSearchPosition ?? '—'}</span>
                </div>
              </div>
              {row.topSearchQueries.length > 0 && (
                <div className="query-table-scroll">
                  <table className="query-table">
                    <thead>
                      <tr>
                        <th>Query</th>
                        <th className="num">Clicks</th>
                        <th className="num">Impr.</th>
                        <th className="num">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.topSearchQueries.map((q) => (
                        <tr key={q.query}>
                          <td>{q.query}</td>
                          <td className="num">{formatNumber(q.clicks)}</td>
                          <td className="num">{formatNumber(q.impressions)}</td>
                          <td className="num">{q.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SourceGroup>
          )}

          {status === 'ready' && row && seRankingLive && (
            <SourceGroup icon={<SeRankingIcon />} label="SE Ranking" tone="seranking">
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

              {row.auditDetail ? (
                <div>
                  <h3
                    className="section-title"
                    title="Real per-page facts from SE Ranking's Website Audit crawl (the 'Crawled pages' section) — not derived, this is what their crawler found on this exact URL."
                  >
                    Website Audit — crawled page details ⓘ
                  </h3>
                  <div className="stat-tiles" style={{ marginBottom: 10 }}>
                    <div className="stat-tile">
                      <span className="stat-tile__label">HTTP status</span>
                      <span className="stat-tile__value">{row.auditDetail.status ?? '—'}</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Indexability</span>
                      <span className="stat-tile__value" style={{ fontSize: 20 }}>
                        {row.auditDetail.indexableStatus ?? '—'}
                      </span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Word count</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.wordsCount)}</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Inlinks</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.inlinks)}</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Outlinks (internal)</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.outlinksInternal)}</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Outlinks (external)</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.outlinksExternal)}</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Traffic forecast</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.trafficForecast)}</span>
                      <span className="stat-tile__sub">SE Ranking's own estimate</span>
                    </div>
                    <div className="stat-tile">
                      <span className="stat-tile__label">Keywords (audit)</span>
                      <span className="stat-tile__value">{formatNumber(row.auditDetail.numKeywords)}</span>
                    </div>
                  </div>
                  <ul className="issue-list" style={{ marginBottom: 0 }}>
                    <li>
                      <strong>Title:</strong> {row.auditDetail.title || <em>missing</em>}
                    </li>
                    <li>
                      <strong>Meta description:</strong> {row.auditDetail.description || <em>missing</em>}
                    </li>
                    <li>
                      <strong>H1:</strong> {row.auditDetail.h1 || <em>missing</em>}
                    </li>
                    {row.auditDetail.canonicalUrl && (
                      <li>
                        <strong>Canonical:</strong> {row.auditDetail.canonicalUrl}
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="pending-note">
                  This page wasn't found in the most recent SE Ranking Website Audit crawl — it may not have been recrawled since being
                  added, or it 404'd/redirected during the crawl.
                </div>
              )}

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
            </SourceGroup>
          )}
        </div>
      </aside>
    </>
  );
}
