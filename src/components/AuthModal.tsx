import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { TrackappellaLogo } from './TrackappellaBrand';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
  targetFeature?: 'Learn' | 'Play' | 'Share' | 'General';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signup',
  targetFeature = 'General'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Escape key to dismiss modal easily
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your name or vocal nickname.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const shotIndex = (email.length % 5) + 1;
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      avatar: `/headshots/shot${shotIndex}.jpeg`,
      defaultPart: 'lead',
      provider: 'email',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      role: 'singer',
      memberGroupCodes: ['SPECTRUM2026']
    };

    onLoginSuccess(newUser);
    onClose();
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'demo') => {
    const providerNames: Record<string, string> = {
      google: 'Google Vocalist',
      apple: 'Apple Harmony User',
      demo: 'Alex Vance (Lead Singer)'
    };

    const newUser: UserProfile = {
      id: `usr_${provider}_${Date.now()}`,
      name: provider === 'demo' ? 'Alex Vance' : `${providerNames[provider]}`,
      email: provider === 'demo' ? 'alex.vance@trackappella.app' : `singer@${provider}.com`,
      avatar: provider === 'demo'
        ? '/headshots/shot1.jpeg'
        : '/headshots/shot2.jpeg',
      defaultPart: 'lead',
      provider,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      role: 'singer',
      memberGroupCodes: ['SPECTRUM2026']
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none cursor-pointer"
      onClick={onClose}
      id="auth-modal-backdrop"
    >
      {/* Modal Card with Radiant Lightbox Theme */}
      <div 
        className="relative w-full max-w-md bg-gradient-to-br from-[#0a2f48] via-[#062033] to-[#03111c] border border-sky-300/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.25)] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-card"
      >
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-[#ff5757]/15 blur-3xl pointer-events-none" />

        {/* Close Button: Generous 44px hit target so clicking anywhere within easily dismisses */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 border border-sky-400/30 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer z-30 shadow-lg active:scale-95 group"
          aria-label="Close modal"
          title="Close modal (Esc)"
          id="auth-modal-close-button"
        >
          <X className="w-5 h-5 pointer-events-none group-hover:scale-110 transition-transform" />
        </button>

        {/* Header: Trackappella Brand */}
        <div className="text-center mb-5 flex flex-col items-center relative z-10">
          <div className="mb-3">
            <TrackappellaLogo size="lg" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
            Rehearse multi-track stems, capture Stage Mode takes, and access your vocal repertoire.
          </p>
        </div>

        {/* Quick 1-Click Demo Sign-in for immediate evaluation */}
        <div className="mb-4 relative z-10">
          <button
            type="button"
            onClick={() => handleSocialLogin('demo')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500/20 via-slate-800/80 to-[#ff5757]/20 border border-sky-400/40 hover:border-sky-300 text-sky-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ff5757] animate-pulse" />
            <span>1-Click Instant Demo Login (Alex Vance)</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center z-10">
          <div className="flex-grow border-t border-sky-400/20"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider">Or Continue With</span>
          <div className="flex-grow border-t border-sky-400/20"></div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="py-2.5 px-3 rounded-xl bg-[#051624] hover:bg-[#082238] border border-sky-400/25 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.3C3.5 20.1 7.4 23 12 23z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="py-2.5 px-3 rounded-xl bg-[#051624] hover:bg-[#082238] border border-sky-400/25 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.06.62-2.73 1.39-.58.67-1.1 1.74-.96 2.77 1.03.08 2.11-.54 2.77-1.31z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Regular Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Name / Vocalist Handle
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/60" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#051624] border border-sky-400/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="singer@example.com"
                required
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#051624] border border-sky-400/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#051624] border border-sky-400/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff5757] via-[#ff6565] to-rose-600 hover:from-[#ff4545] hover:to-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all mt-4 cursor-pointer"
          >
            <span>Join the Sound</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 pt-4 border-t border-sky-400/20 text-center text-xs text-slate-400 relative z-10">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className="text-sky-300 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-sky-300 font-bold hover:underline cursor-pointer"
              >
                Register Free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
