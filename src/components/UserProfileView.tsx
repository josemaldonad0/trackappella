import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  Music, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Save, 
  RotateCcw,
  Check,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onNavigateHome: () => void;
  onSignOut: () => void;
}

// 5 Illustration Headshots located in public/headshots
const HEADSHOT_AVATARS = [
  { id: 'shot1', url: '/headshots/shot1.jpeg', label: 'Illustration 1' },
  { id: 'shot2', url: '/headshots/shot2.jpeg', label: 'Illustration 2' },
  { id: 'shot3', url: '/headshots/shot3.jpeg', label: 'Illustration 3' },
  { id: 'shot4', url: '/headshots/shot4.jpeg', label: 'Illustration 4' },
  { id: 'shot5', url: '/headshots/shot5.jpeg', label: 'Illustration 5' },
];

// Voice Parts: Soprano, Alto, Tenor, Lead, Baritone, Bass
const VOICE_PARTS = [
  {
    id: 'soprano',
    name: 'Soprano',
    badgeColor: '#E5989B',
    bgTint: 'bg-[#E5989B]/15 border-[#E5989B]',
  },
  {
    id: 'alto',
    name: 'Alto',
    badgeColor: '#E0A96D',
    bgTint: 'bg-[#E0A96D]/15 border-[#E0A96D]',
  },
  {
    id: 'tenor',
    name: 'Tenor',
    badgeColor: '#D9A7B4',
    bgTint: 'bg-[#D9A7B4]/15 border-[#D9A7B4]',
  },
  {
    id: 'lead',
    name: 'Lead',
    badgeColor: '#D9AF8D',
    bgTint: 'bg-[#D9AF8D]/15 border-[#D9AF8D]',
  },
  {
    id: 'baritone',
    name: 'Baritone',
    badgeColor: '#9EBCAB',
    bgTint: 'bg-[#9EBCAB]/15 border-[#9EBCAB]',
  },
  {
    id: 'bass',
    name: 'Bass',
    badgeColor: '#B7A1CC',
    bgTint: 'bg-[#B7A1CC]/15 border-[#B7A1CC]',
  }
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  onNavigateHome,
  onSignOut
}) => {
  // Form States
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [defaultPart, setDefaultPart] = useState(currentUser.defaultPart || 'lead');
  const [avatar, setAvatar] = useState(currentUser.avatar || '/headshots/shot1.jpeg');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Password Reset States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // General Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Has changes detection
  const hasChanges = 
    name !== currentUser.name ||
    email !== currentUser.email ||
    defaultPart !== (currentUser.defaultPart || 'lead') ||
    avatar !== currentUser.avatar;

  // Custom Avatar detection
  const isCustomUploadedAvatar = !HEADSHOT_AVATARS.some(h => h.url === avatar);

  // Handle Save Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide a valid name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please provide a valid email address');
      return;
    }

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      defaultPart,
      avatar,
    };

    onUpdateProfile(updated);
    showToast(`Profile information updated! Default voice part set to ${defaultPart.toUpperCase()}.`);
  };

  // Handle Reset to Initial
  const handleDiscardChanges = () => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setDefaultPart(currentUser.defaultPart || 'lead');
    setAvatar(currentUser.avatar || '/headshots/shot1.jpeg');
    setUploadError(null);
    showToast('Changes reverted.');
  };

  // Handle Image File Upload (Manual or Drag-and-drop)
  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size is too large (maximum 8MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          if (img.width < 500 || img.height < 500) {
            showToast(`Photo applied (${img.width}×${img.height}px). Note: At least 500×500px is recommended for sharpest quality.`);
          } else {
            showToast(`Custom photo applied (${img.width}×${img.height}px)! Click Save Changes to keep it.`);
          }
          setAvatar(dataUrl);
        };
        img.onerror = () => {
          setAvatar(dataUrl);
          showToast('Custom photo applied! Click Save Changes to keep it.');
        };
        img.src = dataUrl;
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-uploading same file triggers change
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle Password Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Success simulation
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Password changed successfully. Your next login will use your new password.');
    showToast('Password updated successfully!');
  };

  // Quick reset link
  const handleSendResetEmail = () => {
    showToast(`Password reset link dispatched to ${email}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#CBB9C7] text-[#1C121F] font-sans pb-28 animate-fadeIn" id="user-profile-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#221823] text-[#F7F1F3] border border-[rgba(255,249,247,0.12)] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={onNavigateHome}
            id="profile-back-button"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#3E2843] hover:text-[#1C121F] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Repertoire Library</span>
          </button>

          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#221823] text-[#F7F1F3] shadow-sm">
                <User className="w-6 h-6 text-[#D9AF8D]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1C121F] tracking-tight">
                  Singer Profile & Preferences
                </h1>
                <p className="text-xs sm:text-sm text-[#3E2843] font-medium mt-0.5">
                  Update your singer credentials, email, password, and rehearsal voice part.
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            {hasChanges && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  className="px-3.5 py-2 rounded-xl bg-[#DFCCCF] hover:bg-[#D4C0C3] text-[#3E2843] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Discard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  id="profile-top-save-btn"
                  className="px-4 py-2 rounded-xl bg-[#FF5757] hover:bg-[#ff4242] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </header>
        </div>

        {/* 1. FIRST SECTION: PROFILE INFORMATION (Moved to top as requested) */}
        <section className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-7" id="section-profile-information">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#221823] text-[#D9AF8D]">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1C121F] tracking-tight">
                Profile Information
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#543850] font-medium leading-relaxed">
              Manage your personal credentials, contact email, and profile avatar.
            </p>
          </div>

          {/* Personal Data Form with Name and Email inputs FIRST */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#7E6A7A] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="profile-name-input"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#DFCCCF]/70 border border-[rgba(62,40,67,0.2)] focus:border-[#7C3A82] focus:bg-white text-[#1C121F] text-sm font-semibold transition-all outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#7E6A7A] absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="profile-email-input"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#DFCCCF]/70 border border-[rgba(62,40,67,0.2)] focus:border-[#7C3A82] focus:bg-white text-[#1C121F] text-sm font-semibold transition-all outline-none"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profile Photo / Headshot Selection Block UNDERNEATH Name & Email */}
            <div className="bg-[#DFCCCF]/55 rounded-2xl p-5 sm:p-6 border border-[rgba(62,40,67,0.1)] space-y-6" id="profile-photo-selection-container">
              <div className="flex flex-col md:flex-row items-start gap-6">
                
                {/* Active Avatar Preview */}
                <div className="shrink-0 flex flex-col items-center mx-auto md:mx-0">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#D9AF8D] shadow-md bg-[#221823]"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer text-[10px] font-bold gap-1"
                      title="Upload photo"
                    >
                      <Upload className="w-5 h-5 text-[#D9AF8D]" />
                      <span>Upload</span>
                    </button>
                  </div>
                  {isCustomUploadedAvatar ? (
                    <span className="mt-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase bg-[#221823] text-[#D9AF8D] border border-[#D9AF8D]/30">
                      Custom Photo
                    </span>
                  ) : (
                    <span className="mt-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase bg-[#221823]/85 text-[#F7F1F3]">
                      Illustrated Avatar
                    </span>
                  )}
                </div>

                {/* Right / Inverted Options: Upload First, Provided Avatars Second */}
                <div className="flex-1 space-y-5 w-full">
                  
                  {/* 1. FIRST: Upload a Profile Photo with 500x500px Recommendation */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="text-xs font-bold text-[#1C121F] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[#7C3A82]" />
                        <span>Upload a Profile Photo</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#7C3A82] bg-[#7C3A82]/10 px-2 py-0.5 rounded-md self-start sm:self-auto">
                        Recommended: at least 500 × 500 px
                      </span>
                    </div>

                    <p className="text-[11px] text-[#543850]">
                      Upload your own headshot or ensemble photo. For best clarity and crisp detail across rehearsal views, use an image of at least 500 by 500 pixels (square aspect ratio, PNG, JPG, or WebP up to 8MB).
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="profile-avatar-file-input"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-3.5 sm:p-4 text-center cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                        isDragging
                          ? 'border-[#7C3A82] bg-[#7C3A82]/15 scale-[1.01]'
                          : 'border-[rgba(62,40,67,0.25)] hover:border-[#7C3A82] hover:bg-[#DFCCCF]'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-[#221823] text-[#D9AF8D] shrink-0">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1C121F]">
                            Drag & drop your photo here, or click to browse
                          </div>
                          <div className="text-[11px] text-[#543850]">
                            Suggested: 500 × 500 px or larger (Square 1:1 works best)
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-[#221823] hover:bg-[#2A1E2A] text-[#F7F1F3] text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Browse Files
                      </button>
                    </div>

                    {uploadError && (
                      <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="grow border-t border-[rgba(62,40,67,0.18)]"></div>
                    <span className="shrink-0 mx-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#543850] bg-[#DFCCCF]/80 px-2 py-0.5 rounded">
                      Or select a provided avatar
                    </span>
                    <div className="grow border-t border-[rgba(62,40,67,0.18)]"></div>
                  </div>

                  {/* 2. THEN: Alternatively Select One of the Provided Profile Avatars */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-xs font-bold text-[#1C121F] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D9AF8D]" />
                        <span>Illustrated Singer Avatars</span>
                      </div>
                      <p className="text-[11px] text-[#543850] mt-0.5">
                        Alternatively, choose one of our 5 illustrated profile avatars:
                      </p>
                    </div>

                    {/* 5 Headshot Avatars */}
                    <div className="grid grid-cols-5 gap-2.5 sm:gap-3 max-w-md">
                      {HEADSHOT_AVATARS.map((headshot, index) => {
                        const isSelected = avatar === headshot.url;
                        return (
                          <button
                            key={headshot.id}
                            type="button"
                            onClick={() => {
                              setAvatar(headshot.url);
                              setUploadError(null);
                            }}
                            id={`headshot-avatar-${headshot.id}`}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 ${
                              isSelected
                                ? 'border-[#7C3A82] ring-2 ring-[#7C3A82]/50 shadow-md scale-102'
                                : 'border-transparent hover:border-[rgba(62,40,67,0.3)] opacity-85 hover:opacity-100'
                            }`}
                            title={headshot.label}
                          >
                            <img
                              src={headshot.url}
                              alt={headshot.label}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#7C3A82]/25 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-[#1C121F] text-white flex items-center justify-center shadow-sm">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              </div>
                            )}
                            <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] font-mono font-bold bg-black/60 text-white text-center rounded py-0.2">
                              #{index + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </form>
        </section>

        {/* 2. PREFERRED VOICE PART SECTION (Expanded with Soprano & Alto) */}
        <section className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5" id="section-voice-parts">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#221823] text-[#D9AF8D]">
                <Music className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1C121F] tracking-tight">
                Preferred Rehearsal Voice Part
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#543850] font-medium leading-relaxed">
              Whenever you practice any track in the rehearsal studio or stage mode, this voice part will be automatically selected and isolated by default.
            </p>
          </div>

          {/* Clean Voice Part Picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {VOICE_PARTS.map((part) => {
              const isSelected = defaultPart.toLowerCase() === part.id;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setDefaultPart(part.id)}
                  id={`voice-part-card-${part.id}`}
                  className={`px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none text-left ${
                    isSelected
                      ? `${part.bgTint} shadow-sm scale-[1.01]`
                      : 'bg-[#DFCCCF]/60 border-[rgba(62,40,67,0.12)] hover:border-[rgba(62,40,67,0.3)] hover:bg-[#DFCCCF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: part.badgeColor }} 
                    />
                    <span className="text-base font-extrabold text-[#1C121F] truncate">
                      {part.name}
                    </span>
                  </div>

                  {/* Radio / Check indicator */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                    isSelected 
                      ? 'border-[#1C121F] bg-[#1C121F] text-white' 
                      : 'border-[rgba(62,40,67,0.3)] bg-transparent'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. SECURITY & PASSWORD RESET SECTION */}
        <section className="bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6" id="section-security">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#221823] text-[#D9AF8D]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1C121F] tracking-tight">
                Reset Password & Security
              </h2>
            </div>
            <p className="text-xs text-[#543850] font-medium">
              Update your password or generate a secure reset link dispatched to your registered email.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-bold flex items-center gap-2">
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#7E6A7A] absolute left-3.5 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    id="profile-new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#DFCCCF]/70 border border-[rgba(62,40,67,0.2)] focus:border-[#7C3A82] focus:bg-white text-[#1C121F] text-sm font-semibold transition-all outline-none"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(prev => !prev)}
                    className="absolute right-3 text-[#7E6A7A] hover:text-[#1C121F] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-[#7E6A7A] absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="profile-confirm-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#DFCCCF]/70 border border-[rgba(62,40,67,0.2)] focus:border-[#7C3A82] focus:bg-white text-[#1C121F] text-sm font-semibold transition-all outline-none"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendResetEmail}
                id="profile-send-reset-email-btn"
                className="text-xs font-bold text-[#543850] hover:text-[#1C121F] underline underline-offset-4 cursor-pointer"
              >
                Send password reset link to my email
              </button>

              <button
                type="submit"
                id="profile-update-password-btn"
                disabled={!newPassword || !confirmPassword}
                className="px-4 py-2 rounded-xl bg-[#221823] hover:bg-[#2A1E2A] disabled:opacity-40 disabled:hover:bg-[#221823] text-[#F7F1F3] font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D9AF8D]" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </section>

        {/* 4. FOOTER ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[rgba(62,40,67,0.15)]">
          <button
            type="button"
            onClick={onSignOut}
            id="profile-footer-signout-btn"
            className="text-xs font-bold text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
          >
            Sign out of this device
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={!hasChanges}
              className="px-4 py-2.5 rounded-xl bg-[#DFCCCF] hover:bg-[#D4C0C3] disabled:opacity-40 text-[#3E2843] font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSaveProfile()}
              id="profile-bottom-save-btn"
              disabled={!hasChanges}
              className="px-6 py-2.5 rounded-xl bg-[#FF5757] hover:bg-[#ff4242] disabled:opacity-40 disabled:hover:bg-[#FF5757] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
