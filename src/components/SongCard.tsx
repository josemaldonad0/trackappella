import React from 'react';
import { 
  Heart, 
  MicVocal, 
  ListMusic, 
  Lock, 
  Unlock,
  Video,
  Star
} from 'lucide-react';
import { TrebleClefIcon } from './icons';
import { Song } from '../types';

export type CardLockStatus = 'none' | 'locked' | 'unlocked';

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
  onUpvote?: (songId: string) => void;
  isUpvoted?: boolean;
  isFavorited?: boolean;
  isPreviewing?: boolean;
  lockStatus?: CardLockStatus;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onSelect,
  isUpvoted = false,
  isFavorited = false,
  isPreviewing = false,
  lockStatus = 'none'
}) => {
  const arrangerDisplay = song.arranger 
    ? song.arranger.replace(/^arr\.?\s*/i, '') 
    : song.composer || 'Traditional';

  const tracksByDisplay = song.tracksBy || song.contributorName || 'Studio Master';
  const performerDisplay = song.performerName || song.partner?.name;

  // Metrics: Loved (Heart), Played (Sideways Mic), Saved (Save)
  const lovedCount = (song.popularityVotes || 120) + (isUpvoted ? 1 : 0);
  const playedCount = song.singAlongCount || 450;
  const savedCount = song.savedCount || Math.floor((song.popularityVotes || 100) * 0.75) + 18;

  const artworkUrl = song.assets?.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      onClick={() => onSelect(song)}
      className={`group relative flex flex-col justify-between h-[230px] rounded-xl transition-all duration-200 cursor-pointer overflow-hidden select-none bg-[#221823] shadow-md ${
        isPreviewing
          ? 'ring-1 ring-[#B7A1CC] bg-[#2A1E2A] shadow-lg shadow-[#120B17]/90 scale-[1.01]'
          : 'hover:bg-[#2A1E2A] hover:shadow-xl hover:shadow-[#120B17]/80 hover:-translate-y-0.5'
      }`}
      id={`song-card-${song.id}`}
    >
      {/* 1. Full Card Background Image */}
      <img
        src={artworkUrl}
        alt={song.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* 2. High-Legibility Dark Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#120B17] via-[#120B17]/85 to-[#120B17]/40 group-hover:via-[#120B17]/80 transition-colors" />
      <div className="absolute inset-0 bg-[#120B17]/20" />

      {/* 3. Top Header Badges Row */}
      <div className="relative z-10 p-3 flex items-center justify-between gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          {/* Voicing Tag */}
          <span className="px-2 py-0.5 rounded-md bg-[#17101D]/85 backdrop-blur-md text-[10px] font-mono font-semibold text-[#F7F1F3]">
            {song.voicing}
          </span>

          {/* Key Badge */}
          <span className="px-1.5 py-0.5 rounded-md bg-[#17101D]/75 backdrop-blur-md text-[10px] font-mono font-medium text-[#B9AEB6] flex items-center gap-0.5">
            <TrebleClefIcon className="w-2.5 h-2.5 text-[#B7A1CC]" />
            {song.baseKey}
          </span>

          {Boolean(song.type === 'tag') && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#221823]/90 backdrop-blur-md text-[#F7F1F3] font-medium text-[9px] uppercase tracking-wider">
              Tag
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Boolean(song.isNewThisWeek) && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#221823]/90 backdrop-blur-md text-[#F7F1F3] font-semibold text-[9px] uppercase tracking-wider">
              New
            </span>
          )}

          {Boolean(song.assetType === 'video') && (
            <span className="p-1 rounded-md bg-[#17101D]/85 backdrop-blur-md text-[#B9AEB6]" title="Video Multitrack">
              <Video className="w-3 h-3 text-[#B9AEB6]" />
            </span>
          )}

          {/* Readonly Favorite Star Tag */}
          {Boolean(isFavorited) && (
            <span 
              className="p-1 text-[#D9AF8D] drop-shadow-xs flex items-center" 
              title="Favorited arrangement"
              id={`song-card-star-${song.id}`}
            >
              <Star className="w-3.5 h-3.5 text-[#D9AF8D] fill-[#D9AF8D]" />
            </span>
          )}
        </div>
      </div>

      {/* 4. Bottom Content */}
      <div className="relative z-10 p-3 pt-0 flex flex-col justify-end gap-1.5">
        {/* Title & Metadata */}
        <div className="space-y-0.5">
          <h3 
            title={song.title}
            className={`text-sm sm:text-base font-bold leading-snug line-clamp-1 transition-colors drop-shadow-sm ${
              isPreviewing ? 'text-[#F7F1F3] font-display' : 'text-[#F7F1F3] group-hover:text-[#B7A1CC]'
            }`}
          >
            {song.title}
          </h3>

          <div className="text-[11px] text-[#B9AEB6] leading-tight space-y-0.5 drop-shadow-xs">
            {/* Arranger */}
            <div className="truncate text-[#B9AEB6]">
              <span className="text-[#B9AEB6]/70 font-medium">Arr: </span>
              <span className="text-[#F7F1F3] font-medium">{arrangerDisplay}</span>
            </div>

            {/* Tracks by */}
            <div className="truncate text-[#B9AEB6]">
              <span className="text-[#B9AEB6]/70 font-medium">Tracks: </span>
              <span className="text-[#B9AEB6]">{tracksByDisplay}</span>
            </div>

            {/* As performed by (Only for songs) */}
            {Boolean(song.type === 'song' && performerDisplay) ? (
              <div className="truncate text-[#B9AEB6]">
                <span className="text-[#B9AEB6]/70 font-medium">As perf. by: </span>
                <span className="text-[#B9AEB6]">{performerDisplay}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* 5. Bottom: Left Lock Status & Right Usage Metrics */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {/* Bottom Left Lock Icon: Locked (apricot #D9AF8D), Unlocked (sage #9EBCAB), or Absent */}
          <div className="flex items-center min-h-[16px] shrink-0">
            {lockStatus === 'locked' && (
              <span 
                className="text-[#D9AF8D] drop-shadow-xs flex items-center"
                title="Private Arrangement — Locked to group members"
                id={`lock-status-locked-${song.id}`}
              >
                <Lock className="w-2.5 h-2.5 text-[#D9AF8D]" />
              </span>
            )}
            {lockStatus === 'unlocked' && (
              <span 
                className="text-[#9EBCAB] drop-shadow-xs flex items-center"
                title="Unlocked Repertoire — Full access via group membership"
                id={`lock-status-unlocked-${song.id}`}
              >
                <Unlock className="w-2.5 h-2.5 text-[#9EBCAB]" />
              </span>
            )}
          </div>

          {/* Bottom Right: 3 Usage Icons */}
          <div className="flex items-center gap-2.5 text-[10.5px] font-mono text-[#B9AEB6] bg-[#17101D]/90 backdrop-blur-md px-2 py-0.5 rounded-md ml-auto">
            {/* Loved (Heart) */}
            <div className="flex items-center gap-1" title={`${lovedCount} loved`}>
              <Heart className={`w-3 h-3 ${isUpvoted ? 'text-[#D9A7B4] fill-[#D9A7B4]' : 'text-[#B9AEB6]/70'}`} />
              <span>{lovedCount}</span>
            </div>

            {/* Played (Handheld Microphone) */}
            <div className="flex items-center gap-1" title={`${playedCount} sung along`}>
              <MicVocal className="w-3 h-3 text-[#B9AEB6]/70" />
              <span>{playedCount}</span>
            </div>

            {/* Saved in Setlists / Playlists */}
            <div className="flex items-center gap-1" title={`${savedCount} saved in setlists & playlists`}>
              <ListMusic className="w-3 h-3 text-[#B9AEB6]/70" />
              <span>{savedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
