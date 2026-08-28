// Shared path list the nightly job pulls data for. Kept intentionally
// separate from src/data/sitemapTree.ts (the frontend can't safely import
// server-only code, and this list only needs paths, not the full tree) —
// see app/README.md "keeping this list in sync" for how to regenerate it.
import { flattenTree, getSiteTree, type PageNode } from '../../src/data/sitemapTree.js';

/** Every real, live URL path on the *current* site — future-only pages are
 * deliberately excluded here; they get a projected estimate instead (see
 * buildSnapshot.ts), never a real SE Ranking/GA4 pull, because they don't
 * exist on callnublue.com yet. */
export function currentSitePaths(): string[] {
  return flattenTree(getSiteTree('current'))
    .filter((n) => n.kind !== 'cluster' && n.url)
    .map((n) => n.url as string);
}

/** Future-only page paths (isNew), each paired with the nearest ancestor
 * path that *does* have real data, for the projection step. */
export function projectedPaths(): Array<{ path: string; parentPath: string | null }> {
  const root = getSiteTree('future');
  const out: Array<{ path: string; parentPath: string | null }> = [];
  const walk = (n: PageNode, parentUrl: string | null) => {
    if (n.isNew && n.url) out.push({ path: n.url, parentPath: parentUrl });
    const nextParent = n.url && !n.isNew ? n.url : parentUrl;
    n.children.forEach((c: PageNode) => walk(c, nextParent));
  };
  walk(root, null);
  return out;
}
