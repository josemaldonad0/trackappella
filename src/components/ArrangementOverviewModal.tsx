import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Pause, 
  Heart, 
  ListMusic, 
  Star, 
  Music, 
  Mic,
  Lock, 
  Copy, 
  Sparkles, 
  Check, 
  Video, 
  X, 
  FileText, 
  MicVocal, 
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  Disc3,
  ArrowRight,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Flag,
  Trash2,
  Maximize2,
  Minimize2,
  PanelRightClose,
  Unlock,
  KeyRound,
  Globe,
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Headphones,
  Download,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  SlidersHorizontal
} from 'lucide-react';
import { Song, UserProfile, VocalPart, TrackappellaGroup } from '../types';
import { getSongLockStatus, getSongGrantingGroup } from '../utils/groupUtils';
import { vocalEngine } from '../audio/vocalSynthEngine';
import { getTakesForSong } from '../utils/takesStorage';
import { TrackappellaLogo } from './TrackappellaBrand';
import { PdfScoreViewer } from './PdfScoreViewer';
import { VolumePopupButton } from './VolumePopupButton';
import { 
  SheetMusicIcon, 
  LoopIcon, 
  Rewind10Icon, 
  Forward10Icon, 
  StartOverIcon 
} from './icons';

interface ArrangementOverviewModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: (song: Song, selectedPartId: string) => void;
  onStartStageMode?: (song: Song, selectedPartId: string, keyOffset?: number) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  userDefaultPart?: string;
  onToggleFavorite?: (songId: string) => void;
  isFavorited?: boolean;
  onUpvote?: (songId: string) => void;
  hasUpvoted?: boolean;
  onAddToPlaylist?: (song: Song) => void;
  onNextSong?: () => void;
  onPreviousSong?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalSongsCount?: number;
  initialStudioMode?: boolean;
  groups?: TrackappellaGroup[];
  isSetlistContext?: boolean;
  onViewPerformanceTakes?: (songId?: string) => void;
  onOpenContributorStudio?: (song: Song) => void;
}

const PART_AVATARS: Record<string, string> = {
  tenor: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  soprano: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  lead: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  alto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  baritone: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  bass: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80'
};

const HEART_PARTICLES = [
  { id: 1, angle: -90, distance: 26, scale: 1.1, icon: 'heart', color: '#ff3366', delay: 0 },
  { id: 2, angle: -50, distance: 32, scale: 0.9, icon: 'sparkle', color: '#ff6b8b', delay: 20 },
  { id: 3, angle: -20, distance: 28, scale: 0.8, icon: 'dot', color: '#ffa3b8', delay: 40 },
  { id: 4, angle: 20, distance: 30, scale: 1.0, icon: 'sparkle', color: '#ff3366', delay: 10 },
  { id: 5, angle: 65, distance: 26, scale: 0.85, icon: 'heart', color: '#ff6b8b', delay: 30 },
  { id: 6, angle: 125, distance: 24, scale: 0.75, icon: 'dot', color: '#ff809f', delay: 50 },
  { id: 7, angle: -130, distance: 30, scale: 0.95, icon: 'sparkle', color: '#ff3366', delay: 15 },
  { id: 8, angle: -165, distance: 25, scale: 0.8, icon: 'heart', color: '#ff94b0', delay: 35 },
];

const STAR_PARTICLES = [
  { id: 1, angle: -90, distance: 26, scale: 1.1, icon: 'star', color: '#fbbf24', delay: 0 },
  { id: 2, angle: -50, distance: 32, scale: 0.9, icon: 'sparkle', color: '#f59e0b', delay: 20 },
  { id: 3, angle: -20, distance: 28, scale: 0.8, icon: 'dot', color: '#fef08a', delay: 40 },
  { id: 4, angle: 20, distance: 30, scale: 1.0, icon: 'sparkle', color: '#fbbf24', delay: 10 },
  { id: 5, angle: 65, distance: 26, scale: 0.85, icon: 'star', color: '#f59e0b', delay: 30 },
  { id: 6, angle: 125, distance: 24, scale: 0.75, icon: 'dot', color: '#fde047', delay: 50 },
  { id: 7, angle: -130, distance: 30, scale: 0.95, icon: 'sparkle', color: '#fbbf24', delay: 15 },
  { id: 8, angle: -165, distance: 25, scale: 0.8, icon: 'star', color: '#fef08a', delay: 35 },
];

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

export const ArrangementOverviewModal: React.FC<ArrangementOverviewModalProps> = ({
  song,
  isOpen,
  onClose,
  onStartPractice,
  onStartStageMode,
  currentUser,
  onOpenAuth,
  userDefaultPart = 'lead',
  onToggleFavorite,
  isFavorited = false,
  onUpvote,
  hasUpvoted = false,
  onAddToPlaylist,
  onNextSong,
  onPreviousSong,
  hasNext = false,
  hasPrevious = false,
  currentIndex = 0,
  totalSongsCount = 0,
  initialStudioMode = false,
  groups = [],
  isSetlistContext = false,
  onViewPerformanceTakes,
  onOpenContributorStudio
}) => {
  // Unfolded Studio vs Compact Preview mode
  const [isStudioMode, setIsStudioMode] = useState(initialStudioMode);

  // Collapsible Header Banner State (Practice Mode)
  const [isBannerExpanded, setIsBannerExpanded] = useState(false);
  
  // Shared playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [keyOffset, setKeyOffset] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  // Loop Markers State
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [showPlayheadMenu, setShowPlayheadMenu] = useState(false);
  const [activeMarkerMenu, setActiveMarkerMenu] = useState<'start' | 'end' | null>(null);
  const [isDraggingMarker, setIsDraggingMarker] = useState<'start' | 'end' | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // Score PDF Preview State & Gestures
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [scoreZoom, setScoreZoom] = useState(100);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scoreContainerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(100);

  // Mobile Landscape Orientation Detection (Score full-screen takeover)
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. HARD CONSTRAINT: If width <= height, it is mathematically PORTRAIT.
      // Under NO circumstances can a device be in landscape if width <= height.
      if (width <= height) {
        setIsMobileLandscape(false);
        return;
      }

      // 2. CSS Media Query: Ensure CSS also registers landscape
      const isMediaLandscape = window.matchMedia('(orientation: landscape)').matches;
      if (!isMediaLandscape) {
        setIsMobileLandscape(false);
        return;
      }

      // 3. Screen Orientation API: If the physical screen explicitly declares portrait, reject
      const screenType = window.screen?.orientation?.type || '';
      if (screenType.startsWith('portrait')) {
        setIsMobileLandscape(false);
        return;
      }

      // 4. Legacy window.orientation (iOS legacy: 0 and 180 are portrait)
      if (typeof window.orientation === 'number' && (window.orientation === 0 || window.orientation === 180)) {
        setIsMobileLandscape(false);
        return;
      }

      // 5. Mobile / Handheld constraints:
      // In landscape on smartphones, height is the short edge (typically 320px - 440px).
      // Coarse pointer / touch or small screen height threshold (<= 550px, or <= 600px with touch).
      const isTouchOrCoarse = 
        ('ontouchstart' in window) || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(pointer: coarse)').matches;

      // Screen height in mobile landscape is small (phone short dimension):
      const isMobileLandscapeHeight = height <= 550 || (isTouchOrCoarse && height <= 600);

      // Width is mobile or small device scale (e.g. phones / small handhelds in landscape):
      const isMobileLandscapeWidth = width <= 1024;

      setIsMobileLandscape(isMobileLandscapeHeight && (isTouchOrCoarse || isMobileLandscapeWidth));
    };

    checkOrientation();

    // Re-check with slight delays to accommodate mobile browser layout reflow upon rotation
    const handleOrientationChange = () => {
      checkOrientation();
      setTimeout(checkOrientation, 80);
      setTimeout(checkOrientation, 250);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // CSS Media Query change listener
    const mql = window.matchMedia('(orientation: landscape)');
    const handleMql = () => handleOrientationChange();
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMql);
    } else if ((mql as any).addListener) {
      (mql as any).addListener(handleMql);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMql);
      } else if ((mql as any).removeListener) {
        (mql as any).removeListener(handleMql);
      }
    };
  }, []);

  // Request Access State (for locked tracks)
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestNote, setRequestNote] = useState('');

  // Access & Lock Resolution
  const lockStatus = song ? getSongLockStatus(song, currentUser, groups) : 'none';
  const isLocked = lockStatus === 'locked';
  const grantingGroup = song ? getSongGrantingGroup(song, groups) : null;
  const grantingGroupName = grantingGroup?.name || (song?.groupAccessCode ? `Code ${song.groupAccessCode}` : 'Ensemble');
  const contributorName = song?.tracksBy || song?.contributorName || (song?.arranger ? song.arranger.replace(/^arr\.?\s*/i, '') : '') || song?.partner?.name || 'Arrangement Contributor';

  // Selected Part & Multi-stem Mixer States
  const [selectedPartId, setSelectedPartId] = useState<string>(() => {
    if (!song) return userDefaultPart || 'lead';
    const matched = song.parts?.find(p => p.id.toLowerCase() === userDefaultPart.toLowerCase());
    return matched ? matched.id : (song.parts?.[0]?.id || 'lead');
  });

  // Stem Mutes, Multi-Solos & Individual Volume Faders
  const [partMutes, setPartMutes] = useState<Record<string, boolean>>({});
  const [partSolos, setPartSolos] = useState<Record<string, boolean>>({});
  const [partVolumes, setPartVolumes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    song?.parts?.forEach(p => {
      initial[p.id] = 0.85;
    });
    return initial;
  });
  const [masterVolume, setMasterVolume] = useState<number>(() => vocalEngine.getMasterVolume() || 0.85);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const prevMasterVolumeRef = useRef<number>(0.85);
  const [isDominant, setIsDominant] = useState(false);

  // Sync refs for uninterrupted Web Audio playback starts
  const partMutesRef = useRef(partMutes);
  const partSolosRef = useRef(partSolos);
  const partVolumesRef = useRef(partVolumes);
  useEffect(() => { partMutesRef.current = partMutes; }, [partMutes]);
  useEffect(() => { partSolosRef.current = partSolos; }, [partSolos]);
  useEffect(() => { partVolumesRef.current = partVolumes; }, [partVolumes]);

  // Performance takes recorded for this specific song
  const songTakes = useMemo(() => {
    if (!song) return [];
    return getTakesForSong(song.id);
  }, [song, isOpen]);

  // Action / Feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedPlaylistSuccess, setSavedPlaylistSuccess] = useState(false);
  const [isHeartBursting, setIsHeartBursting] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [isStarBursting, setIsStarBursting] = useState(false);
  const [starBurstKey, setStarBurstKey] = useState(0);

  const duration = song?.durationSeconds || 45;
  const effectiveKey = song ? computeEffectiveKey(song.baseKey, keyOffset) : 'C';

  // Setup audio stem engine on song change
  useEffect(() => {
    if (!song) return;
    vocalEngine.setupParts(song.parts.map(p => p.id));
    vocalEngine.setupStems(song);
    // Reset key offset and time when song changes
    setKeyOffset(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsDominant(false);
    setIsScoreOpen(false);
    setPartSolos({});
    setPartMutes({});
    setPartVolumes(prev => {
      const next: Record<string, number> = {};
      song.parts.forEach(p => {
        next[p.id] = typeof prev[p.id] === 'number' ? prev[p.id] : 0.85;
      });
      return next;
    });
    setLoopStart(null);
    setLoopEnd(null);
    setShowPlayheadMenu(false);
    setActiveMarkerMenu(null);
    setIsBannerExpanded(false);
    
    // Match part to default
    const matched = song.parts.find(p => p.id.toLowerCase() === userDefaultPart.toLowerCase());
    const defaultId = matched ? matched.id : (song.parts[0]?.id || 'lead');
    setSelectedPartId(defaultId);
  }, [song?.id, userDefaultPart]);

  // Sync initial studio mode prop
  useEffect(() => {
    setIsStudioMode(initialStudioMode);
  }, [initialStudioMode]);

  // Lock background body scroll when preview drawer or studio mode is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Update mixer levels (solo isolation muting and volume calculation)
  useEffect(() => {
    if (!song) return;
    const mixStates: Record<string, { isMuted: boolean; isSolo: boolean; volume: number }> = {};
    const hasAnySolo = Object.values(partSolos).some(Boolean);

    song.parts.forEach(p => {
      const isMuted = Boolean(partMutes[p.id]);
      const isSolo = Boolean(partSolos[p.id]);
      // Multi-solo: if ANY part is soloed, all non-soloed parts are silenced
      const shouldMute = isMuted || (hasAnySolo && !isSolo);
      const userVol = typeof partVolumes[p.id] === 'number' ? partVolumes[p.id] : 0.85;

      mixStates[p.id] = {
        isMuted: shouldMute,
        isSolo,
        volume: shouldMute ? 0 : userVol
      };
    });

    vocalEngine.applyMixState(selectedPartId, isDominant, mixStates);
  }, [song, partMutes, partSolos, partVolumes, selectedPartId, isDominant]);

  // Dragging loop markers on progress bar
  const handleMarkerDragStart = (markerType: 'start' | 'end', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingMarker(markerType);
    setActiveMarkerMenu(null);
    setShowPlayheadMenu(false);
  };

  useEffect(() => {
    if (!isDraggingMarker) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!progressBarRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newTime = percentage * duration;

      if (isDraggingMarker === 'start') {
        const maxAllowed = loopEnd !== null ? Math.max(0, loopEnd - 0.5) : duration;
        setLoopStart(Math.min(newTime, maxAllowed));
      } else {
        const minAllowed = loopStart !== null ? Math.min(duration, loopStart + 0.5) : 0;
        setLoopEnd(Math.max(newTime, minAllowed));
      }
    };

    const handlePointerUp = () => {
      setIsDraggingMarker(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDraggingMarker, duration, loopStart, loopEnd]);

  // Click-away listener to dismiss loop marker tooltips & playhead menu
  useEffect(() => {
    if (!showPlayheadMenu && !activeMarkerMenu) return;

    const handleClickAway = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('#studio-playhead-menu') ||
        target.closest('#studio-marker-menu') ||
        target.closest('#studio-playhead-thumb') ||
        target.closest('.group-marker-flag')
      ) {
        return;
      }
      setShowPlayheadMenu(false);
      setActiveMarkerMenu(null);
    };

    window.addEventListener('mousedown', handleClickAway);
    window.addEventListener('touchstart', handleClickAway);
    return () => {
      window.removeEventListener('mousedown', handleClickAway);
      window.removeEventListener('touchstart', handleClickAway);
    };
  }, [showPlayheadMenu, activeMarkerMenu]);

  // Trackpad & native touch pinch-to-zoom on score
  useEffect(() => {
    const container = scoreContainerRef.current;
    if (!container || !isScoreOpen) return;

    // Trackpad pinch-to-zoom (Ctrl/Cmd + Wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        setScoreZoom(prev => Math.max(50, Math.min(300, Math.round(prev * zoomFactor))));
      }
    };

    // Native 2-finger touch pinch-to-zoom
    let initialDist: number | null = null;
    let initialZoom = 100;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = scoreZoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist !== null) {
        // Prevent default browser viewport zoom on mobile Safari/Chrome
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialDist;
        const newZoom = Math.max(50, Math.min(300, Math.round(initialZoom * factor)));
        setScoreZoom(newZoom);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDist = null;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScoreOpen, scoreZoom]);

  const handleScoreDoubleClick = () => {
    setScoreZoom(prev => (prev > 100 ? 100 : 150));
  };

  // Update real audio mix when part mutes, solos, or volumes change
  useEffect(() => {
    if (!isPlaying || !song) return;
    vocalEngine.updateMix(partMutes, partSolos, partVolumes);
  }, [partMutes, partSolos, partVolumes, isPlaying, song]);

  // Handle Playback Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && song) {
      vocalEngine.startPlayback(song, currentTime, partMutesRef.current, partSolosRef.current, keyOffset, playbackSpeed, partVolumesRef.current);

      interval = setInterval(() => {
        const trackTime = vocalEngine.getCurrentTrackTime();
        setCurrentTime(prev => {
          const step = isStudioMode ? 0.15 * playbackSpeed : 0.2;
          const next = typeof trackTime === 'number' && trackTime > 0 ? trackTime : (prev + step);

          // Check Loop End marker:
          if (isLooping && loopEnd !== null && next >= loopEnd) {
            const restartTime = loopStart !== null ? loopStart : 0;
            vocalEngine.seek(restartTime);
            return restartTime;
          }

          if (next >= duration) {
            if (isLooping && isStudioMode) {
              const restartTime = loopStart !== null ? loopStart : 0;
              vocalEngine.seek(restartTime);
              return restartTime;
            }
            setIsPlaying(false);
            vocalEngine.stopPlayback();
            return 0;
          }

          return next;
        });
      }, isStudioMode ? 150 : 200);
    } else {
      vocalEngine.stopPlayback();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isStudioMode, playbackSpeed, isLooping, duration, song, keyOffset, loopStart, loopEnd]);

  // Clean up pitch tone and audio on unmount
  useEffect(() => {
    return () => {
      vocalEngine.stopPlayback();
      vocalEngine.stopPitchPipeTone();
    };
  }, []);

  // Keyboard shortcuts: Escape to fold or close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isStudioMode) {
          setIsStudioMode(false);
        } else {
          handleClose();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowLeft' && e.altKey && hasPrevious && onPreviousSong) {
        onPreviousSong();
      } else if (e.key === 'ArrowRight' && e.altKey && hasNext && onNextSong) {
        onNextSong();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isStudioMode, hasPrevious, hasNext, onPreviousSong, onNextSong]);

  const handleClose = () => {
    vocalEngine.stopPlayback();
    vocalEngine.stopPitchPipeTone();
    setIsPlaying(false);
    setCurrentTime(0);
    setIsStudioMode(false);
    onClose();
  };

  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId);
  };

  const handleToggleMute = (partId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPartMutes(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  const handleToggleSolo = (partId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!song) return;

    setPartSolos(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  const handleClearAllSolos = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPartSolos({});
  };

  const handleVolumeChange = (partId: string, val: number) => {
    setPartVolumes(prev => ({
      ...prev,
      [partId]: Math.max(0, Math.min(1, val))
    }));
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

  const handleResetAllVolumes = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!song) return;
    const reset: Record<string, number> = {};
    song.parts.forEach(p => {
      reset[p.id] = 0.85;
    });
    setPartVolumes(reset);
  };

  const handleToggleDominant = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDominant(prev => !prev);
  };

  // Unfold to Trackapp Studio on "Join in!"
  const handleJoinInClick = () => {
    if (!currentUser) {
      onOpenAuth('Learn');
      return;
    }
    // Smoothly unfold to the left into Trackapp Studio
    setIsStudioMode(true);
  };

  // Open confirmation modal for requesting access from contributor
  const handleRequestAccessClick = () => {
    if (!currentUser) {
      onOpenAuth('Learn');
      return;
    }
    setRequestSubmitted(false);
    setRequestNote('');
    setIsRequestAccessModalOpen(true);
  };

  const handleConfirmSubmitRequest = () => {
    if (!song) return;
    try {
      const stored = localStorage.getItem('trackappella_contributor_access_requests');
      const existing = stored ? JSON.parse(stored) : [];
      const newReq = {
        id: `req_${Date.now()}`,
        songId: song.id,
        songTitle: song.title,
        contributorName,
        userId: currentUser?.id || 'guest',
        userDisplayName: currentUser?.displayName || 'Singer',
        userEmail: currentUser?.email || '',
        note: requestNote.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('trackappella_contributor_access_requests', JSON.stringify([newReq, ...existing]));
    } catch (e) {
      console.warn('Could not save access request', e);
    }
    setRequestSubmitted(true);
  };

  const handleFoldBackToPreview = () => {
    setIsStudioMode(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    vocalEngine.seek(val);
    if (isPlaying && song) {
      vocalEngine.startPlayback(song, val, partMutesRef.current, partSolosRef.current, keyOffset, playbackSpeed, partVolumesRef.current);
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      // Playback starts at Loop Start (if exists and looping is ON) or track start
      let startAt = currentTime;
      if (isLooping && loopStart !== null && (currentTime < loopStart || (loopEnd !== null && currentTime >= loopEnd))) {
        startAt = loopStart;
        setCurrentTime(loopStart);
      }
      setIsPlaying(true);
      if (song) {
        vocalEngine.startPlayback(song, startAt, partMutesRef.current, partSolosRef.current, keyOffset, playbackSpeed, partVolumesRef.current);
      }
    } else {
      setIsPlaying(false);
      vocalEngine.stopPlayback();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    setCurrentTime(targetTime);
    if (isPlaying && song) {
      vocalEngine.startPlayback(song, targetTime, partMutesRef.current, partSolosRef.current, keyOffset, playbackSpeed, partVolumesRef.current);
    }
  };

  const handleSetLoopStart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoopStart(currentTime);
    if (loopEnd !== null && loopEnd <= currentTime) {
      setLoopEnd(null);
    }
    setIsLooping(true);
    setShowPlayheadMenu(false);
  };

  const handleSetLoopEnd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoopEnd(currentTime);
    if (loopStart !== null && loopStart >= currentTime) {
      setLoopStart(null);
    }
    setIsLooping(true);
    setShowPlayheadMenu(false);
  };

  const handleClearLoopStart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoopStart(null);
    setActiveMarkerMenu(null);
  };

  const handleClearLoopEnd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoopEnd(null);
    setActiveMarkerMenu(null);
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

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleHeartClick = () => {
    if (!song) return;
    if (onUpvote) {
      onUpvote(song.id);
    }
    if (!hasUpvoted) {
      setIsHeartBursting(true);
      setBurstKey(prev => prev + 1);
      setTimeout(() => setIsHeartBursting(false), 750);
    } else {
      setIsHeartBursting(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!song) return;
    if (onToggleFavorite) {
      onToggleFavorite(song.id);
    }
    if (!isFavorited) {
      setIsStarBursting(true);
      setStarBurstKey(prev => prev + 1);
      setTimeout(() => setIsStarBursting(false), 750);
    } else {
      setIsStarBursting(false);
    }
  };

  const handleSaveToPlaylist = () => {
    if (!song) return;
    if (onAddToPlaylist) {
      onAddToPlaylist(song);
    }
    setSavedPlaylistSuccess(true);
    setTimeout(() => setSavedPlaylistSuccess(false), 2500);
  };

  const handleLaunchStageMode = () => {
    vocalEngine.stopPlayback();
    vocalEngine.stopPitchPipeTone();
    setIsPlaying(false);
    if (onStartStageMode && song) {
      onStartStageMode(song, selectedPartId, keyOffset);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !song) return null;

  const isVideo = song.assetType === 'video';
  const selectedPart = song.parts.find(p => p.id === selectedPartId) || song.parts[0];
  const lovedCount = (song.popularityVotes || 120) + (hasUpvoted ? 1 : 0);

  const modalContent = (
    <>
      {/* Backdrop: Darkens background with smooth fade */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 select-none ${
          isStudioMode ? 'bg-black/90 backdrop-blur-md' : 'bg-[#1C121F]/60 backdrop-blur-xs'
        }`}
        onClick={isStudioMode ? handleFoldBackToPreview : handleClose} 
        aria-label="Close preview drawer backdrop"
      />

      {/* =========================================================================
          THE UNIFIED PREVIEW & TRACKAPP STUDIO WINDOW CONTAINER
          Anchored on the right edge, expanding smoothly leftward to occupy the whole window
          ========================================================================= */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 shadow-2xl flex flex-col h-full max-h-full overflow-hidden select-none transition-[width,max-width,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isStudioMode
            ? 'w-full max-w-full bg-[#120B17] text-[#F7F1F3]'
            : 'w-full max-w-[480px] xl:max-w-[520px] bg-[#CBB9C7] text-[#1C121F] border-l border-[#573657]/30 font-sans'
        } ${isScoreOpen && isMobileLandscape ? 'mobile-score-active' : ''}`}
        id="arrangement-preview-slider"
      >
        
        {/* =====================================================================
            STATE 1: UNFOLDED TRACKAPP STUDIO REHEARSAL CHAMBER
            Revealed when clicking "Join in!", unfolding smoothly to the left
            ===================================================================== */}
        {isStudioMode ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0 bg-[#120B17] text-[#F7F1F3] animate-fadeIn font-sans selection:bg-[#2A1E2A] selection:text-[#F7F1F3]">
            
            {/* Top Rehearsal Header Bar - Hidden in mobile landscape score view */}
            {!(isScoreOpen && isMobileLandscape) && (
              <div 
                id="studio-rehearsal-header"
                className="px-4 sm:px-6 py-3 bg-[#1C121F] border-b border-[rgba(255,249,247,0.08)] flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30 shadow-md"
              >
                
                {/* Left Actions: Back Icon (preserving fold to preview functionality) + Brand Logo */}
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <button
                    type="button"
                    onClick={handleFoldBackToPreview}
                    className="p-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.08)] text-[#F7F1F3] transition-all active:scale-95 cursor-pointer shadow-xs group flex items-center justify-center"
                    id="studio-back-preview-btn"
                    title="Back to Preview"
                    aria-label="Back to Preview"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#F7F1F3] group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center select-none" title="Trackappella">
                    <TrackappellaLogo size="sm" showSubtitle={false} />
                  </div>
                </div>

                {/* Center Song Track Title & Key */}
                <div className="hidden md:flex items-center gap-2 text-center">
                  <span className="text-sm font-extrabold text-[#F7F1F3] font-display truncate max-w-xs xl:max-w-md">
                    {song.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#2A1E2A] border border-[rgba(255,249,247,0.08)] text-amber-300 text-[10px] font-mono font-bold">
                    {effectiveKey} Maj
                  </span>
                </div>

                {/* Right: Brand Red Perform Button leading to Stage Mode */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLaunchStageMode}
                    className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#ff5757] hover:bg-[#ff4040] active:bg-[#e03838] border border-red-400/30 text-white text-xs font-black font-display tracking-wide shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    id="studio-top-perform-btn"
                    title="Enter Stage Mode"
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    <span>Perform</span>
                  </button>
                </div>

              </div>
            )}

            {/* Practice Mode Collapsible Header Banner (Hidden when Score View is active) */}
            {!isScoreOpen && (
              <div 
                className="border-b border-[rgba(255,249,247,0.08)] bg-[#17101D] px-4 sm:px-8 py-2.5 sm:py-3 shadow-xs cursor-pointer select-none transition-all duration-300"
                onClick={() => setIsBannerExpanded(prev => !prev)}
                onMouseEnter={() => setIsBannerExpanded(true)}
                title={isBannerExpanded ? "Click to collapse details" : "Click or hover to view song details"}
              >
                <div className="max-w-6xl mx-auto">
                  {/* Collapsed view: Just title on the left, selected part on the right */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-[#F7F1F3] tracking-tight font-display truncate">
                        {song.title}
                      </h1>
                      <div className="text-[#B9AEB6] p-0.5">
                        {isBannerExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#FF5757]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#B9AEB6]" />
                        )}
                      </div>
                    </div>

                    {/* Selected Part on the right */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#2A1E2A] border border-[rgba(255,249,247,0.08)] text-xs font-mono shrink-0">
                      <span className="text-[#B9AEB6] font-medium text-[10px] sm:text-[11px]">Singing:</span>
                      <span 
                        className="font-extrabold uppercase text-[10px] sm:text-[11px]"
                        style={{ color: selectedPart?.color || '#D9AF8D' }}
                      >
                        {song.parts.find(p => p.id === selectedPartId)?.name || 'Lead'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded content when tapped / hovered */}
                  {isBannerExpanded && (
                    <div className="pt-3 space-y-2 border-t border-[rgba(255,249,247,0.08)] mt-2.5 animate-fadeIn">
                      {/* Voicing, Duration, Key, and Included Parts Tags below Title */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B7A1CC]/15 text-[#E2D6EF] border border-[#B7A1CC]/30 text-[11px] font-mono font-medium shadow-xs">
                          <Users className="w-3 h-3 text-[#B7A1CC] shrink-0" />
                          <span>{song.voicing}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D9AF8D]/15 text-[#F6E1CF] border border-[#D9AF8D]/30 text-[11px] font-mono font-medium shadow-xs">
                          <Clock className="w-3 h-3 text-[#D9AF8D] shrink-0" />
                          <span>{formatDuration(duration)}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9EBCAB]/15 text-[#D2E7DB] border border-[#9EBCAB]/30 text-[11px] font-mono font-medium shadow-xs">
                          <KeyRound className="w-3 h-3 text-[#9EBCAB] shrink-0" />
                          <span>Concert {effectiveKey}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D9A7B4]/15 text-[#F4D2DA] border border-[#D9A7B4]/30 text-[11px] font-mono font-medium shadow-xs">
                          <Disc3 className="w-3 h-3 text-[#D9A7B4] shrink-0" />
                          <span>{song.parts.map(p => p.shortName || p.name).join(' · ')}</span>
                        </span>
                      </div>

                      {/* Arranger / Attribution Subtitle */}
                      <div className="text-[11px] sm:text-xs text-[#B9AEB6] flex flex-wrap items-center gap-x-2 pt-0.5">
                        {song.arranger && (
                          <span>Arranged by <strong className="text-[#F7F1F3] font-medium">{song.arranger.replace(/^arr\.?\s*/i, '')}</strong></span>
                        )}
                        {(song.performerName || song.partner?.name) && (
                          <span>· As sung by <strong className="text-[#F7F1F3] font-medium">{song.performerName || song.partner?.name}</strong></span>
                        )}
                        {song.tracksBy && (
                          <span>· Tracks by <strong className="text-[#B7A1CC]">{song.tracksBy}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chamber Main Rehearsal Workspace */}
            <div 
              className={`flex-1 flex flex-col min-h-0 ${
                isScoreOpen ? 'overflow-hidden p-0 w-full h-full' : 'overflow-y-auto p-2 sm:p-6 space-y-2 sm:space-y-4 max-w-6xl mx-auto w-full'
              }`}
              onClick={() => setIsBannerExpanded(false)}
            >
                
                {isScoreOpen ? (
                  /* =====================================================================
                      FULLSCREEN SCORE VIEW
                      (Takes over entire available screen real estate above playback bar)
                      ===================================================================== */
                  <div 
                    ref={scoreContainerRef}
                    onDoubleClick={handleScoreDoubleClick}
                    className={`flex-1 flex flex-col w-full bg-[#070b14] overflow-auto shadow-2xl animate-fadeIn relative select-none touch-pan-x touch-pan-y mobile-score-canvas-container ${
                      isMobileLandscape 
                        ? 'fixed inset-0 z-[100] w-screen h-screen p-0 m-0 items-center justify-start' 
                        : 'h-full p-3 sm:p-8 items-center'
                    }`}
                  >
                    {/* Floating Zoom Indicator on Gesture (only in portrait mode to keep landscape 100% clean) */}
                    {showZoomIndicator && !isMobileLandscape && (
                      <div className="fixed top-4 right-4 z-50 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-sky-300 text-xs font-mono font-bold border border-sky-400/40 shadow-2xl pointer-events-none animate-fadeIn">
                        {scoreZoom}% Zoom
                      </div>
                    )}

                    {/* Score Content Canvas - Full bleed end-to-end in mobile landscape */}
                      {song.assets?.chart?.fullScorePdfUrl ? (
                        <div className="w-full flex-1 flex flex-col items-stretch min-h-[600px] h-full relative">
                          <PdfScoreViewer
                            pdfUrl={song.assets.chart.fullScorePdfUrl}
                            title={`${song.title} — Sheet Music`}
                            className="w-full flex-1 min-h-[580px] h-[calc(100vh-220px)] rounded-xl"
                          />
                        </div>
                      ) : (
                        <div 
                          className={`bg-[#fcfbf9] text-slate-950 w-full select-none transition-transform origin-top ${
                            isMobileLandscape
                              ? 'min-h-screen rounded-none p-3 sm:p-6 border-0 shadow-none'
                              : 'max-w-4xl rounded-lg shadow-2xl p-6 sm:p-12 border border-slate-300'
                          }`}
                          style={{ transform: `scale(${scoreZoom / 100})` }}
                        >
                          {/* Sheet Music Page Header */}
                          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block">
                              TRACKAPPELLA VAULT SCORE · {song.voicing} ARRANGEMENT
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-950">
                              {song.title}
                            </h2>
                            <div className="flex justify-between text-xs sm:text-sm font-serif italic text-slate-700 pt-3 px-2">
                              <div className="text-left">
                                <span>Words and Music by</span>
                                <strong className="block font-semibold not-italic text-slate-900">
                                  {song.composer || 'Traditional'}
                                </strong>
                              </div>
                              <div className="text-right">
                                <span>Arranged by</span>
                                <strong className="block font-semibold not-italic text-slate-900">
                                  {song.arranger ? song.arranger.replace(/^arr\.?\s*/i, '') : 'Traditional'}
                                </strong>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-600 pt-2 px-2 border-t border-slate-200">
                              <span>Tempo: ♩ = {song.tempoBpm} BPM</span>
                              <span>Concert Key: {effectiveKey}</span>
                              <span>Voicing: {song.voicing}</span>
                            </div>
                          </div>

                          {/* Staves / Music Systems */}
                          <div className="py-6 space-y-8 font-serif">
                            {/* System 1: mm. 1-4 */}
                            <div className="border-y border-slate-800 py-3 relative">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[10px]">Rehearsal [A] - Verse</span>
                                <span className="text-[11px] font-mono">mm. 1–4</span>
                              </div>
                              
                              <div className="space-y-4 my-2">
                                {/* Treble Stave: Tenor & Lead */}
                                <div className="relative bg-white p-3 rounded border border-slate-300">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                                    <span className="text-sky-700">Tenor & Lead (Melody)</span>
                                    <span className="font-mono text-slate-500">𝄞 Treble Clef 8vb</span>
                                  </div>
                                  <div className="space-y-2 py-1 relative">
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                      <span className="text-2xl font-serif">𝄞</span>
                                      <span className="text-sm font-mono font-bold">4/4</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Sweet and love - ly</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">That is you...</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                    </div>
                                  </div>
                                </div>

                                {/* Bass Stave: Baritone & Bass */}
                                <div className="relative bg-white p-3 rounded border border-slate-300">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                                    <span className="text-indigo-800">Baritone & Bass (Harmonic Foundation)</span>
                                    <span className="font-mono text-slate-500">𝄢 Bass Clef</span>
                                  </div>
                                  <div className="space-y-2 py-1 relative">
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                      <span className="text-2xl font-serif">𝄢</span>
                                      <span className="text-sm font-mono font-bold">4/4</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Sweet and love - ly</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">That is you...</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* System 2: mm. 5-8 */}
                            <div className="border-b border-slate-800 pb-3 relative">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[10px]">Rehearsal [B] - Tag Cadence</span>
                                <span className="text-[11px] font-mono">mm. 5–8</span>
                              </div>
                              
                              <div className="space-y-4 my-2">
                                <div className="relative bg-white p-3 rounded border border-slate-300">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                                    <span className="text-sky-700">Tenor & Lead (High Sustained Post)</span>
                                    <span className="font-mono text-slate-500">𝄞 Treble</span>
                                  </div>
                                  <div className="space-y-2 py-1 relative">
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                      <span className="text-2xl font-serif">𝄞</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Ooo... Heav - en - ly</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Ring! [Hold]</span>
                                      <div className="h-10 w-2 bg-slate-800" />
                                    </div>
                                  </div>
                                </div>

                                <div className="relative bg-white p-3 rounded border border-slate-300">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                                    <span className="text-indigo-800">Baritone & Bass (Barbershop 7th)</span>
                                    <span className="font-mono text-slate-500">𝄢 Bass</span>
                                  </div>
                                  <div className="space-y-2 py-1 relative">
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="h-px bg-slate-800 w-full" />
                                    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                      <span className="text-2xl font-serif">𝄢</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Ooo... Heav - en - ly</span>
                                      <div className="h-10 w-px bg-slate-800" />
                                      <span className="text-xs font-serif italic text-slate-600">Lock & Ring!</span>
                                      <div className="h-10 w-2 bg-slate-800" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Sheet Music Footer */}
                          <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] font-serif text-slate-500">
                            <span>© Trackappella Vault Sheet Music · Rehearsal Score</span>
                            <span className="font-mono">Full Score</span>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  /* =====================================================================
                      PART MIXER: DAW STEM TRACK ROWS
                      (Fits 4-6 parts easily in a single shot without scrolling)
                      ===================================================================== */
                  <div className="space-y-1.5 sm:space-y-2 max-w-4xl mx-auto w-full">
                    {/* Section Header with Multi-Solo status and reset actions */}
                    {(() => {
                      const hasAnySolo = Object.values(partSolos).some(Boolean);
                      const soloCount = Object.values(partSolos).filter(Boolean).length;
                      const hasCustomVolumes = song.parts.some(p => {
                        const v = partVolumes[p.id];
                        return typeof v === 'number' && Math.abs(v - 0.85) > 0.02;
                      });

                      return (
                        <div className="flex items-center justify-between gap-2 px-1 mb-1">
                          <div>
                            <h2 className="text-xs sm:text-base font-black text-[#F7F1F3] font-display tracking-tight flex items-center gap-1.5 sm:gap-2">
                              <span>Part Mixer</span>
                              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-[#2A1E2A] text-[#B7A1CC] border border-[rgba(255,249,247,0.08)] font-bold">
                                {song.parts.length} STEMS
                              </span>
                              {hasAnySolo && (
                                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded bg-[#2A1E2A] text-amber-300 border border-amber-400/40 flex items-center gap-1 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  {soloCount} SOLOED
                                </span>
                              )}
                            </h2>
                            <p className="hidden sm:block text-xs text-[#B9AEB6] mt-0.5">
                              Individual volume faders · Solo multiple parts to rehearse duets/trios · Mute accompaniment
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {hasAnySolo && (
                              <button
                                type="button"
                                onClick={handleClearAllSolos}
                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold bg-[#2A1E2A] hover:bg-[#342435] text-amber-300 border border-amber-400/40 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                                title="Clear all active solos (unmutes remaining parts)"
                                id="clear-all-solos-btn"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>Clear ({soloCount})</span>
                              </button>
                            )}
                            {hasCustomVolumes && (
                              <button
                                type="button"
                                onClick={handleResetAllVolumes}
                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold bg-[#2A1E2A] hover:bg-[#342435] text-[#B9AEB6] hover:text-[#F7F1F3] border border-[rgba(255,249,247,0.08)] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                                title="Reset all stems to default volume (85%)"
                                id="reset-all-volumes-btn"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">Reset Faders</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* DAW Stem Rows - Compact Single-Row on both mobile portrait and desktop */}
                    <div className="space-y-1 sm:space-y-1.5">
                      {(() => {
                        const hasAnySolo = Object.values(partSolos).some(Boolean);

                        return song.parts.map((part) => {
                          const isYou = part.id === selectedPartId;
                          const isSolo = Boolean(partSolos[part.id]);
                          const isMuted = Boolean(partMutes[part.id]);
                          const isSilencedByOtherSolo = hasAnySolo && !isSolo;
                          const isAudiblyMuted = isMuted || isSilencedByOtherSolo;
                          const volume = typeof partVolumes[part.id] === 'number' ? partVolumes[part.id] : 0.85;

                          const userThumbnail = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                          const defaultAvatar = PART_AVATARS[part.id.toLowerCase()] || PART_AVATARS[part.name.toLowerCase()] || PART_AVATARS.lead;
                          const avatarUrl = isYou ? userThumbnail : defaultAvatar;
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
                              className={`flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none ${
                                isYou
                                  ? 'bg-[#2A1E2A] border-2 shadow-md sm:shadow-lg text-[#F7F1F3]'
                                  : isSolo
                                  ? 'bg-[#2A1E2A] border-2 shadow-xs sm:shadow-md text-[#F7F1F3]'
                                  : isMuted
                                  ? 'bg-[#1C121F]/60 border-[rgba(255,249,247,0.05)] opacity-55 text-[#B9AEB6]'
                                  : isSilencedByOtherSolo
                                  ? 'bg-[#1C121F]/60 border-[rgba(255,249,247,0.05)] opacity-55 text-[#B9AEB6]'
                                  : 'bg-[#1C121F] hover:bg-[#2A1E2A] border-[rgba(255,249,247,0.08)] hover:border-[rgba(255,249,247,0.18)] text-[#F7F1F3]'
                              }`}
                              style={{
                                borderColor: isYou ? partColor : isSolo ? partColor : undefined,
                                boxShadow: isYou ? `0 4px 16px ${partColor}25` : undefined
                              }}
                              id={`stem-row-${part.id}`}
                            >
                              {/* Left: Avatar + Badge + Part Identity */}
                              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0 max-w-[85px] xs:max-w-[115px] sm:max-w-none sm:min-w-[140px] lg:min-w-[160px]">
                                <div className="relative shrink-0">
                                  <div 
                                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full overflow-hidden p-0.5 border shrink-0"
                                    style={{ borderColor: isYou ? partColor : `${partColor}80` }}
                                  >
                                    <img
                                      src={avatarUrl}
                                      alt={isYou ? 'You' : part.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  </div>
                                  {isYou && (
                                    <span 
                                      className="absolute -bottom-0.5 -right-0.5 px-1 py-0 rounded-full text-[7px] sm:text-[9px] font-black uppercase font-mono shadow-xs border"
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

                                <div className="min-w-0 truncate">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs sm:text-sm font-extrabold text-[#F7F1F3] tracking-tight uppercase font-display truncate">
                                      {part.name}
                                    </span>
                                    {isYou && (
                                      <span 
                                        className="text-[10px] font-mono font-bold hidden md:inline"
                                        style={{ color: partColor }}
                                      >
                                        · You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] sm:text-[11px] font-mono text-[#B9AEB6] truncate font-medium">
                                    {part.range || (part.shortName ? `Part ${part.shortName}` : 'Vocal')}
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Integrated Volume Fader + Dynamic VU Waveform Meter (Desktop) */}
                              <div 
                                className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mx-0.5 sm:mx-0" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Volume Fader Slider & Readout */}
                                <div 
                                  className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 bg-[#120B17] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border"
                                  style={{ borderColor: `${partColor}30` }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleVolumeChange(part.id, volume > 0 ? 0 : 0.85)}
                                    title={volume === 0 ? 'Restore volume' : 'Zero volume'}
                                    className="hover:text-[#F7F1F3] transition-colors cursor-pointer shrink-0 p-0.5"
                                    style={{ color: isAudiblyMuted || volume === 0 ? '#f43f5e' : partColor }}
                                  >
                                    {isAudiblyMuted || volume === 0 ? (
                                      <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                                    ) : (
                                      <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    )}
                                  </button>

                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    disabled={isMuted}
                                    onChange={(e) => handleVolumeChange(part.id, parseFloat(e.target.value))}
                                    className="w-full h-1 sm:h-2 rounded cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed appearance-none shadow-inner"
                                    style={{ 
                                      accentColor: partColor,
                                      background: `linear-gradient(to right, ${partColor} 0%, ${partColor} ${Math.round(volume * 100)}%, #38243A ${Math.round(volume * 100)}%, #38243A 100%)`
                                    }}
                                    title={`${part.name} volume: ${Math.round(volume * 100)}% (Double-click to reset)`}
                                    onDoubleClick={() => handleVolumeChange(part.id, 0.85)}
                                    id={`stem-volume-fader-${part.id}`}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleVolumeChange(part.id, volume === 0.85 ? 1.0 : 0.85)}
                                    title="Click to toggle 85% / 100%"
                                    className="text-[9px] sm:text-[11px] font-mono font-bold w-6 xs:w-7 sm:w-9 text-right tabular-nums transition-colors shrink-0"
                                    style={{ color: partColor }}
                                  >
                                    {Math.round(volume * 100)}%
                                  </button>
                                </div>

                                {/* Acoustic VU Waveform Meter (Desktop / Tablet) */}
                                <div className="hidden md:flex shrink-0 w-20 lg:w-28 h-6 px-1.5 rounded-lg bg-[#120B17] border border-[rgba(255,249,247,0.08)] items-center justify-center gap-0.5 overflow-hidden">
                                  {Array.from({ length: 8 }).map((_, barIdx) => {
                                    const barSeed = ((barIdx * 31) % 45) + 15;
                                    const dynamicHeight = isPlaying && !isAudiblyMuted
                                      ? `${Math.max(15, (barSeed + Math.sin((currentTime * 5) + barIdx) * 35 * volume))}%`
                                      : '15%';

                                    return (
                                      <div
                                        key={barIdx}
                                        className="flex-1 rounded-xs transition-all duration-150"
                                        style={{
                                          height: dynamicHeight,
                                          backgroundColor: isAudiblyMuted ? '#342435' : partColor,
                                          opacity: isPlaying && !isAudiblyMuted ? 1 : 0.3
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Right: Controls (Dominant if Singer's part, Mute, Solo) */}
                              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Dominant Toggle: Shown ONLY on the selected singer's part */}
                                {isYou && (
                                  <button
                                    type="button"
                                    onClick={handleToggleDominant}
                                    className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border"
                                    style={
                                      isDominant
                                        ? {
                                            backgroundColor: partColor,
                                            borderColor: partColor,
                                            color: '#1C121F',
                                            boxShadow: `0 2px 8px ${partColor}40`
                                          }
                                        : {
                                            backgroundColor: '#2A1E2A',
                                            borderColor: 'rgba(255,249,247,0.08)',
                                            color: '#B9AEB6'
                                          }
                                    }
                                    title={isDominant ? 'Dominant ON: You on Left channel, others on Right channel' : 'Dominant OFF: Stereo playback'}
                                    id="stem-dominant-toggle-btn"
                                  >
                                    <Headphones className="w-3 h-3 shrink-0" />
                                    <span className="hidden xl:inline">Dominant</span>
                                    <span className={`text-[8px] sm:text-[9px] px-0.5 sm:px-1 py-0 rounded font-mono ${isDominant ? 'bg-black/20 text-[#1C121F] font-black' : 'bg-[rgba(255,249,247,0.08)] text-[#B9AEB6]'}`}>
                                      {isDominant ? 'L/R' : 'OFF'}
                                    </span>
                                  </button>
                                )}

                                {/* Mute Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleMute(part.id, e)}
                                  className={`w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center ${
                                    isMuted
                                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold shadow-xs'
                                      : 'bg-[#2A1E2A] hover:bg-[#342435] border-[rgba(255,249,247,0.08)] text-[#B9AEB6] hover:text-[#F7F1F3]'
                                  }`}
                                  title={isMuted ? 'Unmute voice' : 'Mute voice'}
                                  id={`stem-mute-btn-${part.id}`}
                                >
                                  M
                                </button>

                                {/* Solo Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSolo(part.id, e)}
                                  className="w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
                                  style={
                                    isSolo
                                      ? {
                                          backgroundColor: partColor,
                                          borderColor: partColor,
                                          color: '#1C121F',
                                          boxShadow: `0 2px 8px ${partColor}40`
                                        }
                                      : {
                                          backgroundColor: '#2A1E2A',
                                          borderColor: 'rgba(255,249,247,0.08)',
                                          color: '#B9AEB6'
                                        }
                                  }
                                  title={
                                    isSolo
                                      ? 'Remove solo (currently soloed)'
                                      : hasAnySolo
                                      ? 'Add to active solo mix (solo multiple parts together)'
                                      : 'Solo voice (mutes other voices)'
                                  }
                                  id={`stem-solo-btn-${part.id}`}
                                >
                                  S
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* =====================================================================
                  BOTTOM-ANCHORED PLAYBACK TRANSPORT BAR
                  Framed to the bottom of the rehearsal window with 2-row button layout
                  Hidden when Score is active in mobile landscape orientation
                  ===================================================================== */}
              {!(isScoreOpen && isMobileLandscape) && (
                <div 
                  className="shrink-0 w-full border-t border-[rgba(255,249,247,0.10)] bg-[#221823]/98 backdrop-blur-2xl px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xl z-40 text-[#F7F1F3]"
                  id="studio-transport-deck"
                  onClick={() => setIsBannerExpanded(false)}
                >
                <div className="max-w-4xl mx-auto space-y-2">
                  
                  {/* Interactive Scrubber Bar with Loop Markers & Playhead Selector */}
                  <div className="flex items-center gap-2.5 relative select-none">
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#F7F1F3] font-semibold min-w-[32px]">
                      {formatDuration(currentTime)}
                    </span>

                    <div 
                      ref={progressBarRef}
                      onClick={handleProgressBarClick}
                      className="flex-1 h-3.5 flex items-center relative cursor-pointer group py-1"
                      id="studio-progress-bar-container"
                    >
                      {/* Base track bar */}
                      <div className="w-full h-1.5 sm:h-2 bg-black/30 rounded-full overflow-hidden relative">
                        {/* Played progress fill */}
                        <div 
                          className="h-full bg-[#ff5757] rounded-full transition-all duration-75"
                          style={{ width: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
                        />
                      </div>

                      {/* Loop Region Highlight */}
                      {(loopStart !== null || loopEnd !== null) && (
                        <div 
                          className={`absolute top-1/2 -translate-y-1/2 h-2 sm:h-2.5 border-y pointer-events-none rounded-xs ${
                            isLooping
                              ? 'bg-amber-400/35 border-amber-400/80'
                              : 'bg-white/20 border-white/30'
                          }`}
                          style={{
                            left: `${(loopStart !== null ? loopStart / duration : 0) * 100}%`,
                            width: `${((loopEnd !== null ? loopEnd : duration) / duration - (loopStart !== null ? loopStart : 0) / duration) * 100}%`
                          }}
                        />
                      )}

                      {/* Loop Start Marker (Flag A) */}
                      {loopStart !== null && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-25 flex flex-col items-center group-marker-flag"
                          style={{ left: `${(loopStart / duration) * 100}%` }}
                        >
                          <button
                            type="button"
                            onMouseDown={(e) => handleMarkerDragStart('start', e)}
                            onTouchStart={(e) => handleMarkerDragStart('start', e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMarkerMenu(prev => prev === 'start' ? null : 'start');
                              setShowPlayheadMenu(false);
                            }}
                            className={`px-1 py-0.5 rounded-sm text-[9px] font-black font-mono shadow-md flex items-center gap-0.5 border cursor-ew-resize active:scale-110 transition-all ${
                              isLooping
                                ? 'bg-amber-400 text-[#1C121F] border-amber-300'
                                : 'bg-[#2A1E2A] text-slate-300 border-white/20'
                            }`}
                            title={`Loop Start: ${formatDuration(loopStart)} (drag to move, click to toggle menu)`}
                          >
                            <Flag className={`w-2.5 h-2.5 ${isLooping ? 'fill-[#1C121F] text-[#1C121F]' : 'fill-slate-300 text-slate-300'}`} />
                            <span>A</span>
                          </button>

                          {/* Delete Loop Start Tooltip Menu */}
                          {activeMarkerMenu === 'start' && (
                            <div 
                              id="studio-marker-menu"
                              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2A1E2A]/98 backdrop-blur-md border border-rose-500/50 shadow-2xl rounded-xl p-1 z-40 min-w-[125px] animate-fadeIn text-xs font-mono"
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearLoopStart(e);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 hover:text-white font-bold w-full text-left cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Delete Start</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Loop End Marker (Flag B) */}
                      {loopEnd !== null && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-25 flex flex-col items-center group-marker-flag"
                          style={{ left: `${(loopEnd / duration) * 100}%` }}
                        >
                          <button
                            type="button"
                            onMouseDown={(e) => handleMarkerDragStart('end', e)}
                            onTouchStart={(e) => handleMarkerDragStart('end', e)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMarkerMenu(prev => prev === 'end' ? null : 'end');
                              setShowPlayheadMenu(false);
                            }}
                            className={`px-1 py-0.5 rounded-sm text-[9px] font-black font-mono shadow-md flex items-center gap-0.5 border cursor-ew-resize active:scale-110 transition-all ${
                              isLooping
                                ? 'bg-amber-400 text-[#1C121F] border-amber-300'
                                : 'bg-[#2A1E2A] text-slate-300 border-white/20'
                            }`}
                            title={`Loop End: ${formatDuration(loopEnd)} (drag to move, click to toggle menu)`}
                          >
                            <Flag className={`w-2.5 h-2.5 ${isLooping ? 'fill-[#1C121F] text-[#1C121F]' : 'fill-slate-300 text-slate-300'}`} />
                            <span>B</span>
                          </button>

                          {/* Delete Loop End Tooltip Menu */}
                          {activeMarkerMenu === 'end' && (
                            <div 
                              id="studio-marker-menu"
                              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2A1E2A]/98 backdrop-blur-md border border-rose-500/50 shadow-2xl rounded-xl p-1 z-40 min-w-[125px] animate-fadeIn text-xs font-mono"
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearLoopEnd(e);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 hover:text-white font-bold w-full text-left cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Delete End</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Playhead Thumb */}
                      <div 
                        id="studio-playhead-thumb"
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white border-2 border-[#ff5757] shadow-md shadow-black/80 cursor-pointer z-30 hover:scale-125 active:scale-110 transition-transform"
                        style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlayheadMenu(prev => !prev);
                          setActiveMarkerMenu(null);
                        }}
                        title="Click playhead to set Loop Start or End"
                      >
                        {/* Playhead Marker Selector Tooltip Menu */}
                        {showPlayheadMenu && (
                          <div 
                            id="studio-playhead-menu"
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2A1E2A]/98 backdrop-blur-xl border border-amber-400/50 shadow-2xl rounded-xl p-1 flex flex-col gap-1 z-40 min-w-[110px] animate-fadeIn text-xs font-mono text-[#F7F1F3]"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className="px-2 py-0.5 text-[9px] text-[#B9AEB6] uppercase font-mono tracking-wider border-b border-white/10">
                              Set Loop Marker
                            </div>
                            <button
                              type="button"
                              onClick={handleSetLoopStart}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-amber-300 hover:text-white font-bold text-left cursor-pointer transition-colors"
                            >
                              <Flag className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <span>Start</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSetLoopEnd}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-amber-300 hover:text-white font-bold text-left cursor-pointer transition-colors"
                            >
                              <Flag className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <span>End</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-mono text-[#B9AEB6] min-w-[32px] text-right">
                      {formatDuration(duration)}
                    </span>
                  </div>

                  {/* ROW 1: PRIMARY PLAYBACK TRANSPORT CONTROLS */}
                  <div className="flex items-center justify-center sm:justify-between gap-2 sm:gap-4 flex-wrap">
                    
                    {/* Left context indicator */}
                    <div className="hidden sm:flex items-center gap-2 min-w-[80px]">
                      <span className="text-[11px] font-mono text-[#B9AEB6] truncate">
                        {isSetlistContext ? 'Setlist Mode' : 'Single Track'}
                      </span>
                    </div>

                    {/* Center: Track Nav + Core Playback Deck */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                      {/* Previous Track Button (Conditional on setlist/favorites context) */}
                      {isSetlistContext && (
                        <button
                          type="button"
                          disabled={!hasPrevious}
                          onClick={onPreviousSong}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] disabled:opacity-30 disabled:hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] text-[#F7F1F3] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
                          title="Previous Track"
                          id="studio-prev-track-btn"
                        >
                          <SkipBack className="h-4 w-4" />
                        </button>
                      )}

                      {/* Master Volume Speaker Popover Button (Left of -10s button) */}
                      <VolumePopupButton
                        volume={masterVolume}
                        isMuted={isMasterMuted}
                        onVolumeChange={handleMasterVolumeChange}
                        onToggleMute={handleToggleMasterMute}
                        idPrefix="modal-playback-volume"
                      />

                      {/* Rewind 10 Seconds */}
                      <button
                        type="button"
                        onClick={handleRewind10}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.12)] text-[#F7F1F3] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
                        title="Rewind 10 seconds"
                        id="studio-rewind-10-btn"
                      >
                        <Rewind10Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>

                      {/* Master Play / Pause Circular Button */}
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ff5757] hover:bg-[#ff4040] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/40 cursor-pointer border-2 border-red-300/40 shrink-0"
                        title={isPlaying ? 'Pause' : 'Play'}
                        id="studio-master-play-btn"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white ml-0.5" />
                        )}
                      </button>

                      {/* Forward 10 Seconds */}
                      <button
                        type="button"
                        onClick={handleForward10}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.12)] text-[#F7F1F3] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
                        title="Forward 10 seconds"
                        id="studio-forward-10-btn"
                      >
                        <Forward10Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>

                      {/* Next Track Button (Conditional on setlist/favorites context) */}
                      {isSetlistContext && (
                        <button
                          type="button"
                          disabled={!hasNext}
                          onClick={onNextSong}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] disabled:opacity-30 disabled:hover:bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] text-[#F7F1F3] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs"
                          title="Next Track"
                          id="studio-next-track-btn"
                        >
                          <SkipForward className="h-4 w-4" />
                        </button>
                      )}

                      {/* Loop Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsLooping(prev => !prev)}
                        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                          isLooping
                            ? 'bg-amber-400 border-amber-300 text-[#1C121F] shadow-md font-bold'
                            : 'bg-[#2A1E2A] border-[rgba(255,249,247,0.12)] text-[#F7F1F3] hover:bg-[#342435]'
                        }`}
                        title={isLooping ? 'Loop mode active' : 'Enable loop'}
                        id="studio-loop-btn"
                      >
                        <LoopIcon className="h-3.5 w-3.5" />
                      </button>

                      {/* Playback Speed Toggle */}
                      <button
                        type="button"
                        onClick={handleSpeedToggle}
                        className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-[#2A1E2A] hover:bg-[#342435] border border-[rgba(255,249,247,0.12)] text-[11px] font-mono font-bold text-[#F7F1F3] active:scale-95 transition-all cursor-pointer"
                        title="Cycle playback speed"
                        id="studio-speed-btn"
                      >
                        {playbackSpeed.toFixed(1)}x
                      </button>
                    </div>

                    {/* Right tempo indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 min-w-[80px] justify-end">
                      <span className="text-[10px] font-mono text-[#B9AEB6]">
                        {song.tempoBpm} BPM
                      </span>
                    </div>

                  </div>

                  {/* ROW 2: MUSIC PRACTICE MODE (Key Transposition & Sheet Music Score Toggle) */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[rgba(255,249,247,0.12)]">
                    
                    {/* Left: Pitch Transposition Controls */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-mono font-medium text-[#B9AEB6] hidden xs:inline">
                        Key:
                      </span>
                      <div className="inline-flex items-center overflow-hidden rounded-xl bg-[#2A1E2A] border border-[rgba(255,249,247,0.12)] text-xs shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleKeyChange(-1)}
                          className="h-7 w-6 sm:w-7 flex items-center justify-center border-r border-white/10 hover:bg-[#342435] active:scale-95 text-[#F7F1F3] transition-colors cursor-pointer font-mono font-bold"
                          title="Lower key (-1 semitone)"
                          id="studio-key-lower-btn"
                        >
                          –
                        </button>

                        <button
                          type="button"
                          onMouseDown={handlePlayKeyToneDown}
                          onMouseUp={handlePlayKeyToneUp}
                          onMouseLeave={handlePlayKeyToneUp}
                          onTouchStart={handlePlayKeyToneDown}
                          onTouchEnd={handlePlayKeyToneUp}
                          className="h-7 px-2 flex items-center justify-center text-xs font-mono font-extrabold text-amber-300 hover:bg-[#342435] transition-colors cursor-pointer select-none"
                          title="Click & hold to blow starting pitch pipe tone"
                          id="studio-key-pitch-btn"
                        >
                          <span>{effectiveKey}</span>
                          {keyOffset !== 0 && (
                            <span className="ml-1 text-[10px] font-mono text-[#B9AEB6] font-normal">
                              {keyOffset > 0 ? `+${keyOffset}` : keyOffset}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleKeyChange(1)}
                          className="h-7 w-6 sm:w-7 flex items-center justify-center border-l border-white/10 hover:bg-[#342435] active:scale-95 text-[#F7F1F3] transition-colors cursor-pointer font-mono font-bold"
                          title="Raise key (+1 semitone)"
                          id="studio-key-raise-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Center: Active Loop Info & Clear Button */}
                    {(loopStart !== null || loopEnd !== null) && (
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono ${
                        isLooping
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                          : 'bg-[#2A1E2A] border-white/10 text-slate-300'
                      }`}>
                        <Flag className={`w-2.5 h-2.5 ${isLooping ? 'fill-amber-400 text-amber-400' : 'fill-slate-300 text-slate-300'}`} />
                        <span>
                          {loopStart !== null ? formatDuration(loopStart) : '0:00'} → {loopEnd !== null ? formatDuration(loopEnd) : formatDuration(duration)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLoopStart(null);
                            setLoopEnd(null);
                            setActiveMarkerMenu(null);
                          }}
                          className="hover:text-white cursor-pointer ml-1 text-sm font-bold"
                          title="Clear loop points"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Right: Score Toggle Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsScoreOpen(prev => !prev)}
                        className={`h-7 px-3 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold ${
                          isScoreOpen
                            ? 'bg-[#ff5757] text-white border-[#ff5757] shadow-md'
                            : 'bg-[#2A1E2A] border-[rgba(255,249,247,0.12)] text-[#F7F1F3] hover:bg-white/15'
                        }`}
                        title="View PDF Sheet Music Score"
                        id="studio-score-btn"
                      >
                        <SheetMusicIcon className="h-3.5 w-3.5 text-current" />
                        <span>{isScoreOpen ? 'Close Score' : 'Score'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>
        ) : (

          /* =====================================================================
              STATE 2: COMPACT PREVIEW DRAWER MODE (Initial state before unfolding)
              ===================================================================== */
          <div className="flex-1 flex flex-col h-full min-h-0 bg-[#CBB9C7] text-[#1C121F]">
            {/* SCROLLABLE BODY */}
            <div className="p-4 sm:p-5 pb-8 space-y-4 flex-1 overflow-y-auto overscroll-contain min-h-0 bg-[#CBB9C7] text-[#1C121F]">
              
              {/* 1. MEDIA PLAYER HERO STRIP */}
              <div className="rounded-2xl bg-[#543850] border border-[#3E2843]/40 overflow-hidden shadow-md" id="preview-media-player">
                
                {/* Header with Title, Expand to Studio button, and Close Button */}
                <div className="px-4 py-3.5 sm:px-5 bg-[#2A1E2A] text-[#F7F1F3] border-b border-[#3E2843]/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-3 w-3 relative shrink-0">
                      {isPlaying && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50' : 'bg-[#EBDDE0]'}`} />
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-[#F7F1F3] font-display tracking-tight leading-tight truncate" title={song.title}>
                      {song.title}
                    </h2>
                  </div>

                  {/* Actions: Unfold to Studio & Close */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsStudioMode(true);
                        setIsScoreOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-full bg-[#3E2843] hover:bg-[#2A1E2A] text-[#D9AF8D] hover:text-[#F7F1F3] border border-[rgba(255,249,247,0.20)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold shadow-xs"
                      title="Open Sheet Music Score"
                      id="preview-open-score-btn"
                    >
                      <SheetMusicIcon className="w-3.5 h-3.5 text-[#D9AF8D]" />
                      <span className="hidden sm:inline">Score</span>
                    </button>

                    <button
                      type="button"
                      onClick={isLocked ? handleRequestAccessClick : handleJoinInClick}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer border flex items-center justify-center shadow-xs ${
                        isLocked 
                          ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-500/40' 
                          : 'bg-[#3E2843] hover:bg-[#2A1E2A] text-[#F7F1F3] border-[rgba(255,249,247,0.20)]'
                      }`}
                      title={isLocked ? "Request Access from Contributor" : "Unfold into Trackapp Studio Rehearsal"}
                      id="preview-unfold-studio-btn"
                    >
                      {isLocked ? <KeyRound className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleClose}
                      className="p-1.5 rounded-full hover:bg-[rgba(255,249,247,0.15)] text-[#EBDDE0] hover:text-[#F7F1F3] transition-colors cursor-pointer border border-transparent hover:border-[rgba(255,249,247,0.20)] flex items-center justify-center shadow-xs"
                      id="close-preview-slider"
                      title="Close Preview (Esc)"
                      aria-label="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* VIDEO MOSAIC (If Video multitrack) */}
                {isVideo && (
                  <div className="p-2.5 sm:p-3 bg-[#543850] border-b border-[#3E2843]/50">
                    <div className={`grid ${song.parts.length === 2 ? 'grid-cols-2' : song.parts.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-2'} gap-2`}>
                      {song.parts.map((part) => {
                        const avatarUrl = PART_AVATARS[part.id.toLowerCase()] || PART_AVATARS[part.name.toLowerCase()] || PART_AVATARS.lead;
                        return (
                          <div 
                            key={part.id}
                            className="relative rounded-xl overflow-hidden bg-[#19131C] border border-[rgba(255,249,247,0.12)] aspect-video sm:aspect-4/3 flex items-center justify-center group shadow-inner"
                          >
                            <img 
                              src={avatarUrl} 
                              alt={part.name}
                              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105 brightness-105' : 'brightness-75'}`}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#221823]/80 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-[rgba(255,249,247,0.15)]">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: part.color || '#D9AF8D' }}
                              />
                              <span className="text-[10px] font-bold text-[#F7F1F3] font-mono">
                                {part.name}
                              </span>
                            </div>

                            <div className="absolute top-1.5 right-1.5 text-[9px] font-mono text-[#B9AEB6] bg-[#221823]/80 px-1.5 py-0.5 rounded border border-[rgba(255,249,247,0.15)]">
                              {part.range || 'Vocal'}
                            </div>

                            {isPlaying && (
                              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                                <div className="flex items-center gap-0.5">
                                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                                  <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                                </div>
                                <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-1 rounded border border-emerald-500/30">
                                  STEM LIVE
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PLAYBACK TRANSPORT BAR */}
                <div className="p-4 sm:p-5 space-y-3.5 bg-[#543850]" id="preview-playback-transport">
                  
                  {/* Progress Slider */}
                  <div className="space-y-1">
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
                                ? '#2A1E2A'
                                : `linear-gradient(to right, #D9A7B4 0%, #D9AF8D ${(progressPercent * 0.33).toFixed(1)}%, #9EBCAB ${(progressPercent * 0.66).toFixed(1)}%, #B7A1CC ${progressPercent.toFixed(1)}%, #2A1E2A ${progressPercent.toFixed(1)}%, #2A1E2A 100%)`
                            }}
                            aria-label="Multitrack playback position"
                          />
                        </div>
                      );
                    })()}
                    <div className="flex justify-between text-[11px] font-mono px-0.5 font-medium">
                      <span className="font-bold text-[#F6E1CF] bg-[#3E2843] px-2 py-0.5 rounded-lg border border-[#D9AF8D]/30">{formatDuration(currentTime)}</span>
                      <span className="text-[#E2D6EF] font-medium bg-[#2A1E2A] px-2 py-0.5 rounded-lg border border-[#B7A1CC]/30">{formatDuration(duration)}</span>
                    </div>
                  </div>

                  {/* Transport Controls Row */}
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(prev => !prev)}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF5757] hover:bg-[#ff4040] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-white/20 shrink-0"
                      title={isPlaying ? 'Pause' : 'Play'}
                      id="preview-transport-play-btn"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current text-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-white ml-0.5" />
                      )}
                    </button>

                    {/* Voicing Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {song.parts.map(part => (
                        <span 
                          key={part.id} 
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{ 
                            backgroundColor: `${part.color || '#D9AF8D'}30`, 
                            color: '#F7F1F3',
                            border: `1px solid ${part.color || '#D9AF8D'}90`
                          }}
                        >
                          {part.shortName || part.name}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* 2. METADATA BOX (Artwork, Arranged By, Performed By, Metrics) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#DFCCCF] border border-[#573657]/20 space-y-4 shadow-sm text-[#1C121F]" id="preview-metadata-box">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#CBB9C7] border border-[#573657]/25 shrink-0 overflow-hidden relative shadow-sm">
                    <img 
                      src={song.assets?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'} 
                      alt={song.title}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-[#F7F1F3] font-mono bg-[#1C121F]/85 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/20">
                      {song.voicing}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-xs text-[#3E2843] flex flex-col gap-1">
                      <div className="truncate">
                        <span className="text-[#573657] font-semibold">Arranged By:</span>{' '}
                        <span className="text-[#1C121F] font-bold">{song.arranger ? song.arranger.replace(/^arr\.?\s*/i, '') : song.composer || 'Traditional'}</span>
                      </div>
                      {song.performerName || song.partner?.name ? (
                        <div className="truncate">
                          <span className="text-[#573657] font-semibold">As Performed By:</span>{' '}
                          <span className="text-[#1C121F] font-bold">{song.performerName || song.partner?.name}</span>
                        </div>
                      ) : null}
                      <div className="truncate">
                        <span className="text-[#573657] font-semibold">Tracks By:</span>{' '}
                        <span className="text-[#1C121F] font-bold">{song.tracksBy || song.contributorName || song.partner?.name || song.performerName || 'Trackappella Vault'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EBDDE0] text-[#3E2843] font-mono text-[10px] font-bold border border-[#573657]/20 flex items-center gap-1">
                        {isVideo ? <Video className="w-2.5 h-2.5 text-[#573657]" /> : <Music className="w-2.5 h-2.5 text-[#573657]" />}
                        {isVideo ? 'Video Multitrack' : 'Audio Multitrack'}
                      </span>
                      {song.genre && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#EBDDE0] text-[#3E2843] font-mono text-[10px] font-bold border border-[#573657]/20">
                          {song.genre}
                        </span>
                      )}
                      {song.visibility === 'members-only' && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#EBDDE0] text-[#8C4E28] border border-[#8C4E28]/30 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Group
                        </span>
                      )}
                      {onOpenContributorStudio && (song.id === 'i-hold-your-hand-in-mine' || song.title.toLowerCase().includes('hold your hand')) && (
                        <button
                          type="button"
                          onClick={() => onOpenContributorStudio(song)}
                          className="px-2.5 py-1 rounded-lg bg-[#cbb9c7] hover:bg-[#bfa7bb] text-[#1C121F] font-bold font-mono text-[10px] border border-[rgba(62,40,67,0.2)] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Open in Contributor Studio"
                        >
                          <SlidersHorizontal className="w-2.5 h-2.5 text-[#1C121F]" />
                          <span>Contributor Details & Stems</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metrics Strip */}
                <div className="grid grid-cols-4 divide-x divide-[#573657]/20 border border-[#573657]/20 bg-[#EBDDE0] rounded-xl py-2.5 px-1 text-center font-mono shadow-xs">
                  <div className="px-1">
                    <span className="text-[10px] uppercase font-bold text-[#573657] block tracking-wider">Key</span>
                    <span className="text-[#1C121F] font-black text-xs sm:text-sm truncate block mt-0.5">{song.baseKey} Maj</span>
                  </div>
                  <div className="px-1">
                    <span className="text-[10px] uppercase font-bold text-[#573657] block tracking-wider">Tempo</span>
                    <span className="text-[#1C121F] font-black text-xs sm:text-sm truncate block mt-0.5">{song.tempoBpm} BPM</span>
                  </div>
                  <div className="px-1">
                    <span className="text-[10px] uppercase font-bold text-[#573657] block tracking-wider">Length</span>
                    <span className="text-[#1C121F] font-black text-xs sm:text-sm truncate block mt-0.5">{formatDuration(duration)}</span>
                  </div>
                  <div className="px-1">
                    <span className="text-[10px] uppercase font-bold text-[#573657] block tracking-wider">Difficulty</span>
                    <span className="text-[#1C121F] font-black text-xs sm:text-sm truncate block mt-0.5">{song.difficulty || 'Intermediate'}</span>
                  </div>
                </div>
              </div>

              {/* 3. GENERAL DESCRIPTION */}
              {(song.description || song.whyTonightCopy) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#DFCCCF] border border-[#573657]/20 text-xs space-y-2.5 shadow-sm" id="preview-description-box">
                  <div className="flex items-center gap-1.5 text-[#573657] font-bold uppercase tracking-wider text-[11px] font-mono">
                    <FileText className="w-3.5 h-3.5 text-[#573657]" />
                    <span>Arrangement Overview</span>
                  </div>
                  
                  {song.description && (
                    <p className="text-[#1C121F] leading-relaxed font-medium">
                      {song.description}
                    </p>
                  )}

                  {song.whyTonightCopy && (
                    <div className="pt-2.5 border-t border-[#573657]/20 flex items-start gap-2 text-[#3E2843]">
                      <Sparkles className="w-3.5 h-3.5 text-[#573657] shrink-0 mt-0.5" />
                      <p className="italic leading-relaxed text-[11px] text-[#3E2843]">
                        "{song.whyTonightCopy}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ACCESS SECTION (Above Attributions) - Reduced single line */}
              <div 
                className="px-4 py-2.5 rounded-2xl bg-[#DFCCCF] border border-[#573657]/20 flex items-center justify-between gap-3 text-xs shadow-xs" 
                id="preview-access-section"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#573657] font-bold shrink-0">
                    Access
                  </span>
                  <span className="text-[#573657]/40">•</span>
                  {lockStatus === 'locked' && (
                    <div className="flex items-center gap-1.5 min-w-0 text-[#3E2843]">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate text-xs text-[#3E2843] font-medium">You don't have access to this track yet</span>
                    </div>
                  )}
                  {lockStatus === 'unlocked' && (
                    <div className="flex items-center gap-1.5 min-w-0 text-[#3E2843]">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-xs text-[#3E2843] font-medium">Available from Group {grantingGroupName}</span>
                    </div>
                  )}
                  {lockStatus === 'none' && (
                    <div className="flex items-center gap-1.5 min-w-0 text-[#3E2843]">
                      <Globe className="w-3.5 h-3.5 text-[#573657] shrink-0" />
                      <span className="truncate text-xs text-[#3E2843] font-medium">No permissions required</span>
                    </div>
                  )}
                </div>

                {lockStatus === 'locked' && (
                  <button
                    type="button"
                    onClick={handleRequestAccessClick}
                    className="px-3 py-1 rounded-xl bg-[#FF5757] hover:bg-[#ff6b6b] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    Request Access
                  </button>
                )}
              </div>

              {/* 4. PERFORMANCE TAKES SECTION */}
              <div 
                className="p-4 sm:p-5 rounded-2xl bg-[#DFCCCF] border border-[#573657]/20 space-y-3 transition-all hover:border-[#573657]/40 hover:bg-[#EBDDE0] cursor-pointer group/takes-card shadow-sm select-none" 
                id="preview-performance-takes-section"
                onClick={() => {
                  if (onViewPerformanceTakes && song) {
                    onViewPerformanceTakes(song.id);
                  }
                }}
              >
                <div className="flex items-center justify-between border-b border-[#573657]/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#573657] group-hover/takes-card:scale-110 transition-transform" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C121F] font-mono">
                      Performance Takes
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#1C121F] bg-[#EBDDE0] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs border border-[#573657]/20">
                    <span>{songTakes.length}</span>
                    <span>{songTakes.length === 1 ? 'Take' : 'Takes'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="text-sm font-bold text-[#1C121F] group-hover/takes-card:text-[#3E2843] transition-colors flex items-center gap-1.5">
                      <span>
                        {songTakes.length > 0 
                          ? `Performed ${songTakes.length} time${songTakes.length === 1 ? '' : 's'}` 
                          : 'No performance takes yet'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#573657] group-hover/takes-card:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs text-[#3E2843] font-medium truncate">
                      {songTakes.length > 0 
                        ? `Latest: ${songTakes[0].date} • ${songTakes[0].partName || 'Vocal Part'}`
                        : 'Take the stage to record, coach, and score your vocal performance.'}
                    </p>
                  </div>

                  {songTakes.length > 0 && (
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="text-base sm:text-lg font-black font-mono text-emerald-700">
                        {songTakes[0].pitchAccuracyScore}%
                      </span>
                      <span className="text-[9px] font-mono text-[#573657] font-semibold uppercase">
                        Top Accuracy
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. ATTRIBUTIONS SECTION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#DFCCCF] border border-[#573657]/20 space-y-3 shadow-sm" id="preview-attributions-section">
                <div className="flex items-center justify-between border-b border-[#573657]/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#573657]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C121F] font-mono">
                      Attributions
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#3E2843] bg-[#EBDDE0] border border-[#573657]/20 px-2 py-0.5 rounded-md font-semibold">
                    Track Credits
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {song.otherAttributions && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                      <span className="text-[#573657] font-semibold">Other Credits</span>
                      <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%]">
                        {song.otherAttributions}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                    <span className="text-[#573657] font-semibold">Composer</span>
                    <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%]">
                      {song.composer || 'Traditional / Public Domain'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                    <span className="text-[#573657] font-semibold">Arranger</span>
                    <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%]">
                      {song.arranger ? song.arranger.replace(/^arr\.?\s*/i, '') : song.composer || 'Traditional'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                    <span className="text-[#573657] font-semibold">Performed By</span>
                    <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%]">
                      {song.performerName || song.partner?.name || 'Various Artists'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                    <span className="text-[#573657] font-semibold">Learning Stems</span>
                    <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%]">
                      {song.tracksBy || song.contributorName || song.partner?.name || song.performerName || 'Trackappella Master'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#EBDDE0] border border-[#573657]/20">
                    <span className="text-[#573657] font-semibold">Voicing</span>
                    <span className="font-bold text-[#1C121F] text-right truncate max-w-[62%] font-mono">
                      {song.voicing} ({song.parts.map(p => p.shortName || p.name).join(', ')})
                    </span>
                  </div>
                </div>
              </div>

              {/* Generous bottom spacing spacer so attributions row is completely clear and reachable */}
              <div className="h-8 shrink-0" aria-hidden="true" />

            </div>

            {/* 5. PRIMARY CTA & REACTION ACTION FOOTER */}
            <div className="p-3 sm:p-4 bg-[#2A1E2A] border-t border-[#3E2843]/60 shrink-0 shadow-lg flex items-center justify-between gap-2 sm:gap-3 relative z-20" id="preview-primary-cta-bar">
              
              {/* Reactions Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-[#1C121F] p-1 sm:p-1.5 rounded-2xl border border-[rgba(255,249,247,0.10)] shrink-0 shadow-xs" id="preview-footer-reactions-bar">
                
                {/* Heart Upvote */}
                <button
                  type="button"
                  onClick={handleHeartClick}
                  className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors active:scale-95 cursor-pointer border border-transparent shrink-0"
                  title="Love it (Upvote)"
                  id="preview-footer-love-btn"
                >
                  <div className="relative flex items-center justify-center">
                    <Heart 
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-200 ${
                        hasUpvoted ? 'text-rose-500 fill-rose-500' : 'text-[#B9AEB6] group-hover:text-[#F7F1F3]'
                      } ${isHeartBursting ? 'animate-heart-pop' : ''}`} 
                    />

                    {isHeartBursting && (
                      <div key={burstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center -z-0">
                        <span className="absolute w-3.5 h-3.5 rounded-full bg-rose-500/40 animate-ping opacity-75" />
                        {HEART_PARTICLES.map(p => {
                          const rad = (p.angle * Math.PI) / 180;
                          const tx = Math.cos(rad) * p.distance;
                          const ty = Math.sin(rad) * p.distance;
                          return (
                            <span
                              key={p.id}
                              className="absolute inline-flex items-center justify-center animate-sprite-burst pointer-events-none"
                              style={{
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                                '--rot': `${p.angle * 1.4}deg`,
                                animationDelay: `${p.delay}ms`,
                                color: p.color
                              } as React.CSSProperties}
                            >
                              {p.icon === 'heart' ? (
                                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current" style={{ transform: `scale(${p.scale})` }}>
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              ) : p.icon === 'sparkle' ? (
                                <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current" style={{ transform: `scale(${p.scale})` }}>
                                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                              ) : (
                                <span 
                                  className="rounded-full bg-current block" 
                                  style={{ width: `${p.scale * 3.5}px`, height: `${p.scale * 3.5}px` }} 
                                />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <span className={`font-mono text-xs transition-colors ${hasUpvoted ? 'text-rose-400 font-bold' : 'text-[#B9AEB6]'}`}>
                    {lovedCount}
                  </span>
                </button>

                {/* Add to Setlist */}
                <button
                  type="button"
                  onClick={handleSaveToPlaylist}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                    savedPlaylistSuccess 
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] shadow-xs' 
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] border border-transparent'
                  }`}
                  title="Add to Setlist"
                  id="preview-footer-add-btn"
                >
                  {savedPlaylistSuccess ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9AF8D] shrink-0" />
                  ) : (
                    <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B9AEB6] shrink-0" />
                  )}
                  <span className="font-mono text-xs whitespace-nowrap">{savedPlaylistSuccess ? 'Added' : 'Add'}</span>
                </button>

                {/* Star Favorite */}
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-xl text-xs font-bold text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors active:scale-95 cursor-pointer border border-transparent shrink-0"
                  title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  id="preview-footer-favorite-btn"
                >
                  <div className="relative flex items-center justify-center">
                    <Star 
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${
                        isFavorited ? 'text-amber-400 fill-amber-400' : 'text-[#B9AEB6] group-hover:text-[#F7F1F3]'
                      } ${isStarBursting ? 'animate-star-pop' : ''}`} 
                    />

                    {isStarBursting && (
                      <div key={starBurstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center -z-0">
                        <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-400/40 animate-ping opacity-75" />
                        {STAR_PARTICLES.map(p => {
                          const rad = (p.angle * Math.PI) / 180;
                          const tx = Math.cos(rad) * p.distance;
                          const ty = Math.sin(rad) * p.distance;
                          return (
                            <span
                              key={p.id}
                              className="absolute inline-flex items-center justify-center animate-sprite-burst pointer-events-none"
                              style={{
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                                '--rot': `${p.angle * 1.4}deg`,
                                animationDelay: `${p.delay}ms`,
                                color: p.color
                              } as React.CSSProperties}
                            >
                              {p.icon === 'star' ? (
                                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current" style={{ transform: `scale(${p.scale})` }}>
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ) : p.icon === 'sparkle' ? (
                                <svg viewBox="0 0 24 24" className="w-2 h-2 fill-current" style={{ transform: `scale(${p.scale})` }}>
                                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                </svg>
                              ) : (
                                <span 
                                  className="rounded-full bg-current block" 
                                  style={{ width: `${p.scale * 3.5}px`, height: `${p.scale * 3.5}px` }} 
                                />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 sm:p-2 rounded-xl text-xs font-bold text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-all active:scale-95 cursor-pointer border border-transparent shrink-0"
                  title={copiedLink ? 'Link Copied!' : 'Copy Share Link'}
                  id="preview-footer-share-btn"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B9AEB6]" />}
                </button>
              </div>

              {/* CTA Button: "Request Access" when locked, otherwise "Join in!" */}
              {isLocked ? (
                <button
                  type="button"
                  onClick={handleRequestAccessClick}
                  className="flex-1 max-w-[190px] sm:max-w-[220px] py-2.5 sm:py-3 px-3 sm:px-5 rounded-2xl bg-[#FF5757] hover:bg-[#ff6b6b] active:bg-[#e03838] text-white font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-[#FF5757]/20 flex items-center justify-center gap-1.5 sm:gap-2 group select-none ml-auto whitespace-nowrap min-w-0 shrink-0"
                  title="Request access to this arrangement"
                  id="preview-action-request-access-btn"
                >
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform text-white drop-shadow-xs shrink-0" />
                  <span className="tracking-tight text-white font-bold whitespace-nowrap truncate">
                    Request Access
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleLaunchStageMode}
                    className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#3E2843] hover:bg-[#1C121F] active:bg-[#2A1E2A] text-[#F7F1F3] font-bold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0 border border-[rgba(255,249,247,0.15)]"
                    title="Enter Stage Mode directly"
                    id="preview-action-perform-btn"
                  >
                    <Disc3 className="w-3.5 h-3.5 text-[#D9AF8D] shrink-0" />
                    <span className="tracking-tight text-[#F7F1F3] font-bold whitespace-nowrap">
                      Perform
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleJoinInClick}
                    className="py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-xl bg-[#FF5757] hover:bg-[#ff6b6b] active:bg-[#e03838] text-white font-bold text-xs sm:text-sm md:text-base transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-[#FF5757]/20 flex items-center justify-center gap-1.5 sm:gap-2 group select-none whitespace-nowrap shrink-0"
                    title="Join in and unfold Trackapp Studio rehearsal"
                    id="preview-action-join-in-btn"
                  >
                    <MicVocal className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform text-white drop-shadow-xs shrink-0" />
                    <span className="tracking-tight text-white font-bold whitespace-nowrap truncate">
                      Join in!
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </aside>

      {/* ========================================================================= */}
      {/* REQUEST ACCESS CONFIRMATION MODAL                                         */}
      {/* Notifies the contributor asking for access (to be integrated into        */}
      {/* Contributor Studio mode)                                                 */}
      {/* ========================================================================= */}
      {isRequestAccessModalOpen && song && (
        <div className="fixed inset-0 z-50 bg-[#1C121F]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div 
            className="w-full max-w-md bg-[#DFCCCF] border border-[#573657]/30 rounded-3xl p-6 shadow-2xl space-y-4 text-[#1C121F]"
            id="request-access-modal"
          >
            {!requestSubmitted ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#573657]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#EBDDE0] border border-[#573657]/20 text-[#FF5757] flex items-center justify-center shadow-xs">
                      <KeyRound className="w-4 h-4 text-[#FF5757]" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1C121F] tracking-tight">Request Access</h3>
                      <p className="text-[11px] text-[#3E2843]">Notify contributor for repertoire unlock</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRequestAccessModalOpen(false)}
                    className="p-1.5 rounded-xl bg-[#EBDDE0] hover:bg-[#CBB9C7] border border-[#573657]/20 text-[#3E2843] hover:text-[#1C121F] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Track details summary */}
                <div className="p-3.5 rounded-2xl bg-[#EBDDE0] border border-[#573657]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#573657] font-semibold">Arrangement</span>
                    <span className="text-xs font-bold text-[#1C121F] truncate max-w-[65%]">{song.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#573657] font-semibold">Contributor</span>
                    <span className="text-xs font-bold text-[#1C121F] truncate max-w-[65%">{contributorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#573657] font-semibold">Voicing</span>
                    <span className="text-xs font-mono text-[#1C121F] font-bold">{song.voicing}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#3E2843] leading-relaxed font-medium">
                  <p>
                    You don't have access to this track yet. Submitting this request will send an access request to <strong className="text-[#1C121F] font-bold">{contributorName}</strong> asking for permission to unlock rehearsal multitracks and learning materials.
                  </p>
                  {currentUser ? (
                    <p className="text-[11px] text-[#573657] pt-1">
                      Requesting as: <span className="text-[#1C121F] font-bold">{currentUser.displayName}</span> ({currentUser.email || 'Singer Account'})
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-700 font-semibold pt-1">
                      You are not currently signed in. We recommend signing in so the contributor can tie access to your account.
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-bold text-[#573657] uppercase tracking-wider font-mono">
                    Note for Contributor (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={requestNote}
                    onChange={e => setRequestNote(e.target.value)}
                    placeholder="e.g. Preparing for upcoming performance, singing lead..."
                    className="w-full px-3 py-2 rounded-xl bg-[#EBDDE0] border border-[#573657]/25 text-[#1C121F] text-xs placeholder:text-[#573657]/50 focus:outline-none focus:ring-2 focus:ring-[#FF5757]/40 focus:border-[#FF5757] transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#573657]/20">
                  <button
                    type="button"
                    onClick={() => setIsRequestAccessModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#EBDDE0] hover:bg-[#CBB9C7] text-[#3E2843] hover:text-[#1C121F] text-xs font-bold transition-colors cursor-pointer border border-[#573657]/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmitRequest}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5757] hover:bg-[#ff6b6b] active:bg-[#e03838] text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-[#FF5757]/20 flex items-center gap-1.5 active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success notification screen */
              <div className="py-4 text-center space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#1C121F]">Access Request Dispatched</h3>
                  <p className="text-xs text-[#3E2843] max-w-sm mx-auto leading-relaxed">
                    We’ve notified <strong className="text-[#1C121F] font-bold">{contributorName}</strong> that you’ve requested access to <strong className="text-[#1C121F] font-bold">"{song.title}"</strong>.
                  </p>
                  <p className="text-[11px] text-[#573657] pt-1 font-medium">
                    Once approved by the contributor in Contributor Studio, this track will automatically become available in your repertoire.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRequestAccessModalOpen(false);
                      setRequestSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#EBDDE0] hover:bg-[#CBB9C7] text-[#1C121F] text-xs font-bold transition-colors cursor-pointer shadow-sm border border-[#573657]/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
