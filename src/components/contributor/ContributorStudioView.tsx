import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Disc3, 
  Sparkles, 
  Award, 
  Heart, 
  Star, 
  ArrowUpRight, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Lock, 
  Globe, 
  Play, 
  Eye, 
  HelpCircle,
  TrendingUp,
  X,
  ExternalLink,
  Trash2,
  Share2,
  Sliders,
  Calendar,
  Link
} from 'lucide-react';
import { Song, UserProfile, TrackappellaGroup } from '../../types';
import { 
  ContributorArrangement 
} from '../../types/contributor';
import { ArrangementOverviewDetailView, OverviewTab } from './ArrangementOverviewDetailView';

interface ContributorStudioViewProps {
  currentUser: UserProfile | null;
  songs: Song[];
  groups?: TrackappellaGroup[];
  initialArrangementId?: string | null;
  onOpenAuth: () => void;
  onOpenSongPreview: (song: Song) => void;
  onStartPractice: (song: Song, partId?: string) => void;
  onStartStageMode: (song: Song, partId?: string) => void;
  onNavigateHome: () => void;
  onUpdateSongOffsets?: (songId: string, offsets: Record<string, number>) => void;
}

// Initial arrangements with user-contributed "I Hold Your Hand in Mine"
const INITIAL_ARRANGEMENTS: ContributorArrangement[] = [
  {
    id: 'arr_i_hold_your_hand_in_mine',
    title: 'I Hold Your Hand in Mine',
    type: 'song',
    voicing: 'TLBB',
    details: 'Song · TLBB · Audio + chart (4 parts)',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_ihyhim_user_share',
    inviteLinkActive: true,
    grantedGroupCodes: ['SPECTRUM2026'],
    directUsers: [
      {
        id: 'usr_dir_1',
        name: 'Maya Lin',
        email: 'maya.soprano@acappellanet.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        grantedAt: 'Aug 24, 2026',
        sessionsCount: 14,
        lastActive: '1 hour ago',
        revoked: false
      },
      {
        id: 'usr_dir_2',
        name: 'Julian Henderson',
        email: 'julian.tenor@voxworks.org',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        grantedAt: 'Aug 28, 2026',
        sessionsCount: 9,
        lastActive: 'Yesterday',
        revoked: false
      },
      {
        id: 'usr_dir_3',
        name: 'Chloe Bennett',
        email: 'chloe.b@choralacademy.edu',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        grantedAt: 'Sep 1, 2026',
        sessionsCount: 6,
        lastActive: '3 hours ago',
        revoked: false
      }
    ],
    singersCount: 126,
    stageSessionsCount: 238,
    recordedTakesCount: 48,
    reactionsCount: 89,
    savesCount: 54,
    lastUpdated: 'Just now',
    songId: 'i-hold-your-hand-in-mine',
    arranger: 'Jose Maldonado',
    composer: 'Tom Lehrer',
    genre: 'Barbershop / Satire',
    difficulty: 'Intermediate',
    baseKey: 'F',
    tempoBpm: 88,
    description: 'Try your hand at this 4-part arrangement of the Tom Lehrer classic, in barbershop-adjacent style. Rich 4-part TLBB stems in the key of F with isolated rehearsal tracks.',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    hasChart: true,
    hasArt: true,
    hasStems: true,
    partsCount: 4,
    syncLocked: false,
    partSyncOffsets: {
      'tenor': 0,
      'lead': 0,
      'baritone': 0,
      'bass': 0
    },
    partsConfig: [
      {
        id: 'tenor',
        name: 'Tenor',
        range: 'A3 - F5',
        hasAudio: true,
        audioUrl: '/audio/trk1/hold_newTenor.mp3',
        syncOffset: 0,
        color: '#8A3D5B'
      },
      {
        id: 'lead',
        name: 'Lead',
        range: 'F3 - C5',
        hasAudio: true,
        audioUrl: '/audio/trk1/hold_newLead.mp3',
        syncOffset: 0,
        color: '#7C4010'
      },
      {
        id: 'baritone',
        name: 'Baritone',
        range: 'D3 - G4',
        hasAudio: true,
        audioUrl: '/audio/trk1/hold_newBari.mp3',
        syncOffset: 0,
        color: '#2B5B44'
      },
      {
        id: 'bass',
        name: 'Bass',
        range: 'F2 - C4',
        hasAudio: true,
        audioUrl: '/audio/trk1/hold_newBass.mp3',
        syncOffset: 0,
        color: '#573657'
      }
    ]
  },
  {
    id: 'arr_river_of_dreams',
    title: 'River of Dreams',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SATB · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_river_dreams_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 42,
    stageSessionsCount: 68,
    recordedTakesCount: 18,
    reactionsCount: 28,
    savesCount: 18,
    lastUpdated: 'Today',
    songId: 'seed_bright_side',
    arranger: 'Kirby Shaw',
    composer: 'Billy Joel',
    baseKey: 'Eb',
    tempoBpm: 116,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_winter_tag',
    title: 'Winter Tag No. 3',
    type: 'tag',
    voicing: 'SSAA',
    details: 'Tag · SSAA · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_winter_tag_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 31,
    stageSessionsCount: 44,
    recordedTakesCount: 12,
    reactionsCount: 34,
    savesCount: 14,
    lastUpdated: '2 days ago',
    songId: 'seed_tag_after_youve_gone',
    arranger: 'David Wright',
    baseKey: 'F',
    tempoBpm: 76,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_hold_on',
    title: 'Hold On',
    type: 'song',
    voicing: 'TTBB',
    details: 'Song · TTBB · Audio + chart',
    status: 'published-restricted',
    statusLabel: 'Published · Restricted',
    configuration: 'Shared with 2 groups',
    configHealth: 'restricted-groups',
    accessScope: 'restricted',
    inviteLinkToken: 'arr_hold_on_priv77',
    inviteLinkActive: true,
    grantedGroupCodes: ['SPECTRUM2026', 'MASTERS77'],
    directUsers: [
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
    ],
    singersCount: 24,
    stageSessionsCount: 19,
    recordedTakesCount: 9,
    reactionsCount: 12,
    savesCount: 6,
    lastUpdated: 'Sep 2',
    songId: 'seed_misty',
    arranger: 'Aaron Dale',
    baseKey: 'Bb',
    tempoBpm: 92,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_midnight_train',
    title: 'Midnight Train',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SATB · 4 parts',
    status: 'work-in-progress',
    statusLabel: 'Work in progress',
    configuration: 'Missing chart',
    configHealth: 'missing-chart',
    accessScope: 'public',
    inviteLinkToken: 'arr_midnight_draft',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: null,
    stageSessionsCount: null,
    recordedTakesCount: null,
    reactionsCount: null,
    savesCount: null,
    lastUpdated: 'Yesterday',
    arranger: 'Self',
    baseKey: 'G',
    tempoBpm: 124,
    hasChart: false,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_choral_warmup_2',
    title: 'Choral Warm-Up No. 2',
    type: 'tag',
    voicing: 'SAB',
    details: 'Tag · SAB · 3 parts',
    status: 'work-in-progress',
    statusLabel: 'Work in progress',
    configuration: 'Missing cover art',
    configHealth: 'missing-art',
    accessScope: 'public',
    inviteLinkToken: 'arr_warmup2_draft',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: null,
    stageSessionsCount: null,
    recordedTakesCount: null,
    reactionsCount: null,
    savesCount: null,
    lastUpdated: 'Aug 28',
    arranger: 'Self',
    baseKey: 'D',
    tempoBpm: 84,
    hasChart: true,
    hasArt: false,
    hasStems: true
  },
  {
    id: 'arr_bright_morning',
    title: 'Bright Morning',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SATB · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_bright_morn_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 17,
    stageSessionsCount: 22,
    recordedTakesCount: 8,
    reactionsCount: 19,
    savesCount: 9,
    lastUpdated: 'Aug 25',
    songId: 'seed_irish_blessing',
    arranger: 'Kirby Shaw',
    baseKey: 'C',
    tempoBpm: 104,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_harmony_loop',
    title: 'Harmony Loop',
    type: 'tag',
    voicing: 'SATB',
    details: 'Tag · SATB · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_harmony_loop_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 14,
    stageSessionsCount: 16,
    recordedTakesCount: 1,
    reactionsCount: 8,
    savesCount: 5,
    lastUpdated: 'Aug 19',
    songId: 'seed_tag_heart_of_my_heart',
    arranger: 'David Wright',
    baseKey: 'Ab',
    tempoBpm: 72,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_irish_blessing',
    title: 'Irish Blessing (Encore)',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SATB · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_irish_enc_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 11,
    stageSessionsCount: 14,
    recordedTakesCount: 4,
    reactionsCount: 7,
    savesCount: 4,
    lastUpdated: 'Aug 10',
    songId: 'seed_irish_blessing',
    arranger: 'Kirby Shaw',
    baseKey: 'F',
    tempoBpm: 68,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_cry_no_more',
    title: 'Cry No More Tag',
    type: 'tag',
    voicing: 'TTBB',
    details: 'Tag · TTBB · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_cry_tag_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 9,
    stageSessionsCount: 12,
    recordedTakesCount: 3,
    reactionsCount: 5,
    savesCount: 3,
    lastUpdated: 'Jul 30',
    songId: 'seed_tag_cry_no_more',
    arranger: 'Self',
    baseKey: 'Eb',
    tempoBpm: 80,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_misty_harbor',
    title: 'Misty Harbor',
    type: 'song',
    voicing: 'SSAA',
    details: 'Song · SSAA · Audio + chart',
    status: 'published-public',
    statusLabel: 'Published · Public',
    configuration: 'Ready',
    configHealth: 'ready',
    accessScope: 'public',
    inviteLinkToken: 'arr_misty_harbor_pub',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: 8,
    stageSessionsCount: 9,
    recordedTakesCount: 3,
    reactionsCount: 4,
    savesCount: 2,
    lastUpdated: 'Jul 18',
    songId: 'seed_misty',
    arranger: 'Self',
    baseKey: 'Bb',
    tempoBpm: 90,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_festival_sanctus',
    title: 'Festival Sanctus',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SATB · Audio + chart',
    status: 'published-restricted',
    statusLabel: 'Published · Restricted',
    configuration: 'Shared with 1 group',
    configHealth: 'restricted-groups',
    accessScope: 'restricted',
    inviteLinkToken: 'arr_sanctus_priv_88',
    inviteLinkActive: true,
    grantedGroupCodes: ['MASTERS77'],
    directUsers: [],
    singersCount: 6,
    stageSessionsCount: 8,
    recordedTakesCount: 2,
    reactionsCount: 3,
    savesCount: 1,
    lastUpdated: 'Jun 29',
    arranger: 'Kirby Shaw',
    baseKey: 'D',
    tempoBpm: 132,
    hasChart: true,
    hasArt: true,
    hasStems: true
  },
  {
    id: 'arr_deep_river',
    title: 'Deep River Choral Fugue',
    type: 'song',
    voicing: 'SATB',
    details: 'Song · SSAATTBB · 8 parts',
    status: 'work-in-progress',
    statusLabel: 'Work in progress',
    configuration: 'Missing stem audio',
    configHealth: 'missing-stems',
    accessScope: 'public',
    inviteLinkToken: 'arr_deep_river_draft',
    inviteLinkActive: true,
    grantedGroupCodes: [],
    directUsers: [],
    singersCount: null,
    stageSessionsCount: null,
    recordedTakesCount: null,
    reactionsCount: null,
    savesCount: null,
    lastUpdated: 'Jun 14',
    arranger: 'Self',
    baseKey: 'Eb',
    tempoBpm: 60,
    hasChart: true,
    hasArt: true,
    hasStems: false
  }
];

export const ContributorStudioView: React.FC<ContributorStudioViewProps> = ({
  currentUser,
  songs,
  groups = [],
  initialArrangementId,
  onOpenAuth,
  onOpenSongPreview,
  onStartPractice,
  onStartStageMode,
  onNavigateHome,
  onUpdateSongOffsets
}) => {
  // Navigation Sub-View State: 'dashboard' | 'overview' | 'editor' | 'access-detail'
  const [subView, setSubView] = useState<'dashboard' | 'overview' | 'editor' | 'access-detail'>('dashboard');
  const [selectedArrangement, setSelectedArrangement] = useState<ContributorArrangement | null>(null);
  const [overviewTab, setOverviewTab] = useState<OverviewTab>('overview');

  // Page Controls State (Dashboard)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [arrangementFilter, setArrangementFilter] = useState<'all' | 'songs' | 'tags' | 'public' | 'restricted'>('all');
  
  // Arrangements Data & Table Controls
  const [arrangements, setArrangements] = useState<ContributorArrangement[]>(() => {
    const holdArr = INITIAL_ARRANGEMENTS[0];
    const saved = localStorage.getItem('trackappella_contributor_arrangements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const holdIndex = parsed.findIndex((a: ContributorArrangement) => 
            a.id === 'arr_i_hold_your_hand_in_mine' || 
            a.songId === 'i-hold-your-hand-in-mine' || 
            a.title?.toLowerCase().includes('hold your hand')
          );
          if (holdIndex >= 0) {
            const existing = parsed[holdIndex];
            const merged = {
              ...holdArr,
              ...existing,
              // Always guarantee audio stems and PDF chart URLs are present
              partsConfig: holdArr.partsConfig?.map((p, i) => {
                const userPart = existing.partsConfig?.[i];
                return {
                  ...p,
                  ...(userPart || {}),
                  audioUrl: p.audioUrl
                };
              }) || holdArr.partsConfig
            };
            const copy = [...parsed];
            copy[holdIndex] = merged;
            return copy;
          }
          return [holdArr, ...parsed];
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_ARRANGEMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('trackappella_contributor_arrangements', JSON.stringify(arrangements));
    } catch {}
  }, [arrangements]);

  // Open initial arrangement if specified (e.g. from song preview / quick link)
  useEffect(() => {
    if (initialArrangementId) {
      const targetId = initialArrangementId.toLowerCase();
      const found = arrangements.find(a => 
        a.id.toLowerCase() === targetId || 
        a.songId?.toLowerCase() === targetId ||
        (targetId.includes('hold') && (a.id.includes('hold') || a.songId?.includes('hold') || a.title?.toLowerCase().includes('hold your hand')))
      );
      if (found) {
        setSelectedArrangement(found);
        setOverviewTab('overview');
        setSubView('overview');
      }
    }
  }, [initialArrangementId, arrangements]);
  const [tableFilterTab, setTableFilterTab] = useState<'all' | 'drafts' | 'published' | 'public' | 'restricted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'active' | 'title'>('updated');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [visibleRowCount, setVisibleRowCount] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch to unified arrangement overview detail page
  const handleOpenArrangementOverview = (arr: ContributorArrangement, tab: OverviewTab = 'overview') => {
    setSelectedArrangement(arr);
    setOverviewTab(tab);
    setSubView('overview');
  };

  // Switch to dedicated editor for new arrangement
  const handleOpenCreateNew = () => {
    const newArr: ContributorArrangement = {
      id: `arr_draft_${Date.now()}`,
      title: '',
      type: 'song',
      voicing: 'SATB',
      details: 'Song · SATB · 4 parts',
      status: 'work-in-progress',
      statusLabel: 'Work in progress',
      configuration: 'Missing chart',
      configHealth: 'missing-chart',
      accessScope: 'public',
      inviteLinkToken: `invite_${Date.now()}`,
      inviteLinkActive: true,
      grantedGroupCodes: [],
      directUsers: [],
      singersCount: null,
      stageSessionsCount: null,
      recordedTakesCount: null,
      reactionsCount: null,
      savesCount: null,
      lastUpdated: 'Just now',
      arranger: currentUser?.name || 'Self',
      baseKey: 'Eb',
      tempoBpm: 112,
      hasChart: false,
      hasArt: false,
      hasStems: true
    };
    setSelectedArrangement(newArr);
    setOverviewTab('details');
    setSubView('overview');
  };

  // Switch to dedicated editor for existing arrangement
  const handleOpenEdit = (arr: ContributorArrangement) => {
    handleOpenArrangementOverview(arr, 'details');
  };

  // Switch to access detail / activity view
  const handleOpenAccessDetail = (arr: ContributorArrangement) => {
    handleOpenArrangementOverview(arr, arr.status === 'published-restricted' ? 'access' : 'overview');
  };

  // Handle saving draft in dedicated editor
  const handleSaveDraft = (draft: ContributorArrangement) => {
    setArrangements(prev => {
      const idx = prev.findIndex(a => a.id === draft.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = draft;
        return next;
      }
      return [draft, ...prev];
    });
    setSubView('dashboard');
    showToast(`Draft "${draft.title}" saved.`);
  };

  // Handle publishing in dedicated editor
  const handlePublishArrangement = (published: ContributorArrangement) => {
    setArrangements(prev => {
      const idx = prev.findIndex(a => a.id === published.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = published;
        return next;
      }
      return [published, ...prev];
    });
    setSubView('dashboard');
    showToast(`"${published.title}" has been published to Trackappella!`);
  };

  // Handle updating arrangement from access detail view
  const handleUpdateArrangement = (updated: ContributorArrangement) => {
    setArrangements(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedArrangement(updated);
    if (updated.partSyncOffsets) {
      onUpdateSongOffsets?.(updated.songId || updated.id, updated.partSyncOffsets);
    }
  };

  // Filtered & Sorted Arrangements for Table
  const filteredArrangements = useMemo(() => {
    let list = [...arrangements];

    // Filter by tab
    if (tableFilterTab === 'drafts') {
      list = list.filter(a => a.status === 'work-in-progress');
    } else if (tableFilterTab === 'published') {
      list = list.filter(a => a.status.startsWith('published'));
    } else if (tableFilterTab === 'public') {
      list = list.filter(a => a.status === 'published-public');
    } else if (tableFilterTab === 'restricted') {
      list = list.filter(a => a.status === 'published-restricted');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.details.toLowerCase().includes(q) ||
        (a.arranger && a.arranger.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'active') {
      list.sort((a, b) => (b.singersCount || 0) - (a.singersCount || 0));
    }

    return list;
  }, [arrangements, tableFilterTab, searchQuery, sortBy]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: arrangements.length,
      drafts: arrangements.filter(a => a.status === 'work-in-progress').length,
      published: arrangements.filter(a => a.status.startsWith('published')).length,
      public: arrangements.filter(a => a.status === 'published-public').length,
      restricted: arrangements.filter(a => a.status === 'published-restricted').length
    };
  }, [arrangements]);

  // Unified Arrangement Overview Detail View (Combines Activity Details & Edit Workflow)
  if ((subView === 'overview' || subView === 'editor' || subView === 'access-detail') && selectedArrangement) {
    return (
      <ArrangementOverviewDetailView
        arrangement={selectedArrangement}
        groups={groups}
        currentUser={currentUser}
        initialTab={overviewTab}
        songs={songs}
        onBack={() => setSubView('dashboard')}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublishArrangement}
        onUpdateArrangement={handleUpdateArrangement}
        onStartPractice={onStartPractice}
        onStartStageMode={onStartStageMode}
        onUpdateSongOffsets={onUpdateSongOffsets}
      />
    );
  }

  // -------------------------------------------------------------
  // PRIMARY DASHBOARD VIEW (Velvet Studio Theme)
  // -------------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#CBB9C7] text-[#1C121F] font-sans pb-28 animate-fadeIn" id="contributor-studio-container">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#221823] text-[#F7F1F3] border border-[rgba(255,249,247,0.12)] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* 1. PAGE HEADER                                            */}
        {/* ========================================================= */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#221823] text-[#F7F1F3]">
                <Disc3 className="w-5 h-5 text-[#D9AF8D]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1C121F] tracking-tight">
                Contributor Studio
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#3E2843] font-medium mt-1.5 max-w-xl">
              Create, publish, and follow the singers learning your arrangements across rehearsal rooms and live performances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time range selector */}
            <div className="flex bg-[#DFCCCF] border border-[rgba(62,40,67,0.12)] p-1 rounded-xl text-xs shadow-sm">
              {[
                { id: '7d', label: 'Last 7 days' },
                { id: '30d', label: 'Last 30 days' },
                { id: '90d', label: 'Last 90 days' },
                { id: 'all', label: 'All time' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimeRange(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    timeRange === opt.id
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] shadow-sm'
                      : 'text-[#3E2843] hover:text-[#1C121F]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Primary Create Button (Brand Coral: reserved for primary high-intent action) */}
            <button
              type="button"
              onClick={handleOpenCreateNew}
              className="px-4 py-2.5 rounded-xl bg-[#FF5757] hover:bg-[#ff6b6b] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF5757]/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
              id="btn-create-arrangement"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create arrangement</span>
            </button>
          </div>
        </header>

        {/* Arrangement Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-[#3E2843] font-bold uppercase tracking-wider mr-1">Filter metrics:</span>
          {[
            { id: 'all', label: 'All arrangements' },
            { id: 'songs', label: 'Songs' },
            { id: 'tags', label: 'Tags' },
            { id: 'public', label: 'Public' },
            { id: 'restricted', label: 'Restricted' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setArrangementFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap font-bold ${
                arrangementFilter === f.id
                  ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                  : 'bg-[#DFCCCF] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] hover:bg-[#EBDDE0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 2. DASHBOARD SECTION: YOUR ACTIVITY (4 CARDS)             */}
        {/* ========================================================= */}
        <section className="space-y-4" aria-labelledby="activity-heading">
          <div>
            <h2 id="activity-heading" className="text-base sm:text-lg font-bold font-display text-[#1C121F]">
              Your activity
            </h2>
            <p className="text-xs text-[#3E2843] font-medium mt-0.5">
              A quick view of how singers are learning, performing, and sharing your arrangements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Singers Practicing */}
            <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                    Singers practicing
                  </span>
                  <div className="p-2 rounded-xl bg-[#CBB9C7] text-[#1C121F]">
                    <Users className="w-4 h-4 text-[#573657]" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black font-display text-[#1C121F]">126</span>
                  <span className="text-xs text-[#573657] font-semibold">unique singers</span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Up 24% from previous 30 days</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[rgba(62,40,67,0.12)]">
                <div className="flex items-center justify-between text-xs text-[#3E2843] mb-1.5 font-medium">
                  <span>Daily learners</span>
                  <span className="font-mono font-bold text-[#1C121F]">238 practice sessions</span>
                </div>
                {/* SVG Sparkline */}
                <svg className="w-full h-9 overflow-visible" viewBox="0 0 100 24" fill="none">
                  <path
                    d="M0,20 Q15,18 25,15 T50,11 T75,8 T100,3"
                    stroke="#8A3D80"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0,20 Q15,18 25,15 T50,11 T75,8 T100,3 L100,24 L0,24 Z"
                    fill="url(#sparkline-fill)"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A3D80" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card 2: Most-practiced arrangements */}
            <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                    Top arrangements
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#3E2843] bg-[#CBB9C7] px-2 py-0.5 rounded">
                    By singers · 30d
                  </span>
                </div>

                {/* Ranked Horizontal Bars */}
                <div className="mt-3 space-y-2.5 text-xs">
                  {[
                    { title: 'River of Dreams', count: 42, type: 'Song', width: '100%' },
                    { title: 'Winter Tag No. 3', count: 31, type: 'Tag', width: '74%' },
                    { title: 'Hold On', count: 24, type: 'Song', width: '57%' },
                    { title: 'Bright Morning', count: 17, type: 'Song', width: '40%' },
                    { title: 'Harmony Loop', count: 14, type: 'Tag', width: '33%' }
                  ].map((item, idx) => (
                    <div key={item.title}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="truncate max-w-[130px] font-bold text-[#1C121F]">
                          {idx + 1}. {item.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#CBB9C7] text-[#3E2843]">
                            {item.type}
                          </span>
                          <span className="font-mono font-bold text-[#1C121F] text-[11px]">{item.count}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#CBB9C7] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#7C3A82] rounded-full"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[rgba(62,40,67,0.12)] text-right">
                <button
                  type="button"
                  onClick={() => {
                    setTableFilterTab('published');
                    const el = document.getElementById('my-arrangements-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[11px] text-[#3E2843] hover:text-[#1C121F] font-bold cursor-pointer"
                >
                  View all in catalog →
                </button>
              </div>
            </div>

            {/* Card 3: From practice to performance */}
            <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843] block">
                  Practice to performance
                </span>
                <span className="text-[11px] text-[#573657] font-medium block mt-0.5">
                  How singers move through your tracks
                </span>

                {/* Vertical Journey Funnel */}
                <div className="mt-3.5 space-y-3 relative text-xs">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[rgba(62,40,67,0.15)] -z-0" />

                  {[
                    { label: 'Practiced in Rehearsal', count: '126', pct: '100% of learners' },
                    { label: 'Entered Stage Mode', count: '68', pct: '54% of learners' },
                    { label: 'Recorded Takes', count: '48', pct: '70% of Stage Mode' },
                    { label: 'Saved to Setlists', count: '24', pct: '50% of Takes' }
                  ].map((step, idx) => (
                    <div key={step.label} className="flex items-start gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-[#2A1E2A] text-[#F7F1F3] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#1C121F] block text-xs">{step.label}</span>
                          <span className="text-[10px] text-[#573657] font-mono font-medium">{step.pct}</span>
                        </div>
                        <span className="font-mono font-bold text-[#1C121F] text-xs">{step.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[rgba(62,40,67,0.12)]">
                <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Strongest: Rehearsal to Stage Transition</span>
                </span>
              </div>
            </div>

            {/* Card 4: Community Activity */}
            <div className="bg-[#DFCCCF] p-5 rounded-2xl shadow-md border border-[rgba(62,40,67,0.12)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#3E2843]">
                    Community activity
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-500/20 px-2 py-0.5 rounded">
                    High engagement
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] p-2 rounded-xl">
                    <span className="text-lg font-black font-display text-[#1C121F] block">48</span>
                    <span className="text-[10px] text-[#573657] font-medium leading-tight block mt-0.5">Takes</span>
                  </div>
                  <div className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] p-2 rounded-xl">
                    <span className="text-lg font-black font-display text-[#9E2A4B] block flex items-center justify-center gap-0.5">
                      <span>87</span>
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-600" />
                    </span>
                    <span className="text-[10px] text-[#573657] font-medium leading-tight block mt-0.5">Reactions</span>
                  </div>
                  <div className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.08)] p-2 rounded-xl">
                    <span className="text-lg font-black font-display text-[#8A3D80] block">42</span>
                    <span className="text-[10px] text-[#573657] font-medium leading-tight block mt-0.5">Saved</span>
                  </div>
                </div>

                {/* 4-Week Activity Spark Bars */}
                <div className="mt-4 pt-3 border-t border-[rgba(62,40,67,0.12)]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#3E2843] block mb-2">
                    4-Week Community Trend
                  </span>
                  <div className="grid grid-cols-4 gap-2 items-end h-10">
                    {[
                      { week: 'W1', h: '45%' },
                      { week: 'W2', h: '65%' },
                      { week: 'W3', h: '85%' },
                      { week: 'W4', h: '100%' }
                    ].map(bar => (
                      <div key={bar.week} className="flex flex-col items-center gap-1 h-full justify-end">
                        <div 
                          className="w-full bg-[#4E7A68] hover:bg-[#3B6252] transition-colors rounded-t"
                          style={{ height: bar.h }}
                        />
                        <span className="text-[9px] font-mono font-bold text-[#573657]">{bar.week}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[rgba(62,40,67,0.12)] flex items-center justify-between text-xs text-[#573657]">
                <span>Positive feedback: Hearts & Stars</span>
                <span className="text-emerald-800 font-bold">100% positive</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MY ARRANGEMENTS SECTION                                */}
        {/* ========================================================= */}
        <section id="my-arrangements-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-[#1C121F]">
                My arrangements
              </h2>
              <p className="text-xs text-[#3E2843] font-medium mt-0.5">
                Manage drafts, published arrangements, access scopes, and singer rosters.
              </p>
            </div>

            {/* Status Segmented Tabs */}
            <div className="flex bg-[#DFCCCF] border border-[rgba(62,40,67,0.12)] p-1 rounded-xl text-xs overflow-x-auto shadow-sm">
              {[
                { id: 'all', label: `All ${tabCounts.all}` },
                { id: 'drafts', label: `Drafts ${tabCounts.drafts}` },
                { id: 'published', label: `Published ${tabCounts.published}` },
                { id: 'public', label: `Public ${tabCounts.public}` },
                { id: 'restricted', label: `Restricted ${tabCounts.restricted}` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTableFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    tableFilterTab === tab.id
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] shadow-sm'
                      : 'text-[#3E2843] hover:text-[#1C121F]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#DFCCCF] border border-[rgba(62,40,67,0.12)] p-3 rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#573657] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your arrangements..."
                className="w-full pl-9 pr-4 py-2 bg-[#F1E4E7] border border-[rgba(62,40,67,0.1)] rounded-xl text-xs text-[#1C121F] placeholder:text-[#573657]/60 outline-none transition-all focus:border-[#7C3A82]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-[#3E2843] font-mono font-bold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-[#F1E4E7] border border-[rgba(62,40,67,0.1)] rounded-xl text-xs text-[#1C121F] font-bold outline-none cursor-pointer"
              >
                <option value="updated">Recently updated</option>
                <option value="active">Most active</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Arrangements Desktop Table & Mobile Cards */}
          <div className="bg-[#DFCCCF] rounded-2xl overflow-hidden shadow-md border border-[rgba(62,40,67,0.12)]">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#CBB9C7] border-b border-[rgba(62,40,67,0.15)] text-[11px] font-mono uppercase tracking-wider text-[#3E2843] font-bold">
                    <th className="py-3.5 px-5">Arrangement</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Configuration</th>
                    <th className="py-3.5 px-4">30-Day Activity</th>
                    <th className="py-3.5 px-4">Access Scope</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(62,40,67,0.1)]">
                  {filteredArrangements.slice(0, visibleRowCount).map(arr => {
                    const isDraft = arr.status === 'work-in-progress';
                    const isRestricted = arr.status === 'published-restricted';
                    const isPublic = arr.status === 'published-public';

                    return (
                      <tr 
                        key={arr.id} 
                        className="hover:bg-[#CBB9C7]/40 transition-colors"
                      >
                        {/* Title & Details */}
                        <td className="py-4 px-5">
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenArrangementOverview(arr, 'overview')}
                                className="font-bold text-sm text-[#1C121F] hover:text-[#7C3A82] hover:underline cursor-pointer text-left transition-colors flex items-center gap-1.5 group"
                                title="Open Arrangement Overview"
                              >
                                <span className="group-hover:text-[#7C3A82]">{arr.title}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-[#573657] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              {arr.type === 'tag' && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#CBB9C7] text-[#3E2843]">
                                  Tag
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#573657] font-medium block mt-0.5">
                              {arr.details}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isPublic && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-900 border border-emerald-600/30 whitespace-nowrap shrink-0">
                              <Globe className="w-3 h-3 text-emerald-800 shrink-0" />
                              <span>Public</span>
                            </span>
                          )}
                          {isRestricted && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#B7A1CC]/25 text-[#3E2843] border border-[#B7A1CC]/50 whitespace-nowrap shrink-0">
                              <Lock className="w-3 h-3 text-[#543850] shrink-0" />
                              <span>Restricted</span>
                            </span>
                          )}
                          {isDraft && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E5B58D]/35 text-[#7C4010] border border-[#7C4010]/20 whitespace-nowrap shrink-0">
                              <Clock className="w-3 h-3 text-[#7C4010] shrink-0" />
                              <span>Draft</span>
                            </span>
                          )}
                        </td>

                        {/* Configuration Health */}
                        <td className="py-4 px-4">
                          {arr.configHealth === 'ready' && (
                            <span className="text-emerald-900 font-bold flex items-center gap-1.5 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                              <span>Ready</span>
                            </span>
                          )}
                          {arr.configHealth === 'restricted-groups' && (
                            <span className="text-[#3E2843] font-bold flex items-center gap-1.5 text-xs">
                              <Layers className="w-3.5 h-3.5 text-[#573657]" />
                              <span>{arr.configuration}</span>
                            </span>
                          )}
                          {arr.configHealth === 'missing-chart' && (
                            <span className="text-[#994717] font-bold flex items-center gap-1.5 text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Missing chart</span>
                            </span>
                          )}
                          {arr.configHealth === 'missing-art' && (
                            <span className="text-[#994717] font-bold flex items-center gap-1.5 text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Missing cover art</span>
                            </span>
                          )}
                          {arr.configHealth === 'missing-stems' && (
                            <span className="text-[#994717] font-bold flex items-center gap-1.5 text-xs">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Missing stem audio</span>
                            </span>
                          )}
                        </td>

                        {/* 30-Day Activity */}
                        <td className="py-4 px-4">
                          {arr.singersCount !== null ? (
                            <div>
                              <span className="font-bold text-[#1C121F] text-xs font-mono">
                                {arr.singersCount} unique singers
                              </span>
                              <span className="text-[10px] text-[#573657] font-medium block mt-0.5">
                                {arr.stageSessionsCount} practice sessions
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#573657]/50 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Access Scope Button / Link */}
                        <td className="py-4 px-4">
                          {isRestricted ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAccessDetail(arr)}
                              className="text-xs text-[#7C3A82] hover:text-[#1C121F] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>{arr.grantedGroupCodes?.length || 2} groups granted</span>
                              <ChevronRight className="w-3 h-3 text-[#573657]" />
                            </button>
                          ) : isPublic ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAccessDetail(arr)}
                              className="text-xs text-emerald-900 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>View activity</span>
                              <ChevronRight className="w-3 h-3 text-emerald-800" />
                            </button>
                          ) : (
                            <span className="text-xs text-[#573657]/70 font-medium">Unpublished draft</span>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="py-4 px-4 text-[#573657] font-mono text-[11px] font-medium">
                          {arr.lastUpdated}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isDraft ? (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(arr)}
                                className="px-3 py-1.5 rounded-lg bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] font-bold text-xs transition-colors cursor-pointer shadow-sm"
                              >
                                Continue setup
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(arr)}
                                className="px-3 py-1.5 rounded-lg bg-[#CBB9C7] hover:bg-[#B9AEB6] text-[#1C121F] font-bold text-xs transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                            )}

                            {/* More Actions Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === arr.id ? null : arr.id)}
                                className="p-1.5 rounded-lg hover:bg-[#CBB9C7] text-[#3E2843] hover:text-[#1C121F] transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openMenuId === arr.id && (
                                <div className="absolute right-0 mt-1 w-52 bg-[#DFCCCF] border border-[rgba(62,40,67,0.15)] rounded-xl shadow-2xl py-1.5 z-20 text-left animate-fadeIn">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleOpenArrangementOverview(arr, 'overview');
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-[#1C121F] font-bold hover:bg-[#CBB9C7] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#7C3A82]" />
                                    <span>Arrangement overview</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleOpenAccessDetail(arr);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-[#1C121F] font-medium hover:bg-[#CBB9C7] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5 text-[#573657]" />
                                    <span>{isRestricted ? 'Manage access & roster' : 'View interaction stats'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleOpenEdit(arr);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-[#1C121F] font-medium hover:bg-[#CBB9C7] flex items-center gap-2 cursor-pointer"
                                  >
                                    <Sliders className="w-3.5 h-3.5 text-[#573657]" />
                                    <span>Edit arrangement</span>
                                  </button>

                                  {arr.songId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        const song = songs.find(s => s.id === arr.songId) || songs[0];
                                        onStartPractice(song);
                                      }}
                                      className="w-full px-3.5 py-1.5 text-xs text-emerald-900 font-bold hover:bg-[#CBB9C7] flex items-center gap-2 cursor-pointer"
                                    >
                                      <Play className="w-3.5 h-3.5 text-emerald-800" />
                                      <span>Test in Studio</span>
                                    </button>
                                  )}

                                  <div className="my-1 border-t border-[rgba(62,40,67,0.12)]" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setArrangements(prev => prev.filter(a => a.id !== arr.id));
                                      showToast(`Deleted "${arr.title}".`);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-rose-800 font-bold hover:bg-rose-500/15 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                                    <span>Delete arrangement</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="block md:hidden divide-y divide-[rgba(62,40,67,0.1)]">
              {filteredArrangements.slice(0, visibleRowCount).map(arr => (
                <div key={arr.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => handleOpenArrangementOverview(arr, 'overview')}
                        className="font-bold text-[#1C121F] hover:text-[#7C3A82] hover:underline text-sm text-left transition-colors cursor-pointer"
                      >
                        {arr.title}
                      </button>
                      <p className="text-xs text-[#573657] mt-0.5 font-medium">{arr.details}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      arr.status === 'published-restricted'
                        ? 'bg-[#B7A1CC]/25 text-[#3E2843] border border-[#B7A1CC]/50'
                        : arr.status === 'published-public'
                        ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-600/30'
                        : 'bg-[#E5B58D]/35 text-[#7C4010] border border-[#7C4010]/20'
                    }`}>
                      {arr.status === 'published-restricted' ? 'Restricted' : arr.status === 'published-public' ? 'Public' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#573657] font-medium">
                    <span>Config: {arr.configuration}</span>
                    <span className="font-mono font-bold text-[#1C121F]">{arr.singersCount ? `${arr.singersCount} singers` : 'Draft'}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(arr)}
                      className="flex-1 py-1.5 rounded-lg bg-[#CBB9C7] text-[#1C121F] font-bold text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAccessDetail(arr)}
                      className="flex-1 py-1.5 rounded-lg bg-[#2A1E2A] text-[#F7F1F3] font-bold text-xs"
                    >
                      {arr.status === 'published-restricted' ? 'Manage Access' : 'Stats'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination / Show More */}
            {filteredArrangements.length > visibleRowCount && (
              <div className="p-4 border-t border-[rgba(62,40,67,0.12)] text-center bg-[#CBB9C7]/40">
                <button
                  type="button"
                  onClick={() => setVisibleRowCount(prev => prev + 5)}
                  className="px-4 py-2 rounded-xl bg-[#DFCCCF] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.15)] text-[#1C121F] text-xs font-bold cursor-pointer"
                >
                  Show more arrangements ({filteredArrangements.length - visibleRowCount} remaining)
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
