import React, { useState, useMemo, useRef } from 'react';
import { 
  Mic, 
  Award, 
  Disc3, 
  Trash2, 
  Share2, 
  Play, 
  Pause, 
  Search, 
  Calendar, 
  Music, 
  X,
  Users
} from 'lucide-react';
import { RecordedTake, Song, TrackappellaGroup } from '../types';
import { vocalEngine } from '../audio/vocalSynthEngine';
import { groupTakesByGroup, getTakeGroupName, TakeGroupSummary } from '../utils/takesStorage';

interface PerformanceTakesViewProps {
  takes: RecordedTake[];
  songs: Song[];
  groups?: TrackappellaGroup[];
  activeCategory: 'auditions' | 'karaoke';
  onSelectCategory: (category: 'auditions' | 'karaoke') => void;
  filterGroupId?: string | null;
  onSelectGroupFilter?: (groupId: string | null) => void;
  onClearGroupFilter?: () => void;
  filterSongId?: string | null;
  onClearSongFilter?: () => void;
  onOpenSongPreview: (song: Song) => void;
  onStartStageMode?: (song: Song, partId: string) => void;
  onDeleteTake: (takeId: string) => void;
  onShareTake: (take: RecordedTake) => void;
  onNavigateHome: () => void;
}

export const PerformanceTakesView: React.FC<PerformanceTakesViewProps> = ({
  takes,
  songs,
  groups = [],
  activeCategory,
  onSelectCategory,
  filterGroupId,
  onSelectGroupFilter,
  onClearGroupFilter,
  filterSongId,
  onClearSongFilter,
  onOpenSongPreview,
  onStartStageMode,
  onDeleteTake,
  onShareTake,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTakeId, setPlayingTakeId] = useState<string | null>(null);
  const [deletingTakeId, setDeletingTakeId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered song object if filterSongId is present
  const filterSong = useMemo(() => {
    if (!filterSongId) return null;
    return songs.find(s => s.id === filterSongId) || null;
  }, [songs, filterSongId]);

  // Separate all takes by category for counts
  const auditionTakesAll = useMemo(() => {
    return takes.filter(t => t.takeType === 'audition' || t.forAudition);
  }, [takes]);

  const karaokeTakesAll = useMemo(() => {
    return takes.filter(t => !(t.takeType === 'audition' || t.forAudition));
  }, [takes]);

  // Current category takes
  const categoryTakes = useMemo(() => {
    return activeCategory === 'auditions' ? auditionTakesAll : karaokeTakesAll;
  }, [activeCategory, auditionTakesAll, karaokeTakesAll]);

  // Filter takes based on song filter, group filter, and search
  const filteredTakes = useMemo(() => {
    return categoryTakes.filter(take => {
      // 1. Song ID filter
      if (filterSongId && take.songId !== filterSongId) {
        return false;
      }

      // 2. Group filter
      if (filterGroupId) {
        const { groupId } = getTakeGroupName(take, songs, groups);
        if (groupId !== filterGroupId) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = take.songTitle.toLowerCase().includes(q);
        const matchPart = take.partName.toLowerCase().includes(q);
        const matchPerformer = take.performerGroup?.toLowerCase().includes(q) || false;
        const matchDate = take.date.toLowerCase().includes(q);
        return matchTitle || matchPart || matchPerformer || matchDate;
      }

      return true;
    });
  }, [categoryTakes, filterSongId, filterGroupId, searchQuery, songs, groups]);

  // Group the filtered takes by ensemble/group ("where each lists their own group")
  const groupedTakes: TakeGroupSummary[] = useMemo(() => {
    return groupTakesByGroup(filteredTakes, songs, groups);
  }, [filteredTakes, songs, groups]);

  // All available groups in this category for quick filter selection
  const allCategoryGroups = useMemo(() => {
    return groupTakesByGroup(categoryTakes, songs, groups);
  }, [categoryTakes, songs, groups]);

  // Audio preview playback handler
  const handleTogglePlayTake = (take: RecordedTake) => {
    if (playingTakeId === take.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      vocalEngine.stopPlayback();
      setPlayingTakeId(null);
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    vocalEngine.stopPlayback();

    if (take.blobUrl) {
      const audio = new Audio(take.blobUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingTakeId(null);
      audio.play().catch(e => console.warn('Audio playback error:', e));
      setPlayingTakeId(take.id);
    } else {
      // Fallback preview using stem playback for seed takes
      const targetSong = songs.find(s => s.id === take.songId);
      if (targetSong) {
        vocalEngine.setupStems(targetSong);
        const mutes: Record<string, boolean> = {};
        targetSong.parts.forEach(p => {
          mutes[p.id] = false;
        });
        vocalEngine.startPlayback(targetSong, 0, mutes, {}, take.keyOffset || 0, 1.0);
        setPlayingTakeId(take.id);
      }
    }
  };

  const getPartColor = (partId: string) => {
    const p = partId.toLowerCase();
    if (p.includes('lead') || p.includes('tenor 1') || p.includes('soprano')) return 'text-amber-300 bg-amber-400/10 border-amber-400/20';
    if (p.includes('tenor')) return 'text-sky-300 bg-sky-400/10 border-sky-400/20';
    if (p.includes('baritone') || p.includes('alto')) return 'text-purple-300 bg-purple-400/10 border-purple-400/20';
    if (p.includes('bass')) return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20';
    return 'text-slate-300 bg-white/10 border-white/20';
  };

  // Find active group name for filter banner
  const activeGroup = useMemo(() => {
    if (!filterGroupId) return null;
    return allCategoryGroups.find(g => g.groupId === filterGroupId) || null;
  }, [filterGroupId, allCategoryGroups]);

  const isAuditionView = activeCategory === 'auditions';

  return (
    <div className="space-y-4 animate-fadeIn pb-16" id="performance-takes-view-root">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              {isAuditionView ? 'Audition Takes' : 'Karaoke Takes'}
            </h1>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isAuditionView 
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
            }`}>
              {categoryTakes.length} {categoryTakes.length === 1 ? 'take' : 'takes'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAuditionView
              ? 'Contest and audition recordings captured with hidden lyrics and coach for unassisted pitch assessment.'
              : 'Rehearsal and guided performance takes captured with real-time coaching and scrolling lyrics.'}
          </p>
        </div>

        {/* View Switcher & Catalog Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10" id="takes-category-switcher">
            <button
              type="button"
              onClick={() => {
                onSelectCategory('auditions');
                onClearGroupFilter?.();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isAuditionView
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="takes-tab-auditions"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Auditions</span>
              <span className="text-[10px] font-mono opacity-80">({auditionTakesAll.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory('karaoke');
                onClearGroupFilter?.();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isAuditionView
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="takes-tab-karaoke"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Karaoke</span>
              <span className="text-[10px] font-mono opacity-80">({karaokeTakesAll.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browse Catalog</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Group Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase mr-1 shrink-0">Groups:</span>
          <button
            type="button"
            onClick={() => onClearGroupFilter?.()}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
              !filterGroupId
                ? 'bg-white/20 text-white border-white/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            All ({allCategoryGroups.length})
          </button>
          {allCategoryGroups.map(grp => {
            const isSelected = filterGroupId === grp.groupId;
            return (
              <button
                key={grp.groupId}
                type="button"
                onClick={() => onSelectGroupFilter ? onSelectGroupFilter(grp.groupId) : undefined}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? isAuditionView
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold'
                      : 'bg-sky-500/20 text-sky-200 border-sky-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-white/5'
                }`}
              >
                <span>{grp.groupName}</span>
                <span className="text-[10px] font-mono opacity-75">
                  {grp.takesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search takes..."
            className="w-full pl-9 pr-8 py-1.5 bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-white/25 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(filterSong || activeGroup) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="text-slate-400">Active filters:</span>
            {filterSong && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                <Music className="w-3 h-3 text-indigo-400" />
                <span>Song: {filterSong.title}</span>
                {onClearSongFilter && (
                  <button
                    type="button"
                    onClick={onClearSongFilter}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}
            {activeGroup && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                isAuditionView ? 'bg-amber-500/15 text-amber-200' : 'bg-sky-500/15 text-sky-200'
              }`}>
                <Users className="w-3 h-3" />
                <span>Group: {activeGroup.groupName}</span>
                {onClearGroupFilter && (
                  <button
                    type="button"
                    onClick={onClearGroupFilter}
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClearSongFilter?.();
              onClearGroupFilter?.();
            }}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Clean Table List View */}
      {groupedTakes.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            {isAuditionView ? (
              <Award className="w-6 h-6 text-amber-400/60" />
            ) : (
              <Mic className="w-6 h-6 text-sky-400/60" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {isAuditionView ? 'No audition takes found' : 'No karaoke takes found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filterGroupId || filterSongId
                ? 'Try clearing your filters or search query to see saved takes.'
                : isAuditionView
                ? 'Launch Stage Mode and switch on Audition Mode to capture your unassisted take!'
                : 'Launch Stage Mode to record your rehearsal performance!'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-block"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#100c22]/90 shadow-sm" id="performance-takes-table-container">
          <table className="w-full text-left border-collapse text-xs sm:text-sm" id="performance-takes-table">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 sm:px-6">Song Title</th>
                <th className="py-3 px-4">Take Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Part Sung</th>
                <th className="py-3 px-4 text-center">Score / Listen</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groupedTakes.map((group) => (
                <React.Fragment key={group.groupId}>
                  {/* Clean Group Section Header Row */}
                  <tr className="bg-white/[0.03] border-t border-b border-white/10">
                    <td colSpan={6} className="py-2.5 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-white font-mono tracking-wide text-xs sm:text-sm uppercase">
                            {group.groupName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ({group.takesCount} {group.takesCount === 1 ? 'take' : 'takes'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                          <span>Best: <strong className="text-emerald-400 font-semibold">{group.bestScore}%</strong></span>
                          <span>•</span>
                          <span>Avg: {group.averageScore}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Takes for this group */}
                  {group.takes.map((take) => {
                    const matchingSong = songs.find(s => s.id === take.songId);
                    const isPlayingThis = playingTakeId === take.id;
                    const isAuditionTake = take.takeType === 'audition' || take.forAudition;

                    return (
                      <tr 
                        key={take.id} 
                        className="hover:bg-white/[0.025] transition-colors group/row"
                        id={`take-row-${take.id}`}
                      >
                        {/* Column 1: Song Title (link to preview) */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => matchingSong && onOpenSongPreview(matchingSong)}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0"
                              title="Preview arrangement"
                            >
                              <Disc3 className="w-4 h-4 text-indigo-400" />
                            </button>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => matchingSong && onOpenSongPreview(matchingSong)}
                                className="text-left font-semibold text-white hover:text-indigo-300 hover:underline transition-colors truncate block max-w-xs sm:max-w-md cursor-pointer"
                                title={`Preview ${take.songTitle}`}
                              >
                                {take.songTitle}
                              </button>
                              {take.performerGroup && take.performerGroup !== group.groupName && (
                                <div className="text-[11px] text-slate-400 truncate">
                                  {take.performerGroup}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Take Date */}
                        <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{take.date}</span>
                          </div>
                        </td>

                        {/* Column 3: Type Indicator Icon */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isAuditionTake ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/25">
                              <Award className="w-3 h-3 text-amber-400" />
                              <span>Audition</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-sky-500/15 text-sky-300 border border-sky-500/25">
                              <Mic className="w-3 h-3 text-sky-400" />
                              <span>Karaoke</span>
                            </span>
                          )}
                        </td>

                        {/* Column 4: Part Sung */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${getPartColor(take.partId || take.partName)}`}>
                            {take.partName}
                          </span>
                        </td>

                        {/* Column 5: Score / Listen audio */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePlayTake(take)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                                isPlayingThis
                                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm animate-pulse'
                                  : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/15'
                              }`}
                              title={isPlayingThis ? 'Pause Take' : 'Play Take Audio'}
                            >
                              {isPlayingThis ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 ml-0.5" />
                              )}
                            </button>
                            <div className="flex flex-col items-start text-left">
                              <span className="text-xs font-bold font-mono text-emerald-400">
                                {take.pitchAccuracyScore}%
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {Math.floor(take.durationSeconds / 60)}:{String(take.durationSeconds % 60).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Column 6: Actions */}
                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onShareTake(take)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Share take link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {deletingTakeId === take.id ? (
                              <div className="inline-flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-red-500/30">
                                <span className="text-[10px] text-red-300 font-bold">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteTake(take.id);
                                    setDeletingTakeId(null);
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-red-700 hover:bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingTakeId(null)}
                                  className="px-1 py-0.5 rounded text-slate-400 hover:text-white text-[10px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingTakeId(take.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                                title="Delete take"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
