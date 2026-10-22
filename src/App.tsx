import React, { useState, useEffect } from 'react';
import { CharacterTarget, WeaponId } from './types/game';
import {
  loadAllCharacters,
  getActiveCharacterId,
  setActiveCharacterId,
} from './game/characters';
import { sounds } from './game/audio';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { WeaponBar } from './components/WeaponBar';
import { CharacterModal } from './components/CharacterModal';
import { InstructionsModal } from './components/InstructionsModal';

export default function App() {
  const [characters, setCharacters] = useState<CharacterTarget[]>([]);
  const [activeCharId, setActiveCharId] = useState<string>('');
  const [activeWeapon, setActiveWeapon] = useState<WeaponId>('drag');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Initialize characters
  useEffect(() => {
    const list = loadAllCharacters();
    setCharacters(list);
    const savedId = getActiveCharacterId();
    const found = list.find((c) => c.id === savedId) || list[0];
    setActiveCharId(found.id);
  }, []);

  const activeCharacter = characters.find((c) => c.id === activeCharId) || characters[0];

  const handleSelectCharacter = (char: CharacterTarget) => {
    setActiveCharId(char.id);
    setActiveCharacterId(char.id);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleAddScore = (amount: number) => {
    setScore((prev) => prev + amount);
  };

  if (!activeCharacter) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-white font-mono">
        Loading Chamber...
      </div>
    );
  }

  return (
    <div className="w-screen h-[100dvh] flex flex-col bg-slate-950 select-none overflow-hidden touch-none font-sans">
      {/* Top Bar Contract (Wordmark, Score, Actions) */}
      <HUD
        score={score}
        combo={combo}
        activeCharacter={activeCharacter}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenCharacterModal={() => setIsCharModalOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main Ragdoll Physics Arena */}
      <main className="flex-1 relative w-full h-full min-h-0 overflow-hidden bg-slate-950">
        <GameCanvas
          activeCharacter={activeCharacter}
          activeWeapon={activeWeapon}
          onAddScore={handleAddScore}
          combo={combo}
          onUpdateCombo={setCombo}
        />
      </main>

      {/* Bottom Floating Weapon Dock */}
      <WeaponBar
        activeWeapon={activeWeapon}
        onSelectWeapon={setActiveWeapon}
      />

      {/* Target Selector & Face Uploader Modal */}
      <CharacterModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        characters={characters}
        activeCharacterId={activeCharId}
        onSelectCharacter={handleSelectCharacter}
        onCharactersUpdated={setCharacters}
      />

      {/* How to Play Guide Modal */}
      <InstructionsModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
