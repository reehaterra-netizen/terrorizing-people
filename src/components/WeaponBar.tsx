import React, { useState } from 'react';
import { WeaponId, WeaponCategory } from '../types/game';
import { WEAPONS } from '../game/weapons';
import { WeaponIcon } from './WeaponIcon';

interface WeaponBarProps {
  activeWeapon: WeaponId;
  onSelectWeapon: (id: WeaponId) => void;
}

export const WeaponBar: React.FC<WeaponBarProps> = ({
  activeWeapon,
  onSelectWeapon,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WeaponCategory | 'all'>('all');

  const categories: Array<{ id: WeaponCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Tools' },
    { id: 'kinetic', label: 'Impact' },
    { id: 'ballistic', label: 'Heavy Weapons' },
    { id: 'comic', label: 'Pranks & Humiliation' },
  ];

  const filteredWeapons = selectedCategory === 'all'
    ? WEAPONS
    : WEAPONS.filter((w) => w.category === selectedCategory);

  return (
    <footer className="w-full bg-slate-900/95 border-t border-slate-800 text-white backdrop-blur-md px-3 py-2 z-20 shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:block whitespace-nowrap">
            {WEAPONS.find((w) => w.id === activeWeapon)?.description}
          </div>
        </div>

        {/* Weapons Carousel / Grid */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredWeapons.map((weapon) => {
            const isActive = activeWeapon === weapon.id;
            return (
              <button
                key={weapon.id}
                onClick={() => onSelectWeapon(weapon.id)}
                className={`group relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] h-[64px] px-2 rounded-xl transition-all duration-150 shrink-0 select-none ${
                  isActive
                    ? 'bg-gradient-to-b from-rose-500/20 to-rose-600/30 border-2 border-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.03]'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:bg-slate-850 hover:border-slate-600 active:scale-95'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
                    isActive ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  <WeaponIcon id={weapon.id} size={24} />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-center truncate w-full mt-0.5">
                  {weapon.name}
                </span>

                {/* Subtle category dot */}
                {weapon.category === 'ballistic' && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
                {weapon.category === 'comic' && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
