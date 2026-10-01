import React from 'react';
import { 
  Song, 
  UserProfile,
  Setlist,
  TrackappellaGroup
} from '../types';
import { SongLibraryGrid } from './SongLibraryGrid';
import { UseCasesCarousel } from './UseCasesCarousel';

interface HomeLandingViewProps {
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  currentUser: UserProfile | null;
  onNavigateTo: (view: 'learn' | 'play' | 'share') => void;
  sampleSongs: Song[];
  onSelectSongForStudio?: (song: Song, partId?: string) => void;
  onSelectSongForStage?: (song: Song, partId?: string) => void;
  onSelectSongOverview?: (song: Song, contextSongs?: Song[], isSetlist?: boolean) => void;
  activePreviewSongId?: string | null;
  onFilteredSongsChange?: (songs: Song[]) => void;
  upvotedSongIds?: string[];
  favoritedSongIds?: string[];
  onToggleFavorite?: (songId: string) => void;
  activePlaylistId?: string | null;
  onClearActivePlaylist?: () => void;
  userPlaylists?: Setlist[];
  onUpvoteSong?: (songId: string) => void;
  groups?: TrackappellaGroup[];
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  onOpenAuth,
  currentUser,
  onNavigateTo,
  sampleSongs,
  onSelectSongForStudio,
  onSelectSongForStage,
  onSelectSongOverview,
  activePreviewSongId,
  onFilteredSongsChange,
  upvotedSongIds = [],
  favoritedSongIds = [],
  onToggleFavorite,
  activePlaylistId = null,
  onClearActivePlaylist,
  userPlaylists = [],
  onUpvoteSong,
  groups = []
}) => {
  return (
    <div className="w-full select-none space-y-6 pb-12" id="home-main-window">
      
      {/* 1. Feature Carousel & Intro Section (with restored blueish gradient background for unauthenticated visitors) */}
      {!currentUser && (
        <section 
          className="w-full text-[#F7F1F3] relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 bg-gradient-to-br from-[#0a2f48] via-[#062033] to-[#03111c] border border-sky-400/20 shadow-2xl overflow-hidden"
          id="what-is-trackappella-section"
        >
          {/* Subtle ambient lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <UseCasesCarousel
              onNavigateTo={onNavigateTo}
              onOpenAuth={onOpenAuth}
              currentUser={currentUser}
              sampleSongs={sampleSongs}
              onSelectSongForStudio={onSelectSongForStudio}
              onSelectSongForStage={onSelectSongForStage}
              onSelectSongOverview={onSelectSongOverview}
            />
          </div>
        </section>
      )}

      {/* 2. Track Library (Catalog) with Top Search Bar & 4-Across Paginated Sections */}
      <section 
        id="arrangement-directory-section" 
        className="w-full"
      >
        <SongLibraryGrid
          songs={sampleSongs}
          currentUser={currentUser}
          groups={groups}
          onOpenSong={(songId) => {
            const song = sampleSongs.find(s => s.id === songId);
            if (song && onSelectSongOverview) {
              onSelectSongOverview(song, sampleSongs);
            }
          }}
          onSelectSongOverview={onSelectSongOverview}
          onFilteredSongsChange={onFilteredSongsChange}
          activePreviewSongId={activePreviewSongId}
          activePlaylistId={activePlaylistId}
          onClearActivePlaylist={onClearActivePlaylist}
          userPlaylists={userPlaylists}
          favoritedSongIds={favoritedSongIds}
          onToggleFavorite={onToggleFavorite}
          onQuickPracticePart={(songId, partId) => {
            const song = sampleSongs.find(s => s.id === songId);
            if (song) {
              if (currentUser) {
                if (onSelectSongForStudio) onSelectSongForStudio(song, partId);
              } else {
                onOpenAuth('Learn');
              }
            }
          }}
          onLaunchStageModeWithSong={(songId) => {
            const song = sampleSongs.find(s => s.id === songId);
            if (song) {
              if (currentUser) {
                if (onSelectSongForStage) onSelectSongForStage(song, 'lead');
              } else {
                onOpenAuth('Play');
              }
            }
          }}
          userDefaultPart={currentUser?.defaultPart || 'lead'}
          onUpvoteSong={onUpvoteSong}
          upvotedSongIds={upvotedSongIds}
          onOpenContributorStudio={() => {
            if (currentUser) {
              onNavigateTo('share');
            } else {
              onOpenAuth('Share');
            }
          }}
        />
      </section>

    </div>
  );
};
