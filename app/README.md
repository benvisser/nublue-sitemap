# NuBlue Website Sitemap

Interactive sitemap for callnublue.com — implements `project/NuBlue Sitemap.dc.html`
from the Claude Design handoff bundle (see `../README.md` and `../chats/chat1.md`
for the original design brief), plus the SEO/traffic layer discussed in that chat.

- **Current Site / Future State** toggle — future mirrors current plus three
  proposed city pages (Huntersville, Mooresville, Matthews), shown with a
  yellow dot.
- **Node Map** (pan/zoom, collapsible clusters for the blog + city-page
  variants) and **List View** (filterable, sortable by traffic/score).
- **SEO layer** — click any page node to open an inspector: potential
  search volume and estimated traffic (SE Ranking), actual traffic (GA4),
  every tracked keyword's current rank position, a content score + audit
  issues, a computed "local SEO score", and ranked recommendations. A
  "color nodes by" mode turns the map into a traffic/score/local-SEO/
  opportunity heat map; List View has the same metrics as sortable columns.

## Project layout

```
src/                    React app (Vite)
  data/sitemapTree.ts    the page tree — current + future versions
  data/seoTypes.ts        shape of a page's SEO data
  hooks/usePageSeo.ts     fetches one page's data on demand (inspector)
  hooks/useSeoSnapshot.ts aggregate view for heat map / list view / toolbar
netlify/
  functions/
    get-page-seo.mts       fetches/caches ONE page's data — called when its inspector opens
    get-seo-snapshot.mts   assembles the aggregate view from whatever's been cached so far
  lib/
    seRankingClient.ts       SE Ranking API calls (server-only)
    seRankingProjectPull.ts  shared, TTL-cached whole-project SE Ranking pull
    ga4Client.ts             GA4 Data API calls (server-only) — includes a
                             single-page-filtered query
    ga4Status.ts             tiny "did the last GA4 call succeed" record
    buildSnapshot.ts         the math for turning raw pulls into one page's row
    pageSeoCache.ts          write-through per-page cache backing get-seo-snapshot
    seoConfig.ts             path list / future-page-to-parent mapping, from sitemapTree.ts
```

**Why per-page, on demand, instead of one nightly batch pull for all ~300
pages?** The original design chat's concern (a browser call would leak
the SE Ranking API key and hit both APIs' rate limits) still applies —
neither API is ever called from the browser. But a full nightly pull of
every page burns API quota on pages nobody's looking at that day. Instead:

- **GA4** is queried fresh, filtered to exactly one page, every time that
  page's inspector opens (`ga4Client.ts`'s `getSessionsForPath`) — cheap
  enough that there's no need to cache it.
- **SE Ranking** has no equivalent cheap single-page lookup (their API is
  bulk-only), so `seRankingProjectPull.ts` pulls the whole project once
  and reuses it (12h TTL) across however many pages get opened in that
  window, instead of hitting SE Ranking on every click.
- Each computed page gets written to `pageSeoCache.ts`, which is what
  `get-seo-snapshot.mts` reads to assemble the heat map / List View
  columns / toolbar freshness stamp. **This means those views only ever
  reflect pages that have actually been opened at least once** — they
  start empty on a fresh deploy and fill in as the sitemap gets used,
  rather than requiring a full batch pull to complete first. The
  inspector's "↻ Refresh this page" link bypasses the SE Ranking TTL for
  just that one page if you want the freshest possible pull.

**There is no fabricated fallback data.** GA4 and SE Ranking are tracked
independently — `sources.{seRanking,ga4}` on each response records which
actually succeeded on that request. The frontend never invents a number:
a field only ever shows real data from a source that's live; otherwise
it's grayed out with a small "integration coming soon" / "not connected
yet" note (`Inspector.tsx`), and a page that's never been opened reads
"no data yet". This was a deliberate change after early testing — a
fabricated demo snapshot made it hard to tell what was actually wired up
versus placeholder.

## Local development

`npm run dev` gives you the whole stack locally, not just the frontend —
`vite.config.ts` loads `@netlify/vite-plugin`, which emulates Functions and
Blobs directly inside Vite's dev server (see the `netlify()` plugin call).
First time only, link this checkout to the Netlify site so the plugin can
pull its real environment variables:

```
npm install
npx netlify login          # opens a browser once
npx netlify link --id e093103e-0d47-4bd3-9199-97def45ce86b
npm run dev                 # now http://localhost:5173 has real functions + your site's env vars
```

Skip `netlify link` if you just want to work on the UI — the functions
still run locally, they'll just have nothing to fetch without
credentials, so every node reads "no data yet" (same as production for a
page that's never been opened — see the note above on why there's no fake
fallback data). Either way, don't run a separate `netlify dev` process
alongside this — the Vite plugin already covers what that would do.

## Environment variables (set in Netlify site settings, not in code)

| Variable | Used by | Notes |
|---|---|---|
| `SERANKING_API_KEY` | seRankingClient.ts | Account → API in SE Ranking |
| `SERANKING_PROJECT_ID` | seRankingClient.ts | the tracked project ID for callnublue.com |
| `SERANKING_API_BASE_URL` | seRankingClient.ts | optional override, see note below |
| `GA4_PROPERTY_ID` | ga4Client.ts | numeric GA4 property ID |
| `GA4_SERVICE_ACCOUNT_JSON` | ga4Client.ts | full service-account key JSON, as one string; grant it Viewer on the GA4 property (Admin → Property Access Management) and enable the Analytics Data API on its GCP project |

**⚠️ SE Ranking endpoint verification needed.** This sandbox couldn't reach
seranking.com to confirm current endpoint paths/response fields against
live docs (egress to that domain is blocked here). `seRankingClient.ts`
is written from general knowledge of their REST API and isolates every
wire call to that one file — before the first real nightly run, compare
it against your account's API docs (SE Ranking → Account → API) and
adjust paths/field names there if anything's changed. The GA4 client uses
the stable, well-documented Data API v1beta `runReport` endpoint and
shouldn't need the same check.

## First run after adding credentials

Nothing to trigger — just open a page's inspector in the app. That calls
`get-page-seo.mts`, which pulls SE Ranking + GA4 for that one page right
then. If something's misconfigured you'll see it immediately: the
relevant fields gray out with a "coming soon" / "not connected" note
instead of a number. Check **Netlify → Logs → Functions →
get-page-seo** for the actual error if that happens.

## Keeping the sitemap in sync with the live site

`src/data/sitemapTree.ts` is hand-authored (ported from the original
Claude Design prototype) rather than crawled — if pages are added, renamed,
or removed on callnublue.com, update the tree there. `netlify/lib/seoConfig.ts`
derives its path list from the same tree, so no second place needs updating.
