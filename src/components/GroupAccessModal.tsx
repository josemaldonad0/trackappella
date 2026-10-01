import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { GroupCatalog, TrackappellaGroup, UserProfile } from '../types';

interface GroupAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  groupCatalogs: GroupCatalog[];
  groups?: TrackappellaGroup[];
  onUnlockGroup: (code: string) => boolean;
  onOpenCreateGroup?: () => void;
  onResolveInviteToken?: (token: string) => void;
}

export const GroupAccessModal: React.FC<GroupAccessModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  groupCatalogs,
  groups = [],
  onUnlockGroup,
  onOpenCreateGroup,
  onResolveInviteToken
}) => {
  const [code, setCode] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Escape key to easily dismiss modal
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

  // Join group modal only displays for authenticated users
  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = code.trim();
    if (!cleanInput) return;

    // Check if input looks like a full invite link or token
    const tokenMatch = cleanInput.match(/[?&]invite=([^&]+)/) || cleanInput.match(/inv_[a-zA-Z0-9_-]+/) || (cleanInput.includes('-') && !cleanInput.includes(' '));
    if (tokenMatch && onResolveInviteToken) {
      const extractedToken = tokenMatch[1] || tokenMatch[0];
      onResolveInviteToken(extractedToken);
      onClose();
      setCode('');
      return;
    }

    const success = onUnlockGroup(cleanInput.toUpperCase());
    if (success) {
      setStatusMsg({ type: 'success', text: `Access granted! Joined group successfully.` });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
        setCode('');
      }, 900);
    } else {
      // Check if it matches an invite token
      if (onResolveInviteToken) {
        onResolveInviteToken(cleanInput);
        onClose();
        setCode('');
        return;
      }
      setStatusMsg({ type: 'error', text: 'Invalid group code or invite token. Please check with your ensemble director.' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-fadeIn"
      onClick={onClose}
      id="join-group-modal-backdrop"
    >
      <div 
        className="relative w-full max-w-lg bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-[#1C121F] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="join-group-modal-content"
      >
        {/* Close button: returns to catalog (44px touch target) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] active:bg-[#E2D2D5] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] flex items-center justify-center transition-all cursor-pointer z-20 active:scale-95 group shadow-xs"
          id="close-join-group-modal-btn"
          title="Return to catalog (Esc)"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 pointer-events-none group-hover:scale-110 transition-transform" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-[#FF5757] flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-5 h-5 text-[#FF5757]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1C121F] tracking-tight font-display">
              Join Group
            </h3>
            <p className="text-xs text-[#573657]">
              Enter a code provided by your quartet, chorus, or director
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 relative z-10 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
              : 'bg-rose-100 border border-rose-300 text-rose-900'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6 relative z-10">
          <div>
            <label htmlFor="group-code-input" className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider mb-2 font-mono">
              GROUP CODE
            </label>
            <input
              id="group-code-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SPECTRUM2026, MASTERS77, SAIGOLD"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] font-mono text-sm uppercase placeholder:text-[#573657]/60 focus:outline-none focus:ring-2 focus:ring-[#FF5757]/40 focus:border-[#FF5757] tracking-wider transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white font-extrabold text-sm shadow-md shadow-[#FF5757]/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer border border-red-400/30"
            id="submit-join-group-btn"
          >
            <Users className="w-4 h-4" />
            <span>Join Group</span>
          </button>
        </form>

        {/* Demo hints for convenient 1-click test */}
        <div className="p-4 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] space-y-2.5 relative z-10">
          <div className="text-[11px] font-bold text-[#3E2843] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1C121F]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Available Ensemble Demo Codes:</span>
            </span>
            <span className="text-[10px] text-[#573657] font-mono">Click to autofill</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {(groups && groups.length > 0 ? groups : groupCatalogs).map((g: any) => {
              const codeVal = g.code || g.accessCode;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCode(codeVal)}
                  className="p-2.5 rounded-xl bg-[#F1E4E7] hover:bg-[#F7EDF0] border border-[rgba(62,40,67,0.12)] hover:border-[rgba(62,40,67,0.25)] text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="font-semibold text-[#1C121F] truncate text-[11px] group-hover:text-[#FF5757] transition-colors">{g.name}</div>
                  <div className="font-mono text-[10px] text-[#573657] font-bold group-hover:text-[#FF5757] transition-colors">{codeVal}</div>
                </button>
              );
            })}
          </div>

          {onOpenCreateGroup && (
            <div className="pt-2.5 border-t border-[rgba(62,40,67,0.12)] flex items-center justify-between text-xs">
              <span className="text-[#573657] text-[11px]">Directing a quartet or chorus?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateGroup();
                }}
                className="text-[#FF5757] hover:text-[#ff4040] hover:underline font-bold transition-colors cursor-pointer text-[11px]"
              >
                + Create a Private Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
