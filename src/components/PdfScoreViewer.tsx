import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  ExternalLink, 
  Download, 
  FileText, 
  Loader2,
  Columns,
  Square
} from 'lucide-react';

// Configure worker for pdfjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

interface PdfScoreViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

export const PdfScoreViewer: React.FC<PdfScoreViewerProps> = ({
  pdfUrl,
  title = 'Sheet Music Score',
  className = ''
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [renderedScale, setRenderedScale] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [continuousScroll, setContinuousScroll] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGestureActive, setIsGestureActive] = useState<boolean>(false);

  const scaleRef = useRef<number>(1.1);
  scaleRef.current = scale;

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, any>>(new Map());

  // Gesture refs for trackpad and touchscreen pinch
  const touchDistanceRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1.1);
  const gestureStartScaleRef = useRef<number>(1.1);
  const wheelTimeoutRef = useRef<any>(null);
  const lastTapRef = useRef<number>(0);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load PDF score:', err);
        setError(err?.message || 'Could not load PDF document.');
        setLoading(false);
      }
    };

    loadDoc();

    return () => {
      isMounted = false;
      renderTasksRef.current.forEach(task => {
        try { task.cancel(); } catch {}
      });
      renderTasksRef.current.clear();
      if (pdfDocRef.current) {
        try { pdfDocRef.current.destroy(); } catch {}
      }
    };
  }, [pdfUrl]);

  // Render a specific page to canvas at high DPI
  const renderPage = useCallback(async (pageNum: number, targetScale: number, targetRotation: number) => {
    const doc = pdfDocRef.current;
    if (!doc) return;

    const canvas = canvasRefs.current.get(pageNum);
    if (!canvas) return;

    // Cancel existing render task for this page if in progress
    const existingTask = renderTasksRef.current.get(pageNum);
    if (existingTask) {
      try { existingTask.cancel(); } catch {}
    }

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: targetScale, rotation: targetRotation });
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const task = page.render(renderContext);
      renderTasksRef.current.set(pageNum, task);
      await task.promise;
      renderTasksRef.current.delete(pageNum);
      ctx.restore();
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, []);

  // Re-render when renderedScale, rotation, current page or continuous mode changes
  useEffect(() => {
    if (!pdfDocRef.current || loading) return;

    if (continuousScroll) {
      for (let i = 1; i <= numPages; i++) {
        renderPage(i, renderedScale, rotation);
      }
    } else {
      renderPage(currentPage, renderedScale, rotation);
    }
  }, [renderedScale, rotation, currentPage, continuousScroll, loading, numPages, renderPage]);

  // Debounce scale changes from buttons or gestures to update renderedScale
  useEffect(() => {
    if (isGestureActive) return;

    const timer = setTimeout(() => {
      setRenderedScale(scale);
    }, 120);

    return () => clearTimeout(timer);
  }, [scale, isGestureActive]);

  // Trackpad and Touchscreen Pinch Zoom Gestures
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Trackpad Pinch to Zoom (Wheel event with ctrlKey)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setIsGestureActive(true);

        // deltaY is negative when pinching out (zoom in), positive when pinching in (zoom out)
        const zoomFactor = Math.exp(-e.deltaY * 0.008);
        setScale(prev => {
          const next = Math.max(0.4, Math.min(3.5, +(prev * zoomFactor).toFixed(2)));
          scaleRef.current = next;
          return next;
        });

        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          setIsGestureActive(false);
          setRenderedScale(scaleRef.current);
        }, 140);
      }
    };

    // 2. Mobile Device Touchscreen Pinch to Zoom (2-finger touches)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        setIsGestureActive(true);
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchDistanceRef.current = Math.hypot(
          t1.clientX - t2.clientX,
          t1.clientY - t2.clientY
        );
        touchStartScaleRef.current = scaleRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null && touchDistanceRef.current > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(
          t1.clientX - t2.clientX,
          t1.clientY - t2.clientY
        );
        const factor = currentDist / touchDistanceRef.current;
        const next = Math.max(0.4, Math.min(3.5, +(touchStartScaleRef.current * factor).toFixed(2)));
        scaleRef.current = next;
        setScale(next);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchDistanceRef.current !== null) {
        touchDistanceRef.current = null;
        setIsGestureActive(false);
        setRenderedScale(scaleRef.current);
      }
    };

    // 3. Apple Safari Gesture Events (iOS Safari & macOS Safari trackpads)
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      setIsGestureActive(true);
      gestureStartScaleRef.current = scaleRef.current;
    };

    const handleGestureChange = (e: any) => {
      e.preventDefault();
      if (typeof e.scale === 'number') {
        const next = Math.max(0.4, Math.min(3.5, +(gestureStartScaleRef.current * e.scale).toFixed(2)));
        scaleRef.current = next;
        setScale(next);
      }
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
      setIsGestureActive(false);
      setRenderedScale(scaleRef.current);
    };

    // Attach non-passive listeners to allow e.preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Safari-specific gesture events
    container.addEventListener('gesturestart', handleGestureStart as any, { passive: false });
    container.addEventListener('gesturechange', handleGestureChange as any, { passive: false });
    container.addEventListener('gestureend', handleGestureEnd as any, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      container.removeEventListener('gesturestart', handleGestureStart as any);
      container.removeEventListener('gesturechange', handleGestureChange as any);
      container.removeEventListener('gestureend', handleGestureEnd as any);
      clearTimeout(wheelTimeoutRef.current);
    };
  }, []);

  // Double tap to zoom toggle on touch devices
  const handleDoubleTap = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Toggle between 1.1x and 1.8x
      setScale(prev => (prev > 1.3 ? 1.1 : 1.8));
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(3.5, +(prev + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale(prev => Math.max(0.4, +(prev - 0.15).toFixed(2)));
  const handleResetZoom = () => setScale(1.1);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(numPages, prev + 1));

  // Compute instantaneous zoom multiplier for 60fps gesture feedback
  const zoomMultiplier = renderedScale > 0 ? scale / renderedScale : 1;

  return (
    <div className={`flex flex-col h-full w-full bg-slate-950 rounded-xl overflow-hidden border border-white/15 shadow-2xl ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-900 border-b border-white/10 text-xs text-slate-300 select-none">
        {/* Left: Document Info */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="font-bold text-white font-display truncate max-w-[180px] sm:max-w-xs">
            {title}
          </span>
          {numPages > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {numPages} {numPages === 1 ? 'PAGE' : 'PAGES'}
            </span>
          )}
        </div>

        {/* Center: Page Navigation (In Single-Page Mode) */}
        {!continuousScroll && numPages > 1 && (
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-1 text-white font-bold">
              {currentPage} / {numPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Zoom & View Mode Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Continuous Scroll vs Single Page Toggle */}
          <button
            type="button"
            onClick={() => setContinuousScroll(!continuousScroll)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-[11px] transition-colors"
            title={continuousScroll ? 'Switch to Single Page mode' : 'Switch to Continuous Scroll mode'}
          >
            {continuousScroll ? (
              <>
                <Columns className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Continuous</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Single</span>
              </>
            )}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Zoom out (or pinch trackpad/screen)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-sky-300 hover:text-white tabular-nums"
              title="Reset Zoom to 110%"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Zoom in (or pinch trackpad/screen)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Rotate 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Direct File Link */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-400/30 font-medium text-[11px] transition-colors"
            title="Open original PDF in browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Tab</span>
          </a>

          <a
            href={pdfUrl}
            download
            className="p-1.5 rounded bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div 
        ref={containerRef}
        onTouchStart={handleDoubleTap}
        className="flex-1 w-full bg-[#1e2330] overflow-auto flex flex-col items-center p-4 sm:p-6 min-h-[480px] touch-pan-x touch-pan-y select-none relative"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center my-auto py-16 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <span className="text-sm font-medium">Rendering sheet music pages...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center my-auto py-12 px-6 max-w-md bg-slate-900/90 rounded-2xl border border-rose-500/30 text-center gap-3 shadow-2xl">
            <FileText className="w-10 h-10 text-rose-400" />
            <h3 className="text-base font-bold text-white">Score Preview Unavailable</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <div className="flex gap-2 mt-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Score in New Window</span>
              </a>
              <a
                href={pdfUrl}
                download
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center gap-1.5 border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}

        {/* Continuous Scroll Viewport with 60fps GPU Pinch Zoom Multiplier */}
        {!loading && !error && continuousScroll && (
          <div 
            className="flex flex-col items-center gap-6 w-fit mx-auto pb-10 origin-top will-change-transform"
            style={{
              transform: Math.abs(zoomMultiplier - 1) > 0.001 ? `scale(${zoomMultiplier})` : undefined,
              transition: isGestureActive ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
              <div 
                key={pageNum} 
                className="flex flex-col items-center bg-white rounded-lg shadow-2xl border border-slate-400/40 overflow-hidden relative"
              >
                <div className="w-full bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-mono flex justify-between border-b border-slate-200 select-none">
                  <span>Page {pageNum} of {numPages}</span>
                  <span>{title}</span>
                </div>
                <canvas
                  ref={(el) => {
                    if (el) {
                      canvasRefs.current.set(pageNum, el);
                    } else {
                      canvasRefs.current.delete(pageNum);
                    }
                  }}
                  className="block bg-white shadow-inner"
                />
              </div>
            ))}
          </div>
        )}

        {/* Single Page Viewport with 60fps GPU Pinch Zoom Multiplier */}
        {!loading && !error && !continuousScroll && (
          <div 
            className="flex flex-col items-center bg-white rounded-lg shadow-2xl border border-slate-400/40 overflow-hidden my-auto origin-center will-change-transform"
            style={{
              transform: Math.abs(zoomMultiplier - 1) > 0.001 ? `scale(${zoomMultiplier})` : undefined,
              transition: isGestureActive ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            <div className="w-full bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-mono flex justify-between border-b border-slate-200 select-none">
              <span>Page {currentPage} of {numPages}</span>
              <span>{title}</span>
            </div>
            <canvas
              ref={(el) => {
                if (el) {
                  canvasRefs.current.set(currentPage, el);
                } else {
                  canvasRefs.current.delete(currentPage);
                }
              }}
              className="block bg-white shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );
};
