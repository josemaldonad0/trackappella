/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Song, 
  UserProfile, 
  GroupCatalog, 
  RecordedTake, 
  Setlist,
  TrackappellaGroup,
  GroupInviteLink,
  GroupNotification,
  GroupMember,
  GroupJoinRequest
} from './types';
import { SEED_SONGS, SEED_GROUP_CATALOGS } from './data/seedSongs';
import { SEED_GROUPS } from './data/seedGroups';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { HomeLandingView } from './components/HomeLandingView';
import { ArrangementOverviewModal } from './components/ArrangementOverviewModal';
import { StageModeView } from './components/StageModeView';
import { ContributorStudioView } from './components/contributor/ContributorStudioView';
import { PracticeScreen } from './components/PracticeScreen';
import { PerformanceTakesView } from './components/PerformanceTakesView';
import { UserProfileView } from './components/UserProfileView';
import { getAllTakes, deletePerformanceTake } from './utils/takesStorage';
import { AuthModal } from './components/AuthModal';
import { GroupAccessModal } from './components/GroupAccessModal';
import { PitchPipeModal } from './components/PitchPipeModal';
import { GoogleDrivePickerModal, DriveFileItem } from './components/GoogleDrivePickerModal';
import { ScoreViewer } from './components/ScoreViewer';
import { TrackappellaLogo } from './components/TrackappellaBrand';
import { CreateSetlistModal, AddToSetlistModal, DeleteSetlistModal } from './components/SetlistModals';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { GroupPageView } from './components/groups/GroupPageView';
import { InviteLandingModal } from './components/groups/InviteLandingModal';
import { Music2, Sparkles } from 'lucide-react';

const INITIAL_SETLISTS: Setlist[] = [
  { 
    id: 'p1', 
    name: 'Contest Warmup Set', 
    songIds: ['seed_bright_side', 'seed_misty', 'seed_tag_after_youve_gone', 'seed_tag_cry_no_more'],
    songCount: 4 
  },
  { 
    id: 'p2', 
    name: 'Quartet Tag Marathon', 
    songIds: ['seed_tag_after_youve_gone', 'seed_tag_cry_no_more', 'seed_tag_heart_of_my_heart', 'seed_bright_side', 'seed_irish_blessing'],
    songCount: 5 
  }
];

export default function App() {
  // App views: 'home' | 'learn' | 'play' | 'share' | 'studio' | 'group' | 'takes' | 'profile'
  const [currentView, setCurrentView] = useState<'home' | 'learn' | 'play' | 'share' | 'studio' | 'group' | 'takes' | 'profile'>('home');
  
  // User Authentication State (Starts unauthenticated by default unless saved)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trackappella_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Songs & Group Catalogs
  const [songs, setSongs] = useState<Song[]>(() => {
    const hydrateSongOffsets = (s: Song): Song => {
      try {
        const raw = localStorage.getItem(`trackappella_sync_offsets_${s.id}`) ||
                    (s.id.includes('hold') ? localStorage.getItem('trackappella_sync_offsets_i-hold-your-hand-in-mine') : null);
        if (raw) {
          const offsets = JSON.parse(raw);
          return {
            ...s,
            partSyncOffsets: { ...(s.partSyncOffsets || {}), ...offsets },
            assets: {
              ...s.assets,
              partSyncOffsets: { ...(s.assets?.partSyncOffsets || {}), ...offsets }
            }
          };
        }
      } catch {}
      return s;
    };

    const saved = localStorage.getItem('trackappella_songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seedMap = new Map(SEED_SONGS.map(s => [s.id, s]));
          // Keep user-created custom songs, but always use canonical SEED_SONGS with fresh real audio assets
          const userCreated = parsed.filter((s: Song) => !seedMap.has(s.id) && s.id !== 'i-hold-your-hand-in-mine');
          return [...SEED_SONGS, ...userCreated].map(hydrateSongOffsets);
        }
      } catch {
        return SEED_SONGS.map(hydrateSongOffsets);
      }
    }
    return SEED_SONGS.map(hydrateSongOffsets);
  });

  const [groupCatalogs, setGroupCatalogs] = useState<GroupCatalog[]>(SEED_GROUP_CATALOGS);
  
  // Trackappella Groups & Private Repertoire Vault State
  const [groups, setGroups] = useState<TrackappellaGroup[]>(() => {
    const saved = localStorage.getItem('trackappella_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return SEED_GROUPS;
      }
    }
    return SEED_GROUPS;
  });
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [activeGroupDetail, setActiveGroupDetail] = useState<TrackappellaGroup | null>(null);
  const [inviteLandingState, setInviteLandingState] = useState<{ link: GroupInviteLink; group: TrackappellaGroup } | null>(null);
  const [contributorInitialArrangementId, setContributorInitialArrangementId] = useState<string | null>(null);
  const [groupNotifications, setGroupNotifications] = useState<GroupNotification[]>(() => {
    const saved = localStorage.getItem('trackappella_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });
  
  // Active Rehearsal State
  const [activeSongId, setActiveSongId] = useState<string>(SEED_SONGS[0].id);
  const [activePartId, setActivePartId] = useState<string>('lead');
  const [stageKeyOffset, setStageKeyOffset] = useState<number>(0);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTargetFeature, setAuthTargetFeature] = useState<'Learn' | 'Play' | 'Share' | 'General'>('General');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isPitchPipeOpen, setIsPitchPipeOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [driveLinkedFile, setDriveLinkedFile] = useState<{ name: string; id: string } | null>(null);
  const [scoreViewerSong, setScoreViewerSong] = useState<Song | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Arrangement Overview Preview State
  const [overviewSong, setOverviewSong] = useState<Song | null>(null);
  const [overviewInitialStudio, setOverviewInitialStudio] = useState<boolean>(false);
  const [previewContextSongs, setPreviewContextSongs] = useState<Song[]>(SEED_SONGS);
  const [previewIsFromSetlist, setPreviewIsFromSetlist] = useState<boolean>(false);
  const [upvotedSongIds, setUpvotedSongIds] = useState<string[]>([]);

  // Favorited Songs
  const [favoritedSongIds, setFavoritedSongIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('trackappella_favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Custom User Setlists
  const [userPlaylists, setUserPlaylists] = useState<Setlist[]>(() => {
    const saved = localStorage.getItem('trackappella_setlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_SETLISTS;
      }
    }
    return INITIAL_SETLISTS;
  });
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // Setlist Modals State
  const [isCreateSetlistOpen, setIsCreateSetlistOpen] = useState(false);
  const [isAddToSetlistOpen, setIsAddToSetlistOpen] = useState(false);
  const [addToSetlistSong, setAddToSetlistSong] = useState<Song | null>(null);
  const [deleteConfirmSetlist, setDeleteConfirmSetlist] = useState<Setlist | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('trackappella_songs', JSON.stringify(songs));
    } catch (e) {
      console.warn('Could not persist songs to localStorage', e);
    }
  }, [songs]);

  useEffect(() => {
    try {
      localStorage.setItem('trackappella_favorites', JSON.stringify(favoritedSongIds));
    } catch (e) {
      console.warn('Could not persist favorites to localStorage', e);
    }
  }, [favoritedSongIds]);

  useEffect(() => {
    try {
      localStorage.setItem('trackappella_setlists', JSON.stringify(userPlaylists));
    } catch (e) {
      console.warn('Could not persist setlists to localStorage', e);
    }
  }, [userPlaylists]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('trackappella_user_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('trackappella_user_session');
      }
    } catch (e) {
      console.warn('Could not persist user session to localStorage', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('trackappella_groups', JSON.stringify(groups));
    } catch (e) {
      console.warn('Could not persist groups to localStorage', e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem('trackappella_notifications', JSON.stringify(groupNotifications));
    } catch (e) {
      console.warn('Could not persist notifications to localStorage', e);
    }
  }, [groupNotifications]);

  // Check URL query param or hash for invite token (e.g. ?invite=vs-fall-rehearsals-2026)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = searchParams.get('invite') || hashParams.get('invite');
    if (token) {
      const clean = token.toLowerCase().trim();
      for (const grp of groups) {
        const link = grp.inviteLinks.find(l => l.token.toLowerCase() === clean);
        if (link) {
          setInviteLandingState({ link, group: grp });
          break;
        }
      }
    }
  }, [groups]);

  const activeSong = songs.find(s => s.id === activeSongId) || songs[0];

  // Performance Takes state
  const [takesList, setTakesList] = useState<RecordedTake[]>(() => getAllTakes());
  const [takesCategory, setTakesCategory] = useState<'auditions' | 'karaoke'>('auditions');
  const [takesFilterGroupId, setTakesFilterGroupId] = useState<string | null>(null);
  const [takesFilterSongId, setTakesFilterSongId] = useState<string | null>(null);

  const refreshTakes = () => {
    setTakesList(getAllTakes());
  };

  const handleSelectTakesCategory = (category: 'auditions' | 'karaoke', groupId: string | null = null) => {
    refreshTakes();
    setTakesCategory(category);
    setTakesFilterGroupId(groupId);
    setTakesFilterSongId(null);
    setCurrentView('takes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTake = (takeId: string) => {
    deletePerformanceTake(takeId);
    refreshTakes();
  };

  const handleShareTake = (take: RecordedTake) => {
    if (navigator.share) {
      navigator.share({
        title: `Performance Take: ${take.songTitle}`,
        text: `Listen to my ${take.partName} take on "${take.songTitle}" with a score of ${take.pitchAccuracyScore}%!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Take share link copied to clipboard!');
    }
  };

  // Navigation Guard with Auth Wall
  const handleNavigate = (view: 'home' | 'learn' | 'play' | 'share' | 'group' | 'takes' | 'profile') => {
    if (view === 'home' || view === 'learn') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'takes') {
      refreshTakes();
      setTakesFilterSongId(null);
      setCurrentView('takes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'group') {
      if (activeGroupDetail) {
        setCurrentView('group');
      } else if (groups.length > 0) {
        setActiveGroupDetail(groups[0]);
        setCurrentView('group');
      } else {
        setCurrentView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'profile') {
      if (!currentUser) {
        setAuthTargetFeature('General');
        setIsAuthOpen(true);
        return;
      }
      setCurrentView('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!currentUser) {
      const cap = view === 'play' ? 'Play' : 'Share';
      setAuthTargetFeature(cap);
      setIsAuthOpen(true);
      return;
    }

    if (view === 'share') {
      setContributorInitialArrangementId(null);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    if (updatedProfile.defaultPart) {
      setActivePartId(updatedProfile.defaultPart);
    }
  };

  const handleOpenAuth = (feature: 'Learn' | 'Play' | 'Share' | 'General' = 'General') => {
    setAuthTargetFeature(feature);
    setIsAuthOpen(true);
  };

  const handleOpenGroupModal = () => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    setIsGroupModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    if (authTargetFeature === 'Play') {
      setCurrentView('play');
    } else if (authTargetFeature === 'Share') {
      setCurrentView('share');
    } else {
      setCurrentView('home');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setCurrentView('home');
    setActiveGroupDetail(null);
    setIsGroupModalOpen(false);
    setIsCreateGroupOpen(false);
    setIsAuthOpen(false);
    setIsMobileDrawerOpen(false);
    try {
      localStorage.removeItem('trackappella_user_session');
    } catch (e) {
      console.warn(e);
    }
  };

  // Group Management & Vault Handlers
  const handleCreateGroup = (newGroup: TrackappellaGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        memberGroupCodes: Array.from(new Set([...currentUser.memberGroupCodes, newGroup.code]))
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('trackappella_user_session', JSON.stringify(updatedUser));
      } catch (e) {
        console.warn(e);
      }
    }
    setActiveGroupDetail(newGroup);
    setCurrentView('group');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateGroup = (updatedGroup: TrackappellaGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    if (activeGroupDetail?.id === updatedGroup.id) {
      setActiveGroupDetail(updatedGroup);
    }
  };

  const handleResolveInviteToken = (token: string) => {
    const clean = token.toLowerCase().trim();
    // Search by link token
    for (const grp of groups) {
      const link = grp.inviteLinks.find(l => l.token.toLowerCase() === clean);
      if (link) {
        setInviteLandingState({ link, group: grp });
        return;
      }
    }
    // Search by group code
    const matchingGroupByCode = groups.find(g => g.code.toLowerCase() === clean);
    if (matchingGroupByCode) {
      const activeLink = matchingGroupByCode.inviteLinks.find(l => l.status === 'active') || matchingGroupByCode.inviteLinks[0];
      if (activeLink) {
        setInviteLandingState({ link: activeLink, group: matchingGroupByCode });
        return;
      }
    }
  };

  const handleJoinGroupSuccess = (targetGroup: TrackappellaGroup) => {
    if (!currentUser) return;
    
    // Check if not already in members
    const alreadyMember = targetGroup.members.some(m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase());
    let updatedGroup = targetGroup;
    if (!alreadyMember) {
      const newMember: GroupMember = {
        userId: currentUser.id,
        displayName: currentUser.name,
        email: currentUser.email,
        role: 'member',
        status: 'active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        joinSource: inviteLandingState?.link.label ? `Invite: ${inviteLandingState.link.label}` : 'Invite link',
        avatar: currentUser.avatar
      };

      // Increment link uses if available
      const updatedLinks = targetGroup.inviteLinks.map(l => {
        if (inviteLandingState && l.id === inviteLandingState.link.id) {
          return { ...l, usesCount: (l.usesCount || 0) + 1 };
        }
        return l;
      });

      updatedGroup = {
        ...targetGroup,
        members: [...targetGroup.members, newMember],
        inviteLinks: updatedLinks
      };

      handleUpdateGroup(updatedGroup);
    }

    // Add group code to currentUser memberGroupCodes
    const updatedUser = {
      ...currentUser,
      memberGroupCodes: Array.from(new Set([...currentUser.memberGroupCodes, targetGroup.code]))
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('trackappella_user_session', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn(e);
    }

    setInviteLandingState(null);
    setActiveGroupDetail(updatedGroup);
    setCurrentView('group');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJoinRequestSubmitted = (targetGroup: TrackappellaGroup) => {
    if (!currentUser) return;

    const newReq: GroupJoinRequest = {
      id: `req_${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      displayName: currentUser.name,
      groupId: targetGroup.id,
      groupName: targetGroup.name,
      inviteLinkId: inviteLandingState?.link.id,
      inviteLabel: inviteLandingState?.link.label,
      requestTimestamp: new Date().toISOString(),
      status: 'pending'
    };

    const updatedGroup = {
      ...targetGroup,
      joinRequests: [...targetGroup.joinRequests, newReq]
    };

    handleUpdateGroup(updatedGroup);
  };

  // Group Unlock via access code
  const handleUnlockGroup = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    // 1. Check Trackappella Groups
    const foundGroup = groups.find(g => g.code.toUpperCase() === formatted);
    if (foundGroup) {
      if (currentUser) {
        const isMember = foundGroup.members.some(m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase());
        if (!isMember) {
          const newMember: GroupMember = {
            userId: currentUser.id,
            displayName: currentUser.name,
            email: currentUser.email,
            role: 'member',
            status: 'active',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            joinSource: 'Direct Group ID Entry',
            avatar: currentUser.avatar
          };
          handleUpdateGroup({
            ...foundGroup,
            members: [...foundGroup.members, newMember]
          });
        }
        const updatedUser = {
          ...currentUser,
          memberGroupCodes: Array.from(new Set([...currentUser.memberGroupCodes, formatted]))
        };
        setCurrentUser(updatedUser);
        try {
          localStorage.setItem('trackappella_user_session', JSON.stringify(updatedUser));
        } catch (e) {
          console.warn(e);
        }
      }
      setActiveGroupDetail(foundGroup);
      return true;
    }

    // 2. Check legacy GroupCatalogs
    const catalog = groupCatalogs.find(g => g.accessCode.toUpperCase() === formatted);
    if (catalog) {
      if (currentUser) {
        const updatedCodes = Array.from(new Set([...currentUser.memberGroupCodes, formatted]));
        setCurrentUser({ ...currentUser, memberGroupCodes: updatedCodes });
      }
      return true;
    }
    return false;
  };

  // Publish New Song from Share Studio
  const handlePublishSong = (newSong: Song) => {
    setSongs(prev => [newSong, ...prev]);
    setActiveSongId(newSong.id);
    // If it is members-only restricted, grant to matching group
    if (newSong.visibility === 'members-only' && newSong.groupAccessCode) {
      const codeUpper = newSong.groupAccessCode.toUpperCase();
      setGroups(prev => prev.map(grp => {
        if (grp.code.toUpperCase() === codeUpper) {
          return {
            ...grp,
            restrictedSongIds: Array.from(new Set([...grp.restrictedSongIds, newSong.id]))
          };
        }
        return grp;
      }));
    }
  };

  // Filter accessible songs: public songs are available to all, while restricted songs
  // are only visible to singers who are active members of the associated group.
  const accessibleSongs = React.useMemo(() => {
    return songs.filter(song => {
      if (song.visibility !== 'members-only') return true;
      if (!currentUser) return false;
      // Member by user group codes
      if (song.groupAccessCode && currentUser.memberGroupCodes?.map(c => c.toUpperCase()).includes(song.groupAccessCode.toUpperCase())) {
        return true;
      }
      // Member by groups roster
      return groups.some(g => {
        const isMember = g.members.some(m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase());
        return isMember && (
          g.restrictedSongIds.includes(song.id) ||
          (song.groupAccessCode && g.code.toUpperCase() === song.groupAccessCode.toUpperCase())
        );
      });
    });
  }, [songs, currentUser, groups]);

  // Update and synchronize song offsets from Contributor Calibration Rack
  const handleUpdateSongOffsets = (songId: string, offsets: Record<string, number>) => {
    setSongs(prevSongs => prevSongs.map(s => {
      const isMatch = s.id === songId || 
                      (songId.includes('hold') && s.id === 'i-hold-your-hand-in-mine') ||
                      s.title?.toLowerCase().includes('hold your hand');
      if (isMatch) {
        return {
          ...s,
          partSyncOffsets: { ...offsets },
          assets: {
            ...s.assets,
            partSyncOffsets: { ...offsets }
          }
        };
      }
      return s;
    }));
    try {
      localStorage.setItem(`trackappella_sync_offsets_${songId}`, JSON.stringify(offsets));
      if (songId.includes('hold')) {
        localStorage.setItem('trackappella_sync_offsets_i-hold-your-hand-in-mine', JSON.stringify(offsets));
      }
    } catch {}
  };

  // Launch Studio Rehearsal
  const handleSelectSongForStudio = (song: Song, initialPartId?: string) => {
    let targetSong = song;
    try {
      const raw = localStorage.getItem(`trackappella_sync_offsets_${song.id}`) ||
                  (song.id.includes('hold') ? localStorage.getItem('trackappella_sync_offsets_i-hold-your-hand-in-mine') : null);
      if (raw) {
        const offsets = JSON.parse(raw);
        targetSong = {
          ...song,
          partSyncOffsets: { ...(song.partSyncOffsets || {}), ...offsets },
          assets: {
            ...song.assets,
            partSyncOffsets: { ...(song.assets?.partSyncOffsets || {}), ...offsets }
          }
        };
      }
    } catch {}

    setActiveSongId(targetSong.id);
    if (initialPartId) {
      setActivePartId(initialPartId);
    } else if (currentUser?.defaultPart) {
      setActivePartId(currentUser.defaultPart);
    }
    setOverviewSong(targetSong);
    setOverviewInitialStudio(true);
  };

  // Launch Stage Mode
  const handleSelectSongForStage = (song: Song, initialPartId?: string, keyOffset?: number) => {
    let targetSong = song;
    try {
      const raw = localStorage.getItem(`trackappella_sync_offsets_${song.id}`) ||
                  (song.id.includes('hold') ? localStorage.getItem('trackappella_sync_offsets_i-hold-your-hand-in-mine') : null);
      if (raw) {
        const offsets = JSON.parse(raw);
        targetSong = {
          ...song,
          partSyncOffsets: { ...(song.partSyncOffsets || {}), ...offsets },
          assets: {
            ...song.assets,
            partSyncOffsets: { ...(song.assets?.partSyncOffsets || {}), ...offsets }
          }
        };
      }
    } catch {}

    setActiveSongId(targetSong.id);
    if (initialPartId) {
      setActivePartId(initialPartId);
    } else if (currentUser?.defaultPart) {
      setActivePartId(currentUser.defaultPart);
    }
    setStageKeyOffset(keyOffset || 0);
    setCurrentView('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Google Drive Selection
  const handleSelectDriveFile = (file: DriveFileItem) => {
    setIsDriveOpen(false);
    setDriveLinkedFile({ name: file.name, id: file.id });
    
    // Auto import as new repertoire tag
    const newDriveTag: Song = {
      id: `drive_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      subtitle: 'Imported from Google Drive Repertoire',
      performerName: 'Vocal Ensemble',
      type: 'tag',
      voicing: 'TTBB',
      durationSeconds: 42,
      baseKey: 'Eb',
      tempoBpm: 72,
      description: `Synchronized chart imported from Google Drive (${file.name}).`,
      tags: ['Google Drive', 'Barbershop', 'TTBB'],
      difficulty: 'Intermediate',
      status: 'ready',
      visibility: 'public',
      parts: [
        { id: 'tenor', name: 'Tenor', shortName: 'Ten', range: 'Eb4 - G5', color: '#38bdf8', notes: [{ time: 0, duration: 8, noteName: 'G4', midi: 67, lyric: 'Drive' }] },
        { id: 'lead', name: 'Lead', shortName: 'Ld', range: 'Eb3 - Eb4', color: '#f59e0b', notes: [{ time: 0, duration: 8, noteName: 'Eb4', midi: 63, lyric: 'Drive' }] },
        { id: 'baritone', name: 'Baritone', shortName: 'Bari', range: 'Bb2 - C4', color: '#10b981', notes: [{ time: 0, duration: 8, noteName: 'Bb3', midi: 58, lyric: 'Drive' }] },
        { id: 'bass', name: 'Bass', shortName: 'Bass', range: 'Eb2 - Bb3', color: '#8b5cf6', notes: [{ time: 0, duration: 8, noteName: 'Eb3', midi: 51, lyric: 'Drive' }] },
      ],
      rehearsalMarks: [{ id: 'm1', label: 'Start', time: 0 }],
      lyrics: [{ startTime: 0, endTime: 8, text: file.name }],
      assets: {
        artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        chart: { googleDriveFileId: file.id }
      }
    };

    setSongs(prev => [newDriveTag, ...prev]);
  };

  // Toggle Favorite
  const handleToggleFavorite = (songId: string) => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    setFavoritedSongIds(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      }
      return [...prev, songId];
    });
  };

  // Setlists Modal & CRUD Handlers
  const handleOpenCreatePlaylist = () => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    setIsCreateSetlistOpen(true);
  };

  const handleCreateSetlist = (name: string) => {
    const newSetlist: Setlist = {
      id: `sl_${Date.now()}`,
      name,
      songIds: [],
      songCount: 0,
      createdAt: new Date().toISOString()
    };
    setUserPlaylists(prev => [...prev, newSetlist]);
    setActivePlaylistId(newSetlist.id);
  };

  const handleOpenAddToSetlist = (song: Song) => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    setAddToSetlistSong(song);
    setIsAddToSetlistOpen(true);
  };

  const handleAddToSetlist = (setlistId: string, songId: string) => {
    setUserPlaylists(prev => prev.map(sl => {
      if (sl.id === setlistId) {
        const songIds = sl.songIds || [];
        const newSongIds = songIds.includes(songId) ? songIds : [...songIds, songId];
        return {
          ...sl,
          songIds: newSongIds,
          songCount: newSongIds.length
        };
      }
      return sl;
    }));
  };

  const handleCreateAndAddToSetlist = (newSetlistName: string, songId: string) => {
    const newSetlist: Setlist = {
      id: `sl_${Date.now()}`,
      name: newSetlistName,
      songIds: [songId],
      songCount: 1,
      createdAt: new Date().toISOString()
    };
    setUserPlaylists(prev => [...prev, newSetlist]);
  };

  const handleOpenDeleteSetlist = (setlist: Setlist) => {
    setDeleteConfirmSetlist(setlist);
  };

  const handleConfirmDeleteSetlist = (setlistId: string) => {
    setUserPlaylists(prev => prev.filter(sl => sl.id !== setlistId));
    if (activePlaylistId === setlistId) {
      setActivePlaylistId(null);
    }
  };

  const handleReorderSetlists = (reordered: Setlist[]) => {
    setUserPlaylists(reordered);
  };

  // Handle select playlist/folder from sidebar
  const handleSelectSidebarPlaylist = (playlistId: string) => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    setActivePlaylistId(prev => (prev === playlistId ? null : playlistId));
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSidebarGroup = (groupCode: string) => {
    if (!currentUser) {
      handleOpenAuth('General');
      return;
    }
    const found = groups.find(g => g.code.toUpperCase() === groupCode.toUpperCase());
    if (found) {
      setActiveGroupDetail(found);
      setCurrentView('group');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView('home');
  };

  // Upvote handling
  const handleSelectAllCatalog = () => {
    setActivePlaylistId(null);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpvoteSong = (songId: string) => {
    setUpvotedSongIds(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      }
      return [...prev, songId];
    });
  };

  // Compute active preview song index
  const currentPreviewIndex = overviewSong 
    ? previewContextSongs.findIndex(s => s.id === overviewSong.id)
    : -1;

  const handleNextPreviewSong = () => {
    if (currentPreviewIndex >= 0 && currentPreviewIndex < previewContextSongs.length - 1) {
      setOverviewSong(previewContextSongs[currentPreviewIndex + 1]);
    } else if (currentPreviewIndex === -1 && previewContextSongs.length > 0) {
      setOverviewSong(previewContextSongs[0]);
    }
  };

  const handlePreviousPreviewSong = () => {
    if (currentPreviewIndex > 0) {
      setOverviewSong(previewContextSongs[currentPreviewIndex - 1]);
    }
  };

  const handleStartPracticeFromOverview = (song: Song, partId: string) => {
    setOverviewSong(null);
    if (currentUser) {
      handleSelectSongForStudio(song, partId);
    } else {
      handleOpenAuth('Learn');
    }
  };

  const handleStartStageModeFromOverview = (song: Song, partId: string, keyOffset?: number) => {
    setOverviewSong(null);
    setOverviewInitialStudio(false);
    if (currentUser) {
      handleSelectSongForStage(song, partId, keyOffset);
    } else {
      handleOpenAuth('Play');
    }
  };

  return (
    <div className="min-h-screen bg-[#120B17] text-[#F7F1F3] font-sans selection:bg-[#2A1E2A] selection:text-[#F7F1F3] flex flex-col">
      
      {/* 1. Header Bar: Text Logo to the left, Login/Profile action to the right */}
      <Header
        currentView={currentView}
        onNavigate={(v) => {
          handleNavigate(v);
        }}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onOpenPitchPipe={() => setIsPitchPipeOpen(true)}
      />

      {/* Mobile Drawer (Visible on small screens when isMobileDrawerOpen is true, except on unauthenticated home page) */}
      {isMobileDrawerOpen && (currentUser || currentView !== 'home') && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer content sliding in from left - complete straight rectangle overlay */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#17101D] border-r border-[rgba(255,249,247,0.08)] flex flex-col shadow-2xl transition-transform duration-300 ease-out">
            <LeftSidebar
              currentView={currentView}
              onNavigate={(v) => {
                setIsMobileDrawerOpen(false);
                handleNavigate(v);
              }}
              currentUser={currentUser}
              onOpenAuth={(feat) => {
                setIsMobileDrawerOpen(false);
                handleOpenAuth(feat);
              }}
              onOpenGroupModal={() => {
                setIsMobileDrawerOpen(false);
                handleOpenGroupModal();
              }}
              favoritedSongsCount={favoritedSongIds.length}
              performanceTakesCount={takesList.length}
              takesList={takesList}
              activeTakesCategory={takesCategory}
              activeTakesGroupId={takesFilterGroupId}
              onSelectTakesCategory={(cat, grpId) => {
                setIsMobileDrawerOpen(false);
                handleSelectTakesCategory(cat, grpId);
              }}
              songs={songs}
              userPlaylists={userPlaylists}
              activePlaylistId={activePlaylistId}
              groupCatalogs={groupCatalogs}
              groups={groups}
              activeGroupId={currentView === 'group' ? activeGroupDetail?.id : null}
              onOpenCreateGroup={() => {
                setIsMobileDrawerOpen(false);
                if (!currentUser) {
                  handleOpenAuth('General');
                  return;
                }
                setIsCreateGroupOpen(true);
              }}
              onOpenGroupDetail={(g) => {
                setIsMobileDrawerOpen(false);
                setActiveGroupDetail(g);
                setCurrentView('group');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCreatePlaylist={() => {
                setIsMobileDrawerOpen(false);
                handleOpenCreatePlaylist();
              }}
              onReorderSetlists={handleReorderSetlists}
              onDeleteSetlist={handleOpenDeleteSetlist}
              onSelectAllCatalog={() => {
                setIsMobileDrawerOpen(false);
                handleSelectAllCatalog();
              }}
              onSelectPlaylist={(pId) => {
                setIsMobileDrawerOpen(false);
                handleSelectSidebarPlaylist(pId);
              }}
              onSelectGroup={(gCode) => {
                setIsMobileDrawerOpen(false);
                handleSelectSidebarGroup(gCode);
              }}
              onClose={() => setIsMobileDrawerOpen(false)}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Main Body Flex Container: Straight Collapsible Left Sidebar & Right Content Window */}
      <div className="flex-1 flex w-full min-h-0 relative">
        
        {/* Collapsible Left Sidebar: Hidden on mobile when unauthenticated on home page, expandable on desktop */}
        <aside 
          className={`flex-col h-full bg-[#17101D] border-r border-[rgba(255,249,247,0.08)] transition-all duration-300 ease-in-out shrink-0 relative z-20 overflow-hidden ${
            !currentUser && currentView === 'home'
              ? 'hidden md:flex'
              : 'flex'
          } ${
            isSidebarOpen 
              ? 'w-64 lg:w-72' 
              : 'w-14 md:w-16'
          }`}
          id="collapsible-sidebar-drawer"
        >
          <div className="w-full h-full flex flex-col min-h-0">
            <LeftSidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onOpenGroupModal={handleOpenGroupModal}
              favoritedSongsCount={favoritedSongIds.length}
              performanceTakesCount={takesList.length}
              takesList={takesList}
              activeTakesCategory={takesCategory}
              activeTakesGroupId={takesFilterGroupId}
              onSelectTakesCategory={handleSelectTakesCategory}
              songs={songs}
              userPlaylists={userPlaylists}
              activePlaylistId={activePlaylistId}
              groupCatalogs={groupCatalogs}
              groups={groups}
              activeGroupId={currentView === 'group' ? activeGroupDetail?.id : null}
              onOpenCreateGroup={() => {
                if (!currentUser) {
                  handleOpenAuth('General');
                  return;
                }
                setIsCreateGroupOpen(true);
              }}
              onOpenGroupDetail={(g) => {
                setActiveGroupDetail(g);
                setCurrentView('group');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCreatePlaylist={handleOpenCreatePlaylist}
              onReorderSetlists={handleReorderSetlists}
              onDeleteSetlist={handleOpenDeleteSetlist}
              onSelectAllCatalog={handleSelectAllCatalog}
              onSelectPlaylist={handleSelectSidebarPlaylist}
              onSelectGroup={handleSelectSidebarGroup}
              onClose={() => {
                setIsSidebarOpen(false);
              }}
              isCollapsed={!isSidebarOpen}
              onToggleCollapse={() => {
                setIsSidebarOpen(prev => !prev);
              }}
            />
          </div>
        </aside>

        {/* Right of Left Menu: Main Content Window */}
        <main 
          className={`flex-1 overflow-y-auto min-w-0 relative ${currentView === 'share' || currentView === 'profile' ? 'bg-[#CBB9C7]' : 'bg-[#1C121F]'}`}
          id="main-window"
        >
          <div className={`min-w-0 ${currentView === 'share' || currentView === 'profile' ? 'p-0 max-w-none' : 'p-4 sm:p-6 lg:p-8 max-w-[1550px]'} mx-auto w-full`}>
            {currentView === 'home' && (
            <HomeLandingView
              onOpenAuth={handleOpenAuth}
              currentUser={currentUser}
              onNavigateTo={handleNavigate}
              sampleSongs={songs}
              groups={groups}
              onSelectSongForStudio={handleSelectSongForStudio}
              onSelectSongForStage={handleSelectSongForStage}
              onSelectSongOverview={(song, contextSongs, isSetlist) => {
                setOverviewSong(song);
                if (contextSongs && contextSongs.length > 0) {
                  setPreviewContextSongs(contextSongs);
                }
                setPreviewIsFromSetlist(Boolean(isSetlist ?? (activePlaylistId !== null || currentView === 'group')));
              }}
              onFilteredSongsChange={(filtered) => {
                setPreviewContextSongs(filtered);
              }}
              activePreviewSongId={overviewSong?.id}
              activePlaylistId={activePlaylistId}
              onClearActivePlaylist={() => setActivePlaylistId(null)}
              userPlaylists={userPlaylists}
              favoritedSongIds={favoritedSongIds}
              onToggleFavorite={handleToggleFavorite}
              upvotedSongIds={upvotedSongIds}
              onUpvoteSong={handleUpvoteSong}
            />
          )}

          {currentView === 'play' && (
            <StageModeView
              song={activeSong}
              initialPartId={activePartId}
              initialKeyOffset={stageKeyOffset}
              currentUser={currentUser}
              onBackToPractice={() => {
                setOverviewSong(activeSong);
                setOverviewInitialStudio(true);
                setCurrentView('home');
              }}
              onTakeSaved={(_take) => {
                refreshTakes();
              }}
            />
          )}

          {currentView === 'share' && (
            <ContributorStudioView
              currentUser={currentUser}
              songs={songs}
              groups={groups}
              initialArrangementId={contributorInitialArrangementId}
              onOpenAuth={() => handleOpenAuth('Share')}
              onOpenSongPreview={(song) => setOverviewSong(song)}
              onStartPractice={(song, partId) => {
                handleSelectSongForStudio(song, partId);
              }}
              onStartStageMode={(song, partId) => {
                handleSelectSongForStage(song, partId);
              }}
              onNavigateHome={() => setCurrentView('home')}
              onUpdateSongOffsets={handleUpdateSongOffsets}
            />
          )}

          {currentView === 'studio' && (
            <PracticeScreen
              song={activeSong}
              selectedPartId={activePartId || currentUser?.defaultPart || activeSong.parts[0]?.id || 'lead'}
              onChangeSelectedPart={(partId) => setActivePartId(partId)}
              onBack={() => setCurrentView('home')}
              onLaunchStageMode={() => setCurrentView('play')}
            />
          )}

          {currentView === 'takes' && (
            <PerformanceTakesView
              takes={takesList}
              songs={songs}
              groups={groups}
              activeCategory={takesCategory}
              onSelectCategory={(cat) => {
                setTakesCategory(cat);
                setTakesFilterGroupId(null);
              }}
              filterGroupId={takesFilterGroupId}
              onSelectGroupFilter={(gId) => setTakesFilterGroupId(gId)}
              onClearGroupFilter={() => setTakesFilterGroupId(null)}
              filterSongId={takesFilterSongId}
              onClearSongFilter={() => setTakesFilterSongId(null)}
              onOpenSongPreview={(song) => {
                setOverviewSong(song);
                setOverviewInitialStudio(false);
              }}
              onStartStageMode={(song, partId) => {
                handleSelectSongForStage(song, partId);
              }}
              onDeleteTake={handleDeleteTake}
              onShareTake={handleShareTake}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {currentView === 'group' && activeGroupDetail && (
            <GroupPageView
              group={activeGroupDetail}
              currentUser={currentUser}
              songs={songs}
              onBackToCatalog={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onUpdateGroup={handleUpdateGroup}
              onSelectSongOverview={(song, contextSongs) => {
                setOverviewSong(song);
                if (contextSongs && contextSongs.length > 0) {
                  setPreviewContextSongs(contextSongs);
                }
                setPreviewIsFromSetlist(true);
              }}
              onPracticeSong={(song, partId) => handleSelectSongForStudio(song, partId)}
              onPlaySong={(song, partId) => handleSelectSongForStage(song, partId)}
              onAddToSetlist={(song) => handleOpenAddToSetlist(song)}
              onOpenAuth={() => handleOpenAuth('General')}
              onNavigateToShareStudio={() => {
                setCurrentView('share');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              userPlaylists={userPlaylists}
              upvotedSongIds={upvotedSongIds}
              onUpvoteSong={handleUpvoteSong}
              favoritedSongIds={favoritedSongIds}
              onToggleFavorite={handleToggleFavorite}
              groups={groups}
            />
          )}

          {currentView === 'profile' && currentUser && (
            <UserProfileView
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onNavigateHome={() => setCurrentView('home')}
              onSignOut={handleSignOut}
            />
          )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {overviewSong && (
        <ArrangementOverviewModal
          song={overviewSong}
          isOpen={Boolean(overviewSong)}
          onClose={() => {
            setOverviewSong(null);
            setOverviewInitialStudio(false);
          }}
          initialStudioMode={overviewInitialStudio}
          onStartPractice={handleStartPracticeFromOverview}
          onStartStageMode={handleStartStageModeFromOverview}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          userDefaultPart={currentUser?.defaultPart || 'lead'}
          onUpvote={handleUpvoteSong}
          hasUpvoted={upvotedSongIds.includes(overviewSong.id)}
          onToggleFavorite={handleToggleFavorite}
          isFavorited={favoritedSongIds.includes(overviewSong.id)}
          onAddToPlaylist={(song) => {
            handleOpenAddToSetlist(song);
          }}
          onNextSong={handleNextPreviewSong}
          onPreviousSong={handlePreviousPreviewSong}
          hasNext={currentPreviewIndex >= 0 && currentPreviewIndex < previewContextSongs.length - 1}
          hasPrevious={currentPreviewIndex > 0}
          currentIndex={currentPreviewIndex >= 0 ? currentPreviewIndex : 0}
          totalSongsCount={previewContextSongs.length}
          isSetlistContext={previewIsFromSetlist}
          groups={groups}
          onOpenContributorStudio={(song) => {
            setOverviewSong(null);
            setOverviewInitialStudio(false);
            if (song.id === 'i-hold-your-hand-in-mine' || song.title.toLowerCase().includes('hold your hand')) {
              setContributorInitialArrangementId('arr_i_hold_your_hand_in_mine');
            } else {
              setContributorInitialArrangementId(null);
            }
            setCurrentView('share');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewPerformanceTakes={(songId) => {
            setOverviewSong(null);
            setOverviewInitialStudio(false);
            setTakesFilterSongId(songId || null);
            refreshTakes();
            setCurrentView('takes');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <CreateSetlistModal
        isOpen={isCreateSetlistOpen}
        onClose={() => setIsCreateSetlistOpen(false)}
        onCreate={handleCreateSetlist}
      />

      <AddToSetlistModal
        isOpen={isAddToSetlistOpen}
        onClose={() => {
          setIsAddToSetlistOpen(false);
          setAddToSetlistSong(null);
        }}
        song={addToSetlistSong}
        setlists={userPlaylists}
        onAddToSetlist={handleAddToSetlist}
        onCreateAndAdd={handleCreateAndAddToSetlist}
      />

      <DeleteSetlistModal
        isOpen={Boolean(deleteConfirmSetlist)}
        onClose={() => setDeleteConfirmSetlist(null)}
        setlist={deleteConfirmSetlist}
        onConfirmDelete={handleConfirmDeleteSetlist}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetFeature={authTargetFeature}
      />

      <GroupAccessModal
        isOpen={isGroupModalOpen && Boolean(currentUser)}
        onClose={() => setIsGroupModalOpen(false)}
        currentUser={currentUser}
        groupCatalogs={groupCatalogs}
        groups={groups}
        onUnlockGroup={handleUnlockGroup}
        onOpenCreateGroup={() => {
          setIsGroupModalOpen(false);
          if (!currentUser) {
            handleOpenAuth('General');
            return;
          }
          setIsCreateGroupOpen(true);
        }}
        onResolveInviteToken={handleResolveInviteToken}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
        onOpenAuth={() => handleOpenAuth('General')}
      />

      {inviteLandingState && (
        <InviteLandingModal
          isOpen={Boolean(inviteLandingState)}
          onClose={() => setInviteLandingState(null)}
          link={inviteLandingState.link}
          group={inviteLandingState.group}
          currentUser={currentUser}
          onJoinSuccess={handleJoinGroupSuccess}
          onRequestSubmitted={handleJoinRequestSubmitted}
          onOpenAuth={() => handleOpenAuth('General')}
        />
      )}

      <PitchPipeModal
        isOpen={isPitchPipeOpen}
        onClose={() => setIsPitchPipeOpen(false)}
        initialKey={activeSong?.baseKey || 'Eb'}
      />

      <GoogleDrivePickerModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        onSelectFile={handleSelectDriveFile}
      />

      {/* Sheet Music Score Viewer Modal */}
      {scoreViewerSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#221823] border border-[rgba(255,249,247,0.08)] rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setScoreViewerSong(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#19131C] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] transition-colors"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#F7F1F3] font-display">{scoreViewerSong.title}</h3>
              <p className="text-xs text-[#B9AEB6]">Interactive Grand Staves Score Data (Key: {scoreViewerSong.baseKey})</p>
            </div>
            <ScoreViewer
              song={scoreViewerSong}
              selectedPartId={currentUser?.defaultPart || 'lead'}
              currentTime={0}
              duration={scoreViewerSong.durationSeconds}
              keyOffset={0}
              effectiveKey={scoreViewerSong.baseKey}
            />
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-[rgba(255,249,247,0.08)] bg-[#17101D] py-6 px-4 text-center text-xs text-[#B9AEB6]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrackappellaLogo size="sm" />
            <span className="text-[#B9AEB6]">— Vocal Arrangement Player & Repertoire Library</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNavigate('home')} 
              className="hover:text-[#F7F1F3] font-medium transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <button 
              onClick={() => handleNavigate('play')} 
              className="hover:text-[#F7F1F3] font-medium transition-colors cursor-pointer"
            >
              Stage Mode
            </button>
            <button 
              onClick={() => handleNavigate('share')} 
              className="hover:text-[#F7F1F3] font-medium transition-colors cursor-pointer"
            >
              Contributor Studio
            </button>
            <button 
              onClick={() => setIsPitchPipeOpen(true)} 
              className="hover:text-[#F7F1F3] font-medium transition-colors cursor-pointer"
            >
              Pitch Pipe
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
