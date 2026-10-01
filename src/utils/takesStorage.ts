import { RecordedTake, Song, TrackappellaGroup } from '../types';

const STORAGE_KEY = 'trackappella_performance_takes';

export const INITIAL_SEED_TAKES: RecordedTake[] = [
  {
    id: 'take_seed_1',
    songId: 'seed-tonight-quintet',
    songTitle: 'Tonight (Quintet)',
    performerGroup: 'West Side Story Cast',
    partId: 'lead',
    partName: 'Tony (Lead)',
    date: 'Sep 6, 2026, 7:24 PM',
    durationSeconds: 195,
    pitchAccuracyScore: 96,
    keyOffset: 0,
    userName: 'Joseito Maldonado',
    forAudition: true,
    takeType: 'audition'
  },
  {
    id: 'take_seed_2',
    songId: 'seed-tonight-quintet',
    songTitle: 'Tonight (Quintet)',
    performerGroup: 'West Side Story Cast',
    partId: 'tenor',
    partName: 'Tenor',
    date: 'Sep 5, 2026, 3:10 PM',
    durationSeconds: 195,
    pitchAccuracyScore: 92,
    keyOffset: 1,
    userName: 'Joseito Maldonado',
    forAudition: false,
    takeType: 'karaoke'
  },
  {
    id: 'take_seed_3',
    songId: 'seed-longest-time',
    songTitle: 'The Longest Time',
    performerGroup: 'Billy Joel (arr. D. Wright)',
    partId: 'bass',
    partName: 'Bass',
    date: 'Sep 2, 2026, 5:45 PM',
    durationSeconds: 215,
    pitchAccuracyScore: 98,
    keyOffset: 0,
    userName: 'Joseito Maldonado',
    forAudition: true,
    takeType: 'audition'
  },
  {
    id: 'take_seed_4',
    songId: 'seed-georgia-on-my-mind',
    songTitle: 'Georgia on My Mind',
    performerGroup: 'Gas House Gang',
    partId: 'baritone',
    partName: 'Baritone',
    date: 'Aug 29, 2026, 9:02 PM',
    durationSeconds: 160,
    pitchAccuracyScore: 94,
    keyOffset: -1,
    userName: 'Joseito Maldonado',
    forAudition: false,
    takeType: 'karaoke'
  }
];

export function getSavedPerformanceTakes(): RecordedTake[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TAKES));
      return INITIAL_SEED_TAKES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_TAKES;
  } catch (err) {
    console.warn('Failed to load performance takes:', err);
    return INITIAL_SEED_TAKES;
  }
}

export const getAllTakes = getSavedPerformanceTakes;

export function savePerformanceTake(take: RecordedTake): RecordedTake[] {
  const current = getSavedPerformanceTakes();
  const updated = [take, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist performance take:', err);
  }
  return updated;
}

export function deletePerformanceTake(takeId: string): RecordedTake[] {
  const current = getSavedPerformanceTakes();
  const updated = current.filter(t => t.id !== takeId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete performance take:', err);
  }
  return updated;
}

export function getTakesForSong(songId: string): RecordedTake[] {
  const all = getSavedPerformanceTakes();
  return all.filter(t => t.songId === songId);
}

export function getTakeGroupName(
  take: RecordedTake,
  songs: Song[] = [],
  groups: TrackappellaGroup[] = []
): { groupId: string; groupName: string } {
  const song = songs.find(s => s.id === take.songId);
  if (song) {
    // Check if song is in any TrackappellaGroup
    const matchingGroup = groups.find(g => 
      g.restrictedSongIds?.includes(song.id) || 
      (song.groupAccessCode && g.code && g.code.trim().toUpperCase() === song.groupAccessCode.trim().toUpperCase())
    );
    if (matchingGroup) {
      return { groupId: matchingGroup.id, groupName: matchingGroup.name };
    }
  }

  if (take.performerGroup && take.performerGroup.trim()) {
    return { 
      groupId: `grp_${take.performerGroup.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, 
      groupName: take.performerGroup 
    };
  }

  if (song?.performerName && song.performerName.trim()) {
    return { 
      groupId: `grp_${song.performerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, 
      groupName: song.performerName 
    };
  }

  return { groupId: 'grp_open_repertoire', groupName: 'Open Repertoire' };
}

export interface TakeGroupSummary {
  groupId: string;
  groupName: string;
  takesCount: number;
  bestScore: number;
  averageScore: number;
  takes: RecordedTake[];
}

export function groupTakesByGroup(
  takes: RecordedTake[],
  songs: Song[] = [],
  groups: TrackappellaGroup[] = []
): TakeGroupSummary[] {
  const map = new Map<string, { groupName: string; takes: RecordedTake[] }>();

  takes.forEach(take => {
    const { groupId, groupName } = getTakeGroupName(take, songs, groups);
    if (!map.has(groupId)) {
      map.set(groupId, { groupName, takes: [] });
    }
    map.get(groupId)!.takes.push(take);
  });

  const result: TakeGroupSummary[] = [];
  map.forEach((value, groupId) => {
    const takesCount = value.takes.length;
    const scores = value.takes.map(t => t.pitchAccuracyScore || 0);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    result.push({
      groupId,
      groupName: value.groupName,
      takesCount,
      bestScore,
      averageScore,
      takes: value.takes,
    });
  });

  return result.sort((a, b) => b.takesCount - a.takesCount || a.groupName.localeCompare(b.groupName));
}

