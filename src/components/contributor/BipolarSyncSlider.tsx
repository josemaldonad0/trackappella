import React from 'react';
import { RotateCcw, Minus, Plus } from 'lucide-react';

interface BipolarSyncSliderProps {
  value: number; // in seconds (e.g. -0.05 to +0.05)
  maxSec?: number; // default 0.5 (±500ms)
  color: string; // track accent color
  disabled?: boolean;
  onChange: (newValueSec: number) => void;
  showNudgeButtons?: boolean;
}

export const BipolarSyncSlider: React.FC<BipolarSyncSliderProps> = ({
  value,
  maxSec = 0.5,
  color,
  disabled = false,
  onChange,
  showNudgeButtons = true
}) => {
  // Clamped value within bounds
  const clampedVal = Math.max(-maxSec, Math.min(maxSec, value));
  const offsetMs = Math.round(clampedVal * 1000);
  const isZero = Math.abs(offsetMs) === 0;

  // Percentage from 0% (at -maxSec) to 100% (at +maxSec), with 50% being exact center (0ms)
  const posPct = 50 + (clampedVal / maxSec) * 50;
  const clampedPosPct = Math.max(0, Math.min(100, posPct));

  // Determine fill dimensions from center (50%) to the grabber (clampedPosPct)
  const isNegative = clampedVal < -0.0005;
  const isPositive = clampedVal > 0.0005;

  let fillStyle: React.CSSProperties = { display: 'none' };
  if (isNegative) {
    // Fill from grabber (left) to center (50%)
    fillStyle = {
      display: 'block',
      left: `${clampedPosPct}%`,
      width: `${50 - clampedPosPct}%`,
      backgroundColor: color
    };
  } else if (isPositive) {
    // Fill from center (50%) to grabber (right)
    fillStyle = {
      display: 'block',
      left: '50%',
      width: `${clampedPosPct - 50}%`,
      backgroundColor: color
    };
  }

  const handleNudge = (deltaMs: number) => {
    if (disabled) return;
    const nextMs = offsetMs + deltaMs;
    const nextSec = Math.max(-maxSec, Math.min(maxSec, nextMs / 1000));
    onChange(Math.round(nextSec * 1000) / 1000);
  };

  const handleReset = () => {
    if (disabled) return;
    onChange(0);
  };

  return (
    <div className="flex items-center gap-2 select-none w-full" id={`bipolar-slider-${offsetMs}`}>
      {/* Slider Groove Container */}
      <div className="relative flex-1 h-7 flex items-center min-w-[120px]">
        {/* Track Groove Background */}
        <div className="relative w-full h-2 rounded-full bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] overflow-hidden shadow-inner">
          {/* Subtle Center Zero Tick Mark inside the groove */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#3E2843]/30 z-0" />

          {/* Colorized Fill Bar (Active only when dragged left or right from center) */}
          <div 
            className="absolute top-0 bottom-0 transition-all duration-75 rounded-full"
            style={fillStyle}
          />
        </div>

        {/* Center Zero Notch Indicator (extending slightly above/below groove) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-1.5 bottom-1.5 w-0.5 bg-[#3E2843]/40 pointer-events-none z-10"
          title="Center 0ms alignment"
        />

        {/* Draggable Grabber Dot (Always colorized with track color, centered at 50% when 0) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full ring-2 ring-white shadow-md pointer-events-none z-20 transition-transform ${
            disabled ? 'opacity-50' : 'hover:scale-110 active:scale-125'
          }`}
          style={{
            left: `${clampedPosPct}%`,
            backgroundColor: color
          }}
        >
          {/* Center inner pin dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Invisible native range input overlay for 60fps drag & touch responsiveness */}
        <input
          type="range"
          min={-maxSec}
          max={maxSec}
          step={0.002}
          value={clampedVal}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onDoubleClick={handleReset}
          title="Drag left/right to adjust offset. Double-click to reset to 0ms."
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 disabled:cursor-not-allowed"
        />
      </div>

      {/* Millisecond Value Badge */}
      <div 
        onClick={handleReset}
        title="Click to reset to 0ms"
        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md text-center shrink-0 cursor-pointer transition-colors border min-w-[54px] ${
          isZero
            ? 'bg-[#DFCCCF] text-[#3E2843] border-[rgba(62,40,67,0.12)] hover:bg-[#EBDDE0]'
            : isNegative
            ? 'bg-[#DFCCCF] text-[#573657] border-[#573657]/30 hover:bg-[#EBDDE0]'
            : 'bg-[#DFCCCF] text-[#7C4010] border-[#7C4010]/30 hover:bg-[#EBDDE0]'
        }`}
      >
        {isZero ? '0 ms' : offsetMs > 0 ? `+${offsetMs}ms` : `${offsetMs}ms`}
      </div>

      {/* Micro Nudge Stepper Buttons */}
      {showNudgeButtons && (
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleNudge(-10)}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#DFCCCF] hover:bg-[#CBB9C7] disabled:opacity-40 text-[#1C121F] text-[10px] font-bold transition-colors cursor-pointer border border-[rgba(62,40,67,0.1)]"
            title="Nudge left 10ms"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          
          <button
            type="button"
            disabled={disabled || isZero}
            onClick={handleReset}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#DFCCCF] hover:bg-[#CBB9C7] disabled:opacity-30 text-[#1C121F] text-[9px] font-mono font-bold transition-colors cursor-pointer border border-[rgba(62,40,67,0.1)]"
            title="Reset to 0ms"
          >
            <RotateCcw className="w-2.5 h-2.5 text-[#573657]" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => handleNudge(10)}
            className="w-5 h-5 rounded flex items-center justify-center bg-[#DFCCCF] hover:bg-[#CBB9C7] disabled:opacity-40 text-[#1C121F] text-[10px] font-bold transition-colors cursor-pointer border border-[rgba(62,40,67,0.1)]"
            title="Nudge right 10ms"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
};
