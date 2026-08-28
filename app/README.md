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
  data/seoTypes.ts        shape of the SEO snapshot
  data/sampleSeoData.ts   deterministic sample data (dev fallback)
netlify/
  functions/
    get-seo-snapshot.mts      serves the last snapshot to the frontend
    refresh-seo-data-background.mts      nightly scheduled pull (SE Ranking + GA4 → snapshot)
    refresh-seo-data-now-background.mts  same pull, callable on demand for first setup
  lib/
    seRankingClient.ts   SE Ranking API calls (server-only)
    ga4Client.ts         GA4 Data API calls (server-only)
    buildSnapshot.ts     combines both into one SeoSnapshot
    seoConfig.ts         the path list the nightly job pulls data for
```

**Why a nightly snapshot instead of calling SE Ranking/GA4 live from the
browser?** Covered in the original design chat: a browser call would leak
the SE Ranking API key and hit both APIs' rate limits on every page load.
Instead `refresh-seo-data-background.mts` runs server-side on a schedule, writes one
JSON snapshot to Netlify Blobs, and the app only ever reads that snapshot
via `get-seo-snapshot.mts`. If no snapshot exists yet (fresh deploy, or
credentials not configured), the app falls back to deterministic sample
data and shows a "Sample SEO data" badge so nobody mistakes it for real
numbers.

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
still run locally, they'll just fail on missing SE Ranking/GA4 credentials
and the app falls back to sample data, same as production does before the
first snapshot exists. Either way, don't run a separate `netlify dev`
process alongside this — the Vite plugin already covers what that would
do.

## Environment variables (set in Netlify site settings, not in code)

| Variable | Used by | Notes |
|---|---|---|
| `SERANKING_API_KEY` | seRankingClient.ts | Account → API in SE Ranking |
| `SERANKING_PROJECT_ID` | seRankingClient.ts | the tracked project ID for callnublue.com |
| `SERANKING_API_BASE_URL` | seRankingClient.ts | optional override, see note below |
| `GA4_PROPERTY_ID` | ga4Client.ts | numeric GA4 property ID |
| `GA4_SERVICE_ACCOUNT_JSON` | ga4Client.ts | full service-account key JSON, as one string; grant it Viewer on the GA4 property (Admin → Property Access Management) and enable the Analytics Data API on its GCP project |
| `REFRESH_TRIGGER_SECRET` | refresh-seo-data-now-background.mts | optional — required as an `x-refresh-secret` header on the manual-trigger endpoint once set |

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

The nightly schedule (06:00 UTC) will populate the snapshot on its own, but
to see real data immediately after setting the env vars above:

```
curl -X POST https://<your-site>.netlify.app/.netlify/functions/refresh-seo-data-now-background \
  -H "x-refresh-secret: $REFRESH_TRIGGER_SECRET"
```

This is a background function, so the request returns immediately (202) —
check its logs in the Netlify UI, or poll `get-seo-snapshot` until
`generatedAt` changes, to see when it's actually finished.

## Keeping the sitemap in sync with the live site

`src/data/sitemapTree.ts` is hand-authored (ported from the original
Claude Design prototype) rather than crawled — if pages are added, renamed,
or removed on callnublue.com, update the tree there. `netlify/lib/seoConfig.ts`
derives its path list from the same tree, so no second place needs updating.
