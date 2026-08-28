import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.6;
const DEFAULT_ZOOM = 0.85;

function clamp(z: number): number {
  return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) * 100) / 100;
}

/**
 * Ctrl/Cmd+scroll to zoom, click-drag (outside links/buttons/inputs) to pan,
 * on a scrollable container — matches the node-map interaction from the
 * original prototype.
 */
export function usePanZoom() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setZoom((z) => clamp(z - e.deltaY * 0.0015));
    };

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a,button,input')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = el.scrollLeft;
      startTop = el.scrollTop;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
      el.scrollTop = startTop - (e.clientY - startY);
    };
    const onMouseUp = () => {
      dragging = false;
      el.style.cursor = 'grab';
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return {
    zoom,
    scrollRef,
    zoomIn: () => setZoom((z) => clamp(z + 0.1)),
    zoomOut: () => setZoom((z) => clamp(z - 0.1)),
    zoomReset: () => setZoom(DEFAULT_ZOOM),
  };
}
