import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  Sparkles,
  Music2,
  Lock
} from 'lucide-react';
import { TrackappellaLogo } from '../TrackappellaBrand';
import { TrackappellaGroup, GroupInviteLink, UserProfile } from '../../types';

interface InviteLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: GroupInviteLink | null;
  group: TrackappellaGroup | null;
  currentUser: UserProfile | null;
  onOpenAuth: (feature?: 'Learn' | 'Play' | 'Share' | 'General') => void;
  onJoinSuccess: (group: TrackappellaGroup) => void;
  onRequestSubmitted: (group: TrackappellaGroup) => void;
}

export const InviteLandingModal: React.FC<InviteLandingModalProps> = ({
  isOpen,
  onClose,
  inviteLink,
  group,
  currentUser,
  onOpenAuth,
  onJoinSuccess,
  onRequestSubmitted
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !inviteLink || !group) return null;

  // Determine link status (Active, Expired, or Revoked)
  const isExpired = inviteLink.status === 'expired' || (inviteLink.expiresAt ? new Date(inviteLink.expiresAt) < new Date() : false);
  const isRevoked = inviteLink.status === 'revoked';
  const isInvalid = isExpired || isRevoked;

  // Check if current user is already a member
  const isAlreadyMember = currentUser 
    ? group.members.some(m => m.userId === currentUser.id || m.email.toLowerCase() === currentUser.email.toLowerCase())
    : false;

  // Check if user has a pending request
  const hasPendingRequest = currentUser
    ? group.joinRequests.some(r => (r.userId === currentUser.id || r.userEmail.toLowerCase() === currentUser.email.toLowerCase()) && r.status === 'pending')
    : false;

  const isModerated = group.membershipMode === 'moderated';

  const handleAction = () => {
    if (!currentUser) {
      onOpenAuth('General');
      return;
    }

    if (isAlreadyMember) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    if (isModerated) {
      // Create Join Request
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage('Your request to join has been submitted! A group administrator will review and approve your membership.');
        onRequestSubmitted(group);
      }, 500);
    } else {
      // Immediate Join
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(`Welcome! You are now a member of ${group.name}.`);
        onJoinSuccess(group);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-center text-[#1C121F]">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] transition-all cursor-pointer z-10 shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trackappella Branding */}
        <div className="flex justify-center mb-6 relative z-10">
          <TrackappellaLogo size="md" />
        </div>

        {/* State 1: Revoked Invite Link */}
        {isRevoked ? (
          <div className="space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
              <Ban className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1C121F] tracking-tight font-display">Invite Link Revoked</h3>
              <p className="text-xs text-rose-800 font-medium mt-1">
                This invitation link has been revoked by the group administrator.
              </p>
            </div>
            <p className="text-xs text-[#573657] leading-relaxed max-w-xs mx-auto">
              Please contact an administrator of <strong className="text-[#1C121F]">{group.name}</strong> to request an updated invite link.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] text-[#1C121F] font-bold text-xs transition-colors cursor-pointer border border-[rgba(62,40,67,0.12)]"
            >
              Close
            </button>
          </div>
        ) : isExpired ? (
          /* State 2: Expired Invite Link */
          <div className="space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1C121F] tracking-tight font-display">Invite Link Expired</h3>
              <p className="text-xs text-amber-900 font-medium mt-1">
                This invitation window has closed.
              </p>
            </div>
            <p className="text-xs text-[#573657] leading-relaxed max-w-xs mx-auto">
              The expiry window for this invitation link has passed. Please contact <strong className="text-[#1C121F]">{inviteLink.createdByAdminName || group.name}</strong> to generate a fresh link.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] text-[#1C121F] font-bold text-xs transition-colors cursor-pointer border border-[rgba(62,40,67,0.12)]"
            >
              Close
            </button>
          </div>
        ) : successMessage ? (
          /* State 3: Joined or Request Sent */
          <div className="space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1C121F] tracking-tight font-display">
              {isModerated ? 'Request Submitted!' : 'You\'re In!'}
            </h3>
            <p className="text-xs text-[#573657] leading-relaxed max-w-xs mx-auto">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] text-white font-extrabold text-xs shadow-md shadow-[#FF5757]/20 transition-all cursor-pointer border border-red-400/30"
            >
              Open Group Vault
            </button>
          </div>
        ) : (
          /* State 4: Valid Active Invite Link */
          <div className="space-y-5 relative z-10 text-left">
            {/* Group Header Card */}
            <div className="p-4 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5757]/15 border border-[#FF5757]/30 text-[#FF5757] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                  {group.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#573657] font-mono">
                    Group Invitation
                  </div>
                  <h3 className="text-lg font-bold text-[#1C121F] tracking-tight truncate font-display">
                    {group.name}
                  </h3>
                  <div className="text-[11px] text-[#573657]">
                    Invited by <span className="text-[#1C121F] font-semibold">{inviteLink.createdByAdminName}</span>
                  </div>
                </div>
              </div>

              {group.description && (
                <p className="text-xs text-[#3E2843] leading-relaxed border-t border-[rgba(62,40,67,0.08)] pt-2.5">
                  {group.description}
                </p>
              )}

              {inviteLink.label && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[11px] font-medium text-[#1C121F]">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{inviteLink.label}</span>
                </div>
              )}
            </div>

            {/* Membership Mode Callout */}
            <div className={`p-3.5 rounded-2xl border flex items-start gap-3 bg-[#F1E4E7] ${
              isModerated
                ? 'border-emerald-500/30 text-emerald-900'
                : 'border-amber-500/30 text-amber-900'
            }`}>
              {isModerated ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-[#1C121F]">
                  {isModerated ? 'Moderated Group (Admin Review)' : 'Instant Join'}
                </div>
                <p className="text-[11px] text-[#573657] leading-relaxed">
                  {isModerated
                    ? 'Submitting will create a pending join request. A Group Admin will approve your access before restricted arrangements unlock.'
                    : 'Selecting Join immediately makes you an active member with access to the group’s restricted arrangements.'}
                </p>
              </div>
            </div>

            {/* User State & Call To Action */}
            {isAlreadyMember ? (
              <div className="p-3.5 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-xs text-[#1C121F] flex items-center justify-between">
                <span>You are already an active member of this group.</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-[#FF5757] text-white font-bold text-xs hover:bg-[#ff4040] transition-colors cursor-pointer shrink-0 ml-2"
                >
                  View Group
                </button>
              </div>
            ) : hasPendingRequest ? (
              <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Your request to join is pending administrator approval.</span>
              </div>
            ) : currentUser ? (
              <div className="space-y-3">
                <div className="text-[11px] text-[#573657] flex items-center justify-between">
                  <span>Joining as:</span>
                  <span className="text-[#1C121F] font-bold">{currentUser.name} ({currentUser.email})</span>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAction}
                  className="w-full py-3 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white text-xs font-extrabold shadow-md shadow-[#FF5757]/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-red-400/30 disabled:opacity-50"
                  id="invite-join-action-btn"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : isModerated ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Request to Join Group</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#573657] text-center">
                  Sign in or create a Trackappella account to accept this invitation.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAuth('General')}
                  className="w-full py-3 rounded-2xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white text-xs font-extrabold shadow-md shadow-[#FF5757]/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-red-400/30"
                  id="invite-login-to-join-btn"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Join Group</span>
                </button>
              </div>
            )}

            {/* Expiry Window Footer */}
            {inviteLink.expiresAt && (
              <div className="text-[10px] text-[#573657] text-center flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Invite valid through {new Date(inviteLink.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
