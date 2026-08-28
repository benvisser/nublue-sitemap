import { useState } from 'react';
import { Header, type ViewMode } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { NodeMap } from './components/NodeMap';
import { ListView } from './components/ListView';
import { Inspector } from './components/Inspector';
import { useSitemap } from './hooks/useSitemap';
import { usePanZoom } from './hooks/usePanZoom';
import { useSeoSnapshot } from './hooks/useSeoSnapshot';
import type { PageNode, SiteVersion } from './data/sitemapTree';
import type { ColorMode } from './data/seoTypes';

export default function App() {
  const [version, setVersion] = useState<SiteVersion>('current');
  const [view, setView] = useState<ViewMode>('map');
  const [colorMode, setColorMode] = useState<ColorMode>('none');
  const [selectedNode, setSelectedNode] = useState<PageNode | null>(null);

  const { allNodes, layout, isOpen, toggle, setAll } = useSitemap(version);
  const { zoom, scrollRef, zoomIn, zoomOut, zoomReset } = usePanZoom();
  const { snapshot, isSample } = useSeoSnapshot();

  const pageCount = allNodes.filter((n) => n.kind !== 'cluster').length;
  const newCount = allNodes.filter((n) => n.isNew).length;

  const changeVersion = (v: SiteVersion) => {
    setVersion(v);
    setSelectedNode(null);
  };

  const selectNode = (n: PageNode) => {
    if (n.kind === 'cluster') {
      toggle(n);
      return;
    }
    setSelectedNode(n);
  };

  return (
    <div className="app-shell">
      <Header version={version} onVersionChange={changeVersion} view={view} onViewChange={setView} zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset} />
      <div className="stripe" />
      <Toolbar
        version={version}
        pageCount={pageCount}
        newCount={newCount}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        snapshotGeneratedAt={snapshot?.generatedAt ?? null}
        isSample={isSample}
        onExpandAll={() => setAll(true)}
        onCollapseAll={() => setAll(false)}
      />

      {view === 'map' ? (
        <NodeMap
          scrollRef={scrollRef}
          zoom={zoom}
          edges={layout.edges}
          pages={layout.pages}
          clusters={layout.clusters}
          canvasWidth={layout.canvasWidth}
          canvasHeight={layout.canvasHeight}
          isOpen={isOpen}
          onToggle={toggle}
          colorMode={colorMode}
          seo={snapshot}
          selectedPath={selectedNode?.url ?? null}
          onSelectNode={selectNode}
        />
      ) : (
        <ListView allNodes={allNodes} seo={snapshot} selectedPath={selectedNode?.url ?? null} onSelectNode={selectNode} />
      )}

      {selectedNode && <Inspector node={selectedNode} seo={snapshot} isSample={isSample} onClose={() => setSelectedNode(null)} />}
    </div>
  );
}
