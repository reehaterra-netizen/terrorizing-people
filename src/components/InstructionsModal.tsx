import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎮</span> How to Play
          </h2>
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

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="font-bold text-rose-400">1.</span>
            <div>
              <strong className="text-white">Put Anyone on the Ragdoll:</strong> Tap{' '}
              <span className="text-rose-400 font-semibold">Change Victim</span> to upload a picture of a boss, loud neighbor, or annoying friend. Adjust the zoom and crop to fit their face on the ragdoll!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-rose-400">2.</span>
            <div>
              <strong className="text-white">Throw & Fling:</strong> Use the{' '}
              <span className="text-sky-400 font-semibold">Grab & Fling</span> tool to grab any limb, fling them against the padded walls, or toss them into the ceiling.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-rose-400">3.</span>
            <div>
              <strong className="text-white">Unleash Comic Arsenal:</strong> Tap any tool on the bottom dock—drop 500-lb anvils, launch rotten tomatoes, place TNT sticks, fire homing rockets, slap their face, or shock them with Tesla bolts!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-rose-400">4.</span>
            <div>
              <strong className="text-white">Build Stress Combos:</strong> Rapid attacks build your combo multiplier and catharsis points. Tap <span className="text-emerald-400 font-semibold">Clean Ragdoll</span> to wipe off tomato splats and bandages anytime.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95"
          >
            Start Relieving Stress
          </button>
        </div>
      </div>
    </div>
  );
};
