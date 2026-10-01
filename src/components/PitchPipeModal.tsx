import React, { useState } from 'react';
import { X, Volume2, Sparkles, Music } from 'lucide-react';
import { vocalEngine } from '../audio/vocalSynthEngine';

interface PitchPipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

const CHROMATIC_NOTES = [
  { name: 'F', midi: 65, angle: 0 },
  { name: 'F# / Gb', midi: 66, angle: 27.7 },
  { name: 'G', midi: 67, angle: 55.4 },
  { name: 'G# / Ab', midi: 68, angle: 83.1 },
  { name: 'A', midi: 69, angle: 110.8 },
  { name: 'A# / Bb', midi: 70, angle: 138.5 },
  { name: 'B', midi: 71, angle: 166.2 },
  { name: 'C', midi: 72, angle: 193.9 },
  { name: 'C# / Db', midi: 73, angle: 221.6 },
  { name: 'D', midi: 74, angle: 249.3 },
  { name: 'D# / Eb', midi: 75, angle: 277 },
  { name: 'E', midi: 76, angle: 304.7 },
  { name: 'F (high)', midi: 77, angle: 332.4 }
];

export const PitchPipeModal: React.FC<PitchPipeModalProps> = ({
  isOpen,
  onClose,
  initialKey = 'Eb'
}) => {
  const [activeNote, setActiveNote] = useState<string | null>(initialKey);
  const [isBlowing, setIsBlowing] = useState(false);

  if (!isOpen) return null;

  const handleStartTone = (noteName: string) => {
    setActiveNote(noteName);
    setIsBlowing(true);
    vocalEngine.startPitchPipeTone(noteName.split(' ')[0], 0);
  };

  const handleStopTone = () => {
    setIsBlowing(false);
    vocalEngine.stopPitchPipeTone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            handleStopTone();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold tracking-widest text-amber-400 uppercase font-display mb-1">
            <Sparkles className="w-2.5 h-2.5" />
            Master Pitch Tool
          </div>
          <h2 className="text-2xl font-extrabold text-white font-display">Barbershop Pitch Pipe</h2>
          <p className="text-xs text-slate-400">Click & hold any note reed to blow key pitch</p>
        </div>

        {/* Circular Pitch Pipe Dial */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 bg-gradient-to-tr from-amber-950/40 via-slate-950 to-slate-900 shadow-2xl flex items-center justify-center">
            {/* Center Hub */}
            <div
              className={`w-28 h-28 rounded-full border-2 transition-all flex flex-col items-center justify-center ${
                isBlowing
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/40 scale-105'
                  : 'bg-slate-950 text-white border-amber-500/40'
              }`}
            >
              <Volume2 className={`w-7 h-7 mb-1 ${isBlowing ? 'animate-bounce text-slate-950' : 'text-amber-400'}`} />
              <span className="text-base font-extrabold font-display tracking-tight">{activeNote || 'Key'}</span>
              <span className="text-[10px] font-semibold opacity-80">{isBlowing ? 'Sounding...' : 'Hold reed'}</span>
            </div>
          </div>

          {/* 13 Circular Reed Holes */}
          {CHROMATIC_NOTES.map((note, index) => {
            const rad = ((note.angle - 90) * Math.PI) / 180;
            const radius = 104;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const isSelected = activeNote?.includes(note.name.split(' ')[0]);

            return (
              <button
                key={index}
                type="button"
                onMouseDown={() => handleStartTone(note.name)}
                onMouseUp={handleStopTone}
                onMouseLeave={handleStopTone}
                onTouchStart={() => handleStartTone(note.name)}
                onTouchEnd={handleStopTone}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border text-[11px] font-bold flex items-center justify-center transition-all active:scale-95 select-none ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-300/60 font-extrabold scale-110'
                    : 'bg-slate-800 text-amber-200 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400'
                }`}
              >
                {note.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Quick Tonic Blow Button */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onMouseDown={() => handleStartTone(initialKey)}
            onMouseUp={handleStopTone}
            onMouseLeave={handleStopTone}
            onTouchStart={() => handleStartTone(initialKey)}
            onTouchEnd={handleStopTone}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
          >
            Blow Current Song Key: {initialKey}
          </button>
        </div>
      </div>
    </div>
  );
};
