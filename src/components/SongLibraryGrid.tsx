import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Star,
  Compass,
  Tag,
  Video,
  Music,
  SlidersHorizontal,
  RotateCcw,
  UploadCloud,
  Plus,
  User,
  Disc3
} from 'lucide-react';
import { Song, Setlist, UserProfile, TrackappellaGroup } from '../types';
import { SongCard } from './SongCard';
import { getSongLockStatus } from '../utils/groupUtils';

interface SongLibraryGridProps {
  songs: Song[];
  onOpenSong: (songId: string) => void;
  onQuickPracticePart?: (songId: string, partId: string) => void;
  onLaunchStageModeWithSong?: (songId: string) => void;
  userDefaultPart?: string;
  onSelectSongOverview?: (song: Song, contextSongs?: Song[], isSetlist?: boolean) => void;
  onUpvoteSong?: (songId: string) => void;
  upvotedSongIds?: string[];
  favoritedSongIds?: string[];
  onToggleFavorite?: (songId: string) => void;
  activePreviewSongId?: string | null;
  activePlaylistId?: string | null;
  onClearActivePlaylist?: () => void;
  userPlaylists?: Setlist[];
  onFilteredSongsChange?: (songs: Song[]) => void;
  onOpenContributorStudio?: () => void;
  currentUser?: UserProfile | null;
  groups?: TrackappellaGroup[];
  isGroupView?: boolean;
  groupName?: string;
  bannerBelowFilters?: React.ReactNode;
}

interface SectionCarouselProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onUpvote?: (songId: string) => void;
  upvotedSongIds?: string[];
  favoritedSongIds?: string[];
  onToggleFavorite?: (songId: string) => void;
  activePreviewSongId?: string | null;
  badge?: string;
  headerAction?: React.ReactNode;
  customEndCard?: React.ReactNode;
  currentUser?: UserProfile | null;
  groups?: TrackappellaGroup[];
}

const SectionCarousel: React.FC<SectionCarouselProps> = ({
  title,
  icon: Icon,
  songs,
  onSelectSong,
  onUpvote,
  upvotedSongIds = [],
  onToggleFavorite,
  favoritedSongIds = [],
  activePreviewSongId,
  badge,
  headerAction,
  customEndCard,
  currentUser = null,
  groups = []
}) => {
  const [page, setPage] = useState(0);
  // If there is a custom end card on the first page, we show 3 songs + 1 custom card, or 4 songs per subsequent page
  const itemsPerPage = customEndCard ? 3 : 4;
  const totalPages = Math.max(1, Math.ceil(songs.length / itemsPerPage));

  // Reset page if totalPages changes and page is out of bounds
  useEffect(() => {
    if (page >= totalPages) {
      setPage(0);
    }
  }, [totalPages, page]);

  const displayedSongs = useMemo(() => {
    const start = page * itemsPerPage;
    return songs.slice(start, start + itemsPerPage);
  }, [songs, page, itemsPerPage]);

  const handleNext = () => {
    setPage(p => (p + 1) % totalPages);
  };

  const handlePrev = () => {
    setPage(p => (p - 1 + totalPages) % totalPages);
  };

  if (songs.length === 0 && !customEndCard) return null;

  return (
    <section className="space-y-3" id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Section Header */}
      <div className="border-b border-[rgba(255,249,247,0.08)] pb-3" id={`section-${title.toLowerCase().replace(/\s+/g, '-')}-header`}>
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 lg:gap-x-4 gap-y-2">
          {/* 1. Title Group (Icon, Title, Badge, Count) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#221823] text-[#B7A1CC]">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#B7A1CC]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#F7F1F3] tracking-tight font-display flex items-center gap-1.5 sm:gap-2">
                <span>{title}</span>
                {badge && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-[#221823] text-[#B9AEB6] font-medium tracking-normal">
                    {badge}
                  </span>
                )}
              </h2>
            </div>
            <span className="text-xs text-[#B9AEB6] font-mono font-medium">
              ({songs.length})
            </span>
          </div>

          {/* 2. Header Action (Filters) - renders smoothly inline with title on tablet and desktop */}
          {headerAction && (
            <div className="order-3 md:order-2 w-full md:w-auto flex-1 md:flex-initial flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar py-0.5">
              {headerAction}
            </div>
          )}

          {/* 3. Navigation Controls - always anchored to the right */}
          {totalPages > 1 && (
            <div className="order-2 md:order-3 flex items-center gap-1 flex-shrink-0 ml-auto md:ml-0">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 sm:p-2 rounded-lg text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                title="Previous (Scroll left)"
                aria-label={`Previous ${title} items`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 sm:p-2 rounded-lg text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                title="Next (Scroll right)"
                aria-label={`Next ${title} items`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Cards Across on Desktop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {displayedSongs.map(song => (
          <SongCard
            key={song.id}
            song={song}
            onSelect={onSelectSong}
            onUpvote={onUpvote}
            isUpvoted={upvotedSongIds.includes(song.id)}
            onToggleFavorite={onToggleFavorite}
            isFavorited={favoritedSongIds.includes(song.id)}
            isPreviewing={activePreviewSongId === song.id}
            lockStatus={getSongLockStatus(song, currentUser, groups)}
          />
        ))}

        {/* Custom End Card (e.g. Add your arrangement invite banner in Explore section) */}
        {Boolean(customEndCard && page === 0) ? customEndCard : null}
      </div>
    </section>
  );
};

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'title' | 'arranger' | 'composer' | 'performer' | 'tag';
  categoryLabel: string;
  subtitle?: string;
}

export const SongLibraryGrid: React.FC<SongLibraryGridProps> = ({
  songs,
  onOpenSong,
  onSelectSongOverview,
  onUpvoteSong,
  upvotedSongIds = [],
  favoritedSongIds = [],
  onToggleFavorite,
  activePreviewSongId,
  activePlaylistId = null,
  onClearActivePlaylist,
  userPlaylists = [],
  onFilteredSongsChange,
  onOpenContributorStudio,
  currentUser = null,
  groups = [],
  isGroupView = false,
  groupName,
  bannerBelowFilters
}) => {
  // 1. Search State
  const [searchInputText, setSearchInputText] = useState('');
  const [activeSubmittedQuery, setActiveSubmittedQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 2. Filter Toggles State
  const [selectedVoicing, setSelectedVoicing] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'tag' | 'song'>('all');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'audio' | 'video'>('all');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const isSearchActive = Boolean(activeSubmittedQuery.trim().length > 0);
  const isPlaylistActive = Boolean(activePlaylistId);
  const isFilterActive = Boolean(
    selectedVoicing !== 'all' || 
    selectedType !== 'all' || 
    selectedFormat !== 'all'
  );

  const activeFilterCount = (selectedVoicing !== 'all' ? 1 : 0) + 
                            (selectedType !== 'all' ? 1 : 0) + 
                            (selectedFormat !== 'all' ? 1 : 0);

  // Active playlist title and metadata
  const activePlaylistInfo = useMemo(() => {
    if (!activePlaylistId) return null;
    if (activePlaylistId === 'favorites') {
      return {
        id: 'favorites',
        title: 'Favorites',
        isFavorites: true,
        count: favoritedSongIds.length,
        description: 'Starred arrangements saved in your personal repertoire.'
      };
    }
    const found = userPlaylists.find(p => p.id === activePlaylistId);
    const count = found ? (found.songIds ? found.songIds.length : (found.songCount || 0)) : 0;
    return {
      id: activePlaylistId,
      title: found ? found.name : 'Setlist',
      isFavorites: false,
      count,
      description: 'Custom setlist collection filtered from catalog.'
    };
  }, [activePlaylistId, favoritedSongIds.length, userPlaylists]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autosuggest generation based on keystrokes
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const query = searchInputText.trim().toLowerCase();
    if (!query || query.length < 1) return [];

    const results: SearchSuggestion[] = [];
    const seenTexts = new Set<string>();

    // 1. Check Titles
    for (const song of songs) {
      if (song.title.toLowerCase().includes(query)) {
        const text = song.title;
        if (!seenTexts.has(text.toLowerCase())) {
          seenTexts.add(text.toLowerCase());
          results.push({
            id: `title-${song.id}`,
            text: song.title,
            type: 'title',
            categoryLabel: 'Arrangement',
            subtitle: `${song.voicing} • ${song.arranger || song.composer || 'Traditional'}`
          });
        }
      }
      if (results.length >= 8) break;
    }

    // 2. Check Arrangers & Composers
    for (const song of songs) {
      if (results.length >= 8) break;
      const arranger = song.arranger?.replace(/^arr\.?\s*/i, '');
      if (arranger && arranger.toLowerCase().includes(query)) {
        if (!seenTexts.has(arranger.toLowerCase())) {
          seenTexts.add(arranger.toLowerCase());
          results.push({
            id: `arranger-${arranger}`,
            text: arranger,
            type: 'arranger',
            categoryLabel: 'Arranger',
            subtitle: `Arranger on ${song.title}`
          });
        }
      }
      if (song.composer && song.composer.toLowerCase().includes(query)) {
        if (!seenTexts.has(song.composer.toLowerCase())) {
          seenTexts.add(song.composer.toLowerCase());
          results.push({
            id: `composer-${song.composer}`,
            text: song.composer,
            type: 'composer',
            categoryLabel: 'Composer',
            subtitle: `Composer on ${song.title}`
          });
        }
      }
    }

    // 3. Check Performers & Contributors
    for (const song of songs) {
      if (results.length >= 8) break;
      const performer = song.performerName || song.tracksBy;
      if (performer && performer.toLowerCase().includes(query)) {
        if (!seenTexts.has(performer.toLowerCase())) {
          seenTexts.add(performer.toLowerCase());
          results.push({
            id: `performer-${performer}`,
            text: performer,
            type: 'performer',
            categoryLabel: 'Performer / Vault',
            subtitle: `Recorded for ${song.title}`
          });
        }
      }
    }

    // 4. Check Tags
    for (const song of songs) {
      if (results.length >= 8) break;
      if (song.tags) {
        for (const tag of song.tags) {
          if (tag.toLowerCase().includes(query) && !seenTexts.has(tag.toLowerCase())) {
            seenTexts.add(tag.toLowerCase());
            results.push({
              id: `tag-${tag}`,
              text: tag,
              type: 'tag',
              categoryLabel: 'Tag / Style',
              subtitle: `Repertoire style`
            });
            if (results.length >= 8) break;
          }
        }
      }
    }

    return results.slice(0, 7);
  }, [songs, searchInputText]);

  // Submit Search (Enter key or clicking Search button)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSuggestionsOpen(false);
    setActiveSubmittedQuery(searchInputText.trim());
  };

  // Select Suggestion
  const handleSelectSuggestion = (suggestionText: string) => {
    setSearchInputText(suggestionText);
    setActiveSubmittedQuery(suggestionText.trim());
    setIsSuggestionsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchInputText('');
    setActiveSubmittedQuery('');
    setIsSuggestionsOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedVoicing('all');
    setSelectedType('all');
    setSelectedFormat('all');
  };

  const handleResetAll = () => {
    handleClearSearch();
    handleResetFilters();
    if (onClearActivePlaylist) onClearActivePlaylist();
  };

  // Base list of repertoire songs considering active playlist filter (Favorites is the default playlist)
  const basePlaylistSongs = useMemo(() => {
    if (!activePlaylistId) return songs;
    if (activePlaylistId === 'favorites') {
      return songs.filter(s => favoritedSongIds.includes(s.id));
    }
    const found = userPlaylists.find(p => p.id === activePlaylistId);
    if (found) {
      if (Array.isArray(found.songIds)) {
        return songs.filter(s => found.songIds.includes(s.id));
      }
      return [];
    }
    return songs;
  }, [songs, activePlaylistId, favoritedSongIds, userPlaylists]);

  // Filtered calculation
  const filteredCatalogSongs = useMemo(() => {
    return basePlaylistSongs.filter(song => {
      const matchesVoicing = selectedVoicing === 'all' || 
        song.voicing.toLowerCase() === selectedVoicing.toLowerCase() ||
        (selectedVoicing.toLowerCase() === 'ttbb' && song.voicing.toLowerCase() === 'tlbb');
      const matchesType = selectedType === 'all' || song.type === selectedType;
      const matchesFormat = selectedFormat === 'all' || (song.assetType || 'audio') === selectedFormat;
      return matchesVoicing && matchesType && matchesFormat;
    });
  }, [basePlaylistSongs, selectedVoicing, selectedType, selectedFormat]);

  // Full-page search results calculation
  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const query = activeSubmittedQuery.toLowerCase().trim();
    return basePlaylistSongs.filter(song => {
      const matchesQuery = !query || 
        song.title.toLowerCase().includes(query) ||
        song.arranger?.toLowerCase().includes(query) ||
        song.composer?.toLowerCase().includes(query) ||
        song.performerName?.toLowerCase().includes(query) ||
        song.tracksBy?.toLowerCase().includes(query) ||
        song.otherAttributions?.toLowerCase().includes(query) ||
        song.tags?.some(t => t.toLowerCase().includes(query));

      const matchesVoicing = selectedVoicing === 'all' || 
        song.voicing.toLowerCase() === selectedVoicing.toLowerCase() ||
        (selectedVoicing.toLowerCase() === 'ttbb' && song.voicing.toLowerCase() === 'tlbb');
      const matchesType = selectedType === 'all' || song.type === selectedType;
      const matchesFormat = selectedFormat === 'all' || (song.assetType || 'audio') === selectedFormat;

      return matchesQuery && matchesVoicing && matchesType && matchesFormat;
    });
  }, [basePlaylistSongs, activeSubmittedQuery, selectedVoicing, selectedType, selectedFormat, isSearchActive]);

  // Notify parent of active repertoire list for preview navigation
  useEffect(() => {
    if (onFilteredSongsChange) {
      if (isSearchActive) {
        onFilteredSongsChange(searchResults);
      } else if (isFilterActive || isPlaylistActive) {
        onFilteredSongsChange(filteredCatalogSongs);
      } else {
        onFilteredSongsChange(songs);
      }
    }
  }, [isSearchActive, isFilterActive, isPlaylistActive, searchResults, filteredCatalogSongs, songs, onFilteredSongsChange]);

  const handleCardSelect = (song: Song) => {
    const isFromSetlist = isPlaylistActive;
    const contextList = isSearchActive 
      ? searchResults 
      : ((isFilterActive || isPlaylistActive) ? filteredCatalogSongs : songs);

    if (onSelectSongOverview) {
      onSelectSongOverview(song, contextList, isFromSetlist);
    } else {
      onOpenSong(song.id);
    }
  };

  // 1. Explore Section Default Songs
  const exploreSongs = useMemo(() => {
    const explicit = basePlaylistSongs.filter(s => s.isFeaturedSpotlight);
    if (explicit.length >= 3) return explicit;
    const additional = basePlaylistSongs.filter(s => !s.isFeaturedSpotlight);
    return [...explicit, ...additional];
  }, [basePlaylistSongs]);

  // 2. New Section Songs
  const newSongs = useMemo(() => {
    const explicit = basePlaylistSongs.filter(s => s.isNewThisWeek || s.tags?.some(t => t.toLowerCase().includes('new')));
    if (explicit.length >= 4) return explicit;
    const additional = basePlaylistSongs.filter(s => !explicit.some(e => e.id === s.id));
    return [...explicit, ...additional];
  }, [basePlaylistSongs]);

  // 3. Trending Section Songs
  const trendingSongs = useMemo(() => {
    const explicit = basePlaylistSongs.filter(s => s.isTrending || (s.singAlongCount && s.singAlongCount > 800));
    if (explicit.length >= 4) return explicit;
    const additional = basePlaylistSongs.filter(s => !explicit.some(e => e.id === s.id));
    return [...explicit, ...additional];
  }, [basePlaylistSongs]);

  // 4. Fan Favorites Section Songs
  const fanFavoriteSongs = useMemo(() => {
    const explicit = basePlaylistSongs.filter(s => s.isFanFavorite || (s.popularityVotes && s.popularityVotes > 200));
    if (explicit.length >= 4) return explicit;
    const additional = basePlaylistSongs.filter(s => !explicit.some(e => e.id === s.id));
    return [...explicit, ...additional];
  }, [basePlaylistSongs]);

  // Reusable Filter Toggles UI (Placed in the header of Explore Catalog, Playlists, and Search Results)
  const renderFilterToggles = () => (
    <div className="flex items-center gap-1.5 w-full md:w-auto" id="explore-filter-toggles">
      {/* Mobile Filter Accordion Toggle (Collapsed by default on small screens) */}
      <div className="flex md:hidden items-center justify-between gap-2 w-full">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(prev => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isFilterActive 
              ? 'bg-[#2A1E2A] text-[#F7F1F3]' 
              : 'bg-[#221823] text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A]'
          }`}
          id="mobile-filter-toggle-btn"
          aria-expanded={isMobileFiltersOpen}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#B7A1CC]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#B7A1CC] text-[10px] font-bold text-[#120B17] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileFiltersOpen ? 'rotate-180 text-[#F7F1F3]' : 'text-[#B9AEB6]'}`} />
        </button>

        {isFilterActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#B9AEB6] hover:text-[#F7F1F3] px-2 py-1 underline cursor-pointer flex items-center gap-1"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mobile Collapsible Panel Content */}
      {isMobileFiltersOpen && (
        <div className="flex md:hidden flex-col gap-2.5 p-3 rounded-2xl bg-[#221823] w-full shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Voicing */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#B9AEB6]">Voicing</span>
            <div className="flex flex-wrap gap-1">
              {['all', 'TLBB', 'TTBB', 'SATB', 'SSAA', 'SSATBB'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVoicing(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedVoicing === v
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] font-bold'
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] bg-[#19131C]'
                  }`}
                >
                  {v === 'all' ? 'All Voicings' : v}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1 pt-1.5 border-t border-[rgba(255,249,247,0.08)]">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#B9AEB6]">Type</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Types' },
                { id: 'song', label: 'Songs' },
                { id: 'tag', label: 'Tags' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] font-bold'
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] bg-[#19131C]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="space-y-1 pt-1.5 border-t border-[rgba(255,249,247,0.08)]">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#B9AEB6]">Media</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Media' },
                { id: 'audio', label: 'Audio' },
                { id: 'video', label: 'Video' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFormat(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedFormat === f.id
                      ? 'bg-[#2A1E2A] text-[#F7F1F3] font-bold'
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] bg-[#19131C]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Tablet Inline Filters (Mostly borderless text; only the selected option gets a soft neutral fill) */}
      <div className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-nowrap shrink-0">
        {/* Voicing Filter */}
        <div className="flex-shrink-0 flex items-center bg-[#19131C] p-0.5 rounded-xl">
          <span className="hidden xl:inline text-[10px] lg:text-[11px] font-medium text-[#B9AEB6] px-1.5 select-none">Voicing:</span>
          {['all', 'TLBB', 'TTBB', 'SATB', 'SSAA', 'SSATBB'].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setSelectedVoicing(v)}
              className={`px-2 py-1 rounded-lg text-[10px] lg:text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedVoicing === v
                  ? 'bg-[#2A1E2A] text-[#F7F1F3] font-semibold'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3]'
              }`}
            >
              {v === 'all' ? 'All' : v}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex-shrink-0 flex items-center bg-[#19131C] p-0.5 rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'song', label: 'Songs' },
            { id: 'tag', label: 'Tags' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id as any)}
              className={`px-2 py-1 rounded-lg text-[10px] lg:text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedType === t.id
                  ? 'bg-[#2A1E2A] text-[#F7F1F3] font-semibold'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Format Filter */}
        <div className="flex-shrink-0 flex items-center bg-[#19131C] p-0.5 rounded-xl">
          {[
            { id: 'all', label: 'All' },
            { id: 'audio', label: 'Audio' },
            { id: 'video', label: 'Video' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFormat(f.id as any)}
              className={`px-2 py-1 rounded-lg text-[10px] lg:text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedFormat === f.id
                  ? 'bg-[#2A1E2A] text-[#F7F1F3] font-semibold'
                  : 'text-[#B9AEB6] hover:text-[#F7F1F3]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isFilterActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex-shrink-0 text-[10px] lg:text-[11px] text-[#B9AEB6] hover:text-[#F7F1F3] px-1.5 py-0.5 underline cursor-pointer transition-colors flex items-center gap-1"
            title="Reset filter toggles"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );

  // 4th slot Banner in Explore Section: "Got learning tracks? Add them here!"
  const addArrangementBanner = (
    <div
      key="explore-contributor-invite-card"
      onClick={() => {
        if (onOpenContributorStudio) onOpenContributorStudio();
      }}
      className="group relative flex flex-col justify-between h-[230px] rounded-xl bg-[#cbb9c7] hover:bg-[#bfa7bb] border border-[rgba(62,40,67,0.18)] transition-all duration-200 cursor-pointer overflow-hidden select-none p-4.5 shadow-md hover:shadow-xl hover:-translate-y-0.5 text-[#1C121F]"
      id="explore-contributor-invite-card"
    >
      {/* Top Header / Icons */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="p-1.5 rounded-lg bg-[#2A1E2A] text-[#F7F1F3]">
          <UploadCloud className="w-4 h-4 text-[#F7F1F3]" />
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#DFCCCF] flex items-center justify-center text-[#1C121F] group-hover:scale-105 transition-all">
          <Plus className="w-4 h-4 text-[#1C121F]" />
        </div>
      </div>

      {/* Center Copy */}
      <div className="relative z-10 space-y-1.5 my-auto">
        <h3 className="text-lg font-bold text-[#1C121F] tracking-tight font-display transition-colors leading-snug">
          Got learning tracks? Add them here!
        </h3>
        <p className="text-xs text-[#3E2843] line-clamp-2 leading-relaxed font-medium">
          Upload and share your arrangements for others to sing, and help grow our catalog.
        </p>
      </div>

      {/* Bottom CTA Bar */}
      <div className="relative z-10 pt-2 border-t border-[rgba(62,40,67,0.12)] flex items-center justify-end text-xs font-semibold text-[#3E2843]">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7C3A82] group-hover:translate-x-0.5 transition-transform">
          Open Studio →
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-7" id="arrangement-directory-section">
      
      {/* 1. TOP STANDALONE SEARCH BAR (NO Container Border, with Autosuggest Dropdown) */}
      <div className="w-full relative" ref={searchContainerRef} id="library-search-container">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9AEB6] pointer-events-none" />
            <input
              type="text"
              value={searchInputText}
              onChange={(e) => {
                setSearchInputText(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => {
                if (searchInputText.trim().length > 0) {
                  setIsSuggestionsOpen(true);
                }
              }}
              placeholder={
                isGroupView
                  ? `Search ${groupName ? groupName + ' ' : ''}repertoire by title, composer, arranger, vocal part, or tag...`
                  : "Search arrangements by title, composer, arranger, vocal part, or tag... (Press Enter to search)"
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#19131C] hover:bg-[#221823] border border-[rgba(255,249,247,0.08)] focus:border-[#B7A1CC]/60 text-[#F7F1F3] text-xs sm:text-sm placeholder:text-[#B9AEB6]/60 focus:outline-none focus:ring-1 focus:ring-[#B7A1CC]/30 transition-all shadow-sm"
              id="library-search-input"
            />
            {searchInputText && (
              <button
                type="button"
                onClick={() => {
                  setSearchInputText('');
                  if (activeSubmittedQuery) {
                    setActiveSubmittedQuery('');
                  }
                  setIsSuggestionsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B9AEB6] hover:text-[#F7F1F3] transition-colors cursor-pointer p-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#221823] hover:bg-[#2A1E2A] text-[#F7F1F3] font-semibold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
            id="library-search-submit-btn"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Autosuggest Dropdown */}
        {isSuggestionsOpen && suggestions.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#221823] border border-[rgba(255,249,247,0.08)] shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
            id="search-autosuggest-dropdown"
          >
            <div className="py-1 max-h-72 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item.text)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-[#2A1E2A] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-[#19131C] text-[#B9AEB6] group-hover:text-[#F7F1F3] shrink-0">
                      {item.type === 'title' ? (
                        <Music className="w-3.5 h-3.5" />
                      ) : item.type === 'arranger' || item.type === 'composer' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Tag className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-[#F7F1F3] truncate group-hover:text-[#B7A1CC]">
                        {item.text}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[#B9AEB6] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#19131C] text-[#B9AEB6] shrink-0">
                    {item.categoryLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* In Group View: Render Filter Toggles directly below the search bar */}
      {isGroupView && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 -mt-2">
          {renderFilterToggles()}
        </div>
      )}

      {/* Group Banner sits right below the search and filter bars */}
      {isGroupView && bannerBelowFilters && (
        <div className="w-full">
          {bannerBelowFilters}
        </div>
      )}

      {/* 2. CONDITIONAL VIEWS */}
      {isGroupView ? (
        <div className="space-y-6" id="group-repertoire-results-view">
          {/* Unbordered Header showing match count and reset option if filtered */}
          <div className="space-y-3" id="group-repertoire-header">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,249,247,0.08)] pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F7F1F3] tracking-tight font-display flex items-center gap-2.5">
                  {isSearchActive ? (
                    <>
                      <span>Search: "{activeSubmittedQuery}"</span>
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 rounded-full text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer"
                        title="Clear search and show all group repertoire"
                        aria-label="Clear search"
                        id="group-search-term-close-btn"
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : (
                    <span>Group Repertoire</span>
                  )}
                </h2>
                <span className="text-xs sm:text-sm text-[#B9AEB6] font-mono font-medium">
                  ({(isSearchActive ? searchResults : filteredCatalogSongs).length}{' '}
                  {(isSearchActive ? searchResults : filteredCatalogSongs).length === 1 ? 'arrangement' : 'arrangements'})
                </span>
              </div>

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#FF5757] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {(isSearchActive ? searchResults : filteredCatalogSongs).length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#221823] space-y-3 text-[#B9AEB6]">
              <Music className="w-10 h-10 mx-auto text-[#B9AEB6]/40" />
              <div className="font-bold text-base sm:text-lg text-[#F7F1F3]">
                {isSearchActive || isFilterActive ? 'No arrangements found' : 'No arrangements in this group repertoire yet'}
              </div>
              <p className="text-xs sm:text-sm text-[#B9AEB6] max-w-md mx-auto">
                {isSearchActive || isFilterActive
                  ? `No arrangements match the search or filters within this group's repertoire.`
                  : `Group directors can assign arrangements from the catalog or upload custom charts in Share Studio.`}
              </p>
              {(isSearchActive || isFilterActive) && (
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-4 py-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="group-results-grid">
              {(isSearchActive ? searchResults : filteredCatalogSongs).map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={handleCardSelect}
                  onUpvote={onUpvoteSong}
                  isUpvoted={upvotedSongIds.includes(song.id)}
                  isFavorited={favoritedSongIds.includes(song.id)}
                  isPreviewing={activePreviewSongId === song.id}
                  lockStatus={getSongLockStatus(song, currentUser, groups)}
                />
              ))}
            </div>
          )}
        </div>
      ) : isSearchActive ? (
        <div className="space-y-6" id="results-fullpage-view">
          
          {/* Unbordered Search Term Header with Simple (X) Close button + Filter Toggles */}
          <div className="space-y-3" id="search-results-header">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,249,247,0.08)] pb-3">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F7F1F3] tracking-tight font-display flex items-center gap-2.5">
                  <span>Search: "{activeSubmittedQuery}"</span>
                  {/* Simple (X) Close button right after search term */}
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 rounded-full text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer"
                    title="Close search and return to Explore"
                    aria-label="Clear and close search"
                    id="search-term-close-btn"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </h1>
                <span className="text-xs sm:text-sm text-[#B9AEB6] font-mono font-medium">
                  ({searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'})
                </span>
              </div>

              {/* Filters placed under/in the search header */}
              {renderFilterToggles()}
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {searchResults.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#221823] space-y-3 text-[#B9AEB6]">
              <Music className="w-10 h-10 mx-auto text-[#B9AEB6]/40" />
              <div className="font-bold text-base sm:text-lg text-[#F7F1F3]">No arrangements found</div>
              <p className="text-xs sm:text-sm text-[#B9AEB6] max-w-md mx-auto">
                No arrangements match the search term "{activeSubmittedQuery}" with the current filters.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="fullpage-results-grid">
              {searchResults.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={handleCardSelect}
                  onUpvote={onUpvoteSong}
                  isUpvoted={upvotedSongIds.includes(song.id)}
                  isFavorited={favoritedSongIds.includes(song.id)}
                  isPreviewing={activePreviewSongId === song.id}
                  lockStatus={getSongLockStatus(song, currentUser, groups)}
                />
              ))}
            </div>
          )}

        </div>
      ) : isPlaylistActive ? (
        /* 3. CONDITIONAL VIEW: PLAYLIST / FAVORITES VIEW (Unbordered Header with X button, like Search Results) */
        <div className="space-y-6" id="playlist-fullpage-view">
          <div className="space-y-3" id="playlist-results-header">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,249,247,0.08)] pb-3">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F7F1F3] tracking-tight font-display flex items-center gap-2.5">
                  {activePlaylistInfo?.isFavorites ? (
                    <span className="flex items-center gap-2.5 text-[#D9AF8D]">
                      <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-[#D9AF8D] text-[#D9AF8D] shrink-0" />
                      <span className="text-[#F7F1F3]">Favorites</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5 text-[#B7A1CC]">
                      <Disc3 className="w-6 h-6 sm:w-7 sm:h-7 text-[#B7A1CC] shrink-0" />
                      <span className="text-[#F7F1F3]">{activePlaylistInfo?.title || 'Setlist'}</span>
                    </span>
                  )}
                  {/* Simple (X) Close button right after playlist/favorites title */}
                  {onClearActivePlaylist && (
                    <button
                      type="button"
                      onClick={onClearActivePlaylist}
                      className="p-1 rounded-full text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] transition-colors cursor-pointer"
                      title="Close view and return to full catalog"
                      aria-label="Close view and return to full catalog"
                      id="playlist-close-btn"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}
                </h1>
                <span className="text-xs sm:text-sm text-[#B9AEB6] font-mono font-medium">
                  ({filteredCatalogSongs.length} {filteredCatalogSongs.length === 1 ? 'arrangement' : 'arrangements'})
                </span>
              </div>

              {/* Filters placed in the header */}
              {renderFilterToggles()}
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {filteredCatalogSongs.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#221823] space-y-3 text-[#B9AEB6]">
              {activePlaylistInfo?.isFavorites ? (
                <Star className="w-10 h-10 mx-auto text-[#D9AF8D]/40" />
              ) : (
                <Disc3 className="w-10 h-10 mx-auto text-[#B7A1CC]/40" />
              )}
              <div className="font-bold text-base sm:text-lg text-[#F7F1F3]">
                {activePlaylistInfo?.isFavorites ? 'No favorites added yet' : 'No arrangements in this setlist'}
              </div>
              <p className="text-xs sm:text-sm text-[#B9AEB6] max-w-md mx-auto">
                {activePlaylistInfo?.isFavorites
                  ? 'Open any arrangement preview window and click the Star icon to add it to your Favorites.'
                  : 'Open any arrangement preview window and save it to this setlist.'}
              </p>
              {onClearActivePlaylist && (
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={onClearActivePlaylist}
                    className="px-4 py-2 rounded-xl bg-[#2A1E2A] hover:bg-[#342434] text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Explore Full Catalog
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="playlist-results-grid">
              {filteredCatalogSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={handleCardSelect}
                  onUpvote={onUpvoteSong}
                  isUpvoted={upvotedSongIds.includes(song.id)}
                  isFavorited={favoritedSongIds.includes(song.id)}
                  isPreviewing={activePreviewSongId === song.id}
                  lockStatus={getSongLockStatus(song, currentUser, groups)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 4. DEFAULT CATALOG VIEW: EXPLORE CATALOG (with Filters in header) + NEW + TRENDING + FAN FAVORITES */
        <div className="space-y-8" id="default-catalog-sections">
          
          {/* Section 1: Explore Catalog (Filters embedded directly in front/next to the header) */}
          <div className="space-y-4" id="explore-catalog-wrapper">
            <SectionCarousel
              title="Explore Catalog"
              icon={Compass}
              badge="Curated"
              songs={isFilterActive ? filteredCatalogSongs : exploreSongs}
              onSelectSong={handleCardSelect}
              onUpvote={onUpvoteSong}
              upvotedSongIds={upvotedSongIds}
              onToggleFavorite={onToggleFavorite}
              favoritedSongIds={favoritedSongIds}
              activePreviewSongId={activePreviewSongId}
              headerAction={renderFilterToggles()}
              customEndCard={!isFilterActive ? addArrangementBanner : undefined}
              currentUser={currentUser}
              groups={groups}
            />

            {/* When a filter is active, show the remaining filtered repertoire in a full responsive grid seamlessly */}
            {isFilterActive && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-[#B9AEB6]">
                  <span>Showing filtered arrangements matching criteria</span>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[#B9AEB6] hover:text-[#F7F1F3] underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>

                {filteredCatalogSongs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#221823] space-y-2 text-[#B9AEB6]">
                    <Music className="w-8 h-8 mx-auto text-[#B9AEB6]/40" />
                    <div className="font-bold text-sm text-[#F7F1F3]">No arrangements match these filters</div>
                    <p className="text-xs text-[#B9AEB6]">
                      Try choosing different voicing or media options.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {filteredCatalogSongs.slice(4).map(song => (
                      <SongCard
                        key={song.id}
                        song={song}
                        onSelect={handleCardSelect}
                        onUpvote={onUpvoteSong}
                        isUpvoted={upvotedSongIds.includes(song.id)}
                        onToggleFavorite={onToggleFavorite}
                        isFavorited={favoritedSongIds.includes(song.id)}
                        isPreviewing={activePreviewSongId === song.id}
                        lockStatus={getSongLockStatus(song, currentUser, groups)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: New (Only shown when not filtering, for seamless viewing) */}
          {!isFilterActive && (
            <>
              <SectionCarousel
                title="New"
                icon={Tag}
                badge="This Week"
                songs={newSongs}
                onSelectSong={handleCardSelect}
                onUpvote={onUpvoteSong}
                upvotedSongIds={upvotedSongIds}
                onToggleFavorite={onToggleFavorite}
                favoritedSongIds={favoritedSongIds}
                activePreviewSongId={activePreviewSongId}
                currentUser={currentUser}
                groups={groups}
              />

              {/* Section 3: Trending */}
              <SectionCarousel
                title="Trending"
                icon={Flame}
                badge="Popular Sing-Alongs"
                songs={trendingSongs}
                onSelectSong={handleCardSelect}
                onUpvote={onUpvoteSong}
                upvotedSongIds={upvotedSongIds}
                onToggleFavorite={onToggleFavorite}
                favoritedSongIds={favoritedSongIds}
                activePreviewSongId={activePreviewSongId}
                currentUser={currentUser}
                groups={groups}
              />

              {/* Section 4: Fan Favorites */}
              <SectionCarousel
                title="Fan Favorites"
                icon={Star}
                badge="Top Rated"
                songs={fanFavoriteSongs}
                onSelectSong={handleCardSelect}
                onUpvote={onUpvoteSong}
                upvotedSongIds={upvotedSongIds}
                onToggleFavorite={onToggleFavorite}
                favoritedSongIds={favoritedSongIds}
                activePreviewSongId={activePreviewSongId}
                currentUser={currentUser}
                groups={groups}
              />
            </>
          )}

        </div>
      )}

    </div>
  );
};
