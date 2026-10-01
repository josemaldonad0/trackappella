import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Star, 
  ListMusic, 
  Users, 
  Lock, 
  FolderLock,
  Disc3,
  LogIn,
  UploadCloud,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Check,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  Clock,
  Plus,
  X,
  Mic,
  Music,
  Award
} from 'lucide-react';
import { UserProfile, GroupCatalog, Setlist, TrackappellaGroup, RecordedTake, Song } from '../types';

const getSetlistInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface LeftSidebarProps {
  currentView: 'home' | 'learn' | 'play' | 'share' | 'studio' | 'group' | 'takes' | 'profile';
  onNavigate: (view: 'home' | 'learn' | 'play' | 'share' | 'group' | 'takes' | 'profile') => void;
  currentUser: UserProfile | null;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  groupCatalogs: GroupCatalog[];
  onOpenGroupModal: () => void;
  favoritedSongsCount?: number;
  performanceTakesCount?: number;
  takesList?: RecordedTake[];
  activeTakesCategory?: 'auditions' | 'karaoke';
  activeTakesGroupId?: string | null;
  onSelectTakesCategory?: (category: 'auditions' | 'karaoke', groupId?: string | null) => void;
  songs?: Song[];
  userPlaylists?: Setlist[];
  activePlaylistId?: string | null;
  onCreatePlaylist?: () => void;
  onSelectPlaylist?: (playlistId: string) => void;
  onSelectAllCatalog?: () => void;
  onSelectGroup?: (groupCode: string) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onReorderSetlists?: (reorderedSetlists: Setlist[]) => void;
  onDeleteSetlist?: (setlist: Setlist) => void;
  groups?: TrackappellaGroup[];
  activeGroupId?: string | null;
  onOpenCreateGroup?: () => void;
  onOpenGroupDetail?: (group: TrackappellaGroup) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  groupCatalogs,
  onOpenGroupModal,
  favoritedSongsCount = 0,
  performanceTakesCount = 0,
  takesList = [],
  activeTakesCategory = 'auditions',
  activeTakesGroupId = null,
  onSelectTakesCategory,
  songs = [],
  userPlaylists = [],
  activePlaylistId = null,
  onCreatePlaylist,
  onSelectPlaylist,
  onSelectAllCatalog,
  onSelectGroup,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onReorderSetlists,
  onDeleteSetlist,
  groups = [],
  activeGroupId = null,
  onOpenCreateGroup,
  onOpenGroupDetail
}) => {
  const [isEditingSetlists, setIsEditingSetlists] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSetlistsFlyoutOpen, setIsSetlistsFlyoutOpen] = useState(false);
  const [isGroupsFlyoutOpen, setIsGroupsFlyoutOpen] = useState(false);
  const [isTakesFlyoutOpen, setIsTakesFlyoutOpen] = useState(false);

  // Group takes into Auditions and Karaoke take groups
  const auditionTakes = useMemo(() => {
    return takesList.filter(t => t.takeType === 'audition' || t.forAudition);
  }, [takesList]);

  const karaokeTakes = useMemo(() => {
    return takesList.filter(t => !(t.takeType === 'audition' || t.forAudition));
  }, [takesList]);

  const handleContributorStudioClick = () => {
    onNavigate('share');
  };

  // Reordering helpers
  const handleMoveSetlist = (fromIndex: number, toIndex: number) => {
    if (!onReorderSetlists) return;
    if (toIndex < 0 || toIndex >= userPlaylists.length) return;
    const updated = [...userPlaylists];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorderSetlists(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    handleMoveSetlist(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // If collapsed icon-only mini bar mode
  if (isCollapsed) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-between bg-[#17101D] py-3.5 px-1.5 sm:px-2 select-none relative"
        aria-label="Library Navigation Mini"
        id="left-sidebar-mini-container"
      >
        {/* Top: Expand Toggle / Library Icon */}
        <div className="shrink-0 pb-3 border-b border-[rgba(255,249,247,0.08)] w-full flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse || onClose}
            className="p-2 rounded-xl bg-[#221823] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] transition-colors cursor-pointer"
            title="Expand Library Sidebar"
            id="sidebar-mini-expand-button"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Working Section Icons & Setlists */}
        <div className="flex-1 min-h-0 py-2.5 space-y-2 flex flex-col items-center overflow-y-auto custom-scrollbar w-full">
          {/* All Catalog Icon */}
          <button
            type="button"
            onClick={() => {
              setIsSetlistsFlyoutOpen(false);
              if (onSelectAllCatalog) {
                onSelectAllCatalog();
              } else {
                onNavigate('home');
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group ${
              currentView === 'home' && !activePlaylistId
                ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            title="All Catalog (Homepage)"
            id="sidebar-mini-all-catalog"
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Favorites (Default Playlist) Icon */}
          <button
            type="button"
            onClick={() => {
              setIsSetlistsFlyoutOpen(false);
              if (currentUser) {
                onSelectPlaylist?.('favorites');
              } else {
                onOpenAuth('General');
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group ${
              currentUser && activePlaylistId === 'favorites'
                ? 'bg-[#2A1E2A] text-[#D9AF8D]'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            title={currentUser ? `Favorites (${favoritedSongsCount} songs)` : 'Favorites (0 songs)'}
            id="sidebar-mini-favorites"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9AF8D] fill-[#D9AF8D]/30 group-hover:scale-110 transition-transform" />
            {currentUser && favoritedSongsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D9AF8D] text-[#120B17] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                {favoritedSongsCount > 9 ? '9+' : favoritedSongsCount}
              </span>
            )}
          </button>

          {/* Setlists Section Divider */}
          <div className="w-5 h-px bg-[rgba(255,249,247,0.08)] my-0.5 shrink-0" />

          {/* Setlists Main Icon (Toggles Floating Menu if logged in) */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setIsSetlistsFlyoutOpen(prev => !prev);
              } else {
                onOpenAuth('General');
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group ${
              currentUser && ((activePlaylistId && activePlaylistId !== 'favorites') || isSetlistsFlyoutOpen)
                ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            title={currentUser ? (userPlaylists.length > 0 ? `Setlists (${userPlaylists.length}) - Tap to open menu` : 'Setlists') : 'Setlists (0) - Log in to access'}
            id="sidebar-mini-playlists"
          >
            <ListMusic className="w-4 h-4 sm:w-5 sm:h-5 text-[#B9AEB6] group-hover:text-[#F7F1F3] group-hover:scale-110 transition-all" />
            {currentUser && userPlaylists.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF5757] text-[#F7F1F3] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                {userPlaylists.length}
              </span>
            )}
          </button>

          {/* Direct Setlist Shortcut Pills (When logged in) */}
          {currentUser && userPlaylists.slice(0, 3).map((pl) => {
            const isSelected = activePlaylistId === pl.id;
            const initials = getSetlistInitials(pl.name);
            const count = pl.songIds ? pl.songIds.length : (pl.songCount || 0);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => {
                  setIsSetlistsFlyoutOpen(false);
                  onSelectPlaylist?.(pl.id);
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-tight transition-all cursor-pointer flex items-center justify-center relative group ${
                  isSelected
                    ? 'bg-[#2A1E2A] text-[#F7F1F3] font-mono'
                    : 'bg-[#221823] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] font-mono'
                }`}
                title={`${pl.name} (${count} ${count === 1 ? 'song' : 'songs'})`}
                id={`sidebar-mini-setlist-${pl.id}`}
              >
                <span>{initials}</span>
                {isSelected && (
                  <span className="absolute -right-0.5 -top-0.5 w-2 h-2 rounded-full bg-[#FF5757]" />
                )}
              </button>
            );
          })}

          {/* More Setlists Indicator button if > 3 setlists */}
          {currentUser && userPlaylists.length > 3 && (
            <button
              type="button"
              onClick={() => setIsSetlistsFlyoutOpen(true)}
              className="w-7 h-5 rounded-md bg-[#221823] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] text-[9px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer"
              title={`View all ${userPlaylists.length} setlists`}
              id="sidebar-mini-more-setlists"
            >
              +{userPlaylists.length - 3}
            </button>
          )}

          {/* Group Folders Divider */}
          <div className="w-5 h-px bg-[rgba(255,249,247,0.08)] my-0.5 shrink-0" />

          {/* Group Folders Icon */}
          <button
            type="button"
            onClick={() => {
              setIsSetlistsFlyoutOpen(false);
              if (currentUser) {
                setIsGroupsFlyoutOpen(prev => !prev);
              } else {
                onOpenAuth('General');
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group ${
              currentUser && (currentView === 'group' || isGroupsFlyoutOpen)
                ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            title={currentUser ? `Private Groups (${groups.length || groupCatalogs.length}) - Tap to open menu` : 'Private Groups (0) - Log in to access'}
            id="sidebar-mini-groups"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#B9AEB6] group-hover:text-[#F7F1F3] group-hover:scale-110 transition-all" />
            {currentUser && (groups.length > 0 || groupCatalogs.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-[#9EBCAB] text-[#120B17] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                {groups.length || groupCatalogs.length}
              </span>
            )}
          </button>

          {/* Performance Takes Mini Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSetlistsFlyoutOpen(false);
                setIsGroupsFlyoutOpen(false);
                if (currentUser) {
                  setIsTakesFlyoutOpen(prev => !prev);
                } else {
                  onOpenAuth('General');
                }
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer group ${
                currentUser && (currentView === 'takes' || isTakesFlyoutOpen)
                  ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
              }`}
              title={currentUser ? `Performance Takes (${performanceTakesCount}) - Auditions & Karaoke` : 'Performance Takes - Log in to view'}
              id="sidebar-mini-takes"
            >
              <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#B9AEB6] group-hover:text-[#F7F1F3] group-hover:scale-110 transition-all" />
              {currentUser && performanceTakesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D9A7B4] text-[#120B17] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {performanceTakesCount}
                </span>
              )}
            </button>

            {/* Performance Takes Mini Flyout */}
            {isTakesFlyoutOpen && currentUser && (
              <div 
                className="absolute left-full ml-2 top-0 w-56 p-2.5 bg-[#221823] rounded-xl shadow-2xl z-50 space-y-2 animate-fadeIn text-xs"
                id="sidebar-mini-takes-flyout"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-[rgba(255,249,247,0.08)] text-[10px] uppercase font-mono tracking-wider text-[#B9AEB6]">
                  <span className="font-bold flex items-center gap-1.5 text-[#F7F1F3]">
                    <Disc3 className="w-3 h-3 text-[#D9A7B4]" />
                    <span>Takes Menu</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTakesFlyoutOpen(false)}
                    className="text-[#B9AEB6] hover:text-[#F7F1F3] p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Auditions option */}
                <button
                  type="button"
                  onClick={() => {
                    setIsTakesFlyoutOpen(false);
                    onSelectTakesCategory ? onSelectTakesCategory('auditions', null) : onNavigate('takes');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    currentView === 'takes' && activeTakesCategory === 'auditions'
                      ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                      : 'text-[#B9AEB6] hover:bg-[#2A1E2A] hover:text-[#F7F1F3]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#D9AF8D]" />
                    <span className="font-semibold text-xs">Auditions</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#19131C] text-[#D9AF8D] font-bold">
                    {auditionTakes.length}
                  </span>
                </button>

                {/* Karaoke option */}
                <button
                  type="button"
                  onClick={() => {
                    setIsTakesFlyoutOpen(false);
                    onSelectTakesCategory ? onSelectTakesCategory('karaoke', null) : onNavigate('takes');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    currentView === 'takes' && activeTakesCategory === 'karaoke'
                      ? 'bg-[#2A1E2A] text-[#F7F1F3]'
                      : 'text-[#B9AEB6] hover:bg-[#2A1E2A] hover:text-[#F7F1F3]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-[#D9A7B4]" />
                    <span className="font-semibold text-xs">Karaoke</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#19131C] text-[#D9A7B4] font-bold">
                    {karaokeTakes.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Unauthenticated Login Icon if guest */}
          {!currentUser && (
            <>
              <div className="w-5 h-px bg-[rgba(255,249,247,0.08)] my-0.5 shrink-0" />
              <button
                type="button"
                onClick={() => onOpenAuth('General')}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823] transition-all cursor-pointer group"
                title="Log in to see your Setlists & Private Groups"
                id="sidebar-mini-login"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-[#B9AEB6] group-hover:text-[#F7F1F3] group-hover:scale-110 transition-all" />
              </button>
            </>
          )}
        </div>

        {/* Bottom: Contributor Studio Icon */}
        <div className="shrink-0 pt-3 border-t border-[rgba(255,249,247,0.08)] w-full flex justify-center">
          <button
            type="button"
            onClick={() => {
              setIsSetlistsFlyoutOpen(false);
              handleContributorStudioClick();
            }}
            id="sidebar-mini-contributor-studio"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group bg-[#cbb9c7] hover:bg-[#bfa7bb] text-[#1C121F] shadow-sm border border-[rgba(62,40,67,0.18)]"
            title="Contributor Studio (Add & Configure Arrangements)"
          >
            <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-[#1C121F] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Floating Setlists Flyout Menu */}
        {currentUser && isSetlistsFlyoutOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
              onClick={() => setIsSetlistsFlyoutOpen(false)}
            />
            <div 
              className="fixed left-14 sm:left-16 top-16 z-50 w-72 max-w-[calc(100vw-70px)] bg-[#221823] rounded-xl shadow-2xl p-3.5 space-y-3 text-[#F7F1F3] animate-fadeIn"
              id="mini-setlists-flyout"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,249,247,0.08)]">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-[#D9A7B4]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F7F1F3]">
                    Setlists ({userPlaylists.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSetlistsFlyoutOpen(false)}
                  className="p-1 rounded-lg text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer"
                  title="Close Setlists Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Setlists Items List */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                {userPlaylists.map((playlist) => {
                  const isSelected = activePlaylistId === playlist.id;
                  const count = playlist.songIds ? playlist.songIds.length : (playlist.songCount || 0);
                  return (
                    <button
                      key={playlist.id}
                      type="button"
                      onClick={() => {
                        onSelectPlaylist?.(playlist.id);
                        setIsSetlistsFlyoutOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2A1E2A] text-[#F7F1F3] font-semibold'
                          : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A]'
                      }`}
                      id={`flyout-setlist-${playlist.id}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Music className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#FF5757]' : 'text-[#B9AEB6]'}`} />
                        <span className="truncate">{playlist.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                        isSelected ? 'bg-[#19131C] text-[#F7F1F3]' : 'bg-[#19131C] text-[#B9AEB6]'
                      }`}>
                        {count} {count === 1 ? 'song' : 'songs'}
                      </span>
                    </button>
                  );
                })}
                {userPlaylists.length === 0 && (
                  <p className="text-xs text-[#B9AEB6] py-3 text-center">No setlists yet.</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[rgba(255,249,247,0.08)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSetlistsFlyoutOpen(false);
                    if (onCreatePlaylist) {
                      onCreatePlaylist();
                    }
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#FF5757] hover:opacity-90 text-[#F7F1F3] font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Setlist</span>
                </button>
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSetlistsFlyoutOpen(false);
                      onToggleCollapse();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-[#19131C] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] text-xs transition-colors cursor-pointer"
                    title="Open Full Sidebar"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Floating Groups Flyout Menu */}
        {currentUser && isGroupsFlyoutOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
              onClick={() => setIsGroupsFlyoutOpen(false)}
            />
            <div 
              className="fixed left-14 sm:left-16 top-24 z-50 w-72 max-w-[calc(100vw-70px)] bg-[#221823] rounded-xl shadow-2xl p-3.5 space-y-3 text-[#F7F1F3] animate-fadeIn"
              id="mini-groups-flyout"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,249,247,0.08)]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#9EBCAB]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F7F1F3]">
                    Private Groups ({groups && groups.length > 0 ? groups.length : groupCatalogs.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGroupsFlyoutOpen(false)}
                  className="p-1 rounded-lg text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer"
                  title="Close Groups Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Group Items List */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                {groups && groups.length > 0 ? (
                  groups.map((grp) => {
                    const memberRecord = currentUser
                      ? grp.members?.find(
                          m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase()
                        )
                      : undefined;
                    const isMember = Boolean(memberRecord);
                    const isAdmin = memberRecord?.role === 'admin';
                    const isCurrentActiveGroup = currentView === 'group' && activeGroupId === grp.id;

                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          setIsGroupsFlyoutOpen(false);
                          if (onOpenGroupDetail) {
                            onOpenGroupDetail(grp);
                          } else {
                            onSelectGroup?.(grp.code);
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer ${
                          isCurrentActiveGroup
                            ? 'bg-[#2A1E2A] text-[#F7F1F3] font-semibold'
                            : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D9A7B4] shrink-0" />
                          ) : isMember ? (
                            <FolderLock className="w-3.5 h-3.5 text-[#9EBCAB] shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-[#B9AEB6]/50 shrink-0" />
                          )}
                          <span className="truncate">{grp.name}</span>
                        </div>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isAdmin
                            ? 'bg-[#2A1E2A] text-[#D9A7B4]'
                            : isMember
                            ? 'bg-[#19131C] text-[#9EBCAB]'
                            : 'text-[#B9AEB6]/50'
                        }`}>
                          {isAdmin ? 'Admin' : isMember ? 'Member' : 'Lock'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  groupCatalogs.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setIsGroupsFlyoutOpen(false);
                        onSelectGroup?.(cat.accessCode);
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-all cursor-pointer text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock className="w-3.5 h-3.5 text-[#B9AEB6]/50 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[9px] text-[#B9AEB6]/50 font-mono">Lock</span>
                    </button>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[rgba(255,249,247,0.08)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupsFlyoutOpen(false);
                    if (onOpenCreateGroup) {
                      onOpenCreateGroup();
                    } else if (!currentUser) {
                      onOpenAuth('General');
                    }
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#FF5757] hover:opacity-90 text-[#F7F1F3] text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Group</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGroupsFlyoutOpen(false);
                    if (currentUser) {
                      onOpenGroupModal();
                    } else {
                      onOpenAuth('General');
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#19131C] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] text-xs transition-colors cursor-pointer"
                >
                  + Join
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Expanded View
  return (
    <div 
      className="w-full h-full flex flex-col bg-[#17101D] p-4 select-none overflow-hidden"
      aria-label="Library Navigation"
      id="left-sidebar-main-container"
    >
      {/* Header with Title and Collapse Button */}
      <div className="flex items-center justify-between pb-3 shrink-0 border-b border-[rgba(255,249,247,0.08)]">
        <div className="flex items-center gap-2 text-[#B9AEB6]">
          <Library className="w-4 h-4 text-[#D9A7B4]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F7F1F3] font-mono">
            Your Library
          </span>
        </div>
        {(onClose || onToggleCollapse) && (
          <button
            type="button"
            onClick={onToggleCollapse || onClose}
            className="p-1 rounded-lg hover:bg-[#221823] text-[#B9AEB6] hover:text-[#F7F1F3] transition-colors cursor-pointer"
            title="Collapse sidebar to icon mini-bar"
            id="sidebar-collapse-toggle-btn"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Library Content in Middle */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-2 space-y-3.5 text-xs custom-scrollbar">
        {/* All Catalog Navigation Option (Always accessible at the top) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (onSelectAllCatalog) {
                onSelectAllCatalog();
              } else {
                onNavigate('home');
              }
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentView === 'home' && !activePlaylistId
                ? 'bg-[#221823] text-[#F7F1F3] font-semibold'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            id="sidebar-all-catalog-button"
            title="Return to unfiltered All Catalog homepage"
          >
            <div className="flex items-center gap-2 truncate">
              <LayoutGrid className={`w-3.5 h-3.5 shrink-0 ${
                currentView === 'home' && !activePlaylistId
                  ? 'text-[#FF5757]'
                  : 'text-[#B9AEB6] group-hover:text-[#F7F1F3]'
              }`} />
              <span className="font-medium truncate">All Catalog</span>
            </div>
          </button>
        </div>

        {/* Setlists Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B9AEB6]/70">
            <div className="flex items-center gap-1.5">
              <ListMusic className="w-3 h-3 text-[#B9AEB6]" />
              <span>Setlists</span>
            </div>
            
            {/* Actions: Edit (Pencil) and + New */}
            <div className="flex items-center gap-2">
              {currentUser && userPlaylists.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditingSetlists(prev => !prev)}
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isEditingSetlists
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] font-bold'
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
                  }`}
                  title={isEditingSetlists ? 'Done editing setlists' : 'Edit and reorder setlists'}
                  id="sidebar-edit-setlists-btn"
                  aria-pressed={isEditingSetlists}
                >
                  {isEditingSetlists ? (
                    <>
                      <Check className="w-3 h-3 text-[#9EBCAB]" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3 h-3 text-[#B9AEB6] hover:text-[#F7F1F3]" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onCreatePlaylist?.();
                  } else {
                    onOpenAuth('General');
                  }
                }}
                className="text-[10px] text-[#B9AEB6] hover:text-[#F7F1F3] hover:underline cursor-pointer font-medium"
                title="Create new setlist"
                id="sidebar-new-setlist-btn"
              >
                + New
              </button>
            </div>
          </div>

          {/* Default Playlist: Favorites (with Star icon) */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                onSelectPlaylist?.('favorites');
              } else {
                onOpenAuth('General');
              }
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentUser && activePlaylistId === 'favorites'
                ? 'bg-[#221823] text-[#D9AF8D] font-semibold'
                : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
            }`}
            id="sidebar-favorites-tracks-button"
            title={currentUser ? "Favorites (Default Playlist)" : "Favorites (0 songs)"}
          >
            <div className="flex items-center gap-2 truncate">
              <Star className={`w-3.5 h-3.5 shrink-0 ${
                currentUser && activePlaylistId === 'favorites'
                  ? 'text-[#D9AF8D] fill-[#D9AF8D]'
                  : 'text-[#D9AF8D] fill-[#D9AF8D]/20'
              }`} />
              <span className="font-medium truncate">Favorites</span>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${
              currentUser && activePlaylistId === 'favorites' ? 'text-[#D9AF8D] font-bold' : 'text-[#B9AEB6]/60'
            }`}>
              {currentUser ? favoritedSongsCount : 0}
            </span>
          </button>

          {/* User Custom Setlists */}
          {currentUser ? (
            userPlaylists.length === 0 ? (
              <div className="px-2.5 py-2 text-[11px] text-[#B9AEB6]/60 italic">
                No setlists yet. Click + New to create one.
              </div>
            ) : (
              <div className="space-y-1">
                {userPlaylists.map((pl, index) => {
                  const isActive = activePlaylistId === pl.id;
                  const songCount = pl.songIds ? pl.songIds.length : (pl.songCount || 0);

                  return (
                    <div
                      key={pl.id}
                      draggable={isEditingSetlists}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group/setlist w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        draggedIndex === index ? 'opacity-40 bg-[#2A1E2A]' : ''
                      } ${
                        isActive && !isEditingSetlists
                          ? 'bg-[#221823] text-[#F7F1F3] font-semibold'
                          : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
                      }`}
                      id={`sidebar-setlist-item-${pl.id}`}
                    >
                      {/* If in edit mode: show drag handle or reorder buttons */}
                      {isEditingSetlists ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                          {/* Drag grip handle */}
                          <div 
                            className="p-1 rounded hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3] cursor-grab active:cursor-grabbing shrink-0" 
                            title="Drag to reorder setlist"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          {/* Up / Down arrows for direct 1-click reorder */}
                          <div className="flex flex-col shrink-0">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSetlist(index, index - 1);
                              }}
                              className="p-0.5 rounded text-[#B9AEB6] hover:text-[#F7F1F3] disabled:opacity-20 disabled:hover:text-[#B9AEB6] cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === userPlaylists.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveSetlist(index, index + 1);
                              }}
                              className="p-0.5 rounded text-[#B9AEB6] hover:text-[#F7F1F3] disabled:opacity-20 disabled:hover:text-[#B9AEB6] cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Setlist Title */}
                          <div className="truncate flex-1 font-medium text-[#F7F1F3]" title={pl.name}>
                            {pl.name}
                          </div>

                          {/* Song count badge */}
                          <span className="text-[10px] font-mono text-[#B9AEB6] shrink-0">
                            {songCount}
                          </span>

                          {/* Delete Button */}
                          {onDeleteSetlist && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSetlist(pl);
                              }}
                              className="p-1 rounded text-[#B9AEB6] hover:text-[#FF5757] hover:bg-[#2A1E2A] transition-colors cursor-pointer shrink-0 ml-1"
                              title={`Delete setlist "${pl.name}"`}
                              id={`delete-setlist-btn-${pl.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Normal Mode: Selectable button to filter catalog */
                        <button
                          type="button"
                          onClick={() => onSelectPlaylist?.(pl.id)}
                          className="w-full flex items-center justify-between text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {pl.type === 'group' ? (
                              <Users className="w-3.5 h-3.5 text-[#9EBCAB] shrink-0" title={`Group Setlist (${pl.groupName || 'Group'})`} />
                            ) : (
                              <Disc3 className="w-3.5 h-3.5 text-[#B9AEB6]/60 shrink-0 group-hover/setlist:text-[#F7F1F3] transition-colors" />
                            )}
                            <span className="truncate">{pl.name}</span>
                            {pl.type === 'group' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#19131C] text-[#9EBCAB] font-mono shrink-0">
                                Group
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 ${
                            isActive ? 'text-[#F7F1F3] font-bold' : 'text-[#B9AEB6]/60'
                          }`}>{songCount}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="px-2.5 py-1.5 text-[11px] text-[#B9AEB6]/60 italic">
              0 setlists
            </div>
          )}
        </div>

        {/* Group Folders & Repertoire */}
        <div className="space-y-1 pt-2 border-t border-[rgba(255,249,247,0.08)]">
          <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B9AEB6]/70">
            <span className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#B9AEB6]" />
              <span>Private Groups</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onOpenCreateGroup?.();
                  } else {
                    onOpenAuth('General');
                  }
                }}
                className="text-[10px] text-[#B9AEB6] hover:text-[#F7F1F3] font-bold hover:underline cursor-pointer"
                title="Create a new private vocal group"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onOpenGroupModal();
                  } else {
                    onOpenAuth('General');
                  }
                }}
                className="text-[10px] text-[#B9AEB6] hover:text-[#F7F1F3] font-bold hover:underline cursor-pointer"
              >
                + Join
              </button>
            </div>
          </div>

          {currentUser ? (
            groups && groups.length > 0 ? (
              groups.map(grp => {
                const memberRecord = currentUser
                  ? grp.members?.find(
                      m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase()
                    )
                  : undefined;
                const isMember = Boolean(memberRecord);
                const isAdmin = memberRecord?.role === 'admin';
                const pendingReq = currentUser
                  ? grp.joinRequests?.find(
                      r => (r.userId === currentUser.id || r.userEmail.toLowerCase() === currentUser.email.toLowerCase()) && r.status === 'pending'
                    )
                  : undefined;

                const isCurrentActiveGroup = currentView === 'group' && activeGroupId === grp.id;

                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => {
                      if (onOpenGroupDetail) {
                        onOpenGroupDetail(grp);
                      } else {
                        onSelectGroup?.(grp.code);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group/grp ${
                      isCurrentActiveGroup
                        ? 'bg-[#221823] text-[#F7F1F3] font-semibold'
                        : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isAdmin ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D9A7B4] shrink-0" />
                      ) : isMember ? (
                        <FolderLock className="w-3.5 h-3.5 text-[#9EBCAB] shrink-0" />
                      ) : pendingReq ? (
                        <Clock className="w-3.5 h-3.5 text-[#D9AF8D] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#B9AEB6]/50 shrink-0" />
                      )}
                      <span className="truncate">{grp.name}</span>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isAdmin
                        ? 'bg-[#2A1E2A] text-[#D9A7B4]'
                        : isMember
                        ? 'bg-[#19131C] text-[#9EBCAB]'
                        : pendingReq
                        ? 'bg-[#19131C] text-[#D9AF8D]'
                        : 'text-[#B9AEB6]/50'
                    }`}>
                      {isAdmin ? 'Admin' : isMember ? 'Member' : pendingReq ? 'Pending' : 'Lock'}
                    </span>
                  </button>
                );
              })
            ) : (
              groupCatalogs.map(cat => {
                const isMember = currentUser?.memberGroupCodes
                  ? currentUser.memberGroupCodes.includes(cat.accessCode.toUpperCase())
                  : false;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (currentUser) {
                        if (isMember) {
                          onSelectGroup?.(cat.accessCode);
                        } else {
                          onOpenGroupModal();
                        }
                      } else {
                        onOpenAuth('General');
                      }
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isMember ? (
                        <FolderLock className="w-3.5 h-3.5 text-[#9EBCAB] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#B9AEB6]/50 shrink-0" />
                      )}
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono shrink-0 ${
                      isMember ? 'text-[#9EBCAB] font-semibold' : 'text-[#B9AEB6]/50'
                    }`}>
                      {isMember ? `${cat.songIds.length}` : 'Lock'}
                    </span>
                  </button>
                );
              })
            )
          ) : (
            <div className="px-2.5 py-1.5 text-[11px] text-[#B9AEB6]/60 italic">
              0 groups
            </div>
          )}
        </div>

        {/* Performance Takes sidebar menu: Auditions & Karaoke, each listing their own group */}
        <div className="space-y-1.5 pt-2 border-t border-[rgba(255,249,247,0.08)]" id="sidebar-performance-takes-container">
          <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B9AEB6]/70 font-mono">
            <span className="flex items-center gap-1.5">
              <Disc3 className="w-3 h-3 text-[#B9AEB6]" />
              <span>Performance Takes</span>
            </span>
            {performanceTakesCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#221823] text-[#F7F1F3] font-bold">
                {performanceTakesCount}
              </span>
            )}
          </div>

          {/* 1. Auditions Take Group */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  onSelectTakesCategory ? onSelectTakesCategory('auditions', null) : onNavigate('takes');
                } else {
                  onOpenAuth('General');
                }
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer group/takes-aud ${
                currentView === 'takes' && activeTakesCategory === 'auditions'
                  ? 'bg-[#221823] text-[#F7F1F3]'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
              }`}
              id="sidebar-performance-auditions-link"
            >
              <div className="flex items-center gap-2 truncate">
                <Award className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                  currentView === 'takes' && activeTakesCategory === 'auditions'
                    ? 'text-[#D9AF8D]'
                    : 'text-[#D9AF8D]/80 group-hover/takes-aud:text-[#D9AF8D]'
                }`} />
                <span className="truncate font-medium text-xs">Auditions</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                currentView === 'takes' && activeTakesCategory === 'auditions'
                  ? 'bg-[#D9AF8D] text-[#120B17]'
                  : 'bg-[#19131C] text-[#D9AF8D] group-hover/takes-aud:bg-[#2A1E2A]'
              }`}>
                {auditionTakes.length}
              </span>
            </button>
          </div>

          {/* 2. Karaoke Take Group */}
          <div>
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  onSelectTakesCategory ? onSelectTakesCategory('karaoke', null) : onNavigate('takes');
                } else {
                  onOpenAuth('General');
                }
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer group/takes-kar ${
                currentView === 'takes' && activeTakesCategory === 'karaoke'
                  ? 'bg-[#221823] text-[#F7F1F3]'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#221823]'
              }`}
              id="sidebar-performance-karaoke-link"
            >
              <div className="flex items-center gap-2 truncate">
                <Mic className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                  currentView === 'takes' && activeTakesCategory === 'karaoke'
                    ? 'text-[#D9A7B4]'
                    : 'text-[#D9A7B4]/80 group-hover/takes-kar:text-[#D9A7B4]'
                }`} />
                <span className="truncate font-medium text-xs">Karaoke</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                currentView === 'takes' && activeTakesCategory === 'karaoke'
                  ? 'bg-[#D9A7B4] text-[#120B17]'
                  : 'bg-[#19131C] text-[#D9A7B4] group-hover/takes-kar:bg-[#2A1E2A]'
              }`}>
                {karaokeTakes.length}
              </span>
            </button>
          </div>
        </div>
        {!currentUser && (
          <div 
            className="p-3 rounded-xl bg-[#221823] space-y-2 text-left my-2 shrink-0" 
            id="sidebar-logged-out-invite-section"
          >
            <p className="text-xs text-[#B9AEB6] leading-relaxed">
              Log in to view and manage your custom setlists and private group folders.
            </p>
            <button
              type="button"
              onClick={() => onOpenAuth('General')}
              id="sidebar-login-invite-button"
              className="w-full py-2 px-3 rounded-lg bg-[#2A1E2A] hover:bg-[#322332] text-[#F7F1F3] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#B9AEB6]" />
              <span>Log in to see setlists</span>
            </button>
          </div>
        )}
      </div>

      {/* Contributor Studio Section inside the sidebar container at the bottom */}
      <div className="shrink-0 pt-3 border-t border-[rgba(255,249,247,0.08)] mt-auto" id="sidebar-contributor-studio-container">
        <button
          type="button"
          onClick={handleContributorStudioClick}
          id="sidebar-contributor-studio-button"
          className="w-full p-3 rounded-xl text-left transition-all cursor-pointer group flex flex-col gap-1.5 shadow-sm border border-[rgba(62,40,67,0.18)] bg-[#cbb9c7] hover:bg-[#bfa7bb] text-[#1C121F]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg transition-colors bg-[#2A1E2A] text-[#F7F1F3] group-hover:bg-[#3E2843]">
                <UploadCloud className="w-4 h-4 shrink-0 text-[#F7F1F3]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1C121F] tracking-tight block font-display">
                  Contributor Studio
                </span>
                <span className="text-[10px] text-[#573657] font-semibold block">
                  Add Arrangements
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#573657] group-hover:text-[#1C121F] group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-[#3E2843] leading-snug font-medium">
            Visit here to add and configure your arrangements.
          </p>
        </button>
      </div>
    </div>
  );
};


