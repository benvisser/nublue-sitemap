// Site structure for callnublue.com, ported from the Claude Design prototype
// (project/NuBlue Sitemap.dc.html). This is the same content the prototype
// hardcoded — a real implementation would eventually want this sourced from
// the CMS/sitemap.xml, but the page list itself was authored by hand in the
// design tool and is reproduced as-is here.

export type SiteVersion = 'current' | 'future';

export interface PageNode {
  /** Stable id assigned during normalization, e.g. "r.2.0" */
  id: string;
  name: string;
  /** URL path relative to BASE, or null for a page with no live URL yet */
  url: string | null;
  kind: 'page' | 'cluster';
  /** Cluster-only: a note shown instead of "N pages", e.g. "170 pages" */
  note?: string | null;
  /** True for future-state pages that don't exist on the live site yet */
  isNew?: boolean;
  depth: number;
  children: PageNode[];
}

export const BASE_URL = 'https://callnublue.com';

const CITY = [
  ['Charlotte', 'charlotte'],
  ['Fayetteville', 'fayetteville'],
  ['Greenville', 'greenville'],
  ['Lake Norman', 'lake-norman'],
] as const;

let uid = 0;
function page(name: string, url?: string | null, children?: PageNode[], isNew = false): PageNode {
  uid += 1;
  return {
    id: `tmp-${uid}`,
    name,
    url: url || null,
    kind: 'page',
    isNew,
    depth: 0,
    children: children || [],
  };
}

function cluster(name: string, children?: PageNode[], note?: string | null): PageNode {
  uid += 1;
  return {
    id: `tmp-${uid}`,
    name,
    url: null,
    kind: 'cluster',
    note: note || null,
    depth: 0,
    children: children || [],
  };
}

function cities(basePath: string): PageNode {
  return cluster(
    'City pages',
    CITY.map(([label, slug]) => page(`${label}, NC`, `${basePath}${slug}/`)),
  );
}

// A representative sample of the ~170 blog posts on the live site (the full
// list is out of scope for hand-authored mock content — see BLOG_TOTAL_COUNT).
export const BLOG_TOTAL_COUNT = 170;
const BLOG_SAMPLE: Array<[string, string]> = [
  ['Surge Protection Explained: What Actually Protects Your Home', '/blog/surge-protection-explained-what-actually-protects-your-home-and-what-doesnt/'],
  ['Indoor Air Quality in Winter', '/blog/indoor-air-quality-in-winter-how-dirty-filters-and-poor-airflow-affect-your-health/'],
  ['Old Electrical Panels and Overloaded Circuits', '/blog/old-electrical-panels-and-overloaded-circuits-why-january-is-the-smart-time-to-inspect/'],
  ['Tree Roots, Old Pipes, and Spring Rain', '/blog/tree-roots-old-pipes-and-spring-rain-why-sewer-problems-spike-this-time-of-year/'],
  ['Low Water Pressure in Winter', '/blog/low-water-pressure-in-winter-what-it-means-for-your-plumbing-system/'],
  ['What to Look for in a Home Service Company', '/blog/what-to-look-for-in-a-home-service-company-trust-transparency-and-preventative-care/'],
  ['Outdoor Electrical Upgrades for Spring', '/blog/outdoor-electrical-upgrades-for-spring-lighting-fans-and-safety-checks/'],
  ['Why Does My Breaker Keep Tripping?', '/blog/why-does-my-breaker-keep-tripping-and-why-its-common-in-january/'],
  ['Why Every Homeowner Should Test Their Water', '/blog/what-your-water-says-about-your-home-why-every-homeowner-should-test-their-water/'],
  ['Reactive vs. Proactive Home Maintenance', '/blog/reactive-vs-proactive-home-maintenance/'],
  ['Gas Lines for Generators in North Carolina', '/blog/what-north-carolina-homeowners-should-know-about-gas-lines-for-generators/'],
  ['NuBlue Brings HVAC and Air Services to Fayetteville', '/blog/nublue-brings-hvac-and-air-services-to-fayetteville/'],
  ['The Market Leader Journey: Aaron Williams', '/blog/the-market-leader-journey-case-study-aaron-williams/'],
  ['Four Warning Signs That Your Furnace Needs Repairs', '/blog/four-warning-signs-your-furnace-needs-repairs/'],
  ['5 Plumbing Tips to Get You Through The Holiday Season', '/blog/5-plumbing-tips-to-get-you-through-holiday-season/'],
  ['Everything You Should Know About EV Charger Installation', '/blog/everything-you-should-know-about-ev-charger-installation/'],
  ['How to Fix Low Water Pressure in Your Home', '/blog/tips-to-fix-low-water-pressure-in-your-home/'],
  ['Signs You Might Need a New HVAC System', '/blog/signs-you-might-need-a-new-hvac-system/'],
  ['10 Reasons For A Whole Home Generator', '/blog/reasons-charlotte-homeowners-need-whole-home-generator/'],
  ['When to Call an Emergency Plumber', '/blog/when-to-call-an-emergency-plumber/'],
];

function buildTree(version: SiteVersion): PageNode {
  const future = version === 'future';

  const blog = page('Blog', '/blog/', [
    cluster(
      'Blog posts',
      [...BLOG_SAMPLE.map(([n, u]) => page(n, u)), page(`… ${BLOG_TOTAL_COUNT - BLOG_SAMPLE.length} more posts`, '/blog/')],
      `${BLOG_TOTAL_COUNT} pages`,
    ),
  ]);

  const about = page('About Us', '/about/', [
    page('Our Team', '/about/meet-the-team/'),
    page('Careers', '/careers/'),
    page('Why We Love Working at NuBlue', '/why-we-love-working-at-nublue-team-culture-values/'),
    page('NuBlue Gives Back', '/nublue-gives-back'),
    page('Reviews', '/reviews/'),
    page('Coupons', '/coupons/'),
    page('Financing', '/financing/'),
    blog,
  ]);

  const plumbing = page('Plumbing', '/plumbing/', [
    page('Drain & Sewer', '/drain-sewer/', [
      page('Drain Cleaning', '/drain-sewer/cleaning/', [
        page('Hydro Jetting', '/drain-sewer/cleaning/hydro-jetting/', [cities('/drain-sewer/cleaning/hydro-jetting/')]),
        cities('/drain-sewer/cleaning/'),
      ]),
      page('Sewer Line Repair', '/drain-sewer/repair/', [cities('/drain-sewer/repair/')]),
      page('Trenchless Pipe Lining', '/drain-sewer/trenchless-pipe-lining/'),
      page('Sump Pumps', '/drain-sewer/sump-pumps/', [cities('/drain-sewer/sump-pumps/')]),
      page('Septic', '/drain-sewer/septic/', [cities('/drain-sewer/septic/')]),
      cities('/drain-sewer/'),
    ]),
    page('Water Heaters', '/water-heaters/', [
      page('Water Heater Installation', '/water-heaters/installation/', [cities('/water-heaters/installation/')]),
      page('Water Heater Repair', '/water-heaters/repair/', [cities('/water-heaters/repair/')]),
      page('Tankless Water Heaters', '/water-heaters/tankless/', [cities('/water-heaters/tankless/')]),
      cities('/water-heaters/'),
    ]),
    page('Repiping', '/plumbing/repiping/', [cities('/plumbing/repiping/')]),
    page('Backflow Testing & Installation', '/plumbing/backflow/'),
    page('Garbage Disposals', '/plumbing/garbage-disposals/', [cities('/plumbing/garbage-disposals/')]),
    page('Well Pumps', '/plumbing/well-pumps/', [cities('/plumbing/well-pumps/')]),
    page('Whole-House Water Filtration', '/plumbing/whole-house-water-filtration-systems/', [cities('/plumbing/whole-house-water-filtration-systems/')]),
    page('Gas Lines', '/plumbing/gas-lines/', [cities('/plumbing/gas-lines/')]),
    page('Poly B Pipe Replacement', '/plumbing/poly-b-pipe-replacement-charlotte'),
    page('Faucet Repair', '/plumbing/faucet-repair/charlotte'),
    page('Residential Plumbing', '/plumbing/plumbing-residential/'),
    page('Commercial Plumbing', '/plumbing/commercial/', [cities('/plumbing/commercial/')]),
    page('Emergency Plumbing', '/plumbing/plumbing-emergency/', [cities('/plumbing/plumbing-emergency/')]),
    cities('/plumbing/'),
  ]);

  const air = page('Air', '/hvac/', [
    page('Air Conditioning', '/air-conditioning/', [
      page('AC Repair', '/air-conditioning/repair/', [cities('/air-conditioning/repair/')]),
      page('AC Installation', '/air-conditioning/installation/', [cities('/air-conditioning/installation/')]),
      page('Ductless AC', '/air-conditioning/ductless/', [cities('/air-conditioning/ductless/')]),
      page('AC Inspections', '/air-conditioning/inspections/'),
      cities('/air-conditioning/'),
    ]),
    page('Heating', '/heating/', [
      page('Heating Repair', '/heating/repair/', [cities('/heating/repair/')]),
      page('Heating Installation', '/heating/installation/', [cities('/heating/installation/')]),
      page('Furnaces', '/heating/furnaces/', [cities('/heating/furnaces/')]),
      cities('/heating/'),
    ]),
    page('Heat Pumps', '/heat-pumps/', [cities('/heat-pumps/')]),
    page('Air Ducts', '/hvac/air-ducts/'),
    page('Air Handlers', '/air-handlers/'),
    page('Indoor Air Quality', '/air-quality/', [cities('/air-quality/')]),
    page('Attic & Crawl Space', '/crawl-space/', [cities('/crawl-space/')]),
    page('Commercial HVAC', '/hvac/commercial/'),
    page('Emergency HVAC', '/hvac/emergency-services/'),
    cities('/hvac/'),
  ]);

  const electrical = page('Electrical', '/electrical/', [
    page('Electrical Installations', '/electrical/installation/', [cities('/electrical/installation/')]),
    page('Electrical Repair', '/electrical/repair/', [cities('/electrical/repair/')]),
    page('Electrical Maintenance', '/electrical/maintenance/', [cities('/electrical/maintenance/')]),
    page('Electrical Inspections', '/electrical/inspections/', [cities('/electrical/inspections/')]),
    page('Electrical Panels', '/electrical/panels/', [
      page('Panel Repair', '/electrical/panels/repair/', [cities('/electrical/panels/repair/')]),
      page('Panel Replacement', '/electrical/panels/replacement/', [cities('/electrical/panels/replacement/')]),
      page('Circuit Breakers', '/electrical/panels/circuits/', [cities('/electrical/panels/circuits/')]),
      cities('/electrical/panels/'),
    ]),
    page('Wiring & Rewiring', '/electrical/wiring/', [
      page('Outlet Wiring', '/electrical/wiring/outlets/', [cities('/electrical/wiring/outlets/')]),
      cities('/electrical/wiring/'),
    ]),
    page('Surge Protection', '/electrical/surge-protection/', [cities('/electrical/surge-protection/')]),
    page('Generators', '/electrical/generators/', [
      page('Generator Installation', '/electrical/generators/installation/', [cities('/electrical/generators/installation/')]),
      page('Generator Repair', '/electrical/generators/repair/', [cities('/electrical/generators/repair/')]),
      cities('/electrical/generators/'),
    ]),
    page('Lighting', '/electrical/lighting/', [
      page('Outdoor & Exterior Lighting', '/electrical/lighting/exterior/', [
        page('Dock Lighting & Electrical', '/electrical/lighting/docks/'),
        page('Landscape Lighting', '/electrical/lighting/landscape/'),
        cities('/electrical/lighting/exterior/'),
      ]),
      cities('/electrical/lighting/'),
    ]),
    page('EV Charger Installation', '/electrical/ev-chargers/', [
      page('Level 3 EV Chargers', '/electrical/ev-chargers/level-3/', [cities('/electrical/ev-chargers/level-3/')]),
      cities('/electrical/ev-chargers/'),
    ]),
    page('Outdoor Electrical Services', '/electrical/outdoor/'),
    page('Commercial Electrical', '/electrical/commercial/', [cities('/electrical/commercial/')]),
    page('Emergency Electrical', '/electrical/emergency-services/'),
    cities('/electrical/'),
  ]);

  const areaKids = [
    page('Charlotte', '/service-area/charlotte/'),
    page('Lake Norman', '/service-area/cornelius/'),
    page('Greenville, NC', '/service-area/greenville/'),
    page('Fayetteville, NC', '/service-area/fayetteville/'),
    page('Davidson, NC (HVAC)', '/service-area/hvac/davidson-nc/'),
    page('Zip Code Lookup', '/zip-code-lookup/'),
  ];
  if (future) {
    areaKids.splice(
      2,
      0,
      page('Huntersville, NC', '/service-area/huntersville/', undefined, true),
      page('Mooresville, NC', '/service-area/mooresville/', undefined, true),
      page('Matthews, NC', '/service-area/matthews/', undefined, true),
    );
  }
  const serviceArea = page('Service Area', '/service-area/', areaKids);

  const nushield = page('NuShield Protection Plan', '/nushield', [page('Membership Plans', '/memberships/')]);

  const contact = page('Contact Us', '/contact-us/', [
    page('Book Online', '/book-online/'),
    page('Bell Cow Online Scheduler', '/bellcow-book-online'),
    page('Service Request — Electrical', '/service-request-electrical/'),
    page('Service Request — Plumbing', '/service-request-plumbing/'),
    page('Service Request — HVAC', '/service-request-hvac/'),
    page('Service Request — Emergency', '/service-request-emergency/'),
  ]);

  const utility = cluster('Utility & Legal', [
    page('Privacy Policy', '/privacy-policy/'),
    page('SMS Terms of Service', '/sms-terms/'),
    page('HTML Sitemap', '/html-sitemap/'),
    page('No Leaks In This House', '/no-leaks-in-this-house/'),
  ]);

  return page('Home', '/', [about, plumbing, air, electrical, nushield, serviceArea, contact, utility]);
}

function normalize(node: PageNode, id: string, depth: number): PageNode {
  node.id = id;
  node.depth = depth;
  node.children = node.children.map((child, i) => normalize(child, `${id}.${i}`, depth + 1));
  return node;
}

const treeCache = new Map<SiteVersion, PageNode>();

/** Builds (and memoizes) the full, normalized page tree for a site version. */
export function getSiteTree(version: SiteVersion): PageNode {
  const cached = treeCache.get(version);
  if (cached) return cached;
  const tree = normalize(buildTree(version), 'r', 0);
  treeCache.set(version, tree);
  return tree;
}

export function flattenTree(node: PageNode, out: PageNode[] = []): PageNode[] {
  out.push(node);
  node.children.forEach((c) => flattenTree(c, out));
  return out;
}
