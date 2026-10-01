import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Volume1, VolumeX, RotateCcw } from 'lucide-react';

interface VolumePopupButtonProps {
  volume: number;
  isMuted?: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  className?: string;
  idPrefix?: string;
}

export const VolumePopupButton: React.FC<VolumePopupButtonProps> = ({
  volume,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  className = '',
  idPrefix = 'playback-volume'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Close when clicking/touching outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside, true);
    document.addEventListener('touchstart', handlePointerDownOutside, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside, true);
      document.removeEventListener('touchstart', handlePointerDownOutside, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const effectiveVolume = isMuted ? 0 : volume;

  const getSpeakerIcon = () => {
    if (effectiveVolume === 0 || isMuted) {
      return <VolumeX className="w-4 h-4 text-rose-400" />;
    }
    if (effectiveVolume < 0.5) {
      return <Volume1 className="w-4 h-4 text-[#B9AEB6]" />;
    }
    return <Volume2 className="w-4 h-4 text-[#B9AEB6]" />;
  };

  // Calculate volume from pointer position on vertical track
  const updateVolumeFromPointer = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    // 0 at the bottom, 1 at the top
    const relativeY = clientY - rect.top;
    const ratio = 1 - (relativeY / rect.height);
    const clamped = Math.max(0, Math.min(1, ratio));
    onVolumeChange(+clamped.toFixed(2));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateVolumeFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    updateVolumeFromPointer(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Speaker Button in Playback Bar */}
      <button
        type="button"
        id={`${idPrefix}-btn`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        title={`Volume: ${Math.round(effectiveVolume * 100)}% (click to open slider)`}
        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 border ${
          isOpen
            ? 'bg-[#2A1E2A] border-[rgba(255,249,247,0.25)] text-[#FF5757] shadow-xs'
            : 'bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.12)] text-[#B9AEB6] hover:text-[#F7F1F3]'
        }`}
      >
        {getSpeakerIcon()}
      </button>

      {/* Vertical Slider Popover */}
      {isOpen && (
        <div
          id={`${idPrefix}-popover`}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center p-3 rounded-2xl bg-[#221823] border border-[rgba(255,249,247,0.15)] shadow-2xl shadow-black/80 backdrop-blur-xl animate-fadeIn select-none w-16"
        >
          {/* Top: Percentage Display */}
          <span 
            className="text-[11px] font-mono font-bold text-[#D9AF8D] mb-2 tabular-nums cursor-pointer hover:text-white transition-colors"
            title="Double-click to reset to 85%"
            onDoubleClick={() => onVolumeChange(0.85)}
          >
            {Math.round(effectiveVolume * 100)}%
          </span>

          {/* Interactive Vertical Slider Track */}
          <div
            ref={trackRef}
            id={`${idPrefix}-track`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-3.5 h-32 rounded-full bg-[#120B17] border border-[rgba(255,249,247,0.10)] cursor-pointer flex flex-col justify-end p-0.5 touch-none"
            title={`Volume: ${Math.round(effectiveVolume * 100)}% (drag to adjust)`}
          >
            {/* Active filled level gradient with barbershop harmonic palette */}
            <div
              className="w-full rounded-full bg-gradient-to-t from-[#B7A1CC] via-[#9EBCAB] to-[#D9AF8D] transition-all duration-75 pointer-events-none"
              style={{ height: `${Math.round(effectiveVolume * 100)}%` }}
            />

            {/* Draggable thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -ml-0 w-5 h-5 rounded-full bg-white border-2 border-[#D9AF8D] shadow-md shadow-black/60 pointer-events-none transition-all duration-75 flex items-center justify-center"
              style={{
                bottom: `calc(${effectiveVolume * 100}% - 10px)`
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#D9AF8D]" />
            </div>
          </div>

          {/* Accessible Hidden Native Range Input for Keyboard Control */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={effectiveVolume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="sr-only"
            aria-label="Master Volume Slider"
          />

          {/* Bottom Controls: Mute Toggle + 85% Reset */}
          <div className="flex flex-col items-center gap-1.5 mt-2.5 pt-2 border-t border-[rgba(255,249,247,0.08)] w-full">
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted || effectiveVolume === 0 ? 'Unmute' : 'Mute'}
              className="p-1 rounded-lg hover:bg-white/10 text-[#B9AEB6] hover:text-[#F7F1F3] transition-colors cursor-pointer"
            >
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#B9AEB6]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onVolumeChange(0.85)}
              title="Reset to 85%"
              className="text-[9px] font-mono text-[#B9AEB6] hover:text-[#FF5757] transition-colors cursor-pointer"
            >
              85%
            </button>
          </div>

          {/* Bottom Popover Caret Indicator */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#221823]" />
        </div>
      )}
    </div>
  );
};
