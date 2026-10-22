import { CharacterTarget } from '../types/game';

// Preset characters with generated comedic artwork
export const PRESET_CHARACTERS: CharacterTarget[] = [
  {
    id: 'preset-boss',
    name: 'Gregory "ASAP" Davies',
    annoyance: 'Sends 11pm Slacks & rejects time-off requests',
    photoUrl: '/src/assets/images/annoying_boss_portrait_1792669154607.jpg',
    crop: {
      zoom: 1.0,
      offsetX: 0,
      offsetY: -10,
    },
    quotes: [
      'Per my last email!',
      'Let’s take this offline!',
      'I need this EOD without fail!',
      'Can we circle back?',
      'Why wasn’t your camera on?!',
      'Ping me over the weekend!',
    ],
    shirtColor: '#334155', // dark charcoal suit
    pantsColor: '#1e293b',
  },
  {
    id: 'preset-neighbor',
    name: 'Derek "Leafblower" Miller',
    annoyance: 'Revving high-decibel yard equipment at 6:01 AM on Sundays',
    photoUrl: '/src/assets/images/annoying_neighbor_portrait_1792669154778.jpg',
    crop: {
      zoom: 1.05,
      offsetX: 0,
      offsetY: -5,
    },
    quotes: [
      'It’s my constitutional right!',
      'Turn down that TV inside your house!',
      'I am reporting this to the HOA!',
      'Leaves don’t blow themselves!',
      'You parked 2 inches over the line!',
    ],
    shirtColor: '#059669', // vibrant track jacket
    pantsColor: '#3b82f6',
  },
  {
    id: 'preset-colleague',
    name: 'Bernard "Actually" Vance',
    annoyance: 'Replies-All with 14-page essays explaining why you are wrong',
    photoUrl: '/src/assets/images/annoying_colleague_portrait_1792669155048.jpg',
    crop: {
      zoom: 1.0,
      offsetX: 0,
      offsetY: -10,
    },
    quotes: [
      'Actually, strictly speaking...',
      'Did you check cell G14 in the appendix?',
      'I replied to all so everyone is aligned.',
      'Technically, that’s not best practice.',
      'Allow me to share my screen for an hour.',
    ],
    shirtColor: '#78350f', // brown sweater vest
    pantsColor: '#475569',
  },
];

const STORAGE_KEY = 'catharsis_custom_characters_v1';
const ACTIVE_CHAR_KEY = 'catharsis_active_character_id';

export function loadAllCharacters(): CharacterTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PRESET_CHARACTERS;
    const custom: CharacterTarget[] = JSON.parse(raw);
    return [...PRESET_CHARACTERS, ...custom];
  } catch {
    return PRESET_CHARACTERS;
  }
}

export function saveCustomCharacter(character: CharacterTarget): CharacterTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const custom: CharacterTarget[] = raw ? JSON.parse(raw) : [];
    const existingIndex = custom.findIndex((c) => c.id === character.id);
    if (existingIndex >= 0) {
      custom[existingIndex] = character;
    } else {
      custom.push(character);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return [...PRESET_CHARACTERS, ...custom];
  } catch {
    return PRESET_CHARACTERS;
  }
}

export function deleteCustomCharacter(id: string): CharacterTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PRESET_CHARACTERS;
    const custom: CharacterTarget[] = JSON.parse(raw);
    const filtered = custom.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return [...PRESET_CHARACTERS, ...filtered];
  } catch {
    return PRESET_CHARACTERS;
  }
}

export function getActiveCharacterId(): string {
  try {
    return localStorage.getItem(ACTIVE_CHAR_KEY) || PRESET_CHARACTERS[0].id;
  } catch {
    return PRESET_CHARACTERS[0].id;
  }
}

export function setActiveCharacterId(id: string) {
  try {
    localStorage.setItem(ACTIVE_CHAR_KEY, id);
  } catch {
    // no-op
  }
}
