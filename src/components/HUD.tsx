import React from 'react';
import { CharacterTarget } from '../types/game';
import { sounds } from '../game/audio';

interface HUDProps {
  score: number;
  combo: number;
  activeCharacter: CharacterTarget;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCharacterModal: () => void;
  onOpenHowToPlay: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  combo,
  activeCharacter,
  isMuted,
  onToggleMute,
  onOpenCharacterModal,
  onOpenHowToPlay,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-slate-950/90 border-b border-slate-800 text-white backdrop-blur-md z-30 shrink-0">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-lg font-black tracking-tight text-white whitespace-nowrap">
          Catharsis
        </a>
        <span className="text-xs text-slate-500 hidden md:inline">· Ragdoll Stress Sandbox</span>
      </div>

      {/* Zone 2: Stats & Catharsis Counter */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Stress Relieved:</span>
          <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>

        {combo > 1 && (
          <div className="flex items-baseline gap-1 animate-bounce">
            <span className="text-xs font-bold text-rose-400">COMBO</span>
            <span className="text-sm font-black text-rose-300 tabular-nums">
              x{combo}
            </span>
          </div>
        )}
      </div>

      {/* Zone 3: Target Selector & Audio Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <line x1="22" x2="16" y1="9" y2="15" />
              <line x1="16" x2="22" y1="9" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        <button
          onClick={onOpenHowToPlay}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors hidden sm:block"
          title="Game Guide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
        </button>

        <button
          onClick={onOpenCharacterModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors whitespace-nowrap active:scale-95"
        >
          <img
            src={activeCharacter.photoUrl}
            alt=""
            className="w-5 h-5 rounded-full object-cover border border-rose-300"
          />
          <span className="hidden sm:inline">Change Victim</span>
          <span className="sm:hidden">Target</span>
        </button>
      </div>
    </header>
  );
};
