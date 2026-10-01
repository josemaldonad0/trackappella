import React, { useState } from 'react';
import { Song, VocalPart } from '../types';
import { Sparkles, Music2, FileText, ExternalLink, Download } from 'lucide-react';
import { PdfScoreViewer } from './PdfScoreViewer';

interface ScoreViewerProps {
  song: Song;
  selectedPartId?: string;
  currentTime?: number;
  duration?: number;
  keyOffset?: number;
  effectiveKey?: string;
}

export const ScoreViewer: React.FC<ScoreViewerProps> = ({
  song,
  selectedPartId = 'lead',
  currentTime = 0,
  effectiveKey = song?.baseKey || 'Eb'
}) => {
  const pdfUrl = song?.assets?.chart?.fullScorePdfUrl;
  const [viewMode, setViewMode] = useState<'pdf' | 'interactive'>(() => (pdfUrl ? 'pdf' : 'interactive'));

  if (!song) return null;
  const parts = song.parts || [];
  const selectedPart = parts.find(p => p.id === selectedPartId) || parts[0] || { name: 'Part', color: '#f59e0b', id: 'lead' };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/90 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 font-display">
            {viewMode === 'pdf' ? 'PDF Sheet Music Score' : 'Interactive Sheet Chart'}
          </span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs text-slate-300 font-medium">
            Concert Key: <span className="text-cyan-300 font-mono font-bold">{effectiveKey}</span>
          </span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs text-slate-300 font-medium">
            Voicing: <span className="text-violet-300 font-bold">{song.voicing}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 mr-1">
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'pdf' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF Score
              </button>
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'interactive' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Roll
              </button>
            </div>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sky-300 hover:text-white transition-colors border border-white/10 font-medium"
              title="Open full sheet score PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </a>
          )}

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-mono">
            4/4 · ♩={song.tempoBpm} BPM
          </span>
        </div>
      </div>

      {/* PDF View or Interactive Stave Area */}
      {viewMode === 'pdf' && pdfUrl ? (
        <div className="flex-1 w-full bg-slate-900 flex flex-col min-h-[520px] h-[calc(100vh-250px)]">
          <PdfScoreViewer
            pdfUrl={pdfUrl}
            title={`${song.title} — Full Score`}
            className="w-full h-full min-h-[520px] border-0 rounded-none"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5 sm:p-6 flex flex-col items-center justify-start min-h-[300px] bg-gradient-to-b from-slate-950 via-[#070d19] to-slate-950">
          <div className="w-full max-w-3xl space-y-6">
          {/* Song Title in Score Style */}
          <div className="text-center pb-3 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white tracking-wide font-display">{song.title}</h2>
            <div className="flex justify-between text-xs text-slate-400 font-serif italic mt-1 px-4">
              <span>Arranged by: {song.arranger || 'Traditional'}</span>
              <span>Performer: {song.performerName || song.composer}</span>
            </div>
          </div>

          {/* Render 4-part / 6-part Interactive Staves */}
          <div className="relative bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
            <div className="space-y-8">
              {/* Grand Stave 1: Tenor & Lead (Treble Clef) */}
              <div className="relative bg-slate-950/70 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Tenor
                    </span>
                    <span className="text-slate-600 text-xs">/</span>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Lead
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Treble Stave (8vb)</span>
                </div>

                <svg className="w-full h-28 overflow-visible" viewBox="0 0 700 95">
                  {/* 5 Stave lines */}
                  {[18, 30, 42, 54, 66].map((y, i) => (
                    <line key={i} x1="30" y1={y} x2="690" y2={y} stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
                  ))}
                  {/* Bar lines */}
                  <line x1="30" y1="18" x2="30" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                  <line x1="195" y1="18" x2="195" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="360" y1="18" x2="360" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="525" y1="18" x2="525" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="690" y1="18" x2="690" y2="66" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />

                  {/* Treble Clef */}
                  <text x="36" y="58" fill="rgba(255,255,255,0.85)" fontSize="40" fontFamily="serif" fontWeight="bold">𝄞</text>
                  <text x="66" y="37" fill="#38bdf8" fontSize="14" fontWeight="bold">♭</text>
                  <text x="74" y="49" fill="#38bdf8" fontSize="14" fontWeight="bold">♭</text>
                  <text x="82" y="27" fill="#38bdf8" fontSize="14" fontWeight="bold">♭</text>

                  {/* Time signature */}
                  <text x="96" y="39" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="bold" fontFamily="serif">4</text>
                  <text x="96" y="61" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="bold" fontFamily="serif">4</text>

                  {/* Notes for Tenor (Cyan/Sky) */}
                  {parts.find(p => p.id === 'tenor')?.notes?.map((n, i) => {
                    const xPos = 130 + (i * 75);
                    const isSelected = selectedPartId === 'tenor';
                    const isCurrent = currentTime >= n.time && currentTime < n.time + n.duration;
                    const yPos = 42 - ((n.midi - 67) * 2.8);

                    return (
                      <g key={`t-${i}`} className="transition-all duration-300">
                        {isCurrent && (
                          <circle cx={xPos} cy={yPos} r="12" fill="#06b6d4" fillOpacity="0.4" className="animate-ping" />
                        )}
                        <line x1={xPos + 5} y1={yPos} x2={xPos + 5} y2={yPos - 22} stroke={isSelected ? '#06b6d4' : 'rgba(6,182,212,0.7)'} strokeWidth="2" />
                        <ellipse cx={xPos} cy={yPos} rx="7" ry="5" transform={`rotate(-25 ${xPos} ${yPos})`} fill={isSelected ? '#22d3ee' : '#0891b2'} />
                        <text x={xPos} y={86} textAnchor="middle" fill={isCurrent ? '#22d3ee' : 'rgba(255,255,255,0.7)'} fontSize="11" fontWeight={isCurrent ? 'bold' : 'normal'}>
                          {n.lyric}
                        </text>
                      </g>
                    );
                  })}

                  {/* Notes for Lead (Amber) */}
                  {parts.find(p => p.id === 'lead')?.notes?.map((n, i) => {
                    const xPos = 130 + (i * 75);
                    const isSelected = selectedPartId === 'lead';
                    const isCurrent = currentTime >= n.time && currentTime < n.time + n.duration;
                    const yPos = 54 - ((n.midi - 60) * 2.8);

                    return (
                      <g key={`l-${i}`} className="transition-all duration-300">
                        {isCurrent && (
                          <circle cx={xPos} cy={yPos} r="12" fill="#f59e0b" fillOpacity="0.4" className="animate-ping" />
                        )}
                        <line x1={xPos - 5} y1={yPos} x2={xPos - 5} y2={yPos + 22} stroke={isSelected ? '#f59e0b' : 'rgba(245,158,11,0.7)'} strokeWidth="2" />
                        <ellipse cx={xPos} cy={yPos} rx="7" ry="5" transform={`rotate(-25 ${xPos} ${yPos})`} fill={isSelected ? '#fbbf24' : '#d97706'} />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Grand Stave 2: Baritone & Bass (Bass Clef) */}
              <div className="relative bg-slate-950/70 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Baritone
                    </span>
                    <span className="text-slate-600 text-xs">/</span>
                    <span className="text-xs font-bold text-violet-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      Bass
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Bass Stave</span>
                </div>

                <svg className="w-full h-28 overflow-visible" viewBox="0 0 700 95">
                  {/* 5 Stave lines */}
                  {[18, 30, 42, 54, 66].map((y, i) => (
                    <line key={i} x1="30" y1={y} x2="690" y2={y} stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
                  ))}
                  {/* Bar lines */}
                  <line x1="30" y1="18" x2="30" y2="66" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                  <line x1="195" y1="18" x2="195" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="360" y1="18" x2="360" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="525" y1="18" x2="525" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  <line x1="690" y1="18" x2="690" y2="66" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />

                  {/* Bass Clef */}
                  <text x="36" y="55" fill="rgba(255,255,255,0.85)" fontSize="36" fontFamily="serif" fontWeight="bold">𝄢</text>
                  <text x="66" y="30" fill="#10b981" fontSize="14" fontWeight="bold">♭</text>
                  <text x="74" y="42" fill="#10b981" fontSize="14" fontWeight="bold">♭</text>
                  <text x="82" y="54" fill="#10b981" fontSize="14" fontWeight="bold">♭</text>

                  {/* Time signature */}
                  <text x="96" y="39" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="bold" fontFamily="serif">4</text>
                  <text x="96" y="61" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="bold" fontFamily="serif">4</text>

                  {/* Notes for Baritone (Emerald) */}
                  {parts.find(p => p.id === 'baritone')?.notes?.map((n, i) => {
                    const xPos = 130 + (i * 75);
                    const isSelected = selectedPartId === 'baritone';
                    const isCurrent = currentTime >= n.time && currentTime < n.time + n.duration;
                    const yPos = 42 - ((n.midi - 57) * 2.8);

                    return (
                      <g key={`b-${i}`} className="transition-all duration-300">
                        {isCurrent && (
                          <circle cx={xPos} cy={yPos} r="12" fill="#10b981" fillOpacity="0.4" className="animate-ping" />
                        )}
                        <line x1={xPos + 5} y1={yPos} x2={xPos + 5} y2={yPos - 22} stroke={isSelected ? '#10b981' : 'rgba(16,185,129,0.7)'} strokeWidth="2" />
                        <ellipse cx={xPos} cy={yPos} rx="7" ry="5" transform={`rotate(-25 ${xPos} ${yPos})`} fill={isSelected ? '#34d399' : '#059669'} />
                      </g>
                    );
                  })}

                  {/* Notes for Bass (Violet) */}
                  {parts.find(p => p.id === 'bass')?.notes?.map((n, i) => {
                    const xPos = 130 + (i * 75);
                    const isSelected = selectedPartId === 'bass';
                    const isCurrent = currentTime >= n.time && currentTime < n.time + n.duration;
                    const yPos = 60 - ((n.midi - 44) * 2.5);

                    return (
                      <g key={`bs-${i}`} className="transition-all duration-300">
                        {isCurrent && (
                          <circle cx={xPos} cy={yPos} r="12" fill="#8b5cf6" fillOpacity="0.4" className="animate-ping" />
                        )}
                        <line x1={xPos - 5} y1={yPos} x2={xPos - 5} y2={yPos + 22} stroke={isSelected ? '#8b5cf6' : 'rgba(139,92,246,0.7)'} strokeWidth="2" />
                        <ellipse cx={xPos} cy={yPos} rx="7" ry="5" transform={`rotate(-25 ${xPos} ${yPos})`} fill={isSelected ? '#a78bfa' : '#6d28d9'} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
