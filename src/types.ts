export type VoicingType = 'TTBB' | 'SATB' | 'SSAA' | 'SSATBB' | 'Custom';
export type SongType = 'tag' | 'song' | 'other';
export type SongStatus = 'ready' | 'needs-alignment' | 'draft' | 'archived';
export type CatalogVisibility = 'public' | 'members-only';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  defaultPart: string;
  provider: 'email' | 'google' | 'apple' | 'demo';
  joinedDate: string;
  role: 'singer' | 'creator' | 'director';
  memberGroupCodes: string[];
  bio?: string;
}

export interface GroupCatalog {
  id: string;
  name: string;
  accessCode: string;
  organization: string;
  description: string;
  songIds: string[];
  bannerUrl: string;
  isUnlocked: boolean;
}

export interface VocalPart {
  id: string;
  name: string; // e.g. "Tenor", "Lead", "Baritone", "Bass"
  shortName: string; // e.g. "Ten", "Ld", "Bari", "Bass"
  range: string; // e.g. "C4 - G5"
  color: string; // e.g. "#38bdf8"
  description?: string;
  notes?: { time: number; duration: number; noteName: string; midi: number; lyric?: string }[];
  audioUrl?: string;
  videoUrl?: string;
}

export interface RehearsalMark {
  id: string;
  label: string; // e.g. "Intro", "Tag Entry", "High Lock", "Final Post"
  time: number; // in seconds
}

export interface LyricLine {
  startTime: number;
  endTime: number;
  text: string;
  words?: { word: string; time: number; duration: number; partId?: string }[];
}

export interface ScoreNote {
  pitch: string; // e.g. "Eb4", "G3", "Bb4"
  duration: number; // in beats (1 = quarter, 0.5 = eighth, 2 = half, 4 = whole)
  lyric?: string;
  isRest?: boolean;
}

export interface ScoreMeasure {
  measureNumber: number;
  timeSignature: string; // "4/4", "3/4", "6/8"
  parts: Record<string, ScoreNote[]>;
}

export interface SheetScoreData {
  keySignature: string; // e.g. "Eb", "F", "D", "Ab"
  timeSignature: string;
  tempo: number; // BPM
  measures: ScoreMeasure[];
  clefs?: { treble: string[]; bass: string[] }; // part IDs assigned to clefs
}

export interface SongAssets {
  artwork?: string;
  chart?: {
    fullScorePdfUrl?: string;
    perPartPdfUrl?: Record<string, string>;
    scoreData?: SheetScoreData;
    googleDriveFileId?: string;
  };
  audioStems?: Record<string, string>; // partId -> audio URL
  videoStems?: Record<string, string>; // partId -> video URL
  fullMixAudioUrl?: string;
  partSyncOffsets?: Record<string, number>; // partId -> offset in seconds
}

export interface ContentPartner {
  name: string;
  tagline: string;
  badge: 'Official Artist' | 'Championship Quartet' | 'Chorus Partner' | 'Featured Arranger' | 'Community Contributor';
  verified: boolean;
  avatarUrl?: string;
}

export interface Song {
  id: string;
  title: string;
  subtitle?: string;
  performerName?: string;
  arranger?: string;
  tracksBy?: string;
  composer?: string;
  otherAttributions?: string;
  genre?: string;
  type: SongType; // 'song' | 'tag'
  assetType?: 'audio' | 'video'; // Audio Arrangement or Video Arrangement
  voicing: VoicingType | string;
  durationSeconds: number;
  baseKey: string; // e.g. "Eb", "F", "D", "Bb"
  tempoBpm: number;
  description: string;
  whyTonightCopy?: string;
  tags: string[];
  difficulty: 'Easy' | 'Intermediate' | 'Advanced' | 'Virtuoso';
  status: SongStatus;
  visibility: CatalogVisibility; // 'public' | 'members-only'
  groupAccessCode?: string; // required if members-only
  partner?: ContentPartner;
  parts: VocalPart[];
  rehearsalMarks: RehearsalMark[];
  lyrics: LyricLine[];
  assets: SongAssets;
  partSyncOffsets?: Record<string, number>;
  isCustom?: boolean;
  contributorName?: string;
  singAlongCount?: number;
  popularityVotes?: number;
  savedCount?: number;
  allowPublicAuditions?: boolean;
  allowExternalDistribution?: boolean;
  isNewThisWeek?: boolean;
  isTrending?: boolean;
  isFanFavorite?: boolean;
  isFeaturedSpotlight?: boolean;
  releaseDate?: string;
}

export interface PartPlaybackState {
  isMuted: boolean;
  isSolo: boolean;
  isDominant: boolean; // if dominant is enabled, this part is routed Left
  volume: number; // 0..1
}

export interface PerformanceSettings {
  performanceType: 'video' | 'audio';
  cameraOn: boolean;
  coachOn: boolean;
  recordOn: boolean;
  pipeAtStart: boolean;
  lyricsOn: boolean;
  auditionMode: boolean;
  castOn?: boolean;
}

export interface RecordedTake {
  id: string;
  songId: string;
  songTitle: string;
  performerGroup: string;
  partId: string;
  partName: string;
  date: string;
  durationSeconds: number;
  blobUrl?: string;
  pitchAccuracyScore: number;
  keyOffset: number;
  userName: string;
  feedbackNotes?: string;
  forAudition?: boolean;
  takeType?: 'karaoke' | 'audition';
}

export interface Setlist {
  id: string;
  name: string;
  songIds: string[];
  songCount?: number;
  createdAt?: string;
  description?: string;
  type?: 'personal' | 'group';
  groupId?: string;
  groupName?: string;
}

export type GroupMembershipMode = 'non-moderated' | 'moderated';
export type GroupMemberRole = 'admin' | 'member';
export type InviteLinkStatus = 'active' | 'expired' | 'revoked';
export type JoinRequestStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'expired';

export interface GroupMember {
  userId: string;
  displayName: string;
  email: string;
  role: GroupMemberRole;
  status: 'active';
  joinedDate: string;
  joinSource: string; // e.g. "Founder/Creator", "Invite: Fall 2026 chorus invite", "Admin approval"
  avatar?: string;
}

export interface GroupInviteLink {
  id: string;
  token: string;
  groupId: string;
  groupCode: string;
  createdAt: string;
  expiresAt: string | null;
  expiryWindowLabel: string; // "24 hours" | "7 days" | "30 days" | "90 days" | "Never"
  status: InviteLinkStatus;
  createdById: string;
  createdByAdminName: string;
  label?: string;
  usesCount?: number;
}

export interface GroupJoinRequest {
  id: string;
  userId: string;
  userEmail: string;
  displayName: string;
  groupId: string;
  groupName: string;
  inviteLinkId?: string;
  inviteLabel?: string;
  requestTimestamp: string;
  status: JoinRequestStatus;
  reviewedAt?: string;
  reviewedByAdminId?: string;
}

export interface TrackappellaGroup {
  id: string;
  code: string; // internal ID/code used by contributors to assign restricted tracks
  name: string;
  description?: string;
  membershipMode: GroupMembershipMode;
  createdAt: string;
  createdById: string;
  creatorName: string;
  members: GroupMember[];
  inviteLinks: GroupInviteLink[];
  joinRequests: GroupJoinRequest[];
  restrictedSongIds: string[];
  bannerUrl?: string;
}

export interface GroupNotification {
  id: string;
  userId: string;
  groupId: string;
  groupName: string;
  type: 'request_approved' | 'request_declined' | 'promoted_admin' | 'membership_revoked';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

