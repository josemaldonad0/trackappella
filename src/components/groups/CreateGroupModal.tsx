import React, { useState } from 'react';
import { X, Users, ShieldCheck, Zap, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { TrackappellaGroup, GroupMembershipMode, UserProfile } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  onCreateGroup: (newGroup: TrackappellaGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onCreateGroup
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [membershipMode, setMembershipMode] = useState<GroupMembershipMode>('non-moderated');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('General');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Group name is required.');
      return;
    }

    // Generate unique internal ID and Code
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanPrefix = trimmedName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'GRP';
    const generatedCode = `${cleanPrefix}-${randomSuffix}`;
    const newGroupId = `grp_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newGroup: TrackappellaGroup = {
      id: newGroupId,
      code: generatedCode,
      name: trimmedName,
      description: description.trim() || undefined,
      membershipMode,
      createdAt: nowIso,
      createdById: currentUser.id,
      creatorName: currentUser.name,
      restrictedSongIds: [],
      members: [
        {
          userId: currentUser.id,
          displayName: currentUser.name,
          email: currentUser.email,
          role: 'admin',
          status: 'active',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          joinSource: 'Founder/Creator',
          avatar: currentUser.avatar
        }
      ],
      inviteLinks: [
        {
          id: `inv_${Date.now()}`,
          token: `${generatedCode.toLowerCase()}-welcome`,
          groupId: newGroupId,
          groupCode: generatedCode,
          createdAt: nowIso,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          expiryWindowLabel: '30 days',
          status: 'active',
          createdById: currentUser.id,
          createdByAdminName: currentUser.name,
          label: 'Default Ensemble Invite',
          usesCount: 0
        }
      ],
      joinRequests: []
    };

    onCreateGroup(newGroup);
    setName('');
    setDescription('');
    setMembershipMode('non-moderated');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-[#1C121F]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] transition-all cursor-pointer z-10 shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-6 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-[#FF5757] flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5 text-[#FF5757]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1C121F] tracking-tight font-display">Create Private Group</h3>
            <p className="text-xs text-[#573657]">
              For choirs, vocal ensembles, chapters, or rehearsal sections
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl mb-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2 relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Group Name (Required) */}
          <div>
            <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider mb-1.5 font-mono">
              Group Name <span className="text-[#FF5757]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. West Coast Harmony Chorus, Tenor Sectionals"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] placeholder:text-[#573657]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5757]/40 focus:border-[#FF5757] transition-all"
              id="create-group-name-input"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider mb-1.5 font-mono">
              Description <span className="text-[#573657] font-normal normal-case">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Competition rehearsal set, custom learning tracks, and member charts."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] placeholder:text-[#573657]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5757]/40 focus:border-[#FF5757] transition-all resize-none"
              id="create-group-desc-input"
            />
          </div>

          {/* Membership Mode */}
          <div>
            <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider mb-2 font-mono">
              Membership Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Non-moderated */}
              <button
                type="button"
                onClick={() => setMembershipMode('non-moderated')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  membershipMode === 'non-moderated'
                    ? 'bg-[#EBDDE0] border-[#FF5757] text-[#1C121F] ring-2 ring-[#FF5757]/40 shadow-xs'
                    : 'bg-[#F1E4E7] border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:border-[rgba(62,40,67,0.25)] hover:bg-[#F7EDF0]'
                }`}
                id="membership-mode-non-moderated"
              >
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${membershipMode === 'non-moderated' ? 'text-amber-600' : 'text-[#573657]'}`} />
                  <span className="text-xs font-bold">Non-moderated</span>
                </div>
                <p className="text-[11px] text-[#573657] leading-relaxed">
                  Anyone with an active invite link joins immediately. Best for fast rehearsals.
                </p>
              </button>

              {/* Moderated */}
              <button
                type="button"
                onClick={() => setMembershipMode('moderated')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  membershipMode === 'moderated'
                    ? 'bg-[#EBDDE0] border-[#FF5757] text-[#1C121F] ring-2 ring-[#FF5757]/40 shadow-xs'
                    : 'bg-[#F1E4E7] border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:border-[rgba(62,40,67,0.25)] hover:bg-[#F7EDF0]'
                }`}
                id="membership-mode-moderated"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${membershipMode === 'moderated' ? 'text-emerald-700' : 'text-[#573657]'}`} />
                  <span className="text-xs font-bold">Moderated</span>
                </div>
                <p className="text-[11px] text-[#573657] leading-relaxed">
                  Visitors submit a join request. Group Admins review and approve each singer.
                </p>
              </button>
            </div>
          </div>

          {/* Privacy & ID Note */}
          <div className="p-3.5 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-xs text-[#3E2843] space-y-1">
            <div className="flex items-center gap-1.5 text-[#1C121F] font-semibold text-xs">
              <Lock className="w-3.5 h-3.5 text-[#573657]" />
              <span>Private Vault Protection</span>
            </div>
            <p className="text-[11px] text-[#573657] leading-relaxed">
              Groups are not publicly searchable or visible on public profiles. You will become the first Group Admin and receive a unique internal ID for assigning restricted arrangements.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white text-xs font-extrabold shadow-md shadow-[#FF5757]/20 flex items-center gap-2 active:scale-98 transition-all cursor-pointer border border-red-400/30"
              id="confirm-create-group-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
