import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getPrecomputedWaveformForPart, fetchAudioWaveform, WaveformData } from '../../data/precomputedWaveforms';
import { vocalEngine } from '../../audio/vocalSynthEngine';

interface AudioWaveformVisualizerProps {
  partId?: string;
  audioUrl?: string;
  seed?: number;
  color: string;
  syncOffset: number; // in seconds, e.g. -0.500 to +0.500
  height?: number; // default 42px
  isSoloed?: boolean;
  isDimmed?: boolean;
  partIndex: number;
  isPlaying?: boolean;
  playheadProgress?: number | null; // 0 to 100 or null
  playheadTime?: number | null; // in seconds
  duration?: number; // default 153.13s
  zoomFactor?: number; // 1 = full overview, 4 = section zoom, 8 = precision alignment
  onSeekTime?: (timeSec: number) => void;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  partId = '',
  audioUrl,
  seed = 42,
  color,
  syncOffset,
  height = 42,
  isSoloed = false,
  isDimmed = false,
  partIndex,
  isPlaying = false,
  playheadProgress = null,
  duration = 153.13,
  zoomFactor = 1,
  onSeekTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playheadRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [dynamicWaveform, setDynamicWaveform] = useState<WaveformData | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  // Measure container width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth || 600);
    return () => observer.disconnect();
  }, []);

  // Fetch or retrieve actual waveform data
  useEffect(() => {
    const pre = getPrecomputedWaveformForPart(partId, audioUrl);
    if (pre) {
      setDynamicWaveform(pre);
      return;
    }

    if (audioUrl) {
      let isMounted = true;
      fetchAudioWaveform(audioUrl).then((data) => {
        if (isMounted && data) {
          setDynamicWaveform(data);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [partId, audioUrl]);

  // Waveform data source (peaks & rms)
  const waveform = useMemo<WaveformData>(() => {
    if (dynamicWaveform && dynamicWaveform.peaks.length > 0) {
      return dynamicWaveform;
    }
    const pre = getPrecomputedWaveformForPart(partId, audioUrl);
    if (pre) return pre;

    // Fallback if no audio asset loaded yet: clean empty/flat arrays
    return {
      peaks: new Array(800).fill(0),
      rms: new Array(800).fill(0)
    };
  }, [dynamicWaveform, partId, audioUrl]);

  // Render waveform onto high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseWidth = Math.max(200, containerWidth);
    const canvasRenderWidth = baseWidth * zoomFactor;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasRenderWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasRenderWidth}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasRenderWidth, height);

    const centerY = height / 2;
    const { peaks, rms } = waveform;
    const numPoints = peaks.length;

    // 1. Draw DAW measure / beat grid lines
    ctx.strokeStyle = 'rgba(28, 18, 31, 0.08)';
    ctx.lineWidth = 1;
    const barCount = Math.max(16, 16 * zoomFactor);
    for (let b = 1; b < barCount; b++) {
      const gx = (b / barCount) * canvasRenderWidth;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }

    // 2. Draw Zero-crossing center guide line
    ctx.strokeStyle = 'rgba(28, 18, 31, 0.16)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasRenderWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Opacity tuning based on solo/dimmed/muted state
    const baseAlpha = isDimmed ? 0.22 : isSoloed ? 1.0 : 0.92;

    // Check if waveform has any audio content
    const hasAudio = peaks.some(p => p > 0);
    if (!hasAudio) {
      // Draw flatline at center
      ctx.strokeStyle = hexToRgba(color, 0.4 * baseAlpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvasRenderWidth, centerY);
      ctx.stroke();
      return;
    }

    // 4. Draw Main Peak Envelope
    ctx.save();
    ctx.beginPath();

    // Top envelope (left to right)
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * canvasRenderWidth;
      const peakVal = peaks[i];
      // When peakVal is 0, amplitude is strictly 0 (lies directly on centerY)
      const y = peakVal === 0 ? centerY : centerY - (peakVal * (centerY - 3));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Bottom envelope (right to left)
    for (let i = numPoints - 1; i >= 0; i--) {
      const x = (i / (numPoints - 1)) * canvasRenderWidth;
      const peakVal = peaks[i];
      const y = peakVal === 0 ? centerY : centerY + (peakVal * (centerY - 3));
      ctx.lineTo(x, y);
    }

    ctx.closePath();

    // Waveform gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, hexToRgba(color, 0.75 * baseAlpha));
    grad.addColorStop(0.5, hexToRgba(color, 0.25 * baseAlpha));
    grad.addColorStop(1, hexToRgba(color, 0.75 * baseAlpha));

    ctx.fillStyle = grad;
    ctx.fill();

    // Outer contour stroke line
    ctx.strokeStyle = hexToRgba(color, 0.95 * baseAlpha);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 5. Draw RMS Energy Core (denser interior visual layer)
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * canvasRenderWidth;
      const rmsVal = rms[i];
      const y = rmsVal === 0 ? centerY : centerY - (rmsVal * (centerY - 4));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = numPoints - 1; i >= 0; i--) {
      const x = (i / (numPoints - 1)) * canvasRenderWidth;
      const rmsVal = rms[i];
      const y = rmsVal === 0 ? centerY : centerY + (rmsVal * (centerY - 4));
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = hexToRgba(color, 0.45 * baseAlpha);
    ctx.fill();
    ctx.restore();

  }, [waveform, color, height, isSoloed, isDimmed, containerWidth, zoomFactor]);

  // Compute offset translation:
  // Offset moves the waveform by its physical time delay in pixels:
  // offsetPx = syncOffset * pxPerSec
  const pxPerSec = (containerWidth * zoomFactor) / duration;
  const offsetPx = syncOffset * pxPerSec;

  // Compute scroll offset for zoom mode to track playhead
  const totalZoomWidth = containerWidth * zoomFactor;
  let scrollTranslateX = 0;
  if (zoomFactor > 1 && playheadProgress !== null) {
    const playheadPx = (playheadProgress / 100) * totalZoomWidth;
    const targetScroll = playheadPx - (containerWidth / 2);
    scrollTranslateX = -Math.max(0, Math.min(targetScroll, totalZoomWidth - containerWidth));
  }

  // Real-time synchronization loop:
  // When isPlaying is active, bypass React rendering cycles and drive the playhead position
  // directly from the WebAudio hardware clock at the display refresh rate (60/120Hz).
  useEffect(() => {
    if (!isPlaying) {
      if (playheadRef.current) {
        if (playheadProgress !== null && playheadProgress >= 0) {
          const totalW = containerWidth * zoomFactor;
          let scrollX = 0;
          if (zoomFactor > 1) {
            const px = (playheadProgress / 100) * totalW;
            const targetScroll = px - (containerWidth / 2);
            scrollX = -Math.max(0, Math.min(targetScroll, totalW - containerWidth));
          }
          const x = zoomFactor > 1
            ? ((playheadProgress / 100) * totalW) + scrollX
            : (playheadProgress / 100) * containerWidth;
          playheadRef.current.style.transform = `translateX(${x}px)`;
          playheadRef.current.style.display = 'flex';
        } else {
          playheadRef.current.style.display = 'none';
        }
      }
      if (canvasContainerRef.current) {
        canvasContainerRef.current.style.transform = `translateX(${scrollTranslateX + offsetPx}px)`;
      }
      return;
    }

    let animId: number;
    const syncLoop = () => {
      const trackTime = vocalEngine.getCurrentTrackTime();
      if (trackTime !== null && isFinite(trackTime)) {
        const pct = Math.min(100, Math.max(0, (trackTime / duration) * 100));
        const totalW = containerWidth * zoomFactor;
        let scrollX = 0;
        if (zoomFactor > 1) {
          const playheadPx = (pct / 100) * totalW;
          const targetScroll = playheadPx - (containerWidth / 2);
          scrollX = -Math.max(0, Math.min(targetScroll, totalW - containerWidth));
        }
        const px = zoomFactor > 1
          ? ((pct / 100) * totalW) + scrollX
          : (pct / 100) * containerWidth;

        if (playheadRef.current) {
          playheadRef.current.style.transform = `translateX(${px}px)`;
          playheadRef.current.style.display = 'flex';
        }
        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.transform = `translateX(${scrollX + offsetPx}px)`;
        }
      }
      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, duration, containerWidth, zoomFactor, offsetPx, playheadProgress, scrollTranslateX]);

  // Handle click to seek
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeekTime) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    if (zoomFactor > 1) {
      const absoluteX = clickX - scrollTranslateX;
      const targetSec = (absoluteX / totalZoomWidth) * duration;
      onSeekTime(Math.max(0, Math.min(duration, targetSec)));
    } else {
      const targetSec = (clickX / containerWidth) * duration;
      onSeekTime(Math.max(0, Math.min(duration, targetSec)));
    }
  };

  const playheadX = playheadProgress !== null 
    ? (zoomFactor > 1 
        ? ((playheadProgress / 100) * totalZoomWidth) + scrollTranslateX 
        : (playheadProgress / 100) * containerWidth)
    : null;

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative w-full overflow-hidden select-none cursor-pointer rounded-lg bg-[#EADCE0]/50 border border-[rgba(62,40,67,0.08)]"
      style={{ height: `${height}px` }}
      title={onSeekTime ? "Click anywhere along track to seek playhead" : undefined}
    >
      {/* Waveform Canvas container with translation for offset and zoom scrolling */}
      <div 
        ref={canvasContainerRef}
        className="h-full will-change-transform"
        style={{ 
          width: `${totalZoomWidth}px`,
          transform: `translateX(${scrollTranslateX + offsetPx}px)` 
        }}
      >
        <canvas ref={canvasRef} className="block h-full" />
      </div>

      {/* Global 0:00 Reference guideline when track is shifted */}
      {Math.abs(offsetPx) > 1 && (
        <div 
          className="absolute top-0 bottom-0 w-px bg-[#1C121F]/40 pointer-events-none z-10"
          style={{ left: `${Math.max(4, offsetPx + scrollTranslateX)}px` }}
        >
          <div className="absolute top-0.5 left-1 px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#1C121F] text-[#F7F1F3] shadow-xs whitespace-nowrap">
            {syncOffset > 0 ? `+${Math.round(syncOffset * 1000)}ms` : `${Math.round(syncOffset * 1000)}ms`}
          </div>
        </div>
      )}

      {/* Synchronized Playhead (during playback test) */}
      <div 
        ref={playheadRef}
        className="absolute top-0 bottom-0 w-0.5 bg-rose-600 z-20 pointer-events-none shadow-sm flex flex-col items-center will-change-transform"
        style={{ 
          left: 0,
          display: playheadX !== null && playheadX >= 0 ? 'flex' : 'none',
          transform: `translateX(${playheadX ?? 0}px)`
        }}
      >
        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full -mt-0.5 shadow-xs" />
        <div className="w-0.5 flex-1 bg-rose-600" />
      </div>

      {/* Subtle track entrance timecode tag if at start */}
      {waveform.peaks.length > 0 && (
        <div className="absolute bottom-1 right-2 pointer-events-none text-[8px] font-mono text-[#573657]/70 bg-[#DFCCCF]/80 px-1 py-0.5 rounded">
          {syncOffset === 0 ? 'Aligned' : `${syncOffset > 0 ? '+' : ''}${Math.round(syncOffset * 1000)}ms`}
        </div>
      )}
    </div>
  );
};

// Helper function to convert Hex to RGBA
function hexToRgba(hex: string, alpha: number): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return `rgba(124, 58, 130, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
