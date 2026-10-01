export type ArrangementType = 'song' | 'tag';
export type ArrangementStatus = 'published-public' | 'published-restricted' | 'work-in-progress';
export type ConfigHealth = 'ready' | 'missing-chart' | 'missing-art' | 'missing-stems' | 'restricted-groups';

export interface DirectAccessUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grantedAt: string;
  sessionsCount: number;
  lastActive: string;
  revoked?: boolean;
}

export interface ContributorArrangement {
  id: string;
  title: string;
  type: ArrangementType;
  voicing: string; // e.g., 'SATB', 'SSAA', 'TTBB', 'SAB'
  details: string; // e.g., 'Song · SATB · Audio + chart'
  status: ArrangementStatus;
  statusLabel: string; // e.g., 'Published · Public', 'Published · Restricted', 'Work in progress'
  configuration: string; // e.g., 'Ready', 'Shared with 2 groups', 'Missing chart'
  configHealth: ConfigHealth;
  accessScope: 'public' | 'restricted';
  inviteLinkToken: string; // e.g. 'invite_arr_hold_on_xyz'
  inviteLinkActive: boolean;
  grantedGroupCodes: string[]; // e.g. ['SPECTRUM2026', 'MASTERS77']
  directUsers: DirectAccessUser[];
  singersCount: number | null;
  stageSessionsCount: number | null;
  recordedTakesCount: number | null;
  reactionsCount: number | null;
  savesCount?: number | null;
  lastUpdated: string;
  songId?: string; // Matching catalog song ID if available
  arranger?: string;
  composer?: string;
  genre?: string;
  difficulty?: 'Easy' | 'Intermediate' | 'Advanced' | 'Virtuoso';
  baseKey?: string;
  tempoBpm?: number;
  description?: string;
  coverArtUrl?: string;
  hasChart?: boolean;
  hasArt?: boolean;
  hasStems?: boolean;
  customVoicing?: string;
  partsCount?: number; // 1 to 8 parts
  partSyncOffsets?: Record<string, number>; // partId -> offset in seconds (e.g. +0.05, -0.02)
  syncLocked?: boolean;
  partsConfig?: Array<{
    id: string;
    name: string;
    range: string;
    hasAudio: boolean;
    audioUrl?: string;
    syncOffset?: number; // in seconds
    duration?: number;
    color?: string;
  }>;
}
