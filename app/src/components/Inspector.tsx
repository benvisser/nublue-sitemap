import type { PageNode } from '../data/sitemapTree';
import { BASE_URL } from '../data/sitemapTree';
import { usePageSeo } from '../hooks/usePageSeo';
import { formatDelta, formatNumber, formatPercent, formatSeconds } from '../lib/format';
import { LinkIcon, RefreshIcon } from './LinkIcon';
import { Ga4Icon, SearchConsoleIcon } from './SourceIcons';

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
  // SE Ranking is temporarily hidden from the panel — see the comment
  // above the removed SourceGroup below. `sources.seRanking` is still
  // returned by the API and still drives the heat map / list view, this
  // just stops the inspector from showing its all-zero cards.
  const ga4Live = Boolean(result?.sources.ga4);
  const gscLive = Boolean(result?.sources.gsc);
  const anyLive = ga4Live || gscLive;

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
            <div className="inspector__title-actions">
              {node.url && (
                <a
                  href={`${BASE_URL}${node.url}`}
                  target="_blank"
                  rel="noopener"
                  className="inspector__icon-btn"
                  title="Open live page"
                  aria-label="Open live page"
                >
                  <LinkIcon size={13} />
                </a>
              )}
              {status === 'ready' && row && !row.projected && (
                <button
                  type="button"
                  className="inspector__icon-btn"
                  onClick={() => refresh()}
                  title="Refresh this page, bypassing the cache"
                  aria-label="Refresh this page"
                >
                  <RefreshIcon size={13} />
                </button>
              )}
            </div>
          </div>
          <span className="inspector__path">{node.url || '—'}</span>
          {row && (row.projected || !ga4Live || !gscLive) && (
            <div className="inspector__badges">
              {row.projected && <span className="badge badge--projected">Projected estimate</span>}
              {!ga4Live && <span className="badge badge--pending">GA4 not connected yet</span>}
              {!gscLive && <span className="badge badge--pending">Search Console not connected yet</span>}
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
                <div className="stat-tile">
                  <span className="stat-tile__label">Avg. engaged time</span>
                  <span className="stat-tile__value">{formatSeconds(row.avgEngagementSeconds)}</span>
                  <span className="stat-tile__sub">per session, trailing 28d</span>
                </div>
                <div className="stat-tile">
                  <span
                    className="stat-tile__label"
                    title="Share of sessions GA4 counted as 'engaged' (10s+, 2+ pageviews, or a conversion event). Organic traffic with a low engagement rate usually means the page isn't matching what people searched for, even if it ranks fine."
                  >
                    Engagement rate ⓘ
                  </span>
                  <span className="stat-tile__value">{formatPercent(row.engagementRate, 0)}</span>
                  <span className="stat-tile__sub">
                    of sessions <DeltaTag current={row.engagementRate} previous={row.previousEngagementRate} />
                  </span>
                </div>
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

          {/* SE Ranking (keyword volume/opportunity/content score/Website
              Audit) is temporarily removed from the panel — the account's
              data was coming back all zero/empty for every field, so a
              section full of "0"s and em-dashes was worse than not
              showing it. GA4 and Search Console are unaffected. To bring
              it back once SE Ranking's own account/API access is sorted
              out: restore the SourceGroup that used to sit here (see git
              history — "none of this is working, remove for now"), and
              re-add `seRankingLive`/`anyLive` and the badge above. */}
        </div>
      </aside>
    </>
  );
}
