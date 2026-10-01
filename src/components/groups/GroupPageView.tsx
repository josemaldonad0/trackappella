import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Music, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Share2, 
  Settings, 
  ArrowLeft,
  Headphones,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  TrackappellaGroup, 
  UserProfile, 
  Song, 
  GroupInviteLink, 
  GroupMember, 
  GroupMembershipMode, 
  Setlist 
} from '../../types';
import { SongCard } from '../SongCard';
import { SongLibraryGrid } from '../SongLibraryGrid';

interface GroupPageViewProps {
  group: TrackappellaGroup;
  currentUser: UserProfile | null;
  songs: Song[];
  onBackToCatalog: () => void;
  onUpdateGroup: (updatedGroup: TrackappellaGroup) => void;
  onSelectSongOverview: (song: Song, contextSongs?: Song[], isSetlist?: boolean) => void;
  onPracticeSong: (song: Song, partId?: string) => void;
  onPlaySong: (song: Song, partId?: string) => void;
  onAddToSetlist: (song: Song) => void;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  onNavigateToShareStudio?: (prefillGroupCode?: string) => void;
  userPlaylists?: Setlist[];
  upvotedSongIds?: string[];
  favoritedSongIds?: string[];
  onToggleFavorite?: (songId: string) => void;
  onUpvoteSong?: (songId: string) => void;
  groups?: TrackappellaGroup[];
}

export const GroupPageView: React.FC<GroupPageViewProps> = ({
  group,
  currentUser,
  songs,
  onBackToCatalog,
  onUpdateGroup,
  onSelectSongOverview,
  onPracticeSong,
  onPlaySong,
  onAddToSetlist,
  onOpenAuth,
  onNavigateToShareStudio,
  userPlaylists = [],
  upvotedSongIds = [],
  favoritedSongIds = [],
  onToggleFavorite,
  onUpvoteSong,
  groups = []
}) => {
  // Current member status & admin check
  const currentMember = useMemo(() => {
    if (!currentUser) return null;
    return group.members.find(
      m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase()
    );
  }, [group.members, currentUser]);

  const isAdmin = currentMember?.role === 'admin';
  const isMember = Boolean(currentMember);

  const pendingRequests = useMemo(() => {
    return group.joinRequests.filter(r => r.status === 'pending');
  }, [group.joinRequests]);

  // Main View: Repertoire Catalog (default for all) vs Group Settings (Admin only)
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  
  // Admin Center / Group Settings sub-sections
  const [adminSection, setAdminSection] = useState<'requests_roster' | 'invites' | 'shared_rep' | 'settings'>('requests_roster');

  // Link generation state in Admin Center
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkExpiryWindow, setNewLinkExpiryWindow] = useState<'24h' | '7d' | '30d' | '90d' | 'never'>('30d');

  // Notice & Copy Feedback
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Settings form state
  const [editName, setEditName] = useState(group.name);
  const [editDescription, setEditDescription] = useState(group.description || '');
  const [editMembershipMode, setEditMembershipMode] = useState<GroupMembershipMode>(group.membershipMode);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Repertoire picker modal
  const [isAssignSongOpen, setIsAssignSongOpen] = useState(false);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');

  // Confirmation targets
  const [revokeMemberTarget, setRevokeMemberTarget] = useState<GroupMember | null>(null);
  const [revokeLinkTarget, setRevokeLinkTarget] = useState<GroupInviteLink | null>(null);

  // Reset/sync settings when group changes
  React.useEffect(() => {
    setEditName(group.name);
    setEditDescription(group.description || '');
    setEditMembershipMode(group.membershipMode);
  }, [group.id, group.name, group.description, group.membershipMode]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Derive restricted songs belonging to this group
  const groupSongs: Song[] = useMemo(() => {
    return songs.filter(s => 
      (group.restrictedSongIds && group.restrictedSongIds.includes(s.id)) ||
      (s.groupAccessCode && s.groupAccessCode.toUpperCase() === group.code.toUpperCase())
    );
  }, [songs, group.restrictedSongIds, group.code]);

  // Copy Group ID/Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopiedCode(true);
    showNotice(`Group code ${group.code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy Invite Link
  const handleCopyInviteLink = (link: GroupInviteLink) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}?invite=${link.token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(link.id);
    showNotice(`Invite link copied to clipboard!`);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // Create new invite link
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `inv_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
    
    let expiresAt: string | null = null;
    let expiryLabel = 'Never';
    const now = new Date();
    
    if (newLinkExpiryWindow === '24h') {
      now.setHours(now.getHours() + 24);
      expiresAt = now.toISOString();
      expiryLabel = '24 hours';
    } else if (newLinkExpiryWindow === '7d') {
      now.setDate(now.getDate() + 7);
      expiresAt = now.toISOString();
      expiryLabel = '7 days';
    } else if (newLinkExpiryWindow === '30d') {
      now.setDate(now.getDate() + 30);
      expiresAt = now.toISOString();
      expiryLabel = '30 days';
    } else if (newLinkExpiryWindow === '90d') {
      now.setDate(now.getDate() + 90);
      expiresAt = now.toISOString();
      expiryLabel = '90 days';
    }

    const newLink: GroupInviteLink = {
      id: `link_${Date.now()}`,
      token,
      groupId: group.id,
      groupCode: group.code,
      createdAt: new Date().toISOString(),
      expiresAt,
      expiryWindowLabel: expiryLabel,
      status: 'active',
      createdById: currentUser?.id || 'admin',
      createdByAdminName: currentUser?.name || 'Administrator',
      label: newLinkLabel.trim() || undefined,
      usesCount: 0
    };

    const updated = {
      ...group,
      inviteLinks: [newLink, ...group.inviteLinks]
    };
    onUpdateGroup(updated);
    setNewLinkLabel('');
    showNotice('New invite link generated successfully!');
  };

  // Revoke link
  const handleConfirmRevokeLink = () => {
    if (!revokeLinkTarget) return;
    const updatedLinks = group.inviteLinks.map(l => {
      if (l.id === revokeLinkTarget.id) {
        return { ...l, status: 'revoked' as const };
      }
      return l;
    });
    onUpdateGroup({ ...group, inviteLinks: updatedLinks });
    setRevokeLinkTarget(null);
    showNotice('Invite link has been revoked.');
  };

  // Approve join request
  const handleApproveRequest = (request: typeof group.joinRequests[0]) => {
    const newMember: GroupMember = {
      userId: request.userId,
      displayName: request.displayName,
      email: request.userEmail,
      role: 'member',
      status: 'active',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      joinSource: request.inviteLabel ? `Invite: ${request.inviteLabel}` : 'Invite link request',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const updatedRequests = group.joinRequests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedByAdminId: currentUser?.id
        };
      }
      return r;
    });

    onUpdateGroup({
      ...group,
      members: [...group.members, newMember],
      joinRequests: updatedRequests
    });
    showNotice(`Approved ${request.displayName} into the group!`);
  };

  // Decline join request
  const handleDeclineRequest = (request: typeof group.joinRequests[0]) => {
    const updatedRequests = group.joinRequests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: 'declined' as const,
          reviewedAt: new Date().toISOString(),
          reviewedByAdminId: currentUser?.id
        };
      }
      return r;
    });

    onUpdateGroup({
      ...group,
      joinRequests: updatedRequests
    });
    showNotice(`Declined request from ${request.displayName}.`);
  };

  // Promote to Admin
  const handlePromoteToAdmin = (member: GroupMember) => {
    const updatedMembers = group.members.map(m => {
      if (m.userId === member.userId) {
        return { ...m, role: 'admin' as const };
      }
      return m;
    });
    onUpdateGroup({ ...group, members: updatedMembers });
    showNotice(`Promoted ${member.displayName} to Group Admin.`);
  };

  // Demote to Member
  const handleDemoteToMember = (member: GroupMember) => {
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1) {
      showNotice('A group must have at least one active administrator.', 'error');
      return;
    }
    const updatedMembers = group.members.map(m => {
      if (m.userId === member.userId) {
        return { ...m, role: 'member' as const };
      }
      return m;
    });
    onUpdateGroup({ ...group, members: updatedMembers });
    showNotice(`Changed ${member.displayName}'s role to Member.`);
  };

  // Remove Member
  const handleConfirmRevokeMember = () => {
    if (!revokeMemberTarget) return;
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    if (revokeMemberTarget.role === 'admin' && adminCount <= 1) {
      showNotice('Cannot remove the sole administrator of this group.', 'error');
      setRevokeMemberTarget(null);
      return;
    }

    const updatedMembers = group.members.filter(m => m.userId !== revokeMemberTarget.userId);
    onUpdateGroup({ ...group, members: updatedMembers });
    showNotice(`Removed ${revokeMemberTarget.displayName} from the group.`);
    setRevokeMemberTarget(null);
  };

  // Assign song from catalog to group
  const handleAssignSong = (song: Song) => {
    if (group.restrictedSongIds.includes(song.id)) {
      showNotice('This arrangement is already assigned to this group.', 'error');
      return;
    }
    const updated = {
      ...group,
      restrictedSongIds: Array.from(new Set([...group.restrictedSongIds, song.id]))
    };
    onUpdateGroup(updated);
    showNotice(`Added "${song.title}" to group repertoire.`);
    setIsAssignSongOpen(false);
  };

  // Unassign song from group
  const handleUnassignSong = (songId: string) => {
    const updated = {
      ...group,
      restrictedSongIds: group.restrictedSongIds.filter(id => id !== songId)
    };
    onUpdateGroup(updated);
    showNotice('Removed arrangement from group vault.');
  };

  // Save Group Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showNotice('Group name cannot be empty', 'error');
      return;
    }

    const updated = {
      ...group,
      name: editName.trim(),
      description: editDescription.trim(),
      membershipMode: editMembershipMode
    };

    onUpdateGroup(updated);
    setSettingsSaved(true);
    showNotice('Group settings saved successfully!');
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Group Banner rendered below the search and filter bar
  const renderGroupBanner = (inSettingsView: boolean = false) => (
    <div className="relative p-4 sm:p-5 rounded-2xl bg-[#16131b] border border-white/10 shadow-lg overflow-hidden" id="group-repertoire-banner">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Group Avatar */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#221c2c] border border-white/10 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#16131b] flex items-center justify-center text-base sm:text-lg font-black text-white font-display">
              {group.name.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display truncate">
                {group.name}
              </h1>
              
              {/* Clean Role Pill */}
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-200 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#ff5757]" />
                  <span>Group Admin</span>
                </span>
              ) : isMember ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Member</span>
                </span>
              ) : null}
            </div>

            {group.description && (
              <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                {group.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3 text-slate-400" />
                <span className="text-slate-200 font-semibold">{groupSongs.length}</span> arrangements
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-200 font-semibold">{group.members.length}</span> singers
              </span>
            </div>
          </div>
        </div>

        {/* Quick Header Actions: ONLY Group Settings button for Group Admins */}
        {isAdmin && !inSettingsView && (
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGroupSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5 text-slate-300" />
              <span>Group Settings</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-5 select-none pb-16" id={`group-page-${group.id}`}>
      
      {/* Notification Banner (if any) */}
      {actionNotice && (
        <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-fadeIn ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200' 
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-200'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT AREA                                                      */}
      {/* Either: Group Repertoire Catalog (default) OR Group Settings (Admin view) */}
      {/* When in catalog view, group banner sits BELOW search and filter bars      */}
      {/* ========================================================================= */}
      
      {!isGroupSettingsOpen ? (
        /* Regular Catalog Filter View (Filtered to this Group's Repertoire - identical catalog experience) */
        <div className="w-full select-none" id="group-catalog-view">
          <SongLibraryGrid
            songs={groupSongs}
            currentUser={currentUser}
            groups={groups && groups.length > 0 ? groups : [group]}
            isGroupView={true}
            groupName={group.name}
            bannerBelowFilters={renderGroupBanner(false)}
            onOpenSong={(songId) => {
              const song = groupSongs.find(s => s.id === songId);
              if (song) {
                onSelectSongOverview(song, groupSongs, true);
              }
            }}
            onSelectSongOverview={onSelectSongOverview}
            userPlaylists={userPlaylists}
            favoritedSongIds={favoritedSongIds}
            onToggleFavorite={onToggleFavorite}
            upvotedSongIds={upvotedSongIds}
            onUpvoteSong={onUpvoteSong}
            onQuickPracticePart={(songId, partId) => {
              const song = groupSongs.find(s => s.id === songId);
              if (song) {
                if (currentUser) {
                  onPracticeSong(song, partId);
                } else {
                  onOpenAuth('Learn');
                }
              }
            }}
            onLaunchStageModeWithSong={(songId) => {
              const song = groupSongs.find(s => s.id === songId);
              if (song) {
                if (currentUser) {
                  onPlaySong(song, 'lead');
                } else {
                  onOpenAuth('Play');
                }
              }
            }}
            userDefaultPart={currentUser?.defaultPart || 'lead'}
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* GROUP SETTINGS (Houses the Admin Center tabs: Members, Invites, Shared Rep, Settings) */
        /* ========================================================================= */
        <div className="space-y-6" id="group-settings-view">
          
          {/* Group Settings Top Navigation Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setIsGroupSettingsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Group Repertoire</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{group.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200 font-bold">Group Settings & Administration</span>
            </div>
          </div>

          {/* Group Settings Sub-navigation Pills */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#16131b] border border-white/10 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setAdminSection('requests_roster')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                adminSection === 'requests_roster'
                  ? 'bg-white/15 text-white font-bold border border-white/15 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Member List & Requests</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAdminSection('invites')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                adminSection === 'invites'
                  ? 'bg-white/15 text-white font-bold border border-white/15 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Invite Links</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                {group.inviteLinks.filter(l => l.status === 'active').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSection('shared_rep')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                adminSection === 'shared_rep'
                  ? 'bg-white/15 text-white font-bold border border-white/15 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Shared Repertoire</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                {groupSongs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSection('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                adminSection === 'settings'
                  ? 'bg-white/15 text-white font-bold border border-white/15 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Group Info & Rules</span>
            </button>
          </div>

          {/* Section 1: Member List Management & Join Requests */}
          {adminSection === 'requests_roster' && (
            <div className="space-y-6">
              
              {/* Pending Requests Queue (if any) */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>Pending Join Requests</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                        {pendingRequests.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Singers who requested entry under moderated membership mode.
                    </p>
                  </div>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
                    No pending join requests at this time.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{req.displayName}</span>
                            <span className="text-xs text-slate-400">({req.userEmail})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 pt-0.5">
                            Requested {new Date(req.requestTimestamp).toLocaleDateString()} {req.inviteLabel ? `via "${req.inviteLabel}"` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineRequest(req)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Members Roster Management */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-300" />
                      <span>Active Member Roster</span>
                      <span className="text-xs text-slate-400 font-normal">({group.members.length} total)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage permissions, promote administrators, or remove singers from this group.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-white/5 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                  {group.members.map(member => {
                    const isSelf = currentUser && (member.userId === currentUser.id || member.email.toLowerCase() === currentUser.email.toLowerCase());
                    return (
                      <div key={member.userId} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={member.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{member.displayName}</span>
                              {isSelf && <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white font-bold">You</span>}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                member.role === 'admin'
                                  ? 'bg-white/10 text-slate-200 border border-white/15'
                                  : 'bg-white/5 text-slate-400'
                              }`}>
                                {member.role === 'admin' ? 'Administrator' : 'Member'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 pt-0.5">
                              {member.email} • Joined {member.joinedDate} ({member.joinSource})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {member.role === 'member' ? (
                            <button
                              type="button"
                              onClick={() => handlePromoteToAdmin(member)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Promote to Admin
                            </button>
                          ) : (
                            !isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDemoteToMember(member)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Demote to Member
                              </button>
                            )
                          )}

                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => setRevokeMemberTarget(member)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Remove singer from group"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Invite Codes & Shareable Links */}
          {adminSection === 'invites' && (
            <div className="space-y-6">
              
              {/* Generate New Invite Link */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-slate-300" />
                    <span>Create Shareable Invite Link</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generate unique invitation links with customizable labels and expiry limits for prospective singers.
                  </p>
                </div>

                <form onSubmit={handleGenerateLink} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Link Purpose / Campaign Label (optional)
                    </label>
                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={e => setNewLinkLabel(e.target.value)}
                      placeholder="e.g. Fall 2026 Tenors Auditions, Guest Quartet"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff5757]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Link Expiration
                    </label>
                    <select
                      value={newLinkExpiryWindow}
                      onChange={e => setNewLinkExpiryWindow(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#110e16] border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5757]/40"
                    >
                      <option value="24h">Expires in 24 hours</option>
                      <option value="7d">Expires in 7 days</option>
                      <option value="30d">Expires in 30 days</option>
                      <option value="90d">Expires in 90 days</option>
                      <option value="never">Never expires</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 pt-1 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#ff5757] hover:bg-[#ff4242] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Generate Invite Link</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Links Table */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-300" />
                  <span>Existing Invite Links</span>
                </h3>

                {group.inviteLinks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">No invite links created yet.</p>
                ) : (
                  <div className="divide-y divide-white/5 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                    {group.inviteLinks.map(link => {
                      const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
                      const isRevoked = link.status === 'revoked';
                      const isInactive = isExpired || isRevoked;

                      return (
                        <div
                          key={link.id}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white font-mono">{link.token}</span>
                              {link.label && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-semibold">
                                  {link.label}
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isRevoked 
                                  ? 'bg-rose-500/20 text-rose-300' 
                                  : isExpired 
                                  ? 'bg-amber-500/20 text-amber-300' 
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400">
                              Created by {link.createdByAdminName} • Window: {link.expiryWindowLabel} • Uses: {link.usesCount || 0}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isInactive && (
                              <button
                                type="button"
                                onClick={() => handleCopyInviteLink(link)}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {copiedLinkId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedLinkId === link.id ? 'Copied' : 'Copy Link'}</span>
                              </button>
                            )}

                            {!isInactive && (
                              <button
                                type="button"
                                onClick={() => setRevokeLinkTarget(link)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                                title="Revoke this invite link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Shared Repertoire Vault Management */}
          {adminSection === 'shared_rep' && (
            <div className="space-y-6">
              
              {/* Group Access Code Card (Moved from Invite Codes) */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Access Code</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">Repertoire Sharing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono tracking-widest text-white">{group.code}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Contributors can enter this code in Share Studio to assign restricted arrangements directly to this group. Singers can also enter this code to access this repertoire.
                  </p>
                </div>
              </div>

              {/* Header with Assign Button & Contributor Studio Link */}
              <div className="p-5 rounded-2xl bg-[#16131b] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-slate-300" />
                    <span>Shared Repertoire Vault</span>
                    <span className="text-xs text-slate-400 font-normal">({groupSongs.length} arrangements assigned)</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Arrangements in this vault are accessible exclusively to members of {group.name}.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAssignSongOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#ff5757] hover:bg-[#ff4242] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign from Library</span>
                  </button>

                  {onNavigateToShareStudio && (
                    <button
                      type="button"
                      onClick={() => onNavigateToShareStudio(group.code)}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Upload in Share Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assigned Songs List */}
              <div className="rounded-2xl bg-[#16131b] border border-white/10 overflow-hidden divide-y divide-white/5">
                {groupSongs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                    <p>No arrangements have been assigned to this group yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAssignSongOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ff5757] hover:bg-[#ff4242] text-white text-xs font-bold cursor-pointer"
                    >
                      Assign Song Now
                    </button>
                  </div>
                ) : (
                  groupSongs.map(song => (
                    <div
                      key={song.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={song.assets?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                          alt={song.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{song.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-slate-300">
                              {song.voicing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {song.arranger ? `arr. ${song.arranger.replace(/^arr\.?\s*/i, '')}` : song.composer || 'Traditional'} • {song.parts.length} stems
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => onPracticeSong(song)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Headphones className="w-3 h-3" />
                          <span>Rehearse</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUnassignSong(song.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Remove from group repertoire"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Section 4: Group Info & Rules */}
          {adminSection === 'settings' && (
            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#16131b] border border-white/10 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-300" />
                  <span>Group Settings & Moderation</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Update group details and choose whether singers join immediately or require admin approval.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5757]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description & Rehearsal Schedule
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5757]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Membership Access Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setEditMembershipMode('non-moderated')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        editMembershipMode === 'non-moderated'
                          ? 'bg-white/10 border-white/30 text-white ring-1 ring-white/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                        <span>Non-Moderated (Instant Join)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        Anyone with the group code or valid invite link immediately joins as an active member.
                      </p>
                    </div>

                    <div
                      onClick={() => setEditMembershipMode('moderated')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        editMembershipMode === 'moderated'
                          ? 'bg-white/10 border-white/30 text-white ring-1 ring-white/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Moderated (Admin Approval)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        Prospective singers must submit a join request. An administrator must approve them before they access the vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff5757] hover:bg-[#ff4242] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {settingsSaved ? 'Saved!' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN SONG FROM LIBRARY TO GROUP                                  */}
      {/* ========================================================================= */}
      {isAssignSongOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#16131b] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-slate-300" />
                <span>Assign Repertoire from Library</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignSongOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={assignSearchQuery}
                onChange={e => setAssignSearchQuery(e.target.value)}
                placeholder="Search arrangements to assign..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff5757]/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
              {songs
                .filter(s => {
                  const q = assignSearchQuery.toLowerCase();
                  return !q || s.title.toLowerCase().includes(q) || (s.arranger && s.arranger.toLowerCase().includes(q));
                })
                .map(song => {
                  const isAssigned = group.restrictedSongIds.includes(song.id);
                  return (
                    <div key={song.id} className="pt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{song.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {song.voicing}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {song.arranger ? `arr. ${song.arranger.replace(/^arr\.?\s*/i, '')}` : song.composer || 'Traditional'}
                        </p>
                      </div>

                      {isAssigned ? (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>Assigned</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAssignSong(song)}
                          className="px-3 py-1.5 rounded-lg bg-[#ff5757] hover:bg-[#ff4242] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          + Assign
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Revoke Member */}
      {revokeMemberTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#16131b] border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff5757]" />
              <span>Remove Singer from Group?</span>
            </h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong>{revokeMemberTarget.displayName}</strong>? They will lose access to all restricted arrangements in this group vault.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeMemberTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevokeMember}
                className="px-3 py-1.5 rounded-lg bg-[#ff5757] hover:bg-[#ff4242] text-xs text-white font-bold cursor-pointer"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Revoke Link */}
      {revokeLinkTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#16131b] border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff5757]" />
              <span>Revoke Invite Link?</span>
            </h4>
            <p className="text-xs text-slate-300">
              Anyone using this token (<strong>{revokeLinkTarget.token}</strong>) will no longer be able to join or request entry to this group.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeLinkTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevokeLink}
                className="px-3 py-1.5 rounded-lg bg-[#ff5757] hover:bg-[#ff4242] text-xs text-white font-bold cursor-pointer"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
