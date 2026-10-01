import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  LogOut
} from 'lucide-react';
import { TrackappellaLogo } from './TrackappellaBrand';
import { PitchPipeIcon } from './icons';
import { UserProfile } from '../types';

interface HeaderProps {
  currentView: 'home' | 'learn' | 'play' | 'share' | 'studio' | 'group' | 'takes' | 'profile';
  onNavigate: (view: 'home' | 'learn' | 'play' | 'share' | 'group' | 'profile') => void;
  currentUser: UserProfile | null;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  onSignOut: () => void;
  onOpenPitchPipe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onSignOut,
  onOpenPitchPipe,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#17101D]/95 border-b border-[rgba(255,249,247,0.08)] text-[#F7F1F3] backdrop-blur-xl transition-colors duration-200">
      <div className="w-full flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5">
        
        {/* Left: Trackappella Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none transition-opacity hover:opacity-90"
            title="Trackappella — Vocal Arrangement Player & Repertoire Library"
            id="header-logo-button"
          >
            <TrackappellaLogo 
              size="md" 
              textColor="text-[#F7F1F3]"
              showSubtitle={false}
            /> 
          </div>
        </div>

        {/* Right: Quick Tools & Auth Action */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Pitch Pipe Reference Tone Button */}
          <button
            type="button"
            onClick={onOpenPitchPipe}
            id="header-pitchpipe-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer bg-[#221823] hover:bg-[#2A1E2A] text-[#B9AEB6] hover:text-[#F7F1F3]"
            title="Open Master Pitch Pipe reference tone"
          >
            <PitchPipeIcon className="w-3.5 h-3.5 text-[#B7A1CC]" />
            <span className="hidden sm:inline">Pitch Pipe</span>
          </button>

          {currentUser ? (
            /* Consolidated User Profile Thumbnail with Dropdown Menu */
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                id="header-profile-menu-button"
                className="w-8 h-8 rounded-full ring-2 ring-[rgba(255,249,247,0.15)] hover:ring-[#D9AF8D] transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-[#221823] shadow-sm hover:scale-105 active:scale-95"
                title={`${currentUser.name} (${currentUser.defaultPart || 'Singer'}) - Profile & Account`}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  id="header-profile-dropdown"
                  className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#543850] border border-[rgba(255,249,247,0.18)] shadow-2xl p-1.5 z-50 text-[#F7F1F3] backdrop-blur-xl animate-fadeIn font-sans"
                >
                  {/* User Identity Header */}
                  <div className="px-3 py-2.5 border-b border-[rgba(255,249,247,0.12)] mb-1 flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[rgba(255,249,247,0.25)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#F7F1F3] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-[#DFCCCF] truncate font-mono">
                        {currentUser.email}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-[#3E2843] text-[#D9AF8D] border border-[#D9AF8D]/30">
                          {currentUser.defaultPart || 'Lead'}
                        </span>
                        <span className="text-[10px] text-[#DFCCCF] capitalize">
                          {currentUser.role || 'Singer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option 1: User profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('profile');
                    }}
                    id="header-profile-menu-item-profile"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#F7F1F3] hover:bg-[#3E2843] hover:text-[#D9AF8D] transition-colors cursor-pointer text-left group"
                  >
                    <User className="w-4 h-4 text-[#DFCCCF] group-hover:text-[#D9AF8D] transition-colors shrink-0" />
                    <span>User profile</span>
                  </button>

                  {/* Option 2: Sign out */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    id="header-profile-menu-item-signout"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:bg-rose-950/40 hover:text-rose-100 transition-colors cursor-pointer text-left group"
                  >
                    <LogOut className="w-4 h-4 text-rose-300 group-hover:text-rose-200 transition-colors shrink-0" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Login Action (Subdued control with dusty lilac focus/accent) */
            <button
              onClick={() => onOpenAuth('General')}
              id="header-login-cta-button"
              className="px-3.5 py-1.5 rounded-xl font-medium text-xs bg-[#221823] hover:bg-[#2A1E2A] text-[#F7F1F3] hover:text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#B7A1CC]" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
