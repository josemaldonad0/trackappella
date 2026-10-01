import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Lock, 
  Music, 
  Disc3, 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  Share2, 
  Link, 
  Users, 
  Copy, 
  Check, 
  Clock,
  Layers,
  Sliders,
  ShieldCheck,
  Eye,
  RotateCcw,
  VolumeX,
  FastForward,
  Rewind,
  TrendingUp,
  Heart,
  Search,
  ChevronRight,
  ExternalLink,
  Edit3,
  SlidersHorizontal,
  CheckCircle,
  ZoomIn
} from 'lucide-react';
import { Song, TrackappellaGroup, UserProfile } from '../../types';
import { ContributorArrangement, DirectAccessUser } from '../../types/contributor';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { BipolarSyncSlider } from './BipolarSyncSlider';
import { vocalEngine } from '../../audio/vocalSynthEngine';

export type OverviewTab = 'overview' | 'details' | 'stems' | 'chart' | 'access';

interface ArrangementOverviewDetailViewProps {
  arrangement: ContributorArrangement;
  groups: TrackappellaGroup[];
  currentUser: UserProfile | null;
  initialTab?: OverviewTab;
  songs?: Song[];
  onBack: () => void;
  onSaveDraft: (arrangement: ContributorArrangement) => void;
  onPublish: (arrangement: ContributorArrangement) => void;
  onUpdateArrangement: (updated: ContributorArrangement) => void;
  onStartPractice?: (song: Song, partId?: string) => void;
  onStartStageMode?: (song: Song, partId?: string) => void;
  onUpdateSongOffsets?: (songId: string, offsets: Record<string, number>) => void;
}

interface PartStemConfig {
  id: string;
  name: string;
  range: string;
  hasAudio: boolean;
  color: string;
  syncOffset: number;
  waveSeed: number;
  audioUrl?: string;
}

const PART_COLORS = [
  '#8A3D5B', // Soprano / Tenor 1 (dusty rose)
  '#7C4010', // Lead / Soprano 2 (apricot)
  '#2B5B44', // Bari / Alto 1 (celadon)
  '#573657', // Bass / Alto 2 (lilac)
  '#994717', // Part 5 (amber)
  '#7C3A82', // Part 6 (plum)
  '#1E4E5F', // Part 7 (teal)
  '#3E2843'  // Part 8 (deep eggplant)
];

const DEFAULT_DIRECT_USERS: DirectAccessUser[] = [
  {
    id: 'usr_dir_1',
    name: 'Maya Lin',
    email: 'maya.soprano@acappellanet.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    grantedAt: 'Aug 24, 2026',
    sessionsCount: 12,
    lastActive: '2 days ago',
    revoked: false
  },
  {
    id: 'usr_dir_2',
    name: 'Julian Henderson',
    email: 'julian.tenor@voxworks.org',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    grantedAt: 'Aug 28, 2026',
    sessionsCount: 7,
    lastActive: 'Yesterday',
    revoked: false
  },
  {
    id: 'usr_dir_3',
    name: 'Chloe Bennett',
    email: 'chloe.b@choralacademy.edu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    grantedAt: 'Sep 1, 2026',
    sessionsCount: 5,
    lastActive: '3 hours ago',
    revoked: false
  }
];

function generateDefaultParts(count: number, voicingType: string, existingParts?: PartStemConfig[]): PartStemConfig[] {
  const standardPresets: Record<string, string[]> = {
    'SATB': ['Soprano', 'Alto', 'Tenor', 'Bass'],
    'TLBB': ['Tenor', 'Lead', 'Baritone', 'Bass'],
    'SSAA': ['Tenor (Soprano 1)', 'Lead (Soprano 2)', 'Bari (Alto 1)', 'Bass (Alto 2)'],
    'TTBB': ['Tenor', 'Lead', 'Baritone', 'Bass'],
    'SAB': ['Soprano', 'Alto', 'Baritone'],
    'SSA': ['Soprano 1', 'Soprano 2', 'Alto'],
    'TTB': ['Tenor 1', 'Tenor 2', 'Bass'],
    'Double Choir': ['Soprano 1', 'Alto 1', 'Tenor 1', 'Bass 1', 'Soprano 2', 'Alto 2', 'Tenor 2', 'Bass 2']
  };

  const standardRanges = [
    'C4 - A5', 'G3 - D5', 'C3 - G4', 'E2 - C4',
    'D4 - G5', 'Bb3 - Eb5', 'G3 - C5', 'Eb2 - Bb3'
  ];

  const names = standardPresets[voicingType] || [];
  const result: PartStemConfig[] = [];

  for (let i = 0; i < count; i++) {
    const existing = existingParts && existingParts[i];
    if (existing) {
      result.push(existing);
      continue;
    }

    let name = names[i] || `Vocal Part ${i + 1}`;
    if (count > names.length) {
      name = `Part ${i + 1}`;
    }

    result.push({
      id: `part_${i + 1}`,
      name,
      range: standardRanges[i % standardRanges.length],
      hasAudio: true,
      color: PART_COLORS[i % PART_COLORS.length],
      syncOffset: 0,
      waveSeed: (i + 1) * 19
    });
  }

  return result;
}

export const ArrangementOverviewDetailView: React.FC<ArrangementOverviewDetailViewProps> = ({
  arrangement,
  groups,
  currentUser,
  initialTab = 'overview',
  songs = [],
  onBack,
  onSaveDraft,
  onPublish,
  onUpdateArrangement,
  onStartPractice,
  onStartStageMode,
  onUpdateSongOffsets
}) => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<OverviewTab>(initialTab);

  // Core arrangement state
  const [title, setTitle] = useState(arrangement.title);
  const [type, setType] = useState<'song' | 'tag'>(arrangement.type);
  const [voicingPreset, setVoicingPreset] = useState<string>(() => {
    const v = arrangement.voicing || 'SATB';
    const usuals = ['SATB', 'TLBB', 'SSAA', 'TTBB', 'SAB', 'SSA', 'TTB', 'Double Choir'];
    return usuals.includes(v) ? v : 'Custom';
  });
  const [customVoicing, setCustomVoicing] = useState<string>(
    arrangement.customVoicing || (voicingPreset === 'Custom' ? arrangement.voicing : '')
  );
  const [partsCount, setPartsCount] = useState<number>(() => {
    if (arrangement.partsCount) return arrangement.partsCount;
    if (arrangement.partsConfig) return arrangement.partsConfig.length;
    if (arrangement.voicing === 'SAB' || arrangement.voicing === 'SSA' || arrangement.voicing === 'TTB') return 3;
    if (arrangement.voicing === 'Double Choir') return 8;
    return 4;
  });

  const [arranger, setArranger] = useState(arrangement.arranger || '');
  const [composer, setComposer] = useState(arrangement.composer || '');
  const [genre, setGenre] = useState(arrangement.genre || 'Barbershop / A Cappella');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Intermediate' | 'Advanced' | 'Virtuoso'>(
    arrangement.difficulty || 'Intermediate'
  );
  const [baseKey, setBaseKey] = useState(arrangement.baseKey || 'Eb');
  const [tempoBpm, setTempoBpm] = useState<number>(arrangement.tempoBpm || 112);
  const [description, setDescription] = useState(arrangement.description || '');

  // Access scope & distribution
  const [accessScope, setAccessScope] = useState<'public' | 'restricted'>(
    arrangement.accessScope || (arrangement.status === 'published-restricted' ? 'restricted' : 'public')
  );
  const [grantedGroupCodes, setGrantedGroupCodes] = useState<string[]>(
    arrangement.grantedGroupCodes && arrangement.grantedGroupCodes.length > 0
      ? arrangement.grantedGroupCodes
      : (arrangement.status === 'published-restricted' ? ['SPECTRUM2026'] : [])
  );
  const [directUsers, setDirectUsers] = useState<DirectAccessUser[]>(
    arrangement.directUsers && arrangement.directUsers.length > 0
      ? arrangement.directUsers
      : DEFAULT_DIRECT_USERS
  );
  const [inviteToken, setInviteToken] = useState<string>(
    arrangement.inviteLinkToken || `invite_${(arrangement.id || 'ihyhim').replace('arr_', '')}`
  );

  // Content health flags
  const [hasChart, setHasChart] = useState<boolean>(
    arrangement.hasChart ?? (arrangement.configHealth !== 'missing-chart')
  );
  const [hasArt, setHasArt] = useState<boolean>(
    arrangement.coverArtUrl ? true : (arrangement.configHealth !== 'missing-art')
  );
  const [hasStems, setHasStems] = useState<boolean>(
    arrangement.hasStems ?? true
  );

  // Audio duration (default 153.13s for I Hold Your Hand In Mine, 45s for tags)
  const [activeDuration, setActiveDuration] = useState<number>(() => {
    return arrangement.songId === 'i-hold-your-hand-in-mine' || arrangement.title?.toLowerCase().includes('hold your hand') ? 153.13 : 45;
  });

  // Parts stem configurations & audio waveforms
  const [parts, setParts] = useState<PartStemConfig[]>(() => {
    const matched = songs.find(s => s.id === arrangement.songId || s.title?.toLowerCase() === arrangement.title?.toLowerCase());
    const isHoldSong = arrangement.id === 'arr_i_hold_your_hand_in_mine' || 
                       arrangement.songId === 'i-hold-your-hand-in-mine' || 
                       arrangement.title?.toLowerCase().includes('hold your hand');

    const defaultAudioMap: Record<string, string> = {
      'tenor': '/audio/trk1/hold_newTenor.mp3',
      'lead': '/audio/trk1/hold_newLead.mp3',
      'baritone': '/audio/trk1/hold_newBari.mp3',
      'bass': '/audio/trk1/hold_newBass.mp3'
    };

    const targetSongId = arrangement.songId || arrangement.id;
    let savedOffsets: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(`trackappella_sync_offsets_${targetSongId}`) ||
                  (targetSongId.includes('hold') || arrangement.title?.toLowerCase().includes('hold your hand') 
                    ? localStorage.getItem('trackappella_sync_offsets_i-hold-your-hand-in-mine') 
                    : null);
      if (raw) {
        savedOffsets = JSON.parse(raw);
      }
    } catch {}

    if (arrangement.partsConfig && arrangement.partsConfig.length > 0) {
      return arrangement.partsConfig.map((p, i) => {
        let audioUrl = p.audioUrl;
        if (!audioUrl && matched) {
          const songPart = matched.parts.find(sp => sp.id.toLowerCase() === p.id.toLowerCase() || sp.name.toLowerCase() === p.name.toLowerCase());
          audioUrl = songPart?.audioUrl;
        }
        if (!audioUrl && isHoldSong) {
          audioUrl = defaultAudioMap[p.id.toLowerCase()] || Object.values(defaultAudioMap)[i % 4];
        }

        const effectiveOffset = savedOffsets[p.id] !== undefined 
          ? savedOffsets[p.id] 
          : (arrangement.partSyncOffsets ? arrangement.partSyncOffsets[p.id] || 0 : (p.syncOffset || 0));

        return {
          id: p.id,
          name: p.name,
          range: p.range,
          hasAudio: Boolean(p.hasAudio || audioUrl),
          audioUrl,
          color: p.color || PART_COLORS[i % PART_COLORS.length],
          syncOffset: effectiveOffset,
          waveSeed: (i + 1) * 23
        };
      });
    }

    const defaultGenerated = generateDefaultParts(partsCount, voicingPreset);
    if (isHoldSong) {
      const holdPartsMap = [
        { id: 'tenor', name: 'Tenor', audioUrl: '/audio/trk1/hold_newTenor.mp3', range: 'A3 - F5' },
        { id: 'lead', name: 'Lead', audioUrl: '/audio/trk1/hold_newLead.mp3', range: 'F3 - C5' },
        { id: 'baritone', name: 'Baritone', audioUrl: '/audio/trk1/hold_newBari.mp3', range: 'D3 - G4' },
        { id: 'bass', name: 'Bass', audioUrl: '/audio/trk1/hold_newBass.mp3', range: 'F2 - C4' }
      ];
      return defaultGenerated.map((p, i) => {
        const id = holdPartsMap[i]?.id || p.id;
        const effectiveOffset = savedOffsets[id] !== undefined 
          ? savedOffsets[id] 
          : (arrangement.partSyncOffsets ? arrangement.partSyncOffsets[id] || 0 : 0);

        return {
          ...p,
          id,
          name: holdPartsMap[i]?.name || p.name,
          range: holdPartsMap[i]?.range || p.range,
          audioUrl: holdPartsMap[i]?.audioUrl,
          hasAudio: true,
          syncOffset: effectiveOffset
        };
      });
    }
    return defaultGenerated;
  });

  const [hasUnsavedOffsets, setHasUnsavedOffsets] = useState<boolean>(false);
  const [isJustSaved, setIsJustSaved] = useState<boolean>(false);

  // Alignment test playback state & zoom
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [previewingPartId, setPreviewingPartId] = useState<string | null>(null);
  const [mutedPartIds, setMutedPartIds] = useState<string[]>([]);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [calibrationZoom, setCalibrationZoom] = useState<number>(1);

  const currentSecRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Pre-load audio stems into vocalEngine
  useEffect(() => {
    const offsetsMap: Record<string, number> = {};
    parts.forEach(p => {
      offsetsMap[p.id] = p.syncOffset;
    });
    vocalEngine.setPartSyncOffsets(offsetsMap);

    const testSong: any = {
      id: arrangement.songId || arrangement.id,
      title: arrangement.title,
      duration: activeDuration,
      parts: parts.map(p => ({
        id: p.id,
        name: p.name,
        audioUrl: p.audioUrl,
        color: p.color
      })),
      partSyncOffsets: offsetsMap
    };

    vocalEngine.setupStems(testSong);

    return () => {
      vocalEngine.stopPlayback();
    };
  }, [parts, arrangement.id, arrangement.songId, arrangement.title, activeDuration]);

  // Dynamically update track gains in vocalEngine when Solo / Mute states change
  useEffect(() => {
    if (isPlayingTest) {
      const mutes: Record<string, boolean> = {};
      const solos: Record<string, boolean> = {};
      parts.forEach(part => {
        mutes[part.id] = mutedPartIds.includes(part.id);
        solos[part.id] = previewingPartId === part.id;
      });
      vocalEngine.updateMix(mutes, solos);
    }
  }, [mutedPartIds, previewingPartId, parts, isPlayingTest]);

  // Multitrack synchronized Play / Pause toggle
  const handleTogglePlayTest = async () => {
    if (isPlayingTest) {
      vocalEngine.stopPlayback();
      setIsPlayingTest(false);
      isPlayingRef.current = false;
    } else {
      const startSec = (playbackProgress / 100) * activeDuration;
      currentSecRef.current = startSec;

      const offsetsMap: Record<string, number> = {};
      parts.forEach(p => {
        offsetsMap[p.id] = p.syncOffset;
      });
      vocalEngine.setPartSyncOffsets(offsetsMap);

      const mutes: Record<string, boolean> = {};
      const solos: Record<string, boolean> = {};
      parts.forEach(p => {
        mutes[p.id] = mutedPartIds.includes(p.id);
        solos[p.id] = previewingPartId === p.id;
      });

      const testSong: any = {
        id: arrangement.songId || arrangement.id,
        title: arrangement.title,
        duration: activeDuration,
        parts: parts.map(p => ({
          id: p.id,
          name: p.name,
          audioUrl: p.audioUrl,
          color: p.color
        })),
        partSyncOffsets: offsetsMap
      };

      try {
        await vocalEngine.startPlayback(testSong, startSec, mutes, solos, 0, 1.0);
        setIsPlayingTest(true);
        isPlayingRef.current = true;
      } catch (err) {
        console.warn('Playback error with vocalEngine:', err);
      }
    }
  };

  // Rewind all tracks to 0:00.00
  const handleRewindTest = () => {
    vocalEngine.stopPlayback();
    vocalEngine.seek(0);
    setIsPlayingTest(false);
    isPlayingRef.current = false;
    setPlaybackProgress(0);
    currentSecRef.current = 0;
  };

  // Seek timeline directly
  const handleSeekTime = (targetSec: number) => {
    const clampedSec = Math.max(0, Math.min(activeDuration, targetSec));
    currentSecRef.current = clampedSec;
    setPlaybackProgress((clampedSec / activeDuration) * 100);

    if (isPlayingTest) {
      const offsetsMap: Record<string, number> = {};
      parts.forEach(p => {
        offsetsMap[p.id] = p.syncOffset;
      });
      vocalEngine.setPartSyncOffsets(offsetsMap);

      const mutes: Record<string, boolean> = {};
      const solos: Record<string, boolean> = {};
      parts.forEach(p => {
        mutes[p.id] = mutedPartIds.includes(p.id);
        solos[p.id] = previewingPartId === p.id;
      });

      const testSong: any = {
        id: arrangement.songId || arrangement.id,
        title: arrangement.title,
        duration: activeDuration,
        parts: parts.map(p => ({
          id: p.id,
          name: p.name,
          audioUrl: p.audioUrl,
          color: p.color
        })),
        partSyncOffsets: offsetsMap
      };

      vocalEngine.startPlayback(testSong, clampedSec, mutes, solos, 0, 1.0).catch(() => {});
    } else {
      vocalEngine.seek(clampedSec);
    }
  };

  // Continuous playhead synchronization loop
  useEffect(() => {
    let animFrame: number;
    if (isPlayingTest) {
      let lastStateUpdate = 0;
      const updateLoop = (now: number) => {
        const trackTime = vocalEngine.getCurrentTrackTime();
        if (trackTime !== null && isFinite(trackTime)) {
          if (trackTime >= activeDuration) {
            handleRewindTest();
            return;
          }
          currentSecRef.current = trackTime;
          // Throttle React state update to ~30fps for the timecode and scrubber
          // while AudioWaveformVisualizer runs at 60/120Hz directly on the GPU
          if (now - lastStateUpdate > 30) {
            lastStateUpdate = now;
            setPlaybackProgress(Math.min(100, Math.max(0, (trackTime / activeDuration) * 100)));
          }
        } else {
          // Synthetic timeline fallback if audio context has not yet produced samples
          if (now - lastStateUpdate > 30) {
            lastStateUpdate = now;
            setPlaybackProgress(prev => {
              const next = prev + ((1 / 30) / activeDuration) * 100;
              if (next >= 100) {
                handleRewindTest();
                return 0;
              }
              currentSecRef.current = (next / 100) * activeDuration;
              return next;
            });
          }
        }
        animFrame = requestAnimationFrame(updateLoop);
      };
      animFrame = requestAnimationFrame(updateLoop);
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlayingTest, activeDuration]);

  // Access search and filtering
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [groupLookupResult, setGroupLookupResult] = useState<TrackappellaGroup | null | 'not-found'>(null);
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'direct' | 'group'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Derived current voicing string
  const currentVoicingString = voicingPreset === 'Custom' ? (customVoicing || 'Custom') : voicingPreset;
  const isDraft = arrangement.status === 'work-in-progress';
  const isPublic = accessScope === 'public';
  const inviteLinkUrl = `https://trackappella.app/join?code=${inviteToken}`;

  // Build updated arrangement object
  const buildCurrentArrangement = (newStatus?: 'published-public' | 'published-restricted' | 'work-in-progress'): ContributorArrangement => {
    const finalStatus = newStatus || (
      isDraft 
        ? 'work-in-progress' 
        : (accessScope === 'restricted' ? 'published-restricted' : 'published-public')
    );

    let health: ContributorArrangement['configHealth'] = 'ready';
    let configStr = 'Ready';

    if (!hasStems) {
      health = 'missing-stems';
      configStr = 'Missing stem audio';
    } else if (!hasChart) {
      health = 'missing-chart';
      configStr = 'Missing chart';
    } else if (!hasArt) {
      health = 'missing-art';
      configStr = 'Missing cover art';
    } else if (accessScope === 'restricted') {
      health = 'restricted-groups';
      configStr = grantedGroupCodes.length > 0 ? `Shared with ${grantedGroupCodes.length} groups` : 'No active groups';
    }

    const offsetsMap: Record<string, number> = {};
    parts.forEach(p => {
      offsetsMap[p.id] = p.syncOffset;
    });

    return {
      ...arrangement,
      title: title.trim() || 'Untitled Arrangement',
      type,
      voicing: currentVoicingString,
      customVoicing: voicingPreset === 'Custom' ? customVoicing : undefined,
      partsCount,
      details: `${type === 'tag' ? 'Tag' : 'Song'} · ${currentVoicingString} · ${hasChart ? 'Audio + chart' : `${partsCount} parts`}`,
      status: finalStatus,
      statusLabel: finalStatus === 'work-in-progress' ? 'Work in progress' : (finalStatus === 'published-public' ? 'Published · Public' : 'Published · Restricted'),
      configuration: configStr,
      configHealth: health,
      accessScope,
      inviteLinkToken: inviteToken,
      inviteLinkActive: true,
      grantedGroupCodes,
      directUsers,
      arranger,
      composer,
      genre,
      difficulty,
      baseKey,
      tempoBpm,
      description,
      hasChart,
      hasArt,
      hasStems,
      syncLocked: false,
      partSyncOffsets: offsetsMap,
      partsConfig: parts.map(p => ({
        id: p.id,
        name: p.name,
        range: p.range,
        hasAudio: p.hasAudio,
        audioUrl: p.audioUrl,
        syncOffset: p.syncOffset,
        color: p.color
      })),
      lastUpdated: 'Just now'
    };
  };

  // Save changes handler
  const handleSaveCurrent = () => {
    const updated = buildCurrentArrangement();
    onUpdateArrangement(updated);
    showToast(`Saved changes for "${updated.title}".`);
  };

  // Dedicated Save Timing Calibration Offsets Handler
  const handleSaveCalibrationOffsets = () => {
    const offsetsMap: Record<string, number> = {};
    parts.forEach(p => {
      offsetsMap[p.id] = p.syncOffset;
    });

    const targetSongId = arrangement.songId || arrangement.id;
    // Persist to localStorage for vocalEngine and App.tsx
    try {
      localStorage.setItem(`trackappella_sync_offsets_${targetSongId}`, JSON.stringify(offsetsMap));
      if (targetSongId.includes('hold') || arrangement.title?.toLowerCase().includes('hold your hand')) {
        localStorage.setItem('trackappella_sync_offsets_i-hold-your-hand-in-mine', JSON.stringify(offsetsMap));
      }
    } catch (e) {
      console.warn('Could not persist sync offsets to localStorage:', e);
    }

    // Set sync offsets in active vocalEngine singleton
    vocalEngine.setPartSyncOffsets(offsetsMap);

    setHasUnsavedOffsets(false);
    setIsJustSaved(true);
    setTimeout(() => setIsJustSaved(false), 2500);

    // Update parent arrangement
    const updated = buildCurrentArrangement();
    updated.partSyncOffsets = offsetsMap;
    onUpdateArrangement(updated);

    // Call callback prop to update songs state in App.tsx
    onUpdateSongOffsets?.(targetSongId, offsetsMap);

    showToast('Calibration offsets committed and saved.');
  };

  // Publish handler
  const handlePublishCurrent = () => {
    const nextStatus = accessScope === 'restricted' ? 'published-restricted' : 'published-public';
    const updated = buildCurrentArrangement(nextStatus);
    onUpdateArrangement(updated);
    onPublish(updated);
    showToast(`"${updated.title}" has been published to Trackappella!`);
  };

  // Copy share invite link
  const copyInviteLink = () => {
    try {
      navigator.clipboard.writeText(inviteLinkUrl);
      setIsCopiedLink(true);
      showToast('Invite link copied to clipboard.');
      setTimeout(() => setIsCopiedLink(false), 2500);
    } catch {
      showToast('Could not copy link automatically.');
    }
  };

  // Group Code Lookup Handler
  const handleVerifyCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setGroupLookupResult(null);
      return;
    }
    const found = groups.find(g => g.code.toUpperCase() === clean);
    if (found) {
      setGroupLookupResult(found);
    } else {
      setGroupLookupResult('not-found');
    }
  };

  // Grant group code access
  const handleGrantGroupCode = () => {
    if (!groupLookupResult || groupLookupResult === 'not-found') return;
    const code = groupLookupResult.code.toUpperCase();
    if (grantedGroupCodes.includes(code)) {
      showToast(`Group "${groupLookupResult.name}" already has access.`);
      return;
    }
    const updatedCodes = [...grantedGroupCodes, code];
    setGrantedGroupCodes(updatedCodes);
    setGroupCodeInput('');
    setGroupLookupResult(null);

    const updated = buildCurrentArrangement();
    updated.grantedGroupCodes = updatedCodes;
    onUpdateArrangement(updated);
    showToast(`Access granted to "${groupLookupResult.name}".`);
  };

  // Revoke group code access
  const handleRevokeGroupCode = (codeToRemove: string) => {
    const updatedCodes = grantedGroupCodes.filter(c => c !== codeToRemove);
    setGrantedGroupCodes(updatedCodes);
    const updated = buildCurrentArrangement();
    updated.grantedGroupCodes = updatedCodes;
    onUpdateArrangement(updated);
    showToast(`Revoked access for group code ${codeToRemove}.`);
  };

  // Revoke individual user direct access
  const handleRevokeDirectUser = (userId: string) => {
    const updatedUsers = directUsers.map(u => u.id === userId ? { ...u, revoked: true } : u);
    setDirectUsers(updatedUsers);
    const updated = buildCurrentArrangement();
    updated.directUsers = updatedUsers;
    onUpdateArrangement(updated);
    showToast('Direct singer access revoked.');
  };

  // Simulate unlock by singer
  const handleTestUnlockAsSinger = () => {
    showToast(`Simulated: "${currentUser?.name || 'A singer'}" unlocked "${title || 'this track'}".`);
  };

  // Combine group members with direct users
  const groupMembersWithAccess = useMemo(() => {
    const list: Array<{ id: string; name: string; email: string; avatar?: string; groupName: string; groupCode: string }> = [];
    (grantedGroupCodes || []).forEach(code => {
      if (!code) return;
      const g = (groups || []).find(grp => grp.code && grp.code.toUpperCase() === code.toUpperCase());
      if (g && Array.isArray(g.members)) {
        g.members.forEach(m => {
          const memName = m.displayName || (m as any).name || 'Ensemble Singer';
          const memId = m.userId || (m as any).id || `mem_${Math.random().toString(36).slice(2)}`;
          const cleanGroupName = (g.name || 'ensemble').toLowerCase().replace(/[^a-z0-9]/g, '') || 'ensemble';
          const memEmail = m.email || `${memName.toLowerCase().replace(/\s+/g, '.')}@${cleanGroupName}.org`;
          list.push({
            id: `grp_mem_${g.id || 'grp'}_${memId}`,
            name: memName,
            email: memEmail,
            avatar: m.avatar,
            groupName: g.name || 'Ensemble',
            groupCode: g.code || code
          });
        });
      }
    });
    return list;
  }, [grantedGroupCodes, groups]);

  const displayUserRows = useMemo(() => {
    let combined: Array<{
      id: string;
      name: string;
      email: string;
      avatar?: string;
      originType: 'direct' | 'group';
      originLabel: string;
      grantedAt: string;
      sessionsCount: number;
      lastActive: string;
      revoked?: boolean;
    }> = [];

    if (userFilterTab === 'all' || userFilterTab === 'direct') {
      directUsers.forEach(u => {
        combined.push({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          originType: 'direct',
          originLabel: 'Direct Link Invite',
          grantedAt: u.grantedAt,
          sessionsCount: u.sessionsCount,
          lastActive: u.lastActive,
          revoked: u.revoked
        });
      });
    }

    if (userFilterTab === 'all' || userFilterTab === 'group') {
      groupMembersWithAccess.forEach(m => {
        combined.push({
          id: m.id,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
          originType: 'group',
          originLabel: `${m.groupName} (${m.groupCode})`,
          grantedAt: 'Aug 2026',
          sessionsCount: Math.floor(Math.random() * 8) + 2,
          lastActive: 'This week',
          revoked: false
        });
      });
    }

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      combined = combined.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        u.originLabel.toLowerCase().includes(q)
      );
    }

    return combined;
  }, [directUsers, groupMembersWithAccess, userFilterTab, userSearchQuery]);

  const totalAccessCount = directUsers.filter(u => !u.revoked).length + groupMembersWithAccess.length;

  // Stems offset handling - freely editable anytime, requiring Save to commit
  const handleUpdateSyncOffset = (partId: string, newOffsetSec: number) => {
    setHasUnsavedOffsets(true);
    setParts(prev => {
      const nextParts = prev.map(p => p.id === partId ? { ...p, syncOffset: newOffsetSec } : p);
      const offsetsMap: Record<string, number> = {};
      nextParts.forEach(p => {
        offsetsMap[p.id] = Math.round(p.syncOffset * 1000);
      });
      vocalEngine.setPartSyncOffsets(offsetsMap);
      return nextParts;
    });
  };

  const handleResetAllOffsets = () => {
    setHasUnsavedOffsets(true);
    setParts(prev => {
      const nextParts = prev.map(p => ({ ...p, syncOffset: 0 }));
      const offsetsMap: Record<string, number> = {};
      nextParts.forEach(p => {
        offsetsMap[p.id] = 0;
      });
      vocalEngine.setPartSyncOffsets(offsetsMap);
      return nextParts;
    });
    showToast('All stem sync offsets reset to 0ms (click Save Offsets to commit).');
  };

  const toggleMutePart = (partId: string) => {
    setMutedPartIds(prev => 
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
  };

  const toggleSoloPart = (partId: string) => {
    setPreviewingPartId(prev => prev === partId ? null : partId);
  };

  const handlePartsCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(8, newCount));
    setPartsCount(clamped);
    setParts(prev => generateDefaultParts(clamped, voicingPreset === 'Custom' ? customVoicing : voicingPreset, prev));
    showToast(`Updated to ${clamped} vocal part${clamped > 1 ? 's' : ''}.`);
  };

  const handleVoicingPresetSelect = (preset: string) => {
    setVoicingPreset(preset);
    if (preset !== 'Custom') {
      let count = 4;
      if (preset === 'SAB' || preset === 'SSA' || preset === 'TTB') count = 3;
      else if (preset === 'Double Choir') count = 8;
      setPartsCount(count);
      setParts(prev => generateDefaultParts(count, preset, prev));
    }
  };

  // Find linked song if any
  const matchedSong = arrangement.songId ? songs.find(s => s.id === arrangement.songId) : songs[0];

  return (
    <div className="w-full min-h-screen bg-[#CBB9C7] text-[#1C121F] font-sans pb-28 animate-fadeIn" id="arrangement-overview-detail-view">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2A1E2A] text-[#F7F1F3] border border-[rgba(255,249,247,0.12)] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOP UNIFIED STICKY APP BAR                                */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#2A1E2A] text-[#F7F1F3] shadow-md border-b border-[rgba(255,249,247,0.08)] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-[#19131C] hover:bg-[#342434] text-[#F7F1F3] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Studio</span>
          </button>
          
          <div className="h-4 w-px bg-[rgba(255,249,247,0.15)]" />
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#DFCCCF]/70 hidden sm:inline">Contributor Studio /</span>
            <span className="text-sm font-bold text-[#F7F1F3] font-display truncate max-w-[200px] sm:max-w-xs">
              {title || 'Untitled Arrangement'}
            </span>

            {/* Scope / Status Badge */}
            {isDraft ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5B58D]/25 text-[#E5B58D] border border-[#E5B58D]/40 shrink-0">
                <Clock className="w-3 h-3 text-[#E5B58D]" />
                <span>Draft</span>
              </span>
            ) : isPublic ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Public</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B7A1CC]/25 text-[#DFCCCF] border border-[#B7A1CC]/40 shrink-0">
                <Lock className="w-3 h-3 text-[#B7A1CC]" />
                <span>Restricted</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Save / Action buttons */}
        <div className="flex items-center gap-2.5">
          {matchedSong && onStartPractice && (
            <button
              type="button"
              onClick={() => onStartPractice(matchedSong)}
              className="px-3.5 py-2 rounded-xl bg-[#19131C] hover:bg-[#342434] text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Practice Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={copyInviteLink}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#19131C] hover:bg-[#342434] text-[#DFCCCF] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Copy share link"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Link</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCurrent}
            className="px-3.5 py-2 rounded-xl bg-[#DFCCCF] hover:bg-[#F1E4E7] text-[#1C121F] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#573657]" />
            <span>Save Draft</span>
          </button>

          {isDraft && (
            <button
              type="button"
              onClick={handlePublishCurrent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#F7F1F3] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER                                            */}
      {/* ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* HERO CARD: TITLE & ARRANGEMENT METADATA HEADER */}
        <section className="bg-[#DFCCCF] p-6 sm:p-7 rounded-2xl shadow-md border border-[rgba(62,40,67,0.14)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#CBB9C7] text-[#3E2843] uppercase tracking-wider">
                  {type === 'tag' ? 'Vocal Tag' : 'Choral Arrangement'}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#CBB9C7] text-[#3E2843]">
                  {currentVoicingString} ({partsCount} parts)
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#CBB9C7] text-[#3E2843]">
                  Key: {baseKey} · {tempoBpm} BPM
                </span>
                {isDraft ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E5B58D]/35 text-[#7C4010] border border-[#7C4010]/20 whitespace-nowrap shrink-0">
                    <Clock className="w-3 h-3 text-[#7C4010]" />
                    <span>Work in progress</span>
                  </span>
                ) : isPublic ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 border border-emerald-600/30 whitespace-nowrap shrink-0">
                    <Globe className="w-3 h-3 text-emerald-800" />
                    <span>Public Trackappella Catalog</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#B7A1CC]/30 text-[#3E2843] border border-[#B7A1CC]/50 whitespace-nowrap shrink-0">
                    <Lock className="w-3 h-3 text-[#543850]" />
                    <span>Restricted · {grantedGroupCodes.length} {grantedGroupCodes.length === 1 ? 'Group' : 'Groups'}</span>
                  </span>
                )}
              </div>

              {/* Title Input or Prominent Display */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#1C121F] tracking-tight">
                {title || 'Untitled Arrangement'}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#573657] font-medium mt-2">
                <span>Arranger: <strong className="text-[#1C121F] font-bold">{arranger || 'Self'}</strong></span>
                {composer && (
                  <>
                    <span>•</span>
                    <span>Composer: <strong className="text-[#1C121F] font-bold">{composer}</strong></span>
                  </>
                )}
                <span>•</span>
                <span>Genre: <strong className="text-[#1C121F] font-bold">{genre}</strong></span>
                <span>•</span>
                <span>Difficulty: <strong className="text-[#1C121F] font-bold">{difficulty}</strong></span>
                <span>•</span>
                <span className="font-mono text-[11px]">Last Updated {arrangement.lastUpdated || 'Recently'}</span>
              </div>
            </div>

            {/* Quick Readiness Card / Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="p-3 bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-xl flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasStems ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-[#1C121F]">Stems: {hasStems ? 'Linked' : 'Missing'}</span>
                </div>
                <div className="h-3 w-px bg-[rgba(62,40,67,0.15)]" />
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${hasChart ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-[#1C121F]">Chart: {hasChart ? 'Ready' : 'Missing'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('stems')}
                  className="px-3.5 py-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#DFCCCF]" />
                  <span>Stems DAW</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-3.5 py-2 rounded-xl bg-[#F1E4E7] hover:bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-[#1C121F] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#573657]" />
                  <span>Edit Info</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* UNIFIED NAVIGATION TABS                                   */}
        {/* ========================================================= */}
        <div className="flex border-b border-[rgba(62,40,67,0.15)] overflow-x-auto pb-0.5 gap-2">
          {[
            { id: 'overview', label: 'Overview & Activity', icon: TrendingUp },
            { id: 'details', label: 'Arrangement Details', icon: FileText },
            { id: 'stems', label: `Vocal Stems & Sync (${parts.length})`, icon: Music },
            { id: 'chart', label: 'Sheet Music & Chart', icon: Disc3 },
            { id: 'access', label: `Access & Distribution (${accessScope === 'restricted' ? grantedGroupCodes.length : 'Public'})`, icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as OverviewTab)}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-[#DFCCCF] text-[#1C121F] border-[#2A1E2A] shadow-sm'
                    : 'text-[#3E2843] hover:text-[#1C121F] border-transparent hover:bg-[#DFCCCF]/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3A82]' : 'text-[#573657]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & ACTIVITY                                */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Singers Practicing</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 block">
                    {arrangement.singersCount || 42}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-800 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ 18% this month</span>
                </div>
              </div>

              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Rehearsal Sessions</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 block">
                    {arrangement.stageSessionsCount || 68}
                  </span>
                </div>
                <span className="text-[11px] text-[#573657] font-semibold mt-2 block">
                  Studio loop runs
                </span>
              </div>

              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Stage Mode Takes</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 block">
                    {arrangement.recordedTakesCount ? Math.floor(arrangement.recordedTakesCount * 1.5) : 29}
                  </span>
                </div>
                <span className="text-[11px] text-[#573657] font-semibold mt-2 block">
                  Minus-one live takes
                </span>
              </div>

              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Saved to Setlists</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 block">
                    {arrangement.savesCount || 18}
                  </span>
                </div>
                <span className="text-[11px] text-[#573657] font-semibold mt-2 block">
                  Repertoire favorites
                </span>
              </div>

              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Singer Reactions</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 flex items-center gap-1.5">
                    <span>{arrangement.reactionsCount || 28}</span>
                    <Heart className="w-5 h-5 text-[#8A3D5B] fill-[#8A3D5B]/20" />
                  </span>
                </div>
                <span className="text-[11px] text-[#8A3D5B] font-bold mt-2 block">
                  Applause & saves
                </span>
              </div>

              <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#3E2843] font-bold block">Recorded Audio</span>
                  <span className="text-3xl font-black font-display text-[#1C121F] mt-1.5 block">
                    {arrangement.recordedTakesCount || 14}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-bold mt-2 block">
                  Audio & video takes
                </span>
              </div>
            </div>

            {/* Quick Action & Readiness Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Readiness & Configuration Health */}
              <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#1C121F] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Configuration Health</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-500/20 px-2 py-0.5 rounded">
                    {arrangement.configuration || 'Ready'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Music className="w-4 h-4 text-[#7C4010]" />
                      <div>
                        <span className="font-bold text-[#1C121F] block">{parts.length} Vocal Stems</span>
                        <span className="text-[11px] text-[#573657]">
                          {parts.filter(p => p.hasAudio).length} of {parts.length} tracks calibrated
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stems')}
                      className="px-2.5 py-1 rounded-lg bg-[#CBB9C7] hover:bg-[#B9AEB6] text-[#1C121F] font-bold text-[11px] cursor-pointer"
                    >
                      Calibrate
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#8A3D5B]" />
                      <div>
                        <span className="font-bold text-[#1C121F] block">Sheet Music Chart</span>
                        <span className="text-[11px] text-[#573657]">
                          {hasChart ? 'PDF Chart attached' : 'Missing printable chart'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chart')}
                      className="px-2.5 py-1 rounded-lg bg-[#CBB9C7] hover:bg-[#B9AEB6] text-[#1C121F] font-bold text-[11px] cursor-pointer"
                    >
                      {hasChart ? 'View Chart' : 'Upload'}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#2B5B44]" />
                      <div>
                        <span className="font-bold text-[#1C121F] block">Access Scope</span>
                        <span className="text-[11px] text-[#573657]">
                          {accessScope === 'restricted' ? `${grantedGroupCodes.length} Groups Authorized` : 'Open Catalog (Public)'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('access')}
                      className="px-2.5 py-1 rounded-lg bg-[#CBB9C7] hover:bg-[#B9AEB6] text-[#1C121F] font-bold text-[11px] cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>

              {/* Singer Engagement Log */}
              <div className="lg:col-span-2 bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#1C121F] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#7C3A82]" />
                    <span>Recent Singer Engagement Log</span>
                  </h3>
                  <span className="text-xs text-[#573657] font-medium font-mono">Live rehearsal updates</span>
                </div>

                <div className="divide-y divide-[rgba(62,40,67,0.1)] text-xs">
                  {[
                    { text: 'A soprano learner rehearsed Measure 17-32 with isolated vocal stem', time: '14 minutes ago', badge: 'Practice', color: '#8A3D5B' },
                    { text: 'Marcus T. completed full Stage Mode performance (91% pitch accuracy)', time: '2 hours ago', badge: 'Stage Mode', color: '#7C4010' },
                    { text: 'The Raleigh Chorale added arrangement to Fall Concert Setlist', time: 'Yesterday', badge: 'Setlist', color: '#2B5B44' },
                    { text: 'Lena R. recorded Lead take and saved to private rehearsal portfolio', time: '2 days ago', badge: 'Takes', color: '#573657' },
                    { text: 'David W. favorited and rehearsed Bass sectionals with pitch guide', time: '3 days ago', badge: 'Practice', color: '#8A3D5B' }
                  ].map((log, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: log.color }} />
                        <span className="text-[#1C121F] font-medium">{log.text}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#CBB9C7] text-[#3E2843]">
                          {log.badge}
                        </span>
                        <span className="text-[11px] text-[#573657] font-mono">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: EDIT DETAILS                                       */}
        {/* ========================================================= */}
        {activeTab === 'details' && (
          <div className="bg-[#DFCCCF] p-6 sm:p-8 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-6">
            <div>
              <h2 className="text-lg font-bold font-display text-[#1C121F]">
                Arrangement Metadata & Voicing
              </h2>
              <p className="text-xs text-[#573657] font-medium mt-0.5">
                Configure song or tag title, voicing type, vocal parts count, composers, key, and tempo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Arrangement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. River of Dreams, Winter Tag No. 3"
                  className="w-full px-4 py-3 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-sm font-bold text-[#1C121F] placeholder:text-[#573657]/50 outline-none focus:border-[#7C3A82]"
                />
              </div>

              {/* Type: Song vs Tag */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Arrangement Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'song', label: 'Full Song', desc: 'Multi-page rehearsal track' },
                    { id: 'tag', label: 'Vocal Tag', desc: 'Short harmonic barbershop tag' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id as any)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        type === opt.id
                          ? 'bg-[#2A1E2A] text-[#F7F1F3] border-[#2A1E2A]'
                          : 'bg-[#F1E4E7] text-[#1C121F] border-[rgba(62,40,67,0.12)] hover:bg-[#EBDDE0]'
                      }`}
                    >
                      <span className="font-bold text-xs block">{opt.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${type === opt.id ? 'text-[#DFCCCF]/80' : 'text-[#573657]'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voicing Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Voicing Architecture
                </label>
                <div className="flex flex-wrap gap-2">
                  {['SATB', 'TLBB', 'SSAA', 'TTBB', 'SAB', 'SSA', 'TTB', 'Double Choir', 'Custom'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleVoicingPresetSelect(v)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        voicingPreset === v
                          ? 'bg-[#2A1E2A] text-[#F7F1F3] border-[#2A1E2A]'
                          : 'bg-[#F1E4E7] text-[#1C121F] border-[rgba(62,40,67,0.12)] hover:bg-[#EBDDE0]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                {voicingPreset === 'Custom' && (
                  <input
                    type="text"
                    value={customVoicing}
                    onChange={(e) => setCustomVoicing(e.target.value)}
                    placeholder="Enter custom voicing (e.g. SSAATTBB, Quintet)"
                    className="w-full mt-2 px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                  />
                )}
              </div>

              {/* Vocal Parts Count Stepper */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Vocal Parts Count (1 - 8)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => handlePartsCountChange(partsCount - 1)}
                      disabled={partsCount <= 1}
                      className="w-8 h-8 rounded-lg bg-[#DFCCCF] hover:bg-[#CBB9C7] disabled:opacity-40 text-[#1C121F] font-bold text-sm flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-[#1C121F] font-mono">
                      {partsCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePartsCountChange(partsCount + 1)}
                      disabled={partsCount >= 8}
                      className="w-8 h-8 rounded-lg bg-[#DFCCCF] hover:bg-[#CBB9C7] disabled:opacity-40 text-[#1C121F] font-bold text-sm flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-[#573657]">
                    Generates {partsCount} synchronized track lanes in Stems DAW.
                  </span>
                </div>
              </div>

              {/* Arranger */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Arranger
                </label>
                <input
                  type="text"
                  value={arranger}
                  onChange={(e) => setArranger(e.target.value)}
                  placeholder="e.g. Kirby Shaw, David Wright, Self"
                  className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                />
              </div>

              {/* Composer */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Composer / Original Artist
                </label>
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="e.g. Billy Joel, Traditional"
                  className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                />
              </div>

              {/* Base Key & Tempo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                    Base Key
                  </label>
                  <input
                    type="text"
                    value={baseKey}
                    onChange={(e) => setBaseKey(e.target.value)}
                    placeholder="e.g. Eb, F, Bb"
                    className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    value={tempoBpm}
                    onChange={(e) => setTempoBpm(Number(e.target.value))}
                    min={40}
                    max={240}
                    className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                  />
                </div>
              </div>

              {/* Genre & Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Virtuoso">Virtuoso</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Barbershop, Jazz, Choral"
                    className="w-full px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-bold text-[#1C121F] outline-none"
                  />
                </div>
              </div>

              {/* Description / Performance Notes */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-[#1C121F] uppercase font-mono tracking-wider">
                  Arranger Notes & Performance Guide
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share rehearsal tips, vowel shapes, breathing suggestions, or context for singers..."
                  className="w-full px-4 py-3 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-medium text-[#1C121F] placeholder:text-[#573657]/50 outline-none focus:border-[#7C3A82]"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[rgba(62,40,67,0.12)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="px-5 py-2.5 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#DFCCCF]" />
                <span>Save Metadata Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VOCAL STEMS & AUDIO SYNC (DAW WORKFLOW)             */}
        {/* ========================================================= */}
        {activeTab === 'stems' && (
          <div className="space-y-6">
            
            {/* DAW Channel Rack & Multi-Track Waveform Lanes */}
            <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-[rgba(62,40,67,0.12)] pb-4 gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#1C121F]">
                    Multitrack Vocal Stem Calibration Rack
                  </h3>
                  <p className="text-xs text-[#573657] mt-0.5">
                    Real audio stem envelopes are rendered below. Audio is silent during flat sections. Drag the bipolar center slider (±500ms) or micro-nudge to calibrate offset synchronization.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#3E2843] bg-[#CBB9C7] px-3 py-1.5 rounded-xl">
                    {parts.length} Active Tracks
                  </span>
                </div>
              </div>

              {/* Track Lanes */}
              <div className="space-y-3 pt-2">
                {parts.map((part, idx) => {
                  const isMuted = mutedPartIds.includes(part.id);
                  const isSoloed = previewingPartId === part.id;
                  const isDimmed = previewingPartId !== null && !isSoloed;

                  return (
                    <div 
                      key={part.id}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                        isSoloed 
                          ? 'bg-[#F1E4E7] border-[#7C3A82] shadow-sm' 
                          : isMuted || isDimmed
                          ? 'bg-[#DFCCCF]/60 border-[rgba(62,40,67,0.06)] opacity-70'
                          : 'bg-[#F1E4E7] border-[rgba(62,40,67,0.12)]'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        
                        {/* Track Header Row: Part Name & Audio File (50% reduced vertical height) */}
                        <div className="flex items-center justify-between gap-2 h-4 leading-none">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-[#CBB9C7] text-[#1C121F] shrink-0 leading-none">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={part.name}
                              onChange={(e) => {
                                const nextName = e.target.value;
                                setParts(prev => prev.map(p => p.id === part.id ? { ...p, name: nextName } : p));
                              }}
                              className="font-bold text-xs text-[#1C121F] bg-transparent border-b border-transparent hover:border-[rgba(62,40,67,0.2)] focus:border-[#7C3A82] outline-none w-auto max-w-[180px] py-0 leading-none h-4"
                              placeholder="Part name"
                            />
                            {part.audioUrl && (
                              <span 
                                className="text-[9px] font-mono font-bold px-1.5 py-0 rounded bg-emerald-500/15 text-emerald-900 border border-emerald-600/20 truncate max-w-[240px] flex items-center gap-1 h-3.5 leading-none" 
                                title={part.audioUrl}
                              >
                                <Music className="w-2.5 h-2.5 text-emerald-800 shrink-0" />
                                <span className="truncate">{part.audioUrl.split('/').pop()}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Track Alignment Row: Color Bar + Solo/Mute + Expanded Waveform + Sync Slider */}
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">

                          {/* Left of Waveform: Color Indicator, Solo, Mute */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div 
                              className="w-2.5 h-11 rounded-full shrink-0" 
                              style={{ backgroundColor: part.color }} 
                              title={`${part.name} track color`}
                            />

                            {/* S & M Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleSoloPart(part.id)}
                                className={`w-8 h-8 rounded-lg text-xs font-black font-mono flex items-center justify-center transition-colors cursor-pointer ${
                                  isSoloed 
                                    ? 'bg-[#E5B58D] text-[#1C121F] shadow-xs' 
                                    : 'bg-[#DFCCCF] text-[#3E2843] hover:bg-[#CBB9C7]'
                                }`}
                                title="Solo track"
                              >
                                S
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleMutePart(part.id)}
                                className={`w-8 h-8 rounded-lg text-xs font-black font-mono flex items-center justify-center transition-colors cursor-pointer ${
                                  isMuted 
                                    ? 'bg-rose-600 text-white shadow-xs' 
                                    : 'bg-[#DFCCCF] text-[#3E2843] hover:bg-[#CBB9C7]'
                                }`}
                                title="Mute track"
                              >
                                M
                              </button>
                            </div>
                          </div>

                          {/* Expanded Continuous Waveform Visualizer */}
                          <div className="flex-1 min-w-[220px]">
                            <AudioWaveformVisualizer
                              partId={part.id}
                              audioUrl={part.audioUrl}
                              seed={part.waveSeed}
                              color={part.color}
                              syncOffset={part.syncOffset}
                              height={44}
                              isSoloed={isSoloed}
                              isDimmed={isDimmed || isMuted}
                              partIndex={idx}
                              isPlaying={isPlayingTest}
                              zoomFactor={calibrationZoom}
                              playheadProgress={isPlayingTest ? playbackProgress : null}
                              playheadTime={currentSecRef.current}
                              duration={activeDuration}
                              onSeekTime={handleSeekTime}
                            />
                          </div>

                          {/* Bipolar Sync Slider with Center Grab Notch - always editable */}
                          <div className="w-full lg:w-72 shrink-0">
                            <BipolarSyncSlider
                              value={part.syncOffset}
                              color={part.color}
                              onChange={(val) => handleUpdateSyncOffset(part.id, val)}
                            />
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Part Button */}
              {parts.length < 8 && (
                <button
                  type="button"
                  onClick={() => handlePartsCountChange(parts.length + 1)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-[rgba(62,40,67,0.2)] hover:border-[#7C3A82] text-[#3E2843] hover:text-[#1C121F] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-3"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vocal Part Track</span>
                </button>
              )}

              {/* Media Player Console at Bottom of Stem Rack */}
              <div className="mt-6 pt-5 border-t border-[rgba(62,40,67,0.15)] bg-[#2A1E2A] text-[#F7F1F3] p-4 sm:p-5 rounded-2xl shadow-xl border border-[rgba(255,249,247,0.1)] space-y-4">
                
                {/* Timeline Scrubber */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#DFCCCF]/80 px-1">
                    <span>
                      {Math.floor(((playbackProgress / 100) * activeDuration) / 60)}:
                      {(((playbackProgress / 100) * activeDuration) % 60).toFixed(1).padStart(4, '0')}
                    </span>
                    <span>
                      {Math.floor(activeDuration / 60)}:
                      {(activeDuration % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.05"
                    value={playbackProgress}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value);
                      handleSeekTime((pct / 100) * activeDuration);
                    }}
                    className="w-full h-2 bg-[#19131C] rounded-lg appearance-none cursor-pointer accent-[#E5B58D]"
                  />
                </div>

                {/* Media Player Controls Bar - Centered Play Button, Timecode/Zoom Left, Commit Right */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-1">
                  
                  {/* Left Group: Timecode & Zoom Level Slider */}
                  <div className="flex items-center gap-2.5 justify-start order-2 md:order-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-[#DFCCCF]/90 bg-[#19131C] px-3 py-2 rounded-xl border border-[rgba(255,249,247,0.06)]">
                      <span className="text-[#DFCCCF]/60 text-[10px] uppercase font-bold">Time</span>
                      <strong className="text-[#F7F1F3]">
                        {Math.floor(((playbackProgress / 100) * activeDuration) / 60)}:
                        {(((playbackProgress / 100) * activeDuration) % 60).toFixed(2).padStart(5, '0')}
                      </strong>
                    </div>

                    {/* Zoom Slider Control */}
                    <div className="flex items-center gap-2 bg-[#19131C] px-2.5 py-1.5 rounded-xl border border-[rgba(255,249,247,0.06)]">
                      <div className="flex items-center gap-1 text-[#DFCCCF]/60">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-mono font-bold">Zoom</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.1"
                        value={calibrationZoom}
                        onChange={(e) => setCalibrationZoom(parseFloat(e.target.value))}
                        className="w-16 sm:w-20 md:w-24 h-1.5 bg-[#2A1E2A] rounded-lg appearance-none cursor-pointer accent-[#E5B58D]"
                        title={`Zoom: ${calibrationZoom.toFixed(1)}x (drag to adjust, click readout to reset)`}
                      />
                      <button
                        type="button"
                        onClick={() => setCalibrationZoom(1)}
                        className="text-xs font-mono font-bold text-[#E5B58D] hover:underline cursor-pointer min-w-[28px] text-right"
                        title="Click to reset zoom to 1.0x"
                      >
                        {calibrationZoom.toFixed(1)}x
                      </button>
                    </div>
                  </div>

                  {/* Middle Group: Centered Regular Play Button & Rewind */}
                  <div className="flex items-center justify-center gap-3 order-1 md:order-2">
                    <button
                      type="button"
                      onClick={handleRewindTest}
                      className="w-10 h-10 rounded-full bg-[#19131C] hover:bg-[#342434] text-[#DFCCCF] hover:text-[#F7F1F3] transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-md border border-[rgba(255,249,247,0.06)]"
                      title="Rewind to start (0:00)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePlayTest}
                      className={`w-12 h-12 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                        isPlayingTest 
                          ? 'bg-[#E5B58D] text-[#1C121F] hover:bg-[#d8a479] ring-4 ring-[#E5B58D]/25' 
                          : 'bg-[#DFCCCF] text-[#1C121F] hover:bg-[#F1E4E7]'
                      }`}
                      title={isPlayingTest ? "Pause" : "Play"}
                      aria-label={isPlayingTest ? "Pause" : "Play"}
                    >
                      {isPlayingTest ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Right Group: Reset to 0ms & Save Offsets Commit Button */}
                  <div className="flex items-center gap-2.5 justify-end order-3">
                    <button
                      type="button"
                      onClick={handleResetAllOffsets}
                      className="px-3.5 py-2.5 rounded-xl bg-[#19131C] hover:bg-[#342434] text-[#DFCCCF] hover:text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer border border-[rgba(255,249,247,0.06)]"
                      title="Reset all tracks timing offset to 0ms"
                    >
                      Reset 0ms
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCalibrationOffsets}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer font-sans ${
                        isJustSaved
                          ? 'bg-emerald-600 text-white'
                          : hasUnsavedOffsets
                            ? 'bg-[#E5B58D] text-[#1C121F] hover:bg-[#d8a479] ring-2 ring-[#E5B58D]/40'
                            : 'bg-[#E5B58D] text-[#1C121F] hover:bg-[#d8a479]'
                      }`}
                      title="Save calibration offsets to commit changes"
                    >
                      {isJustSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Offsets</span>
                          {hasUnsavedOffsets && (
                            <span className="w-2 h-2 rounded-full bg-[#7C3A82] animate-pulse ml-0.5" title="Unsaved offset changes" />
                          )}
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SHEET MUSIC & CHART                                */}
        {/* ========================================================= */}
        {activeTab === 'chart' && (
          <div className="bg-[#DFCCCF] p-6 sm:p-8 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-[#1C121F]">
                  Sheet Music Chart & Score Configuration
                </h2>
                <p className="text-xs text-[#573657] font-medium mt-0.5">
                  Attach printable PDF scores, configure key signatures, measure alignment, and lyrics guide.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHasChart(!hasChart);
                    showToast(hasChart ? 'Detached chart PDF.' : 'Attached sample arrangement PDF.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#DFCCCF]" />
                  <span>{hasChart ? 'Replace PDF Chart' : 'Upload PDF Chart'}</span>
                </button>
              </div>
            </div>

            {hasChart ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Preview Mockup */}
                <div className="lg:col-span-2 bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[rgba(62,40,67,0.1)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-[#8A3D5B]" />
                      <div>
                        <span className="font-bold text-sm text-[#1C121F] block">{title}_vocal_score.pdf</span>
                        <span className="text-[11px] text-[#573657] font-mono">4 pages · 1.4 MB · High Resolution</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-900 bg-emerald-500/20 px-2 py-0.5 rounded">
                      Linked
                    </span>
                  </div>

                  {/* Clean Mock Score View */}
                  <div className="bg-[#FAF5F7] border border-[rgba(62,40,67,0.15)] rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                    <Disc3 className="w-10 h-10 text-[#573657]/40 animate-pulse" />
                    <h4 className="font-serif text-lg font-bold text-[#1C121F]">
                      {title}
                    </h4>
                    <p className="text-xs text-[#573657] font-mono max-w-sm">
                      Voiced for {currentVoicingString} · Key of {baseKey} · {tempoBpm} BPM
                    </p>
                    <div className="w-full max-w-md h-0.5 bg-[rgba(62,40,67,0.15)] my-2" />
                    <div className="space-y-1 text-xs text-[#3E2843] font-serif italic">
                      <p>“Sing together in four-part close barbershop harmony...”</p>
                      <p className="text-[10px] text-[#573657] font-mono not-italic">Measure 1 to 48 · Full Rehearsal System</p>
                    </div>
                  </div>
                </div>

                {/* Chart Settings */}
                <div className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#1C121F]">
                    Chart Metadata
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-[#573657] block">Original Key Signature</span>
                      <span className="font-bold text-[#1C121F] font-mono mt-0.5 block">{baseKey} Major</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#573657] block">Time Signature</span>
                      <span className="font-bold text-[#1C121F] font-mono mt-0.5 block">4/4 Common Time</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#573657] block">Singer Print Permissions</span>
                      <span className="font-bold text-emerald-900 mt-0.5 block">Allowed for authorized users</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#573657] block">Stage Mode Sheet Integration</span>
                      <span className="font-bold text-[#1C121F] mt-0.5 block">Synchronized score viewer ready</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-[rgba(62,40,67,0.2)] rounded-2xl space-y-3">
                <FileText className="w-12 h-12 text-[#573657]/40 mx-auto" />
                <h3 className="font-bold text-base text-[#1C121F]">No Chart Attached Yet</h3>
                <p className="text-xs text-[#573657] max-w-md mx-auto">
                  Uploading a PDF score allows singers to read sheet music in Rehearsal Studio and Stage Mode alongside the vocal stems.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasChart(true);
                    showToast('Attached sample arrangement score.');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#2A1E2A] text-[#F7F1F3] text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach PDF Chart</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACCESS & SINGER ROSTER                             */}
        {/* ========================================================= */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            
            {/* Scope Switcher Banner */}
            <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
              <div>
                <h2 className="text-lg font-bold font-display text-[#1C121F]">
                  Distribution & Access Control
                </h2>
                <p className="text-xs text-[#573657] font-medium mt-0.5">
                  Choose whether this arrangement is discoverable in the public catalog, or restricted to specific ensembles and direct invite links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <button
                  type="button"
                  onClick={() => setAccessScope('public')}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    accessScope === 'public'
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] border-[#2A1E2A] shadow-sm'
                      : 'bg-[#F1E4E7] text-[#1C121F] border-[rgba(62,40,67,0.12)] hover:bg-[#EBDDE0]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm">Public Catalog</span>
                  </div>
                  <p className={`text-xs ${accessScope === 'public' ? 'text-[#DFCCCF]/80' : 'text-[#573657]'}`}>
                    Any registered singer on Trackappella can practice, record takes, and favorite this arrangement.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessScope('restricted')}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    accessScope === 'restricted'
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] border-[#2A1E2A] shadow-sm'
                      : 'bg-[#F1E4E7] text-[#1C121F] border-[rgba(62,40,67,0.12)] hover:bg-[#EBDDE0]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-[#DFCCCF]" />
                    <span className="font-bold text-sm">Restricted Track</span>
                  </div>
                  <p className={`text-xs ${accessScope === 'restricted' ? 'text-[#DFCCCF]/80' : 'text-[#573657]'}`}>
                    Only ensembles with authorized group codes or singers with direct invite links can unlock.
                  </p>
                </button>
              </div>
            </div>

            {/* If Restricted, Show Full Group Manager & Singer Roster */}
            {accessScope === 'restricted' ? (
              <div className="space-y-6">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                        Singers with Access
                      </span>
                      <div className="text-3xl font-black font-display text-[#1C121F] mt-1">
                        {totalAccessCount}
                      </div>
                      <span className="text-[11px] text-[#573657] font-semibold mt-1 block">
                        {directUsers.filter(u => !u.revoked).length} Direct · {groupMembersWithAccess.length} via Groups
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#CBB9C7] text-[#573657]">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                        Authorized Groups
                      </span>
                      <div className="text-3xl font-black font-display text-[#1C121F] mt-1">
                        {grantedGroupCodes.length}
                      </div>
                      <span className="text-[11px] text-[#573657] font-mono mt-1 block truncate max-w-[180px]">
                        Codes: {grantedGroupCodes.join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#CBB9C7] text-[#7C4010]">
                      <Layers className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                        Direct Invite Link
                      </span>
                      <div className="text-sm font-bold text-emerald-900 mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                        <span>Active & Ready</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyInviteLink}
                        className="text-[11px] text-[#7C3A82] hover:text-[#1C121F] font-bold font-mono mt-1 block cursor-pointer underline"
                      >
                        Copy invite URL
                      </button>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#CBB9C7] text-emerald-800">
                      <Link className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Grant Access Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Group Code Input & Manager */}
                  <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1C121F] uppercase font-mono tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7C4010]" />
                        <span>Grant Access by Group Code</span>
                      </h3>
                      <p className="text-xs text-[#573657] mt-1 font-medium">
                        Enter the code provided by an ensemble director to unlock this track for their members.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={groupCodeInput}
                        onChange={(e) => {
                          setGroupCodeInput(e.target.value.toUpperCase());
                          handleVerifyCode(e.target.value);
                        }}
                        placeholder="e.g. SPECTRUM2026, MASTERS77"
                        className="flex-1 px-3.5 py-2.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] rounded-xl text-xs font-mono text-[#1C121F] placeholder:text-[#573657]/50 uppercase outline-none focus:border-[#7C3A82]"
                      />
                      <button
                        type="button"
                        onClick={handleGrantGroupCode}
                        disabled={!groupLookupResult || groupLookupResult === 'not-found'}
                        className="px-4 py-2.5 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    </div>

                    {groupLookupResult && groupLookupResult !== 'not-found' && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-600/20 text-xs text-emerald-950 flex items-center justify-between">
                        <div>
                          <span>Found: <strong>{groupLookupResult.name}</strong></span>
                          <span className="block text-[10px] text-emerald-800">Director: {groupLookupResult.creatorName || 'Admin'}</span>
                        </div>
                        <span className="font-mono text-[11px] bg-emerald-600/20 px-2 py-0.5 rounded text-emerald-900 font-bold">
                          {groupLookupResult.members.length} singers
                        </span>
                      </div>
                    )}

                    {groupLookupResult === 'not-found' && (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-xs text-rose-900 font-semibold">
                        No group found with code "{groupCodeInput}".
                      </div>
                    )}

                    {/* Granted Groups List */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-[#3E2843] font-bold block">
                        Ensembles with active access:
                      </span>
                      {grantedGroupCodes.map(code => {
                        const matched = groups.find(g => g.code.toUpperCase() === code.toUpperCase());
                        return (
                          <div 
                            key={code}
                            className="p-3 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.1)] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Users className="w-4 h-4 text-[#573657]" />
                              <div>
                                <span className="font-bold text-[#1C121F] block">
                                  {matched ? matched.name : `Group Code: ${code}`}
                                </span>
                                <span className="text-[10px] text-[#573657] font-mono">
                                  Code: {code} · {matched ? `${matched.members.length} active singers` : 'Group'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRevokeGroupCode(code)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Individual Invite Link */}
                  <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1C121F] uppercase font-mono tracking-wider flex items-center gap-2">
                        <Link className="w-4 h-4 text-emerald-800" />
                        <span>Direct Individual Invite Link</span>
                      </h3>
                      <p className="text-xs text-[#573657] mt-1 font-medium">
                        Share this unique link with an individual singer. When opened, this arrangement is permanently unlocked for their account.
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-xl flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[#3E2843] font-bold truncate">
                        {inviteLinkUrl}
                      </span>
                      <button
                        type="button"
                        onClick={copyInviteLink}
                        className="px-3 py-1.5 rounded-lg bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#DFCCCF]" />}
                        <span>{isCopiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.1)] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[#1C121F] block">Simulate User Unlock</span>
                        <span className="text-[11px] text-[#573657]">Test how the link automatically unlocks the arrangement for a singer</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestUnlockAsSinger}
                        className="px-3 py-1.5 rounded-lg bg-[#CBB9C7] hover:bg-[#B9AEB6] text-[#1C121F] font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Test Unlock Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* Authorized Singers Roster Table */}
                <div className="bg-[#DFCCCF] p-6 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1C121F] font-display">
                        Authorized Singers Roster ({displayUserRows.length})
                      </h3>
                      <p className="text-xs text-[#3E2843] font-medium mt-0.5">
                        Live roster of singers accessing through ensemble memberships or direct links.
                      </p>
                    </div>

                    {/* Filter and Search Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex bg-[#CBB9C7] p-1 rounded-xl text-xs">
                        {[
                          { id: 'all', label: `All ${totalAccessCount}` },
                          { id: 'direct', label: `Direct (${directUsers.filter(u => !u.revoked).length})` },
                          { id: 'group', label: `Group (${groupMembersWithAccess.length})` }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setUserFilterTab(tab.id as any)}
                            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                              userFilterTab === tab.id
                                ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                                : 'text-[#3E2843] hover:text-[#1C121F]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#573657] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Search singers..."
                          className="pl-7 pr-3 py-1.5 bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-xl text-xs text-[#1C121F] placeholder:text-[#573657]/50 outline-none w-40 sm:w-48 focus:border-[#7C3A82]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table of Users */}
                  <div className="overflow-x-auto rounded-xl border border-[rgba(62,40,67,0.12)] bg-[#F1E4E7]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#CBB9C7] border-b border-[rgba(62,40,67,0.12)] text-[11px] font-mono uppercase tracking-wider text-[#3E2843] font-bold">
                          <th className="py-3 px-4">Singer</th>
                          <th className="py-3 px-4">Access Type</th>
                          <th className="py-3 px-4">Access Origin</th>
                          <th className="py-3 px-4">Granted Date</th>
                          <th className="py-3 px-4">Activity</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(62,40,67,0.08)]">
                        {displayUserRows.map(row => (
                          <tr key={row.id} className="hover:bg-[#CBB9C7]/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {row.avatar ? (
                                  <img src={row.avatar} alt={row.name} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-[#2A1E2A] flex items-center justify-center font-bold text-[11px] text-[#F7F1F3]">
                                    {row.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-[#1C121F] block">{row.name}</span>
                                  <span className="text-[10px] text-[#573657] font-mono">{row.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {row.originType === 'direct' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900">
                                  <Link className="w-3 h-3" />
                                  <span>Direct Access</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#CBB9C7] text-[#3E2843]">
                                  <Users className="w-3 h-3" />
                                  <span>Group Member</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-[#1C121F] font-mono text-[11px] font-bold">
                              {row.originLabel}
                            </td>

                            <td className="py-3 px-4 text-[#573657] font-mono text-[11px]">
                              {row.grantedAt}
                            </td>

                            <td className="py-3 px-4 text-[#1C121F]">
                              <span className="font-mono text-[11px] font-bold">{row.sessionsCount} sessions</span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              {row.originType === 'direct' ? (
                                row.revoked ? (
                                  <span className="text-[11px] font-bold text-rose-800 bg-rose-500/15 px-2 py-0.5 rounded">
                                    Revoked
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeDirectUser(row.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                )
                              ) : (
                                <span className="text-[11px] text-[#573657] font-mono">
                                  Managed via Group
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* Public Catalog Details */
              <div className="bg-[#DFCCCF] p-6 sm:p-8 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-900">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1C121F]">
                      Open to all Trackappella singers
                    </h3>
                    <p className="text-xs text-[#573657]">
                      This track is published to the public library. Singers can discover and practice your arrangement anytime.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.1)] flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs text-[#1C121F] block">Direct Practice URL</span>
                    <span className="text-[11px] text-[#573657] font-mono">{inviteLinkUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="px-3.5 py-2 rounded-xl bg-[#2A1E2A] text-[#F7F1F3] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Share URL</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};
