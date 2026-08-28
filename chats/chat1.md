# Nublue Website Sitemap Tool

_Started 2026-08-28 10:48 UTC_

---

## User

I need to create a visual sitemap of the current nublue website showing all of the pages and heirarchy. it should be zoomable and with two views. One view is a node based sitemap view and one is a list view. I will have two versions of the sitemap. One will be the current sitemap of the site showing the page structure, page name and a link icon that can link out to that page on the site. It should have a green dot if it is active and live. For resources we can collapse all of those into one single node to represent those pages or have the ability to click the node and show all the pages since there are a lot of them. For the second sitemap it will be a future state or new organization of the sitemap. Any new pages will be represented by a yellow dot. I will prompt updates to the new sitemap once it is built. It can mirror the current one for now. If you could just add one or two pages for small cities around lake norman and charlotte to start that will be a good start.

## Assistant

_[tool: list_files]_

_[tool: web_fetch]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: web_search]_

_[tool: web_fetch]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Built from the live callnublue.com sitemap (~200 mapped pages).

- **Two versions** — Current Site / Future State toggle. Future mirrors current plus three new pages (Huntersville, Mooresville, Matthews) with yellow dots; green = live.
- **Two views** — Node Map (zoom −/+/Fit, ctrl+scroll, drag to pan) and List View with a filter field.
- **Collapsed groups** (dashed blue): the 170 blog posts, the repeated 4-city service variants, and Utility & Legal — click `+` to expand any node.
- Link icon on every page node opens the live URL in a new tab.

Two notes: city-page URLs are generated on the `/service/city/` pattern — a few legacy exceptions on the real site will redirect. The blog cluster lists 20 real posts plus a "…150 more" link rather than all 170. Tell me what to change on the future state and I'll restructure it.

## User

i want to add an seo ranking tool that shows potential traffic to these pages based on search queries as well as current content score and recommendations for each page. We have access to seranking api. What would be a good way to integrate that?

## Assistant



## Assistant

Short answer: don't call SE Ranking from the sitemap at runtime — a browser artifact would leak the API key, and their endpoints are paged/rate-limited per project. The clean pattern:

**1. Batch pull → snapshot file.** A small nightly job (or one-off script) hits SE Ranking server-side and writes one `seo-data.json` keyed by URL path — the same keys the sitemap tree already uses. Useful endpoints: *Keyword Positions* + *Search Volume* for traffic potential, *Website Audit / Page Audit* for the content score and issue list, *Competitor/Keyword Research* for query opportunity.

```
"/electrical/panels/": { traffic: 1240, keywords: 38, top3: 4,
  score: 72, issues: ["thin H2 coverage", "no FAQ schema"], queries: [...] }
```

**2. Sitemap reads the snapshot, not the API.** Node click opens a right-hand inspector: traffic potential, keyword count, score gauge, top queries table, ranked recommendations. Plus a "color nodes by" mode (traffic / score / opportunity) so the whole map becomes a heat map, and sortable score/traffic columns in list view. Future-state nodes have no data by definition — those get a *projected* number from the parent's query cluster, clearly labelled as an estimate.

**3. Freshness is visible.** A "data as of <date>" stamp in the toolbar so nobody mistakes a stale snapshot for live.

Before I build it, a few calls:

_[tool: ask_user]_

Waiting on those six answers — then I'll build the SEO layer onto the existing sitemap.

