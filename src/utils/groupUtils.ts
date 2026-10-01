import { Song, UserProfile, TrackappellaGroup } from '../types';

export type SongLockStatus = 'none' | 'locked' | 'unlocked';

/**
 * Determines whether a track is:
 * - 'none': Publicly accessible (no lock icon shown)
 * - 'locked': Restricted to a group that the current singer is NOT a member of
 * - 'unlocked': Restricted to a group that the current singer has access to via group membership
 */
export function getSongLockStatus(
  song: Song,
  currentUser: UserProfile | null,
  groups: TrackappellaGroup[] = []
): SongLockStatus {
  if (!song) return 'none';

  // Check if song is members-only / group-restricted
  const hasMembersOnlyVisibility = song.visibility === 'members-only';
  const hasGroupAccessCode = Boolean(song.groupAccessCode && song.groupAccessCode.trim().length > 0);

  // Check if any group specifically includes this song in its restricted vault
  const restrictedGroupMatches = groups.filter(g => {
    const codeMatch = Boolean(
      song.groupAccessCode && 
      g.code && 
      g.code.trim().toUpperCase() === song.groupAccessCode.trim().toUpperCase()
    );
    const songIdMatch = Boolean(g.restrictedSongIds && g.restrictedSongIds.includes(song.id));
    return codeMatch || songIdMatch;
  });

  const isRestrictedToGroup = hasMembersOnlyVisibility || hasGroupAccessCode || restrictedGroupMatches.length > 0;

  if (!isRestrictedToGroup) {
    return 'none';
  }

  // If restricted but user is not signed in
  if (!currentUser) {
    return 'locked';
  }

  // Check if user is an active member or admin of any group that has access to this song
  const isMemberOfRestrictedGroup = restrictedGroupMatches.some(g =>
    g.members.some(
      m =>
        m.status === 'active' &&
        (m.userId === currentUser.id ||
         (currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
    )
  );

  const hasMatchingUserGroupCode = Boolean(
    currentUser.memberGroupCodes?.some(c => {
      const clean = c.trim().toUpperCase();
      const directMatch = Boolean(song.groupAccessCode && song.groupAccessCode.trim().toUpperCase() === clean);
      const groupMatch = restrictedGroupMatches.some(g => g.code.trim().toUpperCase() === clean);
      return directMatch || groupMatch;
    })
  );

  return (isMemberOfRestrictedGroup || hasMatchingUserGroupCode) ? 'unlocked' : 'locked';
}

/**
 * Returns all groups where the current user has the 'admin' role.
 */
export function getAdminGroups(
  currentUser: UserProfile | null,
  groups: TrackappellaGroup[] = []
): TrackappellaGroup[] {
  if (!currentUser) return [];
  return groups.filter(g =>
    g.members.some(
      m =>
        m.role === 'admin' &&
        m.status === 'active' &&
        (m.userId === currentUser.id ||
         (currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
    )
  );
}

/**
 * Returns all groups where the current user is an active member or admin.
 */
export function getUserMemberGroups(
  currentUser: UserProfile | null,
  groups: TrackappellaGroup[] = []
): TrackappellaGroup[] {
  if (!currentUser) return [];
  return groups.filter(g =>
    g.members.some(
      m =>
        m.status === 'active' &&
        (m.userId === currentUser.id ||
         (currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
    )
  );
}

/**
 * Returns the group that provides or restricts this song (via code match or restrictedSongIds).
 */
export function getSongGrantingGroup(
  song: Song,
  groups: TrackappellaGroup[] = []
): TrackappellaGroup | null {
  if (!song) return null;
  const match = groups.find(g => {
    const codeMatch = Boolean(
      song.groupAccessCode && 
      g.code && 
      g.code.trim().toUpperCase() === song.groupAccessCode.trim().toUpperCase()
    );
    const songIdMatch = Boolean(g.restrictedSongIds && g.restrictedSongIds.includes(song.id));
    return codeMatch || songIdMatch;
  });
  return match || null;
}
