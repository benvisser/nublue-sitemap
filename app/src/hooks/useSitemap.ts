import { useCallback, useMemo, useState } from 'react';
import { flattenTree, getSiteTree, type PageNode, type SiteVersion } from '../data/sitemapTree';

const EXPAND_DEPTH = 2;

export interface LayoutNode {
  node: PageNode;
  x: number;
  y: number;
}

export interface Edge {
  d: string;
}

const NODE_WIDTH = 250;
const COL_GAP = 62;
const ROW_HEIGHT = 46;
const NODE_HEIGHT = 38;
const COL_WIDTH = NODE_WIDTH + COL_GAP;

export function useSitemap(version: SiteVersion) {
  const root = useMemo(() => getSiteTree(version), [version]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isOpen = useCallback(
    (n: PageNode) => {
      if (Object.prototype.hasOwnProperty.call(collapsed, n.id)) return collapsed[n.id];
      return n.kind !== 'cluster' && n.depth < EXPAND_DEPTH;
    },
    [collapsed],
  );

  const toggle = useCallback((n: PageNode) => {
    setCollapsed((prev) => ({ ...prev, [n.id]: !(Object.prototype.hasOwnProperty.call(prev, n.id) ? prev[n.id] : n.kind !== 'cluster' && n.depth < EXPAND_DEPTH) }));
  }, []);

  const setAll = useCallback(
    (open: boolean) => {
      const next: Record<string, boolean> = {};
      const walk = (n: PageNode) => {
        if (n.children.length) next[n.id] = open;
        n.children.forEach(walk);
      };
      walk(root);
      setCollapsed(next);
    },
    [root],
  );

  const layout = useMemo(() => {
    const pages: LayoutNode[] = [];
    const clusters: LayoutNode[] = [];
    const edges: Edge[] = [];
    let row = 0;
    let maxDepth = 0;

    const walk = (n: PageNode, parent: LayoutNode | null) => {
      const x = n.depth * COL_WIDTH;
      const y = row * ROW_HEIGHT;
      row += 1;
      maxDepth = Math.max(maxDepth, n.depth);
      const rec: LayoutNode = { node: n, x, y };
      (n.kind === 'cluster' ? clusters : pages).push(rec);
      if (parent) {
        const x1 = parent.x + NODE_WIDTH;
        const y1 = parent.y + NODE_HEIGHT / 2;
        const y2 = y + NODE_HEIGHT / 2;
        edges.push({ d: `M${x1} ${y1} C${x1 + 34} ${y1}, ${x - 34} ${y2}, ${x} ${y2}` });
      }
      if (isOpen(n)) n.children.forEach((c) => walk(c, rec));
    };
    walk(root, null);

    return {
      pages,
      clusters,
      edges,
      canvasWidth: (maxDepth + 1) * COL_WIDTH,
      canvasHeight: row * ROW_HEIGHT + 8,
    };
  }, [root, isOpen]);

  const allNodes = useMemo(() => flattenTree(root), [root]);

  return { root, allNodes, layout, isOpen, toggle, setAll };
}

export { NODE_WIDTH, NODE_HEIGHT };
