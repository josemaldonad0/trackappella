import React, { useState } from 'react';
import { X, Search, FileText, Music, Folder, CheckCircle, RefreshCw, HardDrive, Sparkles } from 'lucide-react';
import { GoogleDriveIcon } from './icons';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedDate: string;
  type: 'folder' | 'pdf' | 'audio' | 'musicxml' | 'other';
  downloadUrl?: string;
}

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: DriveFileItem) => void;
  mode?: 'import' | 'export';
  exportData?: { songTitle: string; partName: string; blob?: Blob };
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile,
  mode = 'import',
  exportData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DriveFileItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Realistic Google Drive folder & chart files
  const [driveFiles] = useState<DriveFileItem[]>([
    {
      id: 'gd-1',
      name: 'Sweet_and_Lovely_Complete_TTBB_Chart.pdf',
      mimeType: 'application/pdf',
      size: '1.4 MB',
      modifiedDate: 'Aug 24, 2026',
      type: 'pdf'
    },
    {
      id: 'gd-2',
      name: 'Lullaby_In_Ragtime_Tenor_Lead_Bari_Bass_Tracks.zip',
      mimeType: 'application/zip',
      size: '24.8 MB',
      modifiedDate: 'Aug 22, 2026',
      type: 'audio'
    },
    {
      id: 'gd-3',
      name: 'Irish_Blessing_BobChilcott_SATB_Score.pdf',
      mimeType: 'application/pdf',
      size: '890 KB',
      modifiedDate: 'Aug 19, 2026',
      type: 'pdf'
    },
    {
      id: 'gd-4',
      name: 'Java_Jive_TTBB_AllParts_Master_Stem.mp3',
      mimeType: 'audio/mpeg',
      size: '4.2 MB',
      modifiedDate: 'Aug 15, 2026',
      type: 'audio'
    },
    {
      id: 'gd-5',
      name: 'Shenandoah_Chanticleer_Arrangement.musicxml',
      mimeType: 'application/xml',
      size: '340 KB',
      modifiedDate: 'Aug 10, 2026',
      type: 'musicxml'
    },
    {
      id: 'gd-6',
      name: 'Barbershop Harmony Society Tags & Charts',
      mimeType: 'application/vnd.google-apps.folder',
      size: 'Folder (18 items)',
      modifiedDate: 'Aug 27, 2026',
      type: 'folder'
    }
  ]);

  if (!isOpen) return null;

  const filtered = driveFiles.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportToDrive = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 shadow-sm">
              <GoogleDriveIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
                Google Drive {mode === 'export' ? 'Export Studio' : 'Chart & Track Browser'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Cloud Linked
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'export'
                  ? `Save your ${exportData?.songTitle || 'rehearsal'} take directly to Google Drive`
                  : 'Import sheet music PDF charts or companion vocal stem recordings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search charts, stems, folders on Google Drive..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mode === 'export' ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                <HardDrive className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-display">Save Take to Google Drive</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Exporting recording: <span className="text-cyan-300 font-bold">{exportData?.songTitle}</span> ({exportData?.partName} part)
                </p>
              </div>

              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination Folder:</span>
                  <span className="font-semibold text-white">My Drive / TagAlong Vocal Recordings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Format:</span>
                  <span className="font-semibold text-cyan-300">High Quality Stereo WebM Audio</span>
                </div>
              </div>

              {exportSuccess ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  <CheckCircle className="w-5 h-5" /> Saved to Google Drive successfully!
                </div>
              ) : (
                <button
                  onClick={handleExportToDrive}
                  disabled={isExporting}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center gap-2 mx-auto"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Uploading to Drive...
                    </>
                  ) : (
                    'Confirm & Save to Google Drive'
                  )}
                </button>
              )}
            </div>
          ) : (
            filtered.map((file) => {
              const isSelected = selectedItem?.id === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedItem(file)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-white/10 flex-shrink-0">
                      {file.type === 'folder' && <Folder className="w-5 h-5 text-amber-400" />}
                      {file.type === 'pdf' && <FileText className="w-5 h-5 text-rose-400" />}
                      {file.type === 'audio' && <Music className="w-5 h-5 text-cyan-400" />}
                      {file.type === 'musicxml' && <FileText className="w-5 h-5 text-emerald-400" />}
                    </div>

                    <div className="min-w-0 truncate">
                      <div className="text-sm font-semibold truncate text-white">{file.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Modified {file.modifiedDate}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {mode === 'import' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/80">
            <span className="text-xs text-slate-400 truncate max-w-[260px]">
              {selectedItem ? `Selected: ${selectedItem.name}` : 'Select a file to import'}
            </span>

            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedItem) {
                    onSelectFile(selectedItem);
                    onClose();
                  }
                }}
                disabled={!selectedItem}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
              >
                Import Chart / Audio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
