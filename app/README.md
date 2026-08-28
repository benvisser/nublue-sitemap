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
  search volume and estimated traffic (SE Ranking), actual + organic
  traffic with period-over-period deltas, avg. engagement time, and top
  referrers (GA4), real clicks/impressions/CTR/position and top search
  queries (Google Search Console), every tracked keyword's current rank
  position, a content score + real crawled-page audit issues (SE
  Ranking Website Audit), a computed "local SEO score", and ranked
  recommendations. A "color nodes by" mode turns the map into a
  traffic/score/local-SEO/opportunity heat map; List View has the same
  metrics as sortable columns.

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
    seRankingClient.ts       SE Ranking API calls (server-only) — keyword
                             positions (Data API) + crawled-page audit
                             (Website Audit API); different auth per call
    seRankingProjectPull.ts  shared, TTL-cached whole-project SE Ranking pull
    ga4Client.ts             GA4 Data API calls (server-only) — per-page
                             traffic with period-over-period comparison,
                             engagement time, top referrers
    ga4Status.ts             tiny "did the last GA4 call succeed" record
    gscClient.ts             Search Console Search Analytics calls (server-only)
                             — per-page clicks/impressions/CTR/position + top queries
    gscStatus.ts             tiny "did the last GSC call succeed" record
    buildSnapshot.ts         the math for turning raw pulls into one page's row
    pageSeoCache.ts          write-through per-page cache backing get-seo-snapshot
    seoConfig.ts             path list / future-page-to-parent mapping, from sitemapTree.ts
```

**Why per-page, on demand, instead of one nightly batch pull for all ~300
pages?** The original design chat's concern (a browser call would leak
the SE Ranking API key and hit both APIs' rate limits) still applies —
neither API is ever called from the browser. But a full nightly pull of
every page burns API quota on pages nobody's looking at that day. Instead:

- **GA4** and **Search Console** are both queried fresh, filtered to
  exactly one page, every time that page's inspector opens
  (`ga4Client.ts`'s `getPageTraffic`, `gscClient.ts`'s
  `getPageSearchPerformance`) — cheap enough that there's no need to
  cache either.
- **SE Ranking** has no equivalent cheap single-page lookup (both its
  Data API and Website Audit API are bulk-only), so
  `seRankingProjectPull.ts` pulls the whole project once (keyword
  positions + the full crawled-page audit) and reuses it (12h TTL) across
  however many pages get opened in that window, instead of hitting SE
  Ranking on every click.
- Each computed page gets written to `pageSeoCache.ts`, which is what
  `get-seo-snapshot.mts` reads to assemble the heat map / List View
  columns / toolbar freshness stamp. **This means those views only ever
  reflect pages that have actually been opened at least once** — they
  start empty on a fresh deploy and fill in as the sitemap gets used,
  rather than requiring a full batch pull to complete first. The
  inspector's "↻ Refresh this page" link bypasses the SE Ranking TTL for
  just that one page if you want the freshest possible pull.

**There is no fabricated fallback data.** GA4, SE Ranking, and Search
Console are tracked independently — `sources.{seRanking,ga4,gsc}` on each
response records which actually succeeded on that request. The frontend
never invents a number:
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
| `SERANKING_API_KEY` | seRankingClient.ts | Account → API in SE Ranking. Reused for both SE Ranking API surfaces below (transport differs, key doesn't) |
| `SERANKING_API_BASE_URL` | seRankingClient.ts | optional override for the Data API (keyword positions); defaults to `https://api.seranking.com/v1` |
| `SERANKING_AUDIT_API_BASE_URL` | seRankingClient.ts | optional override for the Website Audit API; defaults to `https://api.seranking.com/v1/project-management/audits` |
| `GA4_PROPERTY_ID` | ga4Client.ts | numeric GA4 property ID |
| `GA4_SERVICE_ACCOUNT_JSON` | ga4Client.ts, gscClient.ts | full service-account key JSON, as one string; shared by both GA4 and Search Console. Grant it Viewer on the GA4 property (Admin → Property Access Management), add it as a Search Console user (see below), and enable both the Analytics Data API and the Search Console API on its GCP project. **Set this in the Netlify dashboard, not via `netlify env:set`/the API** — a multi-line secret like this needs the dashboard's own multi-line field; other paths have corrupted it in practice. |
| `GSC_SITE_URL` | gscClient.ts | the exact Search Console property string, e.g. `sc-domain:callnublue.com` for a Domain property, or `https://callnublue.com/` for a URL-prefix property — must match how the property is registered in Search Console |

There's no `SERANKING_PROJECT_ID` — neither SE Ranking API surface used
here has a "project" concept. `getKeywordPositions` (Data API, confirmed
against `github.com/seranking/openapi`) calls
`GET /domain/keywords?domain=callnublue.com` directly, auth via an
`apikey` query param. `getPageAudit` (Website Audit API, confirmed
against SE Ranking's own published Website Audit docs — not covered by
the OpenAPI spec above) calls `GET /project-management/audits?search=callnublue.com`
to find the account's existing Website Audit for this domain (auth via an
`Authorization: Token API_KEY` header — a different transport from the
Data API), then pages through that audit's `/project-management/audits/pages`
for the full crawled-page list (title/description/H1 duplicates, word
count, indexability, HTTP status, etc.). A per-page content score and
issue list are derived from those real fields in `seRankingClient.ts`
(`scoreFor`/`issuesFor`) since the API doesn't return a single 0-100
score directly.

**⚠️ Data API response field names aren't fully confirmed.** Its auth
(`apikey` as a query param, not a header — the original guess had this
wrong too, which is why early requests 400'd) is confirmed against the
real spec above, but that spec doesn't document `/domain/keywords`'
response body field names. `getKeywordPositions`'s mapping is a
best-effort guess (`keyword`/`position`/`volume`/`url`) with a
console.log if it returns zero rows — check Netlify's function logs
against a real response if numbers still look off. The Website Audit
endpoints and response shape are confirmed against real documentation, so
`getPageAudit` shouldn't need this kind of correction. The GA4 and GSC
clients use their stable, well-documented Google APIs and didn't need
this kind of correction either.

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
