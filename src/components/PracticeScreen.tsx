import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  Music, 
  Video, 
  ArrowRight,
  Disc3,
  Radio,
  Activity,
  Users,
  FileText,
  Lock,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Song, VocalPart } from '../types';
import { vocalEngine } from '../audio/vocalSynthEngine';
import { ScoreViewer } from './ScoreViewer';
import { VolumePopupButton } from './VolumePopupButton';
import { 
  SheetMusicIcon, 
  LoopIcon, 
  Rewind10Icon, 
  Forward10Icon, 
  StartOverIcon 
} from './icons';

interface PracticeScreenProps {
  song: Song;
  selectedPartId: string;
  onChangeSelectedPart: (partId: string) => void;
  onBack: () => void;
  onLaunchStageMode: () => void;
}

type GridMode = 'audio' | 'video';

const normalizeKey = (key: string): string => {
  const map: Record<string, string> = {
    'C': 'C', 'C#': 'C#', 'Db': 'C#', 'D': 'D', 'D#': 'D#', 'Eb': 'D#',
    'E': 'E', 'F': 'F', 'F#': 'F#', 'Gb': 'F#', 'G': 'G', 'G#': 'G#',
    'Ab': 'G#', 'A': 'A', 'A#': 'A#', 'Bb': 'A#', 'B': 'B'
  };
  return map[key.replace(/m|maj|min/gi, '').trim()] || key;
};

const computeEffectiveKey = (baseKey: string, offset: number): string => {
  const normalized = normalizeKey(baseKey);
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const chromaticIdx = chromatic.indexOf(normalized);
  if (chromaticIdx === -1) return baseKey;

  const next = (chromaticIdx + offset) % chromatic.length;
  const wrapped = next < 0 ? next + chromatic.length : next;
  const note = chromatic[wrapped];

  const displayMap: Record<string, string> = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb'
  };

  return displayMap[note] || note;
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const PART_AVATARS: Record<string, string> = {
  tenor: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  soprano: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  lead: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  alto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  baritone: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  bass: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80'
};

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  song,
  selectedPartId,
  onChangeSelectedPart,
  onBack,
  onLaunchStageMode
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [keyOffset, setKeyOffset] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [gridMode, setGridMode] = useState<GridMode>('audio');
  const [showScoreSection, setShowScoreSection] = useState(true);

  const [masterVolume, setMasterVolume] = useState<number>(() => vocalEngine.getMasterVolume() || 0.85);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const prevMasterVolumeRef = React.useRef<number>(0.85);

  // Part state: muted & dominant (solo) per part
  const [partTileState, setPartTileState] = useState<Record<string, { muted: boolean; dominant: boolean }>>(() => {
    const initial: Record<string, { muted: boolean; dominant: boolean }> = {};
    song.parts.forEach(p => {
      initial[p.id] = {
        muted: false,
        dominant: false
      };
    });
    return initial;
  });

  const duration = song.durationSeconds || 45;
  const effectiveKey = computeEffectiveKey(song.baseKey, keyOffset);
  const selectedPart = song.parts.find(p => p.id === selectedPartId) || song.parts[0];

  const hasAnyVideo = Boolean(
    song.assetType === 'video' ||
    (song.assets.videoStems && Object.keys(song.assets.videoStems).length > 0)
  );

  useEffect(() => {
    vocalEngine.setupParts(song.parts.map(p => p.id));
    vocalEngine.setupStems(song);
    // Reset mute/solo state when song changes so all parts play in harmony
    const initial: Record<string, { muted: boolean; dominant: boolean; volume: number }> = {};
    song.parts.forEach(p => {
      initial[p.id] = {
        muted: false,
        dominant: false,
        volume: 0.85
      };
    });
    setPartTileState(initial);
  }, [song.id]);

  useEffect(() => {
    const mixStates: Record<string, { isMuted: boolean; isSolo: boolean; volume: number }> = {};
    const anyDominant = Object.values(partTileState).some((s: { muted: boolean; dominant: boolean; volume?: number }) => s.dominant);

    song.parts.forEach(p => {
      const state = partTileState[p.id] || { muted: false, dominant: false, volume: 0.85 };
      const isSolo = Boolean(state.dominant);
      const shouldMute = state.muted || (anyDominant && !isSolo);
      const userVol = typeof state.volume === 'number' ? state.volume : 0.85;
      mixStates[p.id] = {
        isMuted: shouldMute,
        isSolo,
        volume: shouldMute ? 0 : userVol
      };
    });

    const isDominant = Boolean(partTileState[selectedPartId]?.dominant);
    vocalEngine.applyMixState(selectedPartId, isDominant, mixStates);
  }, [song, partTileState, selectedPartId]);

  // Update real audio mix whenever part states change
  useEffect(() => {
    if (!isPlaying) return;
    const muteMap: Record<string, boolean> = {};
    const soloMap: Record<string, boolean> = {};
    const volumeMap: Record<string, number> = {};
    const anyDominant = Object.values(partTileState).some((s: { muted: boolean; dominant: boolean; volume?: number }) => s.dominant);

    Object.entries(partTileState).forEach(([id, st]: [string, { muted: boolean; dominant: boolean; volume?: number }]) => {
      const isSolo = Boolean(st.dominant);
      const shouldMute = st.muted || (anyDominant && !isSolo);
      const userVol = typeof st.volume === 'number' ? st.volume : 0.85;
      muteMap[id] = shouldMute;
      soloMap[id] = isSolo;
      volumeMap[id] = shouldMute ? 0 : userVol;
    });

    vocalEngine.updateMix(muteMap, soloMap, volumeMap);
  }, [partTileState, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const muteMap: Record<string, boolean> = {};
      const soloMap: Record<string, boolean> = {};
      const volumeMap: Record<string, number> = {};
      const anyDominant = Object.values(partTileState).some((s: { muted: boolean; dominant: boolean; volume?: number }) => s.dominant);

      Object.entries(partTileState).forEach(([id, st]: [string, { muted: boolean; dominant: boolean; volume?: number }]) => {
        const isSolo = Boolean(st.dominant);
        const shouldMute = st.muted || (anyDominant && !isSolo);
        const userVol = typeof st.volume === 'number' ? st.volume : 0.85;
        muteMap[id] = shouldMute;
        soloMap[id] = isSolo;
        volumeMap[id] = shouldMute ? 0 : userVol;
      });

      // Start hardware audio playback of real stems
      vocalEngine.startPlayback(song, currentTime, muteMap, soloMap, keyOffset, playbackSpeed, volumeMap);

      interval = setInterval(() => {
        const trackTime = vocalEngine.getCurrentTrackTime();
        setCurrentTime(prev => {
          const next = typeof trackTime === 'number' && trackTime > 0
            ? trackTime
            : (prev + (0.15 * playbackSpeed));
          if (next >= duration) {
            if (isLooping) {
              vocalEngine.seek(0);
              return 0;
            }
            setIsPlaying(false);
            vocalEngine.stopPlayback();
            return 0;
          }
          return next;
        });
      }, 150);
    } else {
      vocalEngine.stopPlayback();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, isLooping, duration, song, keyOffset]);

  useEffect(() => {
    return () => {
      vocalEngine.stopPlayback();
      vocalEngine.stopPitchPipeTone();
    };
  }, []);

  const handleSelectPart = (partId: string) => {
    onChangeSelectedPart(partId);
  };

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    vocalEngine.seek(0);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleRewind10 = () => {
    setCurrentTime(prev => {
      const next = Math.max(0, prev - 10);
      vocalEngine.seek(next);
      return next;
    });
  };

  const handleForward10 = () => {
    setCurrentTime(prev => {
      const next = Math.min(duration, prev + 10);
      vocalEngine.seek(next);
      return next;
    });
  };

  const handleKeyChange = (delta: number) => {
    setKeyOffset(prev => {
      const next = Math.max(-3, Math.min(3, prev + delta));
      vocalEngine.setKeyOffset(next);
      return next;
    });
  };

  const handlePlayKeyToneDown = () => {
    vocalEngine.startPitchPipeTone(effectiveKey, 0);
  };

  const handlePlayKeyToneUp = () => {
    vocalEngine.stopPitchPipeTone();
  };

  const handleSpeedToggle = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    vocalEngine.setSpeed(nextSpeed);
  };

  const handleToggleMute = (partId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPartTileState(prev => {
      const current = prev[partId] || { muted: false, dominant: false, volume: 0.85 };
      const nextMuted = !current.muted;
      return {
        ...prev,
        [partId]: {
          ...current,
          muted: nextMuted,
          dominant: nextMuted ? false : current.dominant
        }
      };
    });
  };

  const handleToggleDominant = (partId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPartTileState(prev => {
      const current = prev[partId] || { muted: false, dominant: false, volume: 0.85 };
      const nextDominant = !current.dominant;
      return {
        ...prev,
        [partId]: {
          ...current,
          dominant: nextDominant,
          muted: nextDominant ? false : current.muted
        }
      };
    });
  };

  const handleVolumeChange = (partId: string, val: number) => {
    setPartTileState(prev => {
      const current = prev[partId] || { muted: false, dominant: false, volume: 0.85 };
      return {
        ...prev,
        [partId]: {
          ...current,
          volume: Math.max(0, Math.min(1, val))
        }
      };
    });
  };

  const handleMasterVolumeChange = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setMasterVolume(clamped);
    if (clamped > 0) {
      setIsMasterMuted(false);
      prevMasterVolumeRef.current = clamped;
    }
    vocalEngine.setMasterVolume(clamped);
  };

  const handleToggleMasterMute = () => {
    if (isMasterMuted || masterVolume === 0) {
      const restore = prevMasterVolumeRef.current > 0 ? prevMasterVolumeRef.current : 0.85;
      setIsMasterMuted(false);
      setMasterVolume(restore);
      vocalEngine.setMasterVolume(restore);
    } else {
      prevMasterVolumeRef.current = masterVolume;
      setIsMasterMuted(true);
      setMasterVolume(0);
      vocalEngine.setMasterVolume(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    vocalEngine.seek(val);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 font-sans text-[#F7F1F3] selection:bg-[#2A1E2A] selection:text-[#F7F1F3]">
      
      {/* =========================================================================
          CIRCLE ENSEMBLE ARC: ACOUSTIC REHEARSAL CHAMBER
          Styled in the Catalog Dark Palette (#120B17 / #221823 / #2A1E2A / #FF5757 / #B7A1CC)
          ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-3xl border border-[rgba(255,249,247,0.08)] bg-[#221823] shadow-2xl shadow-[#120B17]/60 text-[#F7F1F3]"
        id="circle-ensemble-chamber"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-[#1C121F] border-b border-[rgba(255,249,247,0.08)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3E2843] hover:bg-[#543850] border border-[#573657]/50 text-xs font-bold text-[#EBDDE0] hover:text-[#F7F1F3] transition-all active:scale-95 cursor-pointer shadow-xs group"
              id="studio-back-catalog-btn"
            >
              <ChevronLeft className="w-4 h-4 text-[#D9AF8D] group-hover:-translate-x-0.5 transition-transform" />
              <span>Catalog</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#3E2843] border border-[#B7A1CC]/30 shadow-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#FF5757]" />
              <span className="text-[11px] font-black tracking-widest uppercase font-mono text-[#EBDDE0]">
                Trackapp Studio
              </span>
            </div>
          </div>

          {/* Quick Arranger & Voicing Badges / Header Pills */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-3 py-1 rounded-xl bg-[#B7A1CC]/15 border border-[#B7A1CC]/40 text-[#E2D6EF] font-bold uppercase shadow-xs">
              {song.voicing}
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#9EBCAB]/15 border border-[#9EBCAB]/40 text-[#D2E7DB] font-bold shadow-xs">
              {song.type === 'tag' ? 'Tag' : 'Full Track'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#D9AF8D]/15 border border-[#D9AF8D]/40 text-[#F6E1CF] font-bold font-mono shadow-xs">
              Key: {effectiveKey} Maj
            </span>
          </div>
        </div>

        {/* Chamber Stage Title & Repertoire Attribution Banner */}
        <div className="p-5 sm:p-6 border-b border-[rgba(255,249,247,0.08)] bg-[#17101D]/70">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-xl bg-[#D9A7B4]/20 text-[#F4D2DA] border border-[#D9A7B4]/40 shadow-xs">
                  ACOUSTIC VOCAL RING · {song.parts.length} VOICES
                </span>
                <span className="text-xs text-[#F6E1CF] font-mono bg-[#D9AF8D]/15 px-2.5 py-1 rounded-xl border border-[#D9AF8D]/40 shadow-xs">
                  {song.durationSeconds ? `${Math.round(song.durationSeconds)}s stem` : 'Arrangement'}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F1F3] tracking-tight font-display drop-shadow-2xs truncate">
                {song.title}
              </h1>

              <div className="text-xs sm:text-sm text-[#B9AEB6] flex flex-wrap items-center gap-x-2 gap-y-1">
                {song.arranger && (
                  <span>Arranged by <strong className="text-[#F7F1F3] font-semibold">{song.arranger.replace(/^arr\.?\s*/i, '')}</strong></span>
                )}
                {(song.performerName || song.partner?.name) && (
                  <span>· As Sung by <strong className="text-[#F7F1F3] font-semibold">{song.performerName || song.partner?.name}</strong></span>
                )}
                {song.tracksBy && (
                  <span>· Tracks by <strong className="text-[#B7A1CC]">{song.tracksBy}</strong></span>
                )}
              </div>
            </div>

            {/* Focus Voice Selector Pills with distinct soft voice part colors */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#2A1E2A] p-2 sm:p-2.5 rounded-2xl border border-[#543850]/40 shadow-sm shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D9AF8D] px-2">
                Focus Voice:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {song.parts.map(p => {
                  const isSelected = p.id === selectedPartId;
                  const partColor = p.color || (
                    p.id.toLowerCase().includes('tenor') ? '#D9A7B4' :
                    p.id.toLowerCase().includes('lead') ? '#D9AF8D' :
                    p.id.toLowerCase().includes('bari') ? '#9EBCAB' :
                    p.id.toLowerCase().includes('bass') ? '#B7A1CC' : '#D9AF8D'
                  );
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPart(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border active:scale-95 shadow-xs"
                      style={
                        isSelected
                          ? {
                              backgroundColor: partColor,
                              borderColor: partColor,
                              color: '#1C121F',
                              boxShadow: `0 4px 14px ${partColor}50`,
                              transform: 'scale(1.05)'
                            }
                          : {
                              backgroundColor: `${partColor}15`,
                              borderColor: `${partColor}40`,
                              color: '#F7F1F3'
                            }
                      }
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ 
                          backgroundColor: isSelected ? '#1C121F' : partColor,
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.4)'
                        }}
                      />
                      <span>{p.shortName || p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            ACOUSTIC VOCAL ENSEMBLE FORMATION (The Circle Arc)
            ===================================================================== */}
        <div className="p-6 sm:p-8 bg-[#221823] relative">
          
          {/* Chamber Ambient Help Pill */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3E2843] border border-[#573657]/50 text-[11px] font-mono text-[#EBDDE0] shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#D9AF8D]" />
              <span>Click any singer pod to isolate, solo, or focus that vocal track</span>
            </div>
          </div>

          {/* Singer Pods in Acoustic Arc Formation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {song.parts.map((part, idx) => {
              const tileState = partTileState[part.id] || { muted: false, dominant: false };
              const isYou = part.id === selectedPartId;
              const avatarUrl = PART_AVATARS[part.id.toLowerCase()] || PART_AVATARS[part.name.toLowerCase()] || PART_AVATARS.lead;
              const partColor = part.color || (
                part.id.toLowerCase().includes('soprano') ? '#E5989B' :
                part.id.toLowerCase().includes('alto') ? '#E0A96D' :
                part.id.toLowerCase().includes('tenor') ? '#D9A7B4' :
                part.id.toLowerCase().includes('lead') ? '#D9AF8D' :
                part.id.toLowerCase().includes('bari') ? '#9EBCAB' :
                part.id.toLowerCase().includes('bass') ? '#B7A1CC' : '#D9AF8D'
              );

              return (
                <div
                  key={part.id}
                  onClick={() => handleSelectPart(part.id)}
                  className={`group relative flex flex-col items-center text-center p-5 rounded-3xl border transition-all duration-300 cursor-pointer shadow-md select-none ${
                    isYou
                      ? 'bg-[#2A1E2A] scale-[1.03] shadow-xl text-[#F7F1F3]'
                      : tileState.muted
                      ? 'bg-[#1C121F]/60 border-[rgba(255,249,247,0.05)] opacity-55 text-[#B9AEB6]'
                      : 'bg-[#1C121F] hover:bg-[#2A1E2A] border-[rgba(255,249,247,0.08)] hover:border-[rgba(255,249,247,0.18)] hover:scale-[1.01] text-[#F7F1F3]'
                  }`}
                  style={isYou ? {
                    borderColor: partColor,
                    boxShadow: `0 8px 24px ${partColor}25, 0 0 0 3px ${partColor}30`
                  } : undefined}
                  id={`ensemble-singer-${part.id}`}
                >
                  {/* Top Badge: Voice Channel & Voice Range */}
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#B9AEB6] mb-3 px-1">
                    <span 
                      className="px-2.5 py-0.5 rounded-lg font-bold uppercase shadow-2xs"
                      style={{
                        backgroundColor: `${partColor}25`,
                        color: partColor,
                        border: `1px solid ${partColor}50`
                      }}
                    >
                      {part.shortName || part.name}
                    </span>
                    <span className="text-[#EBDDE0] font-medium">{part.range || `Voice ${idx + 1}`}</span>
                  </div>

                  {/* Circular Avatar with Active Dynamic Vocal Resonance Ring */}
                  <div className="relative my-2">
                    {isPlaying && !tileState.muted && (
                      <div 
                        className="absolute -inset-2.5 rounded-full animate-ping opacity-35"
                        style={{ backgroundColor: partColor }}
                      />
                    )}

                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden p-1 shadow-md bg-[#120B17] border-2"
                      style={{ borderColor: isYou ? partColor : `${partColor}80` }}
                    >
                      <img
                        src={avatarUrl}
                        alt={part.name}
                        className={`w-full h-full rounded-full object-cover transition-transform duration-500 ${
                          isPlaying && !tileState.muted ? 'scale-105 brightness-105' : 'brightness-95'
                        }`}
                      />
                    </div>

                    {isYou && (
                      <span 
                        className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono shadow-md border"
                        style={{
                          backgroundColor: partColor,
                          color: '#1C121F',
                          borderColor: 'rgba(255,255,255,0.4)'
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Part Title & Harmonic Status */}
                  <div className="mt-2 mb-3">
                    <h3 className="text-base sm:text-lg font-black text-[#F7F1F3] tracking-tight font-display">
                      {part.name}
                    </h3>
                    <p className="text-[11px] font-mono" style={{ color: tileState.muted ? '#B9AEB6' : partColor }}>
                      {tileState.muted ? 'Muted' : tileState.dominant ? 'Solo Focus' : isPlaying ? 'Resonating' : 'Standby'}
                    </p>
                  </div>

                  {/* Mini Real-Time Acoustic VU Meter */}
                  <div className="w-full h-8 px-3 py-1 rounded-xl bg-[#120B17] border border-[rgba(255,249,247,0.08)] flex items-end justify-center gap-1 mb-2.5">
                    {Array.from({ length: 8 }).map((_, barIdx) => {
                      const barSeed = ((barIdx * 37 + idx * 23) % 55) + 20;
                      const userVol = typeof tileState.volume === 'number' ? tileState.volume : 0.85;
                      const dynamicHeight = isPlaying && !tileState.muted
                        ? `${Math.max(15, (barSeed + Math.sin((currentTime * 4.5) + barIdx) * 35 * userVol))}%`
                        : '12%';

                      return (
                        <div
                          key={barIdx}
                          className="flex-1 rounded-xs transition-all duration-150"
                          style={{
                            height: dynamicHeight,
                            backgroundColor: tileState.muted ? '#4A3B4D' : partColor,
                            opacity: isPlaying && !tileState.muted ? 1 : 0.4
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Volume Slider for Part Channel */}
                  <div className="w-full mb-2" onClick={(e) => e.stopPropagation()}>
                    <div 
                      className="flex items-center gap-2 bg-[#1C121F] px-2.5 py-1.5 rounded-xl border shadow-xs"
                      style={{ borderColor: `${partColor}30` }}
                    >
                      <button
                        type="button"
                        onClick={() => handleVolumeChange(part.id, (tileState.volume ?? 0.85) > 0 ? 0 : 0.85)}
                        className="transition-colors cursor-pointer shrink-0"
                        title={(tileState.volume ?? 0.85) === 0 ? 'Restore volume' : 'Zero volume'}
                      >
                        {tileState.muted || (tileState.volume ?? 0.85) === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" style={{ color: partColor }} />
                        )}
                      </button>
                      {(() => {
                        const volVal = tileState.volume ?? 0.85;
                        const volPercent = Math.round(volVal * 100);
                        return (
                          <>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volVal}
                              disabled={tileState.muted}
                              onChange={(e) => handleVolumeChange(part.id, parseFloat(e.target.value))}
                              className="w-full h-1.5 rounded-full cursor-pointer transition-all disabled:opacity-40 appearance-none shadow-inner"
                              style={{ 
                                accentColor: partColor,
                                background: `linear-gradient(to right, ${partColor} 0%, ${partColor} ${volPercent}%, #38243A ${volPercent}%, #38243A 100%)`
                              }}
                              title={`${part.name} volume: ${volPercent}%`}
                            />
                            <span 
                              className="text-[10px] font-mono font-bold w-7 text-right tabular-nums"
                              style={{ color: partColor }}
                            >
                              {volPercent}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Tactile Control Switches: Mute & Solo */}
                  <div className="flex items-center gap-2 w-full pt-1.5 border-t border-[rgba(255,249,247,0.08)]" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleMute(part.id, e)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer shadow-xs ${
                        tileState.muted
                          ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-xs font-black'
                          : 'bg-[#3E2843] hover:bg-[#543850] border-[#573657]/50 text-[#EBDDE0] hover:text-[#F7F1F3]'
                      }`}
                      title={`Toggle mute for ${part.name}`}
                    >
                      {tileState.muted ? 'MUTED' : 'MUTE'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleDominant(part.id, e)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer shadow-xs"
                      style={
                        tileState.dominant
                          ? {
                              backgroundColor: partColor,
                              borderColor: partColor,
                              color: '#1C121F',
                              boxShadow: `0 2px 8px ${partColor}40`
                            }
                          : {
                              backgroundColor: '#3E2843',
                              borderColor: 'rgba(87, 54, 87, 0.5)',
                              color: '#EBDDE0'
                            }
                      }
                      title={tileState.dominant ? 'Turn off solo' : `Solo ${part.name} (supports multiple solos)`}
                    >
                      {tileState.dominant ? 'SOLO ON' : 'SOLO'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* =========================================================================
          SYNCHRONIZED SHEET MUSIC / SCORE SECTION
          Styled in Catalog Dark Scheme (#221823 / #1C121F)
          ========================================================================= */}
      <div 
        className="rounded-3xl border border-[rgba(255,249,247,0.08)] bg-[#221823] p-5 sm:p-6 shadow-xl space-y-4 text-[#F7F1F3]"
        id="studio-score-container"
      >
        <div className="flex items-center justify-between border-b border-[rgba(255,249,247,0.08)] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D9AF8D]" />
            <h2 className="text-sm sm:text-base font-bold text-[#F7F1F3] uppercase font-mono tracking-wider">
              Synchronized Sheet Music & Score
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#D9AF8D] bg-[#3E2843] px-3 py-1 rounded-xl border border-[#573657]/40 shadow-xs">
              {selectedPart.name} Stave · Concert {effectiveKey}
            </span>
            <button
              type="button"
              onClick={() => setShowScoreSection(prev => !prev)}
              className="text-xs font-bold text-[#FF5757] hover:underline cursor-pointer"
            >
              {showScoreSection ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {showScoreSection && (
          <ScoreViewer
            song={song}
            selectedPartId={selectedPartId}
            currentTime={currentTime}
            duration={duration}
            keyOffset={keyOffset}
            effectiveKey={effectiveKey}
          />
        )}
      </div>

      {/* =========================================================================
          HIGH-PRECISION DOCKED TRANSPORT DECK
          Styled in Catalog Dark Scheme #221823 with #FF5757 Master Play button
          ========================================================================= */}
      <div 
        className="sticky bottom-4 z-30 rounded-3xl border border-[#543850]/40 bg-[#221823]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-[#120B17]/90 ring-1 ring-white/5 transition-all text-[#F7F1F3]"
        id="studio-transport-deck"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Pitch Transposition & Starting Pitch Pipe Tone */}
          <div className="flex items-center gap-2 text-[#F7F1F3]">
            <div className="inline-flex items-center overflow-hidden rounded-2xl bg-[#2A1E2A] border border-[#543850]/50 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => handleKeyChange(-1)}
                className="flex h-9 w-9 items-center justify-center border-r border-[#543850]/50 hover:bg-[#3E2843] active:scale-95 transition-colors cursor-pointer text-[#EBDDE0]"
                title="Lower key (-1 semitone)"
                id="studio-key-lower-btn"
              >
                <span className="text-base font-bold font-mono">–</span>
              </button>

              <button
                type="button"
                onMouseDown={handlePlayKeyToneDown}
                onMouseUp={handlePlayKeyToneUp}
                onMouseLeave={handlePlayKeyToneUp}
                onTouchStart={handlePlayKeyToneDown}
                onTouchEnd={handlePlayKeyToneUp}
                className="flex items-center justify-center px-3.5 h-9 text-xs font-semibold hover:bg-[#3E2843] transition-colors cursor-pointer select-none group"
                title="Click & hold to blow starting pitch pipe tone"
                id="studio-key-pitch-btn"
              >
                <span className="font-mono font-extrabold text-[#D9AF8D]">
                  {effectiveKey}
                </span>
                {keyOffset !== 0 && (
                  <span className="ml-1 text-[10px] font-mono text-[#B7A1CC] font-normal">
                    {keyOffset > 0 ? `+${keyOffset}` : keyOffset}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleKeyChange(1)}
                className="flex h-9 w-9 items-center justify-center border-l border-[#543850]/50 hover:bg-[#3E2843] active:scale-95 transition-colors cursor-pointer text-[#EBDDE0]"
                title="Raise key (+1 semitone)"
                id="studio-key-raise-btn"
              >
                <span className="text-base font-bold font-mono">+</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2A1E2A] hover:bg-[#3E2843] border border-[#543850]/40 text-[#EBDDE0] hover:text-[#F7F1F3] active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Start over from beginning"
              id="studio-restart-btn"
            >
              <StartOverIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Center Transport Controls: Volume Popover, -10s, Master #FF5757 Play/Pause, +10s */}
          <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
            {/* Master Volume Speaker Popover Button (Left of -10s button) */}
            <VolumePopupButton
              volume={masterVolume}
              isMuted={isMasterMuted}
              onVolumeChange={handleMasterVolumeChange}
              onToggleMute={handleToggleMasterMute}
              idPrefix="practice-playback-volume"
            />

            <button
              type="button"
              onClick={handleRewind10}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2A1E2A] hover:bg-[#3E2843] border border-[#543850]/40 text-[#EBDDE0] hover:text-[#F7F1F3] active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Rewind 10 seconds"
              id="studio-rewind-10-btn"
            >
              <Rewind10Icon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#FF5757] hover:bg-[#ff4040] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF5757]/30 cursor-pointer border-2 border-red-300/30 shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
              id="studio-master-play-btn"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current text-white" />
              ) : (
                <Play className="w-5 h-5 fill-current text-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleForward10}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2A1E2A] hover:bg-[#3E2843] border border-[#543850]/40 text-[#EBDDE0] hover:text-[#F7F1F3] active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Forward 10 seconds"
              id="studio-forward-10-btn"
            >
              <Forward10Icon className="h-4 w-4" />
            </button>
          </div>

          {/* Right Transport Utilities: Loop, Speed, Score Toggle */}
          <div className="flex items-center gap-2 text-[#F7F1F3]">
            <button
              type="button"
              onClick={() => setIsLooping(prev => !prev)}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                isLooping
                  ? 'bg-[#9EBCAB] border-[#9EBCAB] text-[#1C121F] shadow-md font-bold'
                  : 'bg-[#2A1E2A] border-[#543850]/40 text-[#D2E7DB] hover:text-[#F7F1F3] hover:bg-[#3E2843]'
              }`}
              title={isLooping ? 'Loop mode active' : 'Enable section loop'}
              id="studio-loop-btn"
            >
              <LoopIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSpeedToggle}
              className="h-9 px-3 rounded-2xl bg-[#3E2843] hover:bg-[#543850] border border-[#B7A1CC]/30 text-xs font-mono font-bold text-[#E2D6EF] hover:text-[#F7F1F3] active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Cycle playback speed"
              id="studio-speed-btn"
            >
              {playbackSpeed.toFixed(1)}x
            </button>

            <button
              type="button"
              onClick={() => setShowScoreSection(prev => !prev)}
              className={`flex h-9 items-center gap-1.5 px-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                showScoreSection
                  ? 'bg-[#B7A1CC] border-[#B7A1CC] text-[#1C121F] font-bold shadow-md'
                  : 'bg-[#2A1E2A] border-[#543850]/40 text-[#E2D6EF] hover:text-[#F7F1F3] hover:bg-[#3E2843]'
              }`}
              title="Toggle Sheet Music Chart"
              id="studio-score-btn"
            >
              <SheetMusicIcon className="h-4 w-4 text-current" />
              <span className="text-xs font-semibold hidden sm:inline">Score</span>
            </button>
          </div>
        </div>

        {/* High-Precision Timeline Scrubber with soft 4-voice harmonic gradient slider track */}
        <div className="mt-3.5 space-y-1.5">
          {(() => {
            const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
            return (
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer hover:brightness-110 transition-all shadow-inner border border-[#543850]/40"
                  style={{
                    accentColor: '#D9AF8D',
                    background: progressPercent <= 0
                      ? '#38243A'
                      : `linear-gradient(to right, #D9A7B4 0%, #D9AF8D ${(progressPercent * 0.33).toFixed(1)}%, #9EBCAB ${(progressPercent * 0.66).toFixed(1)}%, #B7A1CC ${progressPercent.toFixed(1)}%, #38243A ${progressPercent.toFixed(1)}%, #38243A 100%)`
                  }}
                  aria-label="Studio playback timeline"
                />
              </div>
            );
          })()}
          <div className="flex justify-between text-[11px] font-mono px-0.5">
            <span className="font-bold text-[#F6E1CF] bg-[#3E2843] px-2.5 py-0.5 rounded-lg border border-[#D9AF8D]/30 shadow-xs">
              {formatDuration(currentTime)}
            </span>
            <span className="font-medium text-[#E2D6EF] bg-[#2A1E2A] px-2.5 py-0.5 rounded-lg border border-[#B7A1CC]/30 shadow-xs">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PERFORMANCE READY CTA: LAUNCH STAGE MODE
          ========================================================================= */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLaunchStageMode}
          className="w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-[rgba(255,249,247,0.08)] bg-[#221823] hover:bg-[#2A1E2A] shadow-xl transition-all active:scale-[0.99] cursor-pointer group text-[#F7F1F3]"
          id="studio-launch-stage-btn"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#1C121F] border border-[rgba(255,249,247,0.08)] text-[#FF5757] group-hover:scale-110 transition-transform">
              <Disc3 className="w-6 h-6 animate-spin-slow text-[#FF5757]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-xl bg-[#543850] text-[#F7F1F3] border border-[#B7A1CC]/40 shadow-xs">
                  NEXT STAGE
                </span>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-display text-[#F7F1F3]">
                  Ready to perform on stage?
                </h3>
              </div>
              <p className="text-xs text-[#B9AEB6] mt-0.5">
                Launch Stage Mode to record your performance take or rehearse live with real-time pitch feedback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] text-white group-hover:translate-x-1 transition-transform shrink-0 shadow-md shadow-[#FF5757]/30 border border-red-400/30">
            <span>Perform on Stage</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

    </div>
  );
};
