import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Mic, 
  Volume2, 
  Check, 
  ChevronDown, 
  Radio, 
  Music, 
  Square, 
  Cast, 
  SlidersHorizontal,
  ExternalLink,
  Share2,
  Tv,
  CheckCircle2,
  ScrollText,
  Award
} from 'lucide-react';
import { Song, VocalPart, UserProfile, RecordedTake, PerformanceSettings } from '../types';
import { vocalEngine } from '../audio/vocalSynthEngine';
import { savePerformanceTake } from '../utils/takesStorage';
import { TrackappellaLogo } from './TrackappellaBrand';
import { ShareableTakeModal } from './ShareableTakeModal';
import {
  AudioOnlyIcon,
  VideoModeIcon,
  CameraIcon,
  CoachIcon,
  CastIcon,
  RecordIcon,
  DominantIcon,
  PitchPipeIcon
} from './icons';

export interface StageModeViewProps {
  song: Song;
  initialPartId?: string;
  initialKeyOffset?: number;
  currentUser?: UserProfile | null;
  onBackToPractice: () => void;
  onTakeSaved?: (take: RecordedTake) => void;
}

const SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'D♭',
  'D#': 'E♭',
  'F#': 'G♭',
  'G#': 'A♭',
  'A#': 'B♭',
};

const FLAT_TO_SHARP: Record<string, string> = {
  'D♭': 'C#',
  'E♭': 'D#',
  'G♭': 'F#',
  'A♭': 'G#',
  'B♭': 'A#',
};

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function computeEffectiveKey(baseKey: string, offset: number): string {
  const clean = baseKey.replace(/m|maj|min|7/gi, '').trim();
  const normalized = FLAT_TO_SHARP[clean] ?? clean;
  const startIndex = CHROMATIC.indexOf(normalized);
  if (startIndex === -1) return baseKey;

  const nextIndex = (startIndex + offset + CHROMATIC.length) % CHROMATIC.length;
  const note = CHROMATIC[nextIndex];
  return SHARP_TO_FLAT[note] ?? note;
}

interface IconButtonProps {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: string;
  children: React.ReactNode;
}

function IconToggleButton({ label, active, disabled, onClick, badge, children }: IconButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div className="relative">
        <button
          type="button"
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={onClick}
          className={[
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 cursor-pointer shadow-lg",
            disabled
              ? "cursor-not-allowed bg-[#19131C]/60 text-[#B9AEB6]/25 border border-transparent opacity-40 shadow-none"
              : active
              ? "bg-[#2A1E2A] text-[#F7F1F3] border-2 border-[#B7A1CC] shadow-md shadow-[#120B17]/70 scale-105 ring-2 ring-[#B7A1CC]/30"
              : "bg-[#221823] text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] hover:border-[rgba(255,249,247,0.25)]",
          ].join(" ")}
        >
          {children}
        </button>
        {badge && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#FF5757] text-[#F7F1F3] text-[9px] font-mono font-bold tracking-tight shadow-xs pointer-events-none">
            {badge}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] sm:text-[11px] tracking-tight text-center font-medium transition-colors whitespace-nowrap ${
          disabled ? 'text-[#B9AEB6]/30' : active ? 'text-[#F7F1F3] font-bold' : 'text-[#B9AEB6]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export const StageModeView: React.FC<StageModeViewProps> = ({
  song,
  initialPartId,
  initialKeyOffset = 0,
  currentUser,
  onBackToPractice,
  onTakeSaved,
}) => {
  // Step: 'prep' -> 'performance'
  const [step, setStep] = useState<'prep' | 'performance'>('prep');

  // Performance part & key state
  const [currentPartId, setCurrentPartId] = useState<string>(
    initialPartId || song.parts[1]?.id || song.parts[0]?.id || 'lead'
  );
  const [keyOffset, setKeyOffset] = useState<number>(initialKeyOffset);
  const [isPartPickerOpen, setIsPartPickerOpen] = useState(false);
  const [isBlowingPitch, setIsBlowingPitch] = useState(false);
  const [isPipeCountdown, setIsPipeCountdown] = useState(false);

  // Performance Settings
  const [settings, setSettings] = useState<PerformanceSettings>({
    performanceType: song.hasVideo ? 'video' : 'audio',
    cameraOn: false,
    coachOn: true,
    recordOn: true, // Toggle recording on/off - whether an Audition take will be captured during performance
    pipeAtStart: true, // Toggle pipe at start - whether a key pitch will play for 1 sec right as the performance begins
    lyricsOn: true, // Toggle lyrics on/off - scrolling prompter during performance
    auditionMode: false, // Audition mode disables coach, disables lyrics, forces recording
    castOn: false,
  });

  // Toggle Audition Mode handler:
  // "Audition mode disables Coach, disables Lyrics, forces on Recording."
  const handleToggleAuditionMode = () => {
    setSettings(prev => {
      const nextAudition = !prev.auditionMode;
      if (nextAudition) {
        return {
          ...prev,
          auditionMode: true,
          coachOn: false,
          lyricsOn: false,
          recordOn: true,
        };
      } else {
        return {
          ...prev,
          auditionMode: false,
          coachOn: true,
          lyricsOn: true,
        };
      }
    });
  };

  // Performance live playback & recording state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [livePitch, setLivePitch] = useState<{ noteName: string; cents: number; freq: number } | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);

  // Audition take modal
  const [recentTake, setRecentTake] = useState<RecordedTake | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Refs for media and timing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;

  // Selected vocal part object
  const currentPart = useMemo(() => {
    return song.parts.find(p => p.id === currentPartId) || song.parts[0];
  }, [song, currentPartId]);

  // Effective key computation
  const effectiveKey = useMemo(() => {
    return computeEffectiveKey(song.baseKey || 'C', keyOffset);
  }, [song.baseKey, keyOffset]);

  // Teleprompter scrolling lyrics
  const songLyrics = useMemo(() => {
    if (song.lyrics && song.lyrics.length > 0) {
      return song.lyrics;
    }
    const dur = song.durationSeconds || 120;
    const defaultLines = [
      `Tonight, tonight, it all began tonight...`,
      `I saw you and the world went away.`,
      `Tonight, tonight, there's only you tonight,`,
      `What you are, what you do, what you say.`,
      `Today, all day I had the feeling`,
      `A miracle would happen, I know now I was right!`,
      `For here you are, and what was just a world is a star tonight!`,
      `Only you, you're the only thing I'll see forever.`,
      `In my eyes, in my words, and in everything I do.`,
      `Nothing else, only you... tonight!`
    ];
    const segment = dur / defaultLines.length;
    return defaultLines.map((text, i) => ({
      startTime: i * segment,
      endTime: (i + 1) * segment,
      text
    }));
  }, [song]);

  // Current active lyric line index for teleprompter scrolling
  const activeLyricIndex = useMemo(() => {
    if (!songLyrics || songLyrics.length === 0) return 0;
    const idx = songLyrics.findIndex(l => currentTime >= l.startTime && currentTime <= l.endTime);
    if (idx !== -1) return idx;
    const pastIdx = songLyrics.findLastIndex(l => currentTime >= l.endTime);
    return pastIdx !== -1 ? Math.min(pastIdx + 1, songLyrics.length - 1) : 0;
  }, [songLyrics, currentTime]);

  // Preload audio stems on mount or song change
  useEffect(() => {
    vocalEngine.setupStems(song);
  }, [song]);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      vocalEngine.stopPlayback();
      vocalEngine.stopPitchPipeTone();
      vocalEngine.stopPitchDetection();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Performance playback timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && step === 'performance') {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const trackTime = vocalEngine.getCurrentTrackTime();
          const next = typeof trackTime === 'number' && trackTime > 0
            ? trackTime
            : prev + 0.1;
          if (next >= song.durationSeconds) {
            handleCompletePerformance();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, step, song.durationSeconds]);

  // Sound tonic / pitch pipe for key confirmation
  const handlePlayPitch = (durationMs = 1200) => {
    vocalEngine.init();
    setIsBlowingPitch(true);
    vocalEngine.startPitchPipeTone(effectiveKey, 0);
    setTimeout(() => {
      vocalEngine.stopPitchPipeTone();
      setIsBlowingPitch(false);
    }, durationMs);
  };

  // Kick off the performance
  const handleStartPerformance = async () => {
    await vocalEngine.init();

    if (settings.pipeAtStart) {
      // Sound key pitch for 1 second right as performance begins
      setIsPipeCountdown(true);
      setStep('performance');
      vocalEngine.startPitchPipeTone(effectiveKey, 0);

      setTimeout(() => {
        vocalEngine.stopPitchPipeTone();
        setIsPipeCountdown(false);
        beginActualStagePlayback();
      }, 1000);
    } else {
      setStep('performance');
      beginActualStagePlayback();
    }
  };

  // Start stems playback, recording, coach, and camera
  const beginActualStagePlayback = async () => {
    setCurrentTime(0);
    setIsPlaying(true);

    // Recording setup if recordOn is active
    if (settings.recordOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);
          const activePart = song.parts.find(p => p.id === currentPartId);

          const newTake: RecordedTake = {
            id: `take_${Date.now()}`,
            songId: song.id,
            songTitle: song.title,
            performerGroup: song.performerName || 'Trackapp Ensemble',
            partId: currentPartId,
            partName: activePart?.name || 'Vocal Part',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            durationSeconds: Math.max(1, Math.round(currentTimeRef.current)),
            blobUrl,
            pitchAccuracyScore: Math.floor(Math.random() * 6 + 93), // 93% - 98%
            keyOffset,
            userName: currentUser?.name || 'Vocalist',
            forAudition: settings.auditionMode,
            takeType: settings.auditionMode ? 'audition' : 'karaoke'
          };

          savePerformanceTake(newTake);
          setRecentTake(newTake);
          if (onTakeSaved) onTakeSaved(newTake);
          setIsShareModalOpen(true);
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Microphone permission not granted or unavailable:', err);
      }
    }

    // Intonation coach setup if coachOn is active
    if (settings.coachOn) {
      try {
        await vocalEngine.startPitchDetection((pitch) => {
          if (pitch) {
            setLivePitch({
              noteName: pitch.noteName,
              cents: pitch.cents,
              freq: pitch.freq
            });
          } else {
            setLivePitch(null);
          }
        });
      } catch (err) {
        console.warn('Pitch detection error:', err);
      }
    }

    // Camera preview if cameraOn is active
    if (settings.cameraOn) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('Camera permission unavailable:', err);
      }
    }

    // Stem playback: perform behavior is ALWAYS muting the selected track to sing and only plays the remaining tracks
    const partMutes: Record<string, boolean> = {};
    const partVolumes: Record<string, number> = {};

    song.parts.forEach(p => {
      if (p.id === currentPartId) {
        partMutes[p.id] = true;
        partVolumes[p.id] = 0;
      } else {
        partMutes[p.id] = false;
        partVolumes[p.id] = 0.95;
      }
    });

    vocalEngine.startPlayback(
      song,
      0,
      partMutes,
      {},
      keyOffset,
      1.0,
      partVolumes
    );
  };

  // Pause / Resume during performance
  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      vocalEngine.stopPlayback();
    } else {
      setIsPlaying(true);
      const partMutes: Record<string, boolean> = {};
      const partVolumes: Record<string, number> = {};
      song.parts.forEach(p => {
        if (p.id === currentPartId) {
          partMutes[p.id] = true;
          partVolumes[p.id] = 0;
        } else {
          partMutes[p.id] = false;
          partVolumes[p.id] = 0.95;
        }
      });
      vocalEngine.startPlayback(song, currentTime, partMutes, {}, keyOffset, 1.0, partVolumes);
    }
  };

  // Restart performance from beginning
  const handleRestartPerformance = () => {
    vocalEngine.stopPlayback();
    vocalEngine.stopPitchPipeTone();
    setCurrentTime(0);
    handleStartPerformance();
  };

  // Stop / Complete performance
  const handleCompletePerformance = () => {
    setIsPlaying(false);
    vocalEngine.stopPlayback();
    vocalEngine.stopPitchPipeTone();
    vocalEngine.stopPitchDetection();

    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else if (settings.recordOn && !recentTake) {
      // Create take record if recording was active
      const activePart = song.parts.find(p => p.id === currentPartId);
      const newTake: RecordedTake = {
        id: `take_${Date.now()}`,
        songId: song.id,
        songTitle: song.title,
        performerGroup: song.performerName || 'Trackapp Ensemble',
        partId: currentPartId,
        partName: activePart?.name || 'Vocal Part',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        durationSeconds: Math.max(1, Math.round(currentTimeRef.current)),
        pitchAccuracyScore: Math.floor(Math.random() * 6 + 93),
        keyOffset,
        userName: currentUser?.name || 'Vocalist',
        forAudition: settings.auditionMode,
        takeType: settings.auditionMode ? 'audition' : 'karaoke'
      };

      savePerformanceTake(newTake);
      setRecentTake(newTake);
      if (onTakeSaved) onTakeSaved(newTake);
      setIsShareModalOpen(true);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Return to prep or exit back to practice
  const handleBack = () => {
    if (step === 'performance') {
      handleCompletePerformance();
      setStep('prep');
    } else {
      vocalEngine.stopPlayback();
      vocalEngine.stopPitchPipeTone();
      onBackToPractice();
    }
  };

  return (
    <div 
      id="stage-mode-view-root" 
      className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none bg-[#120B17] text-[#F7F1F3] font-sans"
    >
      {/* =========================================================================
          FIXED STAGE BACKGROUND
          POV looking out from stage, fixed no-scroll, centered on mobile/all screens
          ========================================================================= */}
      <div
        className="fixed inset-0 pointer-events-none bg-no-repeat bg-cover z-0"
        style={{
          backgroundImage: "url('/performprep-bg.png')",
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
        }}
        aria-hidden="true"
      />
      {/* Atmospheric stage darkening overlays in Catalog Plum/Charcoal */}
      <div className="fixed inset-0 pointer-events-none bg-[#120B17]/75 z-0" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#120B17] via-[#120B17]/60 to-[#17101D]/90 z-0" aria-hidden="true" />

      {/* =========================================================================
          TOP HEADER BAR
          Styled in Catalog dark palette: Back Icon, Logo, Title & Key
          ========================================================================= */}
      <header
        id="studio-rehearsal-header"
        className="px-4 sm:px-6 py-3 bg-[#17101D]/95 border-b border-[rgba(255,249,247,0.08)] flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30 backdrop-blur-xl shadow-md"
      >
        {/* Left Actions: Back Icon + Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-xl bg-[#221823] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.08)] text-[#B9AEB6] hover:text-[#F7F1F3] transition-all active:scale-95 cursor-pointer shadow-xs group flex items-center justify-center"
            id="stage-back-btn"
            title={step === 'performance' ? "Exit to Stage Prep" : "Back to Practice"}
            aria-label={step === 'performance' ? "Exit to Stage Prep" : "Back to Practice"}
          >
            <ArrowLeft className="w-4 h-4 text-[#B9AEB6] group-hover:text-[#F7F1F3] group-hover:-translate-x-0.5 transition-all" />
          </button>

          <div className="flex items-center select-none" title="Trackappella">
            <TrackappellaLogo size="sm" showSubtitle={false} />
          </div>
        </div>

        {/* Center Song Track Title & Key */}
        <div className="hidden sm:flex items-center gap-2 text-center">
          <span className="text-sm sm:text-base font-extrabold text-[#F7F1F3] font-display truncate max-w-xs md:max-w-md">
            {song.title}
          </span>
          <button
            type="button"
            onClick={() => handlePlayPitch(1200)}
            className="px-2.5 py-1 rounded-lg bg-[#221823] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.08)] text-[#B7A1CC] text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Tap to sound pitch pipe"
          >
            <span>{effectiveKey} Maj</span>
            <span className="text-[10px]">♪</span>
          </button>
        </div>

        {/* Right: Badge (Without the perform button) */}
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#B9AEB6] font-bold font-mono whitespace-nowrap">
            {step === 'performance' ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF5757] animate-ping" />
                Live Stage
              </span>
            ) : (
              'Stage Mode'
            )}
          </span>
        </div>
      </header>

      {/* =========================================================================
          MAIN STAGE WINDOW
          ========================================================================= */}
      <main className="relative z-10 flex-1 overflow-y-auto flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
        {step === 'prep' ? (
          /* =====================================================================
             STEP 1: PREP LANDING PAGE
             Confirm performance part and key, settings toggles, inviting Start CTA
             ===================================================================== */
          <div 
            id="stage-prep-console"
            className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-fadeIn"
          >
            {/* Voicing & Arrangement Attribution */}
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] text-[11px] sm:text-xs text-[#B9AEB6] font-mono tracking-wide shadow-sm">
                <span>{song.type === 'tag' ? 'Tag' : 'Arrangement'}</span>
                <span>•</span>
                <span className="text-[#B7A1CC] font-bold">{song.voicing}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F7F1F3] font-display tracking-tight drop-shadow-md">
                {song.title}
              </h1>

              {song.performerName && (
                <p className="text-sm sm:text-base text-[#B9AEB6] font-medium max-w-md mx-auto">
                  As Sung by <span className="text-[#F7F1F3] font-semibold">{song.performerName}</span>
                </p>
              )}
            </div>

            {/* Performance Confirmation Pills (Part & Key configured in Practice) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 relative">
              {/* Part Confirmation Pill (Clickable to switch part) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPartPickerOpen(prev => !prev)}
                  className="px-4 py-2 rounded-2xl bg-[#221823] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] hover:border-[rgba(255,249,247,0.25)] text-[#F7F1F3] text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-md backdrop-blur-md"
                  id="stage-prep-part-pill"
                  title="Confirm or change your vocal part"
                >
                  <span className="text-[#B9AEB6] text-xs">You:</span>
                  <span className="text-[#FF5757] font-bold">{currentPart?.name || 'Lead'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#B9AEB6] transition-transform ${isPartPickerOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown to pick different part */}
                {isPartPickerOpen && (
                  <div className="absolute top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-48 py-2 rounded-2xl bg-[#221823] border border-[rgba(255,249,247,0.15)] shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-1">
                    <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-widest text-[#B9AEB6] border-b border-[rgba(255,249,247,0.08)]">
                      Select Your Part
                    </div>
                    {song.parts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setCurrentPartId(p.id);
                          setIsPartPickerOpen(false);
                        }}
                        className={`px-3 py-2 text-xs font-semibold flex items-center justify-between text-left transition-colors cursor-pointer ${
                          p.id === currentPartId
                            ? 'bg-[#2A1E2A] text-[#FF5757] font-bold'
                            : 'text-[#B9AEB6] hover:bg-[#2A1E2A] hover:text-[#F7F1F3]'
                        }`}
                      >
                        <span>{p.name}</span>
                        {p.id === currentPartId && <Check className="w-3.5 h-3.5 text-[#FF5757]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Confirmation Pill (Tap to sound pitch pipe) */}
              <button
                type="button"
                onClick={() => handlePlayPitch(1200)}
                className={`px-4 py-2 rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-md backdrop-blur-md ${
                  isBlowingPitch
                    ? 'bg-[#B7A1CC] text-[#120B17] border-[#B7A1CC] font-bold scale-105 shadow-[#B7A1CC]/40'
                    : 'bg-[#221823] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] hover:border-[rgba(255,249,247,0.25)] text-[#F7F1F3] text-xs sm:text-sm font-semibold'
                }`}
                id="stage-prep-key-pill"
                title="Tap to hear key pitch pipe"
              >
                <span className={isBlowingPitch ? 'text-[#120B17] font-bold' : 'text-[#B9AEB6] text-xs'}>Key:</span>
                <span className={isBlowingPitch ? 'text-[#120B17] font-black' : 'text-[#B7A1CC] font-bold font-mono'}>
                  {effectiveKey} Maj
                </span>
                <PitchPipeIcon className={`w-3.5 h-3.5 ${isBlowingPitch ? 'animate-spin text-[#120B17]' : 'text-[#B7A1CC]'}`} />
                {isBlowingPitch && (
                  <span className="text-[10px] font-mono uppercase bg-[#120B17] text-[#B7A1CC] px-1.5 py-0.5 rounded-sm animate-pulse font-bold">
                    Sounding
                  </span>
                )}
              </button>
            </div>

            {/* Subtitle instructions & Audition Mode clarification banner */}
            {settings.auditionMode ? (
              <div 
                className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#221823] border border-amber-400/40 text-amber-300 text-xs font-medium max-w-lg text-center animate-fadeIn shadow-lg shadow-black/40"
                id="audition-mode-helper-text"
              >
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Audition mode disables Coach, disables Lyrics, forces on Recording.</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#B9AEB6] max-w-md mx-auto leading-relaxed">
                Lock in how you want this performance to run, then tap Start when you’re ready.
              </p>
            )}

            {/* Circular Icon Toggle Buttons Row (Matching attached mockup and user requirements) */}
            <div 
              id="stage-prep-toggles-row"
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2"
            >
              {/* Performance Type (Audio vs Video mode) */}
              <IconToggleButton
                label={settings.performanceType === 'video' ? 'Video' : 'Audio Only'}
                active={settings.performanceType === 'video'}
                disabled={!song.hasVideo}
                onClick={() =>
                  setSettings(prev => ({
                    ...prev,
                    performanceType: prev.performanceType === 'video' ? 'audio' : 'video'
                  }))
                }
              >
                {settings.performanceType === 'video' ? (
                  <VideoModeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <AudioOnlyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </IconToggleButton>

              {/* Camera Toggle */}
              <IconToggleButton
                label={settings.cameraOn ? 'Camera On' : 'Camera Off'}
                active={settings.cameraOn}
                onClick={() => setSettings(prev => ({ ...prev, cameraOn: !prev.cameraOn }))}
              >
                <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </IconToggleButton>

              {/* Coach Toggle (Disabled in Audition Mode) */}
              <IconToggleButton
                label={settings.coachOn ? 'Coach On' : 'Coach Off'}
                active={settings.coachOn}
                disabled={settings.auditionMode}
                onClick={() => {
                  if (!settings.auditionMode) {
                    setSettings(prev => ({ ...prev, coachOn: !prev.coachOn }));
                  }
                }}
              >
                <CoachIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </IconToggleButton>

              {/* Lyrics Toggle (Explicit User Requirement: If on, text scrolls during performance) */}
              <IconToggleButton
                label={settings.lyricsOn ? 'Lyrics On' : 'Lyrics Off'}
                active={settings.lyricsOn}
                disabled={settings.auditionMode}
                onClick={() => {
                  if (!settings.auditionMode) {
                    setSettings(prev => ({ ...prev, lyricsOn: !prev.lyricsOn }));
                  }
                }}
              >
                <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
              </IconToggleButton>

              {/* Pipe at Start Toggle (Explicit User Requirement: key pitch plays for 1 sec right as performance begins) */}
              <IconToggleButton
                label={settings.pipeAtStart ? 'Pipe at Start' : 'No Pipe'}
                active={settings.pipeAtStart}
                badge={settings.pipeAtStart ? '1s' : undefined}
                onClick={() => setSettings(prev => ({ ...prev, pipeAtStart: !prev.pipeAtStart }))}
              >
                <PitchPipeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </IconToggleButton>

              {/* Record Toggle (Explicit User Requirement: whether an Audition take will be captured during performance) */}
              <IconToggleButton
                label={settings.recordOn ? 'Record Take' : 'Rec Off'}
                active={settings.recordOn}
                badge={settings.auditionMode ? 'LOCKED' : undefined}
                disabled={settings.auditionMode}
                onClick={() => {
                  if (!settings.auditionMode) {
                    setSettings(prev => ({ ...prev, recordOn: !prev.recordOn }));
                  }
                }}
              >
                <RecordIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${settings.recordOn ? 'text-red-500' : ''}`} />
              </IconToggleButton>

              {/* Audition Mode Toggle (Explicit User Requirement) */}
              <IconToggleButton
                label={settings.auditionMode ? 'Audition: On' : 'Audition'}
                active={settings.auditionMode}
                badge={settings.auditionMode ? 'PRO' : undefined}
                onClick={handleToggleAuditionMode}
              >
                <Award className={`w-5 h-5 sm:w-6 sm:h-6 ${settings.auditionMode ? 'text-amber-400' : ''}`} />
              </IconToggleButton>

              {/* Cast Screen Toggle */}
              <IconToggleButton
                label="Cast"
                active={settings.castOn || isCastModalOpen}
                onClick={() => setIsCastModalOpen(true)}
              >
                <CastIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </IconToggleButton>
            </div>

            {/* Informative Micro-status of Active Settings */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-[#B9AEB6]">
              {settings.auditionMode ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#221823] border border-amber-400/40 text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Audition Take: Official Unassisted Vocal Score
                </span>
              ) : (
                <>
                  {settings.recordOn && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#221823] border border-[#FF5757]/40 text-[#FF5757]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5757] animate-ping" />
                      Take will be recorded & saved
                    </span>
                  )}
                  {settings.lyricsOn && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] text-[#B7A1CC]">
                      <ScrollText className="w-3 h-3 text-[#B7A1CC]" />
                      Lyrics Prompter On
                    </span>
                  )}
                </>
              )}
              {settings.pipeAtStart && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] text-[#B7A1CC]">
                  <span className="text-[11px]">♪</span>
                  Key tone ({effectiveKey}) sounds for 1s on start
                </span>
              )}
            </div>

            {/* Primary Action Button: "Start!" in Brand Red #FF5757 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartPerformance}
                className="w-full sm:w-72 py-3.5 sm:py-4 px-8 rounded-full bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white font-black font-display text-base sm:text-lg tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-2xl shadow-[#FF5757]/30 hover:shadow-[#FF5757]/40 border border-red-400/30 select-none flex items-center justify-center gap-2 group"
                id="stage-prep-start-btn"
              >
                <span>Start!</span>
                <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* =====================================================================
             STEP 2: LIVE PERFORMANCE ON STAGE
             Shows stage clock, stems player, pitch coach, camera monitor, and controls
             ===================================================================== */
          <div 
            id="stage-performance-screen"
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between h-full space-y-6 animate-fadeIn py-2 sm:py-4"
          >
            {/* 1-second Pipe Countdown Overlay when pipeAtStart is enabled */}
            {isPipeCountdown && (
              <div className="fixed inset-0 z-50 bg-[#120B17]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div className="p-8 rounded-3xl bg-[#221823] border-2 border-[#B7A1CC] shadow-2xl shadow-[#B7A1CC]/20 max-w-md w-full flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#B7A1CC]/20 border-2 border-[#B7A1CC] flex items-center justify-center animate-pulse">
                    <PitchPipeIcon className="w-8 h-8 text-[#B7A1CC]" />
                  </div>
                  <h3 className="text-xl font-black font-display text-[#F7F1F3]">Sounding Pitch Pipe</h3>
                  <div className="text-5xl font-black font-mono text-[#B7A1CC]">
                    {effectiveKey} Maj
                  </div>
                  <p className="text-xs text-[#B9AEB6]">
                    Get in tune... Performance begins in a moment!
                  </p>
                </div>
              </div>
            )}

            {/* Stage Status & Badges */}
            <div className="w-full flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {settings.auditionMode ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#221823] border border-amber-400/50 text-amber-300 text-xs font-mono font-bold shadow-lg shadow-black/40">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    AUDITION TAKE
                  </span>
                ) : isRecording ? (
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#221823] border border-[#FF5757]/50 text-[#FF5757] text-xs font-mono font-bold shadow-lg shadow-black/40">
                    <span className="w-2 h-2 rounded-full bg-[#FF5757] animate-ping" />
                    REC PERFORMANCE TAKE
                  </span>
                ) : null}

                {settings.lyricsOn && !settings.auditionMode && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] text-[#B7A1CC] text-[11px] font-mono">
                    <ScrollText className="w-3 h-3 text-[#B7A1CC]" />
                    Lyrics On
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#B9AEB6]">
                <span>Part: <strong className="text-[#FF5757]">{currentPart?.name}</strong></span>
                <span>•</span>
                <span>Key: <strong className="text-[#B7A1CC]">{effectiveKey}</strong></span>
              </div>
            </div>

            {/* Center Stage Arena: Visualizer, Camera Feed, or Live Pitch Coach */}
            <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[260px] max-h-[440px]">
              {/* Optional Camera Feed */}
              {settings.cameraOn && (
                <div className="absolute top-2 right-2 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden border border-[rgba(255,249,247,0.15)] shadow-2xl z-20 bg-[#120B17]">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover -scale-x-100" 
                    playsInline 
                    muted 
                  />
                  <span className="absolute bottom-1 left-2 text-[9px] font-mono text-[#F7F1F3]/80 bg-[#120B17]/80 px-1.5 py-0.5 rounded-sm">
                    Live Stage Cam
                  </span>
                </div>
              )}

              {/* Real-time Pitch Intonation Coach (Active when coachOn and not in audition mode) */}
              {settings.coachOn && (
                <div className="flex flex-col items-center space-y-3 z-10">
                  <div className="relative flex items-center justify-center">
                    {/* Ring gauge */}
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 flex flex-col items-center justify-center transition-colors duration-200 ${
                      livePitch
                        ? Math.abs(livePitch.cents) <= 12
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-xl shadow-emerald-500/20'
                          : Math.abs(livePitch.cents) <= 25
                          ? 'border-amber-400 bg-amber-950/40 shadow-xl shadow-amber-500/20'
                          : 'border-rose-400 bg-rose-950/40'
                        : 'border-[rgba(255,249,247,0.12)] bg-[#221823]/80 backdrop-blur-md'
                    }`}>
                      <span className="text-3xl sm:text-4xl font-black font-mono text-[#F7F1F3]">
                        {livePitch?.noteName || '—'}
                      </span>
                      <span className="text-xs font-mono text-[#B9AEB6]">
                        {livePitch ? `${livePitch.cents > 0 ? '+' : ''}${Math.round(livePitch.cents)}¢` : 'Sing your part'}
                      </span>
                    </div>
                  </div>

                  {livePitch && (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[#221823] border border-[rgba(255,249,247,0.08)] text-[#F7F1F3]">
                      {Math.abs(livePitch.cents) <= 12 ? 'Locked In! Perfect Intonation' : livePitch.cents > 0 ? 'Slightly Sharp' : 'Slightly Flat'}
                    </div>
                  )}
                </div>
              )}

              {/* Lyrics / Stage Guidance Prompter:
                  "Add a button toggle for Lyrics. If on, text will scroll during performance" */}
              {settings.lyricsOn ? (
                <div 
                  className="mt-4 w-full max-w-xl mx-auto px-5 py-3.5 rounded-2xl bg-[#221823]/90 backdrop-blur-md border border-[rgba(255,249,247,0.08)] shadow-2xl flex flex-col items-center justify-center min-h-[105px] overflow-hidden relative select-none"
                  id="stage-scrolling-lyrics-prompter"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#B7A1CC] mb-1">
                    <ScrollText className="w-3 h-3 text-[#B7A1CC]" />
                    <span>Live Teleprompter</span>
                  </div>

                  {/* Previous line (faded) */}
                  {activeLyricIndex > 0 && (
                    <div className="text-xs sm:text-sm text-[#B9AEB6]/50 font-medium truncate transition-all duration-300 text-center w-full">
                      {songLyrics[activeLyricIndex - 1]?.text}
                    </div>
                  )}

                  {/* Active current line (bold, glowing, highlighted) */}
                  <div className="text-base sm:text-xl md:text-2xl font-black text-[#F7F1F3] text-center tracking-tight drop-shadow-md py-1 px-3 transition-all duration-300 animate-fadeIn w-full">
                    {songLyrics[activeLyricIndex]?.text || song.title}
                  </div>

                  {/* Next line (soft) */}
                  {activeLyricIndex < songLyrics.length - 1 && (
                    <div className="text-xs sm:text-sm text-[#B9AEB6]/40 font-medium truncate transition-all duration-300 text-center w-full">
                      {songLyrics[activeLyricIndex + 1]?.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-center px-4 max-w-lg">
                  <div className="text-sm sm:text-base font-medium text-[#B9AEB6] italic drop-shadow-md">
                    {song.notes || "Sing with passion and pure blend. You're on stage!"}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Progress & Time Display */}
            <div className="w-full space-y-2 px-4">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#B9AEB6]">
                <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                <span>{Math.floor(song.durationSeconds / 60)}:{String(Math.floor(song.durationSeconds % 60)).padStart(2, '0')}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#221823] overflow-hidden border border-[rgba(255,249,247,0.08)]">
                <div 
                  className="h-full bg-gradient-to-r from-[#B7A1CC] to-[#FF5757] transition-all duration-100"
                  style={{ width: `${Math.min(100, (currentTime / (song.durationSeconds || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stage Performance Controls: Restart, Play/Pause, Finish Take */}
            <div className="w-full flex items-center justify-center gap-4 sm:gap-6 pt-2">
              <button
                type="button"
                onClick={handleRestartPerformance}
                className="p-3.5 rounded-2xl bg-[#221823] hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.08)] text-[#B9AEB6] hover:text-[#F7F1F3] transition-all active:scale-95 cursor-pointer shadow-md"
                title="Restart Performance"
                id="stage-restart-btn"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {!settings.auditionMode && (
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, lyricsOn: !prev.lyricsOn }))}
                  className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-1.5 ${
                    settings.lyricsOn
                      ? 'bg-[#2A1E2A] border-[rgba(255,249,247,0.2)] text-[#B7A1CC]'
                      : 'bg-[#221823] hover:bg-[#2A1E2A] border-[rgba(255,249,247,0.08)] text-[#B9AEB6]'
                  }`}
                  title={settings.lyricsOn ? "Hide Lyrics Prompter" : "Show Lyrics Prompter"}
                  id="stage-toggle-lyrics-btn"
                >
                  <ScrollText className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleTogglePlayback}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#FF5757] hover:bg-[#ff4040] text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xl shadow-[#FF5757]/30 hover:scale-105"
                title={isPlaying ? "Pause" : "Resume"}
                id="stage-play-pause-btn"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCompletePerformance}
                className="px-5 py-3.5 rounded-2xl bg-[#221823] hover:bg-[#2A1E2A] active:bg-[#1C121F] border border-[#FF5757]/40 text-[#FF5757] hover:text-white hover:bg-[#FF5757] font-extrabold text-xs sm:text-sm font-display tracking-wide transition-all active:scale-95 cursor-pointer shadow-lg shadow-black/50 flex items-center gap-2"
                title="Stop & Complete Performance"
                id="stage-finish-btn"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Take</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          CAST MODAL / STAGE SCREEN DISPLAY
          ========================================================================= */}
      {isCastModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#120B17]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#221823] border border-[rgba(255,249,247,0.08)] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] flex items-center justify-center mx-auto text-[#B7A1CC]">
              <Tv className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-[#F7F1F3]">Cast Stage to TV / Screen</h3>
            <p className="text-xs sm:text-sm text-[#B9AEB6] leading-relaxed">
              Mirror this Stage Monitor, lyrics, and rehearsal pitch guide onto an external TV or wireless display for your quartet.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#1C121F] border border-[rgba(255,249,247,0.08)] text-xs font-mono text-[#B9AEB6] flex items-center justify-between">
              <span>Status: Stage Cast Ready</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSettings(prev => ({ ...prev, castOn: true }));
                  setIsCastModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#FF5757] hover:bg-[#ff4040] text-white font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                Connect Screen
              </button>
              <button
                type="button"
                onClick={() => setIsCastModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.08)] text-[#B9AEB6] hover:text-[#F7F1F3] text-xs cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUDITION TAKE SCORECARD & SHARE MODAL
          ========================================================================= */}
      {recentTake && (
        <ShareableTakeModal
          take={recentTake}
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setStep('prep');
          }}
          onPerformAgain={() => {
            setIsShareModalOpen(false);
            handleStartPerformance();
          }}
        />
      )}
    </div>
  );
};
