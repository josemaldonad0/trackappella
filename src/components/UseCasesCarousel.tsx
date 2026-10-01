import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Music,
  Sliders,
  Mic2,
  FolderLock,
  Sparkles,
  Play,
  UploadCloud,
  Volume2,
  VolumeX,
  FileText,
  Radio,
  Disc3,
  Heart,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  SlidersHorizontal,
  Layers,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Song, UserProfile } from '../types';

interface UseCasesCarouselProps {
  onNavigateTo: (view: 'home' | 'learn' | 'play' | 'share' | 'studio' | 'group' | 'takes' | 'profile') => void;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  currentUser: UserProfile | null;
  sampleSongs: Song[];
  onSelectSongForStudio?: (song: Song, partId?: string) => void;
  onSelectSongForStage?: (song: Song, partId?: string) => void;
  onSelectSongOverview?: (song: Song, contextQueue?: Song[]) => void;
}

interface SlideItem {
  id: 'library' | 'preview' | 'perform' | 'contributor';
  step: number;
  tabTitle: string;
  badge: string;
  headline: string;
  desc: string;
  actionText: string;
  actionTarget: 'library' | 'preview' | 'perform' | 'contributor';
  accentColor: string;
}

export const UseCasesCarousel: React.FC<UseCasesCarouselProps> = ({
  onNavigateTo,
  onOpenAuth,
  currentUser,
  sampleSongs,
  onSelectSongForStudio,
  onSelectSongForStage,
  onSelectSongOverview
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides: SlideItem[] = [
    {
      id: 'library',
      step: 1,
      tabTitle: "New to 'Trackappella'?",
      badge: 'Song Library & Repertoire',
      headline: "New to 'Trackappella'?",
      desc: 'Browse categorized acappella arrangements, barbershop tags, and chorus repertoire with instant audio previews, filter by voicing, and create custom setlists.',
      actionText: 'Explore Song Library',
      actionTarget: 'library',
      accentColor: '#38bdf8'
    },
    {
      id: 'preview',
      step: 2,
      tabTitle: 'Practice makes perfect',
      badge: 'Arrangement Overview',
      headline: 'Practice makes perfect',
      desc: 'Inspect the engraving on the full score, audition stems with synchronized multi-track audio, solo or mute any voice part, and review vocal ranges before rehearsing.',
      actionText: 'Preview Arrangement',
      actionTarget: 'preview',
      accentColor: '#FF5757'
    },
    {
      id: 'perform',
      step: 3,
      tabTitle: 'Take the stage',
      badge: 'Stage Mode & Karaoke',
      headline: 'Take the stage',
      desc: 'Perform with synchronized scrolling lyrics teleprompter, a key pitch pipe countdown, live pitch resonance feedback, and studio-grade take recording for auditions.',
      actionText: 'Enter Stage Mode',
      actionTarget: 'perform',
      accentColor: '#D9AF8D'
    },
    {
      id: 'contributor',
      step: 4,
      tabTitle: 'Sharing is caring',
      badge: 'Contributor Studio',
      headline: 'Sharing is caring',
      desc: 'Upload multitrack vocal stems, fine-tune millisecond sync offsets with live playback, attach sheet music PDFs, and distribute access securely to your ensemble or quartet.',
      actionText: 'Open Contributor Studio',
      actionTarget: 'contributor',
      accentColor: '#9EBCAB'
    }
  ];

  // Auto rotate every 7 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleAction = (slide: SlideItem) => {
    const featuredSong = sampleSongs.find(s => s.id === 'i-hold-your-hand-in-mine') || sampleSongs[0] || null;

    if (slide.actionTarget === 'library') {
      const el = document.getElementById('arrangement-directory-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (slide.actionTarget === 'preview') {
      if (featuredSong && onSelectSongOverview) {
        onSelectSongOverview(featuredSong, sampleSongs);
      } else {
        const el = document.getElementById('arrangement-directory-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (slide.actionTarget === 'perform') {
      if (currentUser) {
        if (featuredSong && onSelectSongForStage) {
          onSelectSongForStage(featuredSong, currentUser.defaultPart || 'lead');
        } else {
          onNavigateTo('play');
        }
      } else {
        onOpenAuth('Play');
      }
    } else if (slide.actionTarget === 'contributor') {
      if (currentUser) {
        onNavigateTo('share');
      } else {
        onOpenAuth('Share');
      }
    }
  };

  const current = slides[activeSlide];

  return (
    <div 
      className="w-full relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="getting-started-carousel"
    >
      {/* Main Slide Area */}
      <div className="relative py-1 sm:py-2 transition-colors duration-500">
        
        {/* Subtle Ambient Depth */}
        <div 
          className="absolute -right-12 -top-12 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none bg-[#2A1E2A]"
        />

        {/* 2-Column Responsive Grid: Content (Left) & Hero Screenshot Mockup (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Focused, Clean, Inviting Copy (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5 text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#221823] text-xs font-medium text-[#DFCCCF] border border-[rgba(255,249,247,0.08)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5757]" />
              <span>{current.badge}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F7F1F3] tracking-tight leading-snug font-display">
              {current.headline}
            </h2>

            {/* Descriptor Sentences */}
            <p className="text-sm sm:text-base text-[#B9AEB6] leading-relaxed max-w-md font-normal">
              {current.desc}
            </p>

            {/* Action CTA Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleAction(current)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#543850] hover:bg-[#684663] text-[#F7F1F3] font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer border border-[rgba(255,249,247,0.12)]"
              >
                <span>{current.actionText}</span>
                <ArrowRight className="w-4 h-4 text-[#D9AF8D]" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Screenshot / UI Preview (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="w-full rounded-xl overflow-hidden bg-[#221823] shadow-xl relative group border border-[rgba(255,249,247,0.08)]">
              
              {/* Browser/App Window Chrome bar */}
              <div className="px-3.5 py-2 bg-[#19131C] border-b border-[rgba(255,249,247,0.08)] flex items-center justify-between text-xs text-[#B9AEB6]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5757]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D9AF8D]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9EBCAB]/70" />
                  <span className="ml-2 text-[11px] font-mono text-[#B9AEB6]">
                    trackappella.app/{current.id}
                  </span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#B9AEB6] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9EBCAB]" />
                  {current.tabTitle} View
                </span>
              </div>

              {/* ========================================================= */}
              {/* SLIDE 1: LIBRARY UI PREVIEW                               */}
              {/* ========================================================= */}
              {current.id === 'library' && (
                <div className="p-3.5 sm:p-4 space-y-3 bg-[#1C121F]">
                  {/* Library Search & Filter Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#221823] border border-[rgba(255,249,247,0.08)] text-xs text-[#B9AEB6]">
                      <Search className="w-3.5 h-3.5 text-[#B9AEB6] shrink-0" />
                      <span className="text-[11px] text-[#B9AEB6]/70 truncate">Search by title, arranger, composer, or artist...</span>
                    </div>
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-hidden text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-[#543850] text-[#F7F1F3] font-medium border border-[rgba(255,249,247,0.12)]">
                        All Arrangements
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#221823] text-[#B9AEB6] border border-[rgba(255,249,247,0.05)]">
                        Barbershop Tags
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#221823] text-[#B9AEB6] border border-[rgba(255,249,247,0.05)]">
                        Popular
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#221823] text-[#B9AEB6] border border-[rgba(255,249,247,0.05)]">
                        TTBB Voicing
                      </span>
                    </div>
                  </div>

                  {/* Section Title Header */}
                  <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,249,247,0.06)]">
                    <div className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-[#B7A1CC]" />
                      <span className="text-xs font-bold text-[#F7F1F3] uppercase tracking-wider">
                        Popular Arrangements (8)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#B9AEB6]">
                      <span className="w-5 h-5 rounded bg-[#221823] flex items-center justify-center text-[10px]">‹</span>
                      <span className="w-5 h-5 rounded bg-[#221823] flex items-center justify-center text-[10px]">›</span>
                    </div>
                  </div>

                  {/* 3 Song Cards Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Card 1: Darkness on the Delta */}
                    <div className="p-2 rounded-lg bg-[#221823] border border-[rgba(255,249,247,0.06)] space-y-1.5">
                      <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#2A1E2A] relative">
                        <img 
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80" 
                          alt="Darkness on the Delta"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[#9EBCAB] text-[8px] font-mono">
                          TTBB
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#F7F1F3] truncate">Darkness on the Delta</div>
                        <div className="text-[9px] text-[#B9AEB6] truncate">Barbershop Tag · Traditional</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[#B9AEB6] pt-0.5">
                        <span className="flex items-center gap-0.5 text-[#FF5757]">
                          <Heart className="w-2.5 h-2.5 fill-current" /> 142
                        </span>
                        <span>4 Parts</span>
                      </div>
                    </div>

                    {/* Card 2: I Hold Your Hand in Mine */}
                    <div className="p-2 rounded-lg bg-[#221823] border border-[#FF5757]/30 space-y-1.5 relative">
                      <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#2A1E2A] relative">
                        <img 
                          src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80" 
                          alt="I Hold Your Hand in Mine"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-[#FF5757] text-[#F7F1F3] text-[8px] font-bold">
                          NEW
                        </span>
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[#D9AF8D] text-[8px] font-mono">
                          TLBB
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#F7F1F3] truncate">I Hold Your Hand in Mine</div>
                        <div className="text-[9px] text-[#B9AEB6] truncate">Tom Lehrer · Jose M.</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[#B9AEB6] pt-0.5">
                        <span className="flex items-center gap-0.5 text-[#FF5757]">
                          <Heart className="w-2.5 h-2.5 fill-current" /> 98
                        </span>
                        <span className="text-[#9EBCAB] font-medium">Stems Ready</span>
                      </div>
                    </div>

                    {/* Card 3: Heart of My Heart */}
                    <div className="p-2 rounded-lg bg-[#221823] border border-[rgba(255,249,247,0.06)] space-y-1.5">
                      <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#2A1E2A] relative">
                        <img 
                          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80" 
                          alt="Heart of My Heart"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[#B7A1CC] text-[8px] font-mono">
                          TTBB
                        </span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#F7F1F3] truncate">Heart of My Heart</div>
                        <div className="text-[9px] text-[#B9AEB6] truncate">Traditional Barbershop</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[#B9AEB6] pt-0.5">
                        <span className="flex items-center gap-0.5 text-[#FF5757]">
                          <Heart className="w-2.5 h-2.5 fill-current" /> 85
                        </span>
                        <span>Full Audio</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status row */}
                  <div className="flex items-center justify-between text-[10px] text-[#B9AEB6] pt-1 border-t border-[rgba(255,249,247,0.06)]">
                    <span className="flex items-center gap-1 text-[#9EBCAB]">
                      <Radio className="w-3 h-3 text-[#9EBCAB]" />
                      Instant Pitch Pipe & Audio Stems
                    </span>
                    <span className="text-[#D9AF8D] font-medium">Click any card to Preview →</span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SLIDE 2: PREVIEW UI PREVIEW                               */}
              {/* ========================================================= */}
              {current.id === 'preview' && (
                <div className="p-3.5 sm:p-4 space-y-2.5 bg-[#1C121F]">
                  {/* Modal Header Simulation */}
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,249,247,0.08)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2A1E2A] flex items-center justify-center text-[#D9AF8D] font-bold text-xs">
                        TL
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F7F1F3]">I Hold Your Hand in Mine</div>
                        <div className="text-[10px] text-[#B9AEB6]">Tom Lehrer · Arr. Jose Maldonado · Key of F · ♩=88</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#543850] text-[#F7F1F3] text-[10px] font-medium">
                        Rehearse
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#2A1E2A] text-[#D9AF8D] text-[10px] font-medium">
                        Stage
                      </span>
                    </div>
                  </div>

                  {/* Split Workspace: Score Engraving (Left) + Vocal Parts Rack (Right) */}
                  <div className="grid grid-cols-12 gap-2.5">
                    {/* Left 6 cols: Sheet Music Score Snippet */}
                    <div className="col-span-6 p-2 rounded-lg bg-[#FCFBF9] text-slate-900 flex flex-col justify-between shadow-inner">
                      <div>
                        <div className="text-[8px] font-mono tracking-wider text-slate-500 uppercase text-center border-b border-slate-200 pb-0.5">
                          VAULT SCORE · TLBB
                        </div>
                        <div className="text-center pt-1 font-serif font-bold text-[11px] text-slate-900 leading-tight">
                          I Hold Your Hand in Mine
                        </div>
                        {/* Music Notation Staff Lines */}
                        <div className="py-2 space-y-1">
                          <div className="h-4 border-y border-slate-400 relative flex items-center justify-around px-1">
                            <span className="text-[10px] font-serif font-black">𝄞</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 translate-y-0.5" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 -translate-y-0.5" />
                          </div>
                          <div className="text-[8px] font-serif italic text-center text-slate-700">
                            "I hold your hand in mine, dear..."
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                        <span>Tempo: 88 BPM</span>
                        <span className="font-bold text-indigo-900">Score 100% Zoom</span>
                      </div>
                    </div>

                    {/* Right 6 cols: 4 Vocal Stems with Solo/Mute Controls */}
                    <div className="col-span-6 space-y-1">
                      {/* Tenor */}
                      <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                        <span className="text-[#D9A7B4] font-bold">Tenor</span>
                        <div className="w-12 h-1 bg-[#2A1E2A] rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-[#D9A7B4]" />
                        </div>
                        <span className="text-[8px] text-[#B9AEB6]">100%</span>
                      </div>

                      {/* Lead (Soloed Part) */}
                      <div className="px-2 py-1 rounded bg-[#2A1E2A] border border-[#FF5757]/60 flex items-center justify-between text-[10px] shadow-sm">
                        <span className="text-[#FF5757] font-bold flex items-center gap-1">
                          Lead <span className="text-[7px] px-1 rounded bg-[#FF5757] text-[#F7F1F3]">YOU</span>
                        </span>
                        <span className="text-[8px] px-1 rounded bg-[#FF5757]/30 text-[#FF5757] font-bold font-mono">
                          SOLO
                        </span>
                        <div className="w-10 h-1 bg-[#19131C] rounded-full overflow-hidden">
                          <div className="w-full h-full bg-[#FF5757]" />
                        </div>
                      </div>

                      {/* Baritone */}
                      <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                        <span className="text-[#9EBCAB] font-bold">Baritone</span>
                        <div className="w-12 h-1 bg-[#2A1E2A] rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-[#9EBCAB]" />
                        </div>
                        <span className="text-[8px] text-[#B9AEB6]">75%</span>
                      </div>

                      {/* Bass */}
                      <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                        <span className="text-[#B7A1CC] font-bold">Bass</span>
                        <div className="w-12 h-1 bg-[#2A1E2A] rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-[#B7A1CC]" />
                        </div>
                        <span className="text-[8px] text-[#B9AEB6]">80%</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Transport Player Bar */}
                  <div className="p-2 rounded-lg bg-[#19131C] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#FF5757] flex items-center justify-center text-white">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                      <span className="font-mono text-[10px] text-[#F7F1F3]">0:42 / 2:15</span>
                    </div>
                    {/* Simulated Waveform / Timeline Scrubber */}
                    <div className="flex-1 mx-3 h-1.5 bg-[#2A1E2A] rounded-full overflow-hidden flex items-center">
                      <div className="w-1/3 h-full bg-[#FF5757]" />
                      <div className="w-1/4 h-full bg-[#D9AF8D]/70" />
                    </div>
                    <span className="text-[9px] font-mono text-[#9EBCAB]">Loop M. 12-16</span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SLIDE 3: PERFORM UI PREVIEW                               */}
              {/* ========================================================= */}
              {current.id === 'perform' && (
                <div 
                  className="p-3.5 sm:p-4 space-y-3 relative overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(28, 18, 31, 0.88), rgba(28, 18, 31, 0.94)), url('/performprep-bg.png')`
                  }}
                >
                  {/* Top Stage HUD */}
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,249,247,0.1)]">
                    <div className="flex items-center gap-2">
                      <Mic2 className="w-4 h-4 text-[#D9AF8D]" />
                      <div>
                        <div className="text-xs font-bold text-[#F7F1F3]">Darkness on the Delta</div>
                        <div className="text-[9px] text-[#B9AEB6]">Your Part: Lead (Stem Muted for Singing)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40">
                      <span className="w-2 h-2 rounded-full bg-[#FF5757] animate-ping" />
                      <span className="text-[9px] font-bold font-mono text-[#FF5757] uppercase tracking-wider">
                        REC Active · 0:48
                      </span>
                    </div>
                  </div>

                  {/* Stage Teleprompter / Scrolling Lyrics */}
                  <div className="py-2.5 px-3 rounded-xl bg-[#19131C]/90 backdrop-blur-sm border border-[rgba(255,249,247,0.08)] text-center space-y-1.5">
                    {/* Previous Line */}
                    <div className="text-[11px] text-[#B9AEB6]/50 transition-opacity">
                      "Down where the sleepy delta flow..."
                    </div>
                    {/* Active Singing Line */}
                    <div className="text-sm sm:text-base font-bold text-[#F7F1F3] tracking-wide text-amber-200 drop-shadow-sm font-display">
                      "Hear the lonesome whippoorwill call..."
                    </div>
                    {/* Upcoming Line */}
                    <div className="text-[11px] text-[#B9AEB6]/50 transition-opacity">
                      "Darkness on the Delta brings love back home to me."
                    </div>
                  </div>

                  {/* Pitch & Resonance Live Feedback */}
                  <div className="px-3 py-1.5 rounded-lg bg-[#221823]/90 border border-[rgba(255,249,247,0.06)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#9EBCAB] animate-pulse" />
                      <span className="text-[10px] text-[#9EBCAB] font-mono font-medium">
                        Pitch Resonance: 100% (Key E♭)
                      </span>
                    </div>
                    {/* Animated EQ Frequency Bars */}
                    <div className="flex items-center gap-0.5 h-3">
                      <div className="w-1 h-2 bg-[#9EBCAB] rounded-full animate-pulse" />
                      <div className="w-1 h-3 bg-[#9EBCAB] rounded-full" />
                      <div className="w-1 h-2.5 bg-[#9EBCAB] rounded-full animate-pulse" />
                      <div className="w-1 h-1.5 bg-[#9EBCAB] rounded-full" />
                    </div>
                  </div>

                  {/* Bottom Stage Controls */}
                  <div className="flex items-center justify-between text-[10px] text-[#B9AEB6] pt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#2A1E2A] text-[#D9AF8D] font-mono">
                        Key Pitch: E♭
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#2A1E2A] text-[#F7F1F3]">
                        Mic: Active
                      </span>
                    </div>
                    <span className="text-[#FF5757] font-semibold text-[10px]">
                      Complete & Save Audition Take →
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SLIDE 4: CONTRIBUTOR UI PREVIEW                           */}
              {/* ========================================================= */}
              {current.id === 'contributor' && (
                <div className="p-3.5 sm:p-4 space-y-2.5 bg-[#1C121F]">
                  {/* Studio Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,249,247,0.08)]">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#9EBCAB]" />
                      <div>
                        <div className="text-xs font-bold text-[#F7F1F3]">I Hold Your Hand in Mine</div>
                        <div className="text-[9px] text-[#B9AEB6]">Published · Public · 126 Singers · 48 Takes</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#9EBCAB]/15 text-[#9EBCAB] text-[10px] font-bold font-mono border border-[#9EBCAB]/30">
                      4 Stems Ready
                    </span>
                  </div>

                  {/* Multitrack Stem Alignment Editor Lanes */}
                  <div className="space-y-1">
                    {/* Stem 1: Tenor */}
                    <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#2A1E2A] text-[#D9A7B4] flex items-center justify-center font-bold text-[8px]">T</span>
                        <span className="text-[#F7F1F3] font-medium">Tenor</span>
                        <span className="text-[8px] text-[#B9AEB6]/60">hold_newTenor.mp3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-[#B9AEB6]">0 ms</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#9EBCAB]/10 text-[#9EBCAB] text-[8px] font-mono">
                          Aligned ✓
                        </span>
                      </div>
                    </div>

                    {/* Stem 2: Lead */}
                    <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#2A1E2A] text-[#FF5757] flex items-center justify-center font-bold text-[8px]">L</span>
                        <span className="text-[#F7F1F3] font-medium">Lead</span>
                        <span className="text-[8px] text-[#B9AEB6]/60">hold_newLead.mp3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-[#B9AEB6]">0 ms</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#9EBCAB]/10 text-[#9EBCAB] text-[8px] font-mono">
                          Aligned ✓
                        </span>
                      </div>
                    </div>

                    {/* Stem 3: Baritone (with adjusted offset) */}
                    <div className="px-2 py-1 rounded bg-[#2A1E2A] border border-[#9EBCAB]/40 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#19131C] text-[#9EBCAB] flex items-center justify-center font-bold text-[8px]">Br</span>
                        <span className="text-[#F7F1F3] font-medium">Baritone</span>
                        <span className="text-[8px] text-[#B9AEB6]/60">hold_newBari.mp3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-[#D9AF8D] font-bold">+24 ms</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#9EBCAB]/20 text-[#9EBCAB] text-[8px] font-mono font-bold">
                          Sync Calibrated
                        </span>
                      </div>
                    </div>

                    {/* Stem 4: Bass */}
                    <div className="px-2 py-1 rounded bg-[#221823] flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#2A1E2A] text-[#B7A1CC] flex items-center justify-center font-bold text-[8px]">B</span>
                        <span className="text-[#F7F1F3] font-medium">Bass</span>
                        <span className="text-[8px] text-[#B9AEB6]/60">hold_newBass.mp3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-[#B9AEB6]">0 ms</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#9EBCAB]/10 text-[#9EBCAB] text-[8px] font-mono">
                          Aligned ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution & Score Info */}
                  <div className="p-2 rounded-lg bg-[#19131C] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-[#B9AEB6]">
                      <FileText className="w-3.5 h-3.5 text-[#D9AF8D]" />
                      <span>Chart: <strong className="text-[#F7F1F3]">hold_hand_2026.pdf</strong> (4 pages)</span>
                    </div>
                    <span className="text-[#9EBCAB] font-mono">Chorus Access Token: Ready</span>
                  </div>

                  {/* Bottom Footer Action */}
                  <div className="flex items-center justify-between text-[10px] text-[#B9AEB6] pt-1 border-t border-[rgba(255,249,247,0.06)]">
                    <span>Manage arrangement permissions & stem mixes</span>
                    <span className="text-[#9EBCAB] font-semibold">Studio Workspace →</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Bottom Navigation Tabs & Controls */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 relative z-20">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            id="carousel-bottom-prev-button"
            className="w-8 h-8 rounded-full text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-[rgba(255,249,247,0.08)]"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 4 Named Feature Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-xl bg-[#221823] border border-[rgba(255,249,247,0.08)]">
            {slides.map((slide, idx) => {
              const isActive = idx === activeSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  id={`carousel-tab-${slide.id}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#543850] text-[#F7F1F3] shadow-xs'
                      : 'text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A]'
                  }`}
                  aria-label={`Jump to ${slide.tabTitle} slide`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#FF5757]' : 'bg-[#B9AEB6]/40'}`} />
                  <span>{slide.tabTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            id="carousel-bottom-next-button"
            className="w-8 h-8 rounded-full text-[#B9AEB6] hover:text-[#F7F1F3] hover:bg-[#2A1E2A] flex items-center justify-center transition-all active:scale-90 cursor-pointer border border-[rgba(255,249,247,0.08)]"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
