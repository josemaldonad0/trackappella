import React, { useState, useEffect } from 'react';
import { 
  ListMusic, 
  Plus, 
  X, 
  Trash2, 
  Check, 
  FolderPlus,
  Layers,
  Users
} from 'lucide-react';
import { Song, Setlist, TrackappellaGroup } from '../types';

// -------------------------------------------------------------
// 1. Create New Setlist Modal
// -------------------------------------------------------------
interface CreateSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type?: 'personal' | 'group', groupId?: string, groupName?: string) => void;
  adminGroups?: TrackappellaGroup[];
}

export const CreateSetlistModal: React.FC<CreateSetlistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  adminGroups = []
}) => {
  const [name, setName] = useState('');
  const [setlistType, setSetlistType] = useState<'personal' | 'group'>('personal');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [error, setError] = useState('');

  const hasAdminGroups = adminGroups.length > 0;

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setSetlistType('personal');
      if (adminGroups.length > 0) {
        setSelectedGroupId(adminGroups[0].id);
      } else {
        setSelectedGroupId('');
      }
    }
  }, [isOpen, adminGroups]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a setlist name.');
      return;
    }

    if (setlistType === 'group') {
      const group = adminGroups.find(g => g.id === selectedGroupId);
      if (!group) {
        setError('Please select an ensemble group for this setlist.');
        return;
      }
      onCreate(trimmed, 'group', group.id, group.name);
    } else {
      onCreate(trimmed, 'personal');
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200"
      id="create-setlist-modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-[#1C121F] animate-in zoom-in-95 duration-150"
        id="create-setlist-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#DFCCCF] border-b border-[rgba(62,40,67,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-[#FF5757] flex items-center justify-center shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1C121F] tracking-tight font-display">
                New Setlist
              </h2>
              <p className="text-xs text-[#573657]">
                Group arrangements for rehearsals, contests, or shows
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] transition-all cursor-pointer shadow-xs"
            id="close-create-setlist-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Setlist Type Picker (Personal vs Group Setlist) for Group Admins */}
          {hasAdminGroups && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                Setlist Audience / Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)]">
                <button
                  type="button"
                  onClick={() => setSetlistType('personal')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    setlistType === 'personal'
                      ? 'bg-[#FF5757] text-white shadow-xs'
                      : 'text-[#3E2843] hover:text-[#1C121F]'
                  }`}
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Personal Setlist</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetlistType('group')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    setlistType === 'group'
                      ? 'bg-[#543850] text-white shadow-xs'
                      : 'text-[#3E2843] hover:text-[#1C121F]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Setlist</span>
                </button>
              </div>

              {setlistType === 'group' && (
                <div className="pt-2 space-y-1.5 animate-fadeIn">
                  <label htmlFor="select-group-setlist-owner" className="block text-[11px] font-bold text-[#3E2843]">
                    Select Group (You Admin):
                  </label>
                  <select
                    id="select-group-setlist-owner"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] text-xs focus:outline-none focus:border-[#FF5757] cursor-pointer"
                  >
                    {adminGroups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#573657]">
                    This setlist will be shared with all members of this group.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Setlist Name */}
          <div className="space-y-1.5">
            <label htmlFor="setlist-name-input" className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
              Setlist Name
            </label>
            <input
              id="setlist-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={setlistType === 'group' ? 'e.g. Chorus Competition Set 2026' : 'e.g. Spring Contest 2026, Quartet Opener...'}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] placeholder:text-[#573657]/60 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757] text-sm transition-all"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{error}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] text-[#3E2843] hover:text-[#1C121F] text-xs font-bold border border-[rgba(62,40,67,0.12)] transition-colors cursor-pointer"
              id="cancel-create-setlist-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white text-xs font-extrabold shadow-md shadow-[#FF5757]/20 border border-red-400/30 transition-all cursor-pointer flex items-center gap-1.5"
              id="submit-create-setlist-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create {setlistType === 'group' ? 'Group Setlist' : 'Setlist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 2. Add Track to Setlist Modal
// -------------------------------------------------------------
interface AddToSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  setlists: Setlist[];
  onAddToSetlist: (setlistId: string, songId: string) => void;
  onCreateAndAdd: (newSetlistName: string, songId: string, type?: 'personal' | 'group', groupId?: string, groupName?: string) => void;
  adminGroups?: TrackappellaGroup[];
}

export const AddToSetlistModal: React.FC<AddToSetlistModalProps> = ({
  isOpen,
  onClose,
  song,
  setlists,
  onAddToSetlist,
  onCreateAndAdd,
  adminGroups = []
}) => {
  const [selectedSetlistId, setSelectedSetlistId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [newSetlistType, setNewSetlistType] = useState<'personal' | 'group'>('personal');
  const [newSetlistGroupId, setNewSetlistGroupId] = useState<string>('');
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasAdminGroups = adminGroups.length > 0;

  const personalSetlists = setlists.filter(s => !s.type || s.type === 'personal');
  const groupSetlists = setlists.filter(s => s.type === 'group');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSaveSuccess(false);
      setIsCreatingNew(false);
      setNewSetlistName('');
      setNewSetlistType('personal');
      if (adminGroups.length > 0) {
        setNewSetlistGroupId(adminGroups[0].id);
      }

      if (setlists.length > 0) {
        // Default to first setlist that doesn't already have this song, or first setlist
        const notIncluded = setlists.find(s => song && !s.songIds.includes(song.id));
        setSelectedSetlistId(notIncluded ? notIncluded.id : setlists[0].id);
      } else {
        setSelectedSetlistId('');
        setIsCreatingNew(true);
      }
    }
  }, [isOpen, setlists, song, adminGroups]);

  if (!isOpen || !song) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      const trimmed = newSetlistName.trim();
      if (!trimmed) {
        setError('Please enter a setlist name.');
        return;
      }
      if (newSetlistType === 'group') {
        const grp = adminGroups.find(g => g.id === newSetlistGroupId);
        onCreateAndAdd(trimmed, song.id, 'group', grp?.id, grp?.name);
      } else {
        onCreateAndAdd(trimmed, song.id, 'personal');
      }
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      if (!selectedSetlistId) {
        setError('Please select a setlist.');
        return;
      }
      onAddToSetlist(selectedSetlistId, song.id);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200"
      id="add-to-setlist-modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-[#1C121F] animate-in zoom-in-95 duration-150"
        id="add-to-setlist-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#DFCCCF] border-b border-[rgba(62,40,67,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-[#FF5757] flex items-center justify-center shadow-xs">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1C121F] tracking-tight font-display">
                Add to Setlist
              </h2>
              <p className="text-xs text-[#573657]">
                Save arrangement to your personal or group repertoire
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] transition-all cursor-pointer shadow-xs"
            id="close-add-setlist-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Song Preview Banner */}
        <div className="px-6 py-3.5 bg-[#EBDDE0] border-b border-[rgba(62,40,67,0.12)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] flex items-center justify-center text-[#FF5757] font-bold shrink-0 text-xs shadow-2xs">
            {song.voicing}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-[#1C121F] truncate" title={song.title}>
              {song.title}
            </h3>
            <p className="text-xs text-[#573657] truncate">
              {song.arranger ? `Arr. ${song.arranger}` : song.voicing} • {song.type === 'tag' ? 'Tag' : 'Full Arrangement'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Option switcher tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)]">
            <button
              type="button"
              disabled={setlists.length === 0}
              onClick={() => {
                setIsCreatingNew(false);
                setError('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !isCreatingNew
                  ? 'bg-[#FF5757] text-white shadow-xs'
                  : 'text-[#3E2843] hover:text-[#1C121F] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Choose Existing ({setlists.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                setError('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isCreatingNew
                  ? 'bg-[#FF5757] text-white shadow-xs'
                  : 'text-[#3E2843] hover:text-[#1C121F]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Setlist</span>
            </button>
          </div>

          {!isCreatingNew ? (
            /* Choose Existing Dropdown/List */
            <div className="space-y-2">
              <label htmlFor="select-setlist-dropdown" className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                Select Setlist
              </label>
              <div className="relative">
                <select
                  id="select-setlist-dropdown"
                  value={selectedSetlistId}
                  onChange={(e) => {
                    setSelectedSetlistId(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] text-sm focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757] cursor-pointer transition-all"
                >
                  {personalSetlists.length > 0 && (
                    <optgroup label="Personal Setlists">
                      {personalSetlists.map((sl) => {
                        const alreadyHas = sl.songIds.includes(song.id);
                        return (
                          <option key={sl.id} value={sl.id}>
                            {sl.name} ({sl.songIds.length} {sl.songIds.length === 1 ? 'track' : 'tracks'}){alreadyHas ? ' — Already added' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}

                  {groupSetlists.length > 0 && (
                    <optgroup label="Group Setlists (Administered Groups)">
                      {groupSetlists.map((sl) => {
                        const alreadyHas = sl.songIds.includes(song.id);
                        return (
                          <option key={sl.id} value={sl.id}>
                            👥 {sl.name} [{sl.groupName || 'Group'}] ({sl.songIds.length} {sl.songIds.length === 1 ? 'track' : 'tracks'}){alreadyHas ? ' — Already added' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>

              {selectedSetlistId && (() => {
                const sl = setlists.find(s => s.id === selectedSetlistId);
                if (sl && sl.songIds.includes(song.id)) {
                  return (
                    <p className="text-[11px] text-amber-800 flex items-center gap-1 mt-1 font-semibold">
                      <span>✓</span> This arrangement is already in "{sl.name}". Saving will confirm.
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            /* Create New Setlist input right inside modal */
            <div className="space-y-3">
              {hasAdminGroups && (
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)]">
                  <button
                    type="button"
                    onClick={() => setNewSetlistType('personal')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer ${
                      newSetlistType === 'personal'
                        ? 'bg-[#FF5757] text-white'
                        : 'text-[#3E2843] hover:text-[#1C121F]'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSetlistType('group')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1 ${
                      newSetlistType === 'group'
                        ? 'bg-[#543850] text-white'
                        : 'text-[#3E2843] hover:text-[#1C121F]'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Group</span>
                  </button>
                </div>
              )}

              {newSetlistType === 'group' && hasAdminGroups && (
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#3E2843] font-bold">
                    Group:
                  </label>
                  <select
                    value={newSetlistGroupId}
                    onChange={(e) => setNewSetlistGroupId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] text-xs"
                  >
                    {adminGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="new-setlist-inline-input" className="block text-xs font-bold text-[#3E2843] uppercase tracking-wider font-mono">
                  New Setlist Name
                </label>
                <input
                  id="new-setlist-inline-input"
                  type="text"
                  value={newSetlistName}
                  onChange={(e) => {
                    setNewSetlistName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={newSetlistType === 'group' ? 'e.g. Quartet Regional Set' : 'e.g. Festival Set, Barbershop Repertoire...'}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1E4E7] border border-[rgba(62,40,67,0.18)] text-[#1C121F] placeholder:text-[#573657]/60 focus:outline-none focus:border-[#FF5757] focus:ring-1 focus:ring-[#FF5757] text-sm transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 mt-1 font-semibold">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] text-[#3E2843] hover:text-[#1C121F] text-xs font-bold border border-[rgba(62,40,67,0.12)] transition-colors cursor-pointer"
              id="cancel-add-setlist-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#FF5757] hover:bg-[#ff4040] active:bg-[#e03838] text-white text-xs font-extrabold shadow-md shadow-[#FF5757]/20 border border-red-400/30 transition-all cursor-pointer flex items-center gap-1.5"
              id="submit-add-setlist-btn"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save to Setlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// 3. Delete Setlist Confirmation Modal
// -------------------------------------------------------------
interface DeleteSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  setlist: Setlist | null;
  onConfirmDelete: (setlistId: string) => void;
}

export const DeleteSetlistModal: React.FC<DeleteSetlistModalProps> = ({
  isOpen,
  onClose,
  setlist,
  onConfirmDelete
}) => {
  if (!isOpen || !setlist) return null;

  const handleDelete = () => {
    onConfirmDelete(setlist.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200"
      id="delete-setlist-modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#DFCCCF] border border-[rgba(62,40,67,0.18)] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-[#1C121F] animate-in zoom-in-95 duration-150"
        id="delete-setlist-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#DFCCCF] border-b border-[rgba(62,40,67,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1C121F] tracking-tight font-display">
                Delete Setlist
              </h2>
              <p className="text-xs text-[#573657]">
                Confirm setlist removal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] border border-[rgba(62,40,67,0.12)] text-[#3E2843] hover:text-[#1C121F] transition-all cursor-pointer shadow-xs"
            id="close-delete-setlist-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-[#1C121F]">
          <p className="text-sm leading-relaxed">
            Are you sure you want to delete the setlist <strong className="text-[#1C121F] font-bold">"{setlist.name}"</strong>?
          </p>
          <div className="p-4 rounded-2xl bg-[#EBDDE0] border border-[rgba(62,40,67,0.12)] text-xs text-[#3E2843] space-y-1">
            <p className="font-bold text-[#1C121F]">Arrangements will remain safe:</p>
            <p className="text-[#573657]">
              All {setlist.songIds.length} tracks will stay in the catalog and your favorites list. Only this setlist grouping will be deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBDDE0] hover:bg-[#F1E4E7] text-[#3E2843] hover:text-[#1C121F] text-xs font-bold border border-[rgba(62,40,67,0.12)] transition-colors cursor-pointer"
              id="cancel-delete-setlist-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/20 transition-all cursor-pointer flex items-center gap-1.5"
              id="confirm-delete-setlist-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Setlist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
