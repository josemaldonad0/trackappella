import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Award, 
  CheckCircle2, 
  Play, 
  Pause, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Send,
  ExternalLink
} from 'lucide-react';
import { RecordedTake } from '../types';
import { GoogleDriveIcon } from './icons';

interface ShareableTakeModalProps {
  take: RecordedTake | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareableTakeModal: React.FC<ShareableTakeModalProps> = ({
  take,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [directorNotes, setDirectorNotes] = useState(take?.feedbackNotes || '');
  const [sentFeedback, setSentFeedback] = useState(false);

  if (!isOpen || !take) return null;

  const shareUrl = `${window.location.origin}/#take=${take.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail) return;
    setSentFeedback(true);
    setTimeout(() => {
      setSentFeedback(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/50">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate / Audition Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase font-mono text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Official Vocal Take & Audition Report</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              {take.songTitle}
            </h2>
            <p className="text-xs text-slate-400">
              Performed Part: <strong className="text-amber-300">{take.partName}</strong> • Backing: {take.performerGroup}
            </p>
          </div>
        </div>

        {/* Take Performance Score Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-white/10 mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Vocalist</div>
              <div className="text-sm font-extrabold text-white truncate">{take.userName}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Intonation Accuracy</div>
              <div className="text-base font-black text-emerald-400 font-mono">{take.pitchAccuracyScore}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-[10px] text-slate-500 font-mono uppercase">Recorded Date</div>
              <div className="text-xs font-bold text-slate-300 font-mono">{take.date}</div>
            </div>
          </div>

          {/* Audio Player Preview */}
          {take.blobUrl && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
              <audio controls src={take.blobUrl} className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Share & Instructor Feedback Section */}
        <div className="space-y-4">
          {/* Share Link Row */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Audition Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-xs font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Send for Teacher / Music Director Certification */}
          <form onSubmit={handleSendToInstructor} className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Submit Take for Director / Instructor Feedback:</span>
              <span className="text-[10px] text-amber-400 font-mono">Certification Flow</span>
            </div>

            {sentFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Take submitted successfully to instructor review queue!</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                placeholder="director@chorus.org or teacher@vocalacademy.com"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          {take.blobUrl && (
            <a
              href={take.blobUrl}
              download={`${take.songTitle.replace(/\s+/g, '_')}_${take.partName}_Take.wav`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Audio Take</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs ml-auto cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
