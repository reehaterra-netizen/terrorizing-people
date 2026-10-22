import React, { useState, useRef } from 'react';
import { CharacterTarget } from '../types/game';
import { saveCustomCharacter, deleteCustomCharacter } from '../game/characters';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterTarget[];
  activeCharacterId: string;
  onSelectCharacter: (char: CharacterTarget) => void;
  onCharactersUpdated: (chars: CharacterTarget[]) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  activeCharacterId,
  onSelectCharacter,
  onCharactersUpdated,
}) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');

  // Form state for creating custom target
  const [name, setName] = useState('');
  const [annoyance, setAnnoyance] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [shirtColor, setShirtColor] = useState('#2563eb');
  const [pantsColor, setPantsColor] = useState('#1e293b');
  const [quotesInput, setQuotesInput] = useState('Why me?!, Stop it!, I am reporting this!');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoDataUrl(event.target?.result as string);
        setZoom(1.0);
        setOffsetX(0);
        setOffsetY(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use uploaded photo or default comic avatar
    const finalPhoto =
      photoDataUrl ||
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f43f5e"/><text x="50" y="60" font-size="45" text-anchor="middle" fill="white">😡</text></svg>';

    const parsedQuotes = quotesInput
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean);

    const newTarget: CharacterTarget = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      annoyance: annoyance.trim() || 'General high-level annoyance',
      photoUrl: finalPhoto,
      crop: {
        zoom,
        offsetX,
        offsetY,
      },
      quotes: parsedQuotes.length > 0 ? parsedQuotes : ['Ouch!', 'Have mercy!'],
      shirtColor,
      pantsColor,
    };

    const updated = saveCustomCharacter(newTarget);
    onCharactersUpdated(updated);
    onSelectCharacter(newTarget);
    setMode('list');
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCustomCharacter(id);
    onCharactersUpdated(updated);
    if (activeCharacterId === id) {
      onSelectCharacter(updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'list' ? 'Choose Your Ragdoll Target' : 'Create Custom Annoyance'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'list'
                ? 'Select who to put in the ragdoll test chamber or add someone new'
                : 'Upload a picture of anyone who annoys you to put their face on the ragdoll'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {mode === 'list' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Available Targets</span>
                <button
                  onClick={() => setMode('create')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Your Own Person
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {characters.map((char) => {
                  const isSelected = char.id === activeCharacterId;
                  const isCustom = char.id.startsWith('custom-');

                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        onSelectCharacter(char);
                        onClose();
                      }}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500'
                          : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={char.photoUrl}
                        alt={char.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{char.name}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{char.annoyance}</div>
                      </div>

                      {isCustom && (
                        <button
                          onClick={(e) => handleDelete(char.id, e)}
                          title="Delete Target"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveCustom} className="space-y-4">
              {/* Photo Upload & Preview Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/80">
                {/* Circular Mask Preview */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 shadow-lg bg-slate-950 flex items-center justify-center shrink-0">
                    {photoDataUrl ? (
                      <img
                        src={photoDataUrl}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform"
                        style={{
                          transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                        }}
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Head Preview</span>
                </div>

                {/* Upload Controls & Sliders */}
                <div className="flex-1 w-full space-y-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {photoDataUrl ? 'Choose Different Photo' : 'Upload Face Photo'}
                    </button>
                  </div>

                  {photoDataUrl && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Zoom</span>
                        <span className="tabular-nums">{zoom.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />

                      <div className="flex gap-3 pt-1">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Pan X</span>
                            <span className="tabular-nums">{offsetX}px</span>
                          </div>
                          <input
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={offsetX}
                            onChange={(e) => setOffsetX(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Pan Y</span>
                            <span className="tabular-nums">{offsetY}px</span>
                          </div>
                          <input
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={offsetY}
                            onChange={(e) => setOffsetY(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Annoyance Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Name / Nickname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Roommate Dave"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Their Annoying Habit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chews loudly during phone calls"
                    value={annoyance}
                    onChange={(e) => setAnnoyance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Clothes Color Customization */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Shirt Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shirtColor}
                      onChange={(e) => setShirtColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-mono">{shirtColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pants Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pantsColor}
                      onChange={(e) => setPantsColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-mono">{pantsColor}</span>
                  </div>
                </div>
              </div>

              {/* Annoying Catchphrases */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  What do they say when hit? (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. It was not me!, Can we circle back?, Stop!"
                  value={quotesInput}
                  onChange={(e) => setQuotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95"
                >
                  Save & Use Ragdoll
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
