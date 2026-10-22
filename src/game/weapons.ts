import { WeaponDef, WeaponId } from '../types/game';

export const WEAPONS: WeaponDef[] = [
  // Kinetic & Impact
  {
    id: 'drag',
    name: 'Grab & Fling',
    category: 'kinetic',
    description: 'Grab any limb and toss them violently against the walls or ceiling',
    iconName: 'hand',
    damage: 15,
    cooldownMs: 0,
  },
  {
    id: 'slap',
    name: 'The Mega Slap',
    category: 'kinetic',
    description: 'Rapid-fire face slaps with crisp comic crack sounds',
    iconName: 'slap',
    damage: 35,
    cooldownMs: 80,
  },
  {
    id: 'mallet',
    name: 'Squeaky Mallet',
    category: 'kinetic',
    description: 'Giant cartoon hammer with ridiculous knockback and high-pitch squeak',
    iconName: 'hammer',
    damage: 120,
    cooldownMs: 250,
  },
  {
    id: 'boxing_glove',
    name: 'Spring Boxing Glove',
    category: 'kinetic',
    description: 'Accordion-spring loaded boxing glove that punches them across the room',
    iconName: 'boxing',
    damage: 150,
    cooldownMs: 300,
  },

  // Ballistics & Explosives
  {
    id: 'dynamite',
    name: 'TNT Dynamite',
    category: 'ballistic',
    description: 'Placeable explosive with burning fuse that triggers massive blast wave',
    iconName: 'bomb',
    damage: 250,
    cooldownMs: 400,
  },
  {
    id: 'rocket',
    name: 'Homing Firework',
    category: 'ballistic',
    description: 'Whistling rocket that tracks towards the ragdoll and explodes in starbursts',
    iconName: 'rocket',
    damage: 200,
    cooldownMs: 350,
  },
  {
    id: 'anvil',
    name: '500-Ton Anvil',
    category: 'ballistic',
    description: 'Classic Looney Tunes heavy anvil dropped from the ceiling with CLANG',
    iconName: 'anvil',
    damage: 300,
    cooldownMs: 500,
  },
  {
    id: 'laser',
    name: 'Plasma Blaster',
    category: 'ballistic',
    description: 'Sizzling continuous laser beams that send sparks flying',
    iconName: 'laser',
    damage: 40,
    cooldownMs: 60,
  },

  // Comedic & Annoyances
  {
    id: 'tomato',
    name: 'Rotten Tomato',
    category: 'comic',
    description: 'Juicy squelching red tomatoes that splatter permanently across their face',
    iconName: 'tomato',
    damage: 50,
    cooldownMs: 120,
  },
  {
    id: 'pie',
    name: 'Whipped Cream Pie',
    category: 'comic',
    description: 'Flying cream pie that blinds them and drips custard everywhere',
    iconName: 'pie',
    damage: 60,
    cooldownMs: 180,
  },
  {
    id: 'tesla',
    name: 'Tesla Shock Wand',
    category: 'comic',
    description: 'High-voltage electric zaps that make their limbs spasm and skeleton glow',
    iconName: 'zap',
    damage: 75,
    cooldownMs: 100,
  },
  {
    id: 'rubber_chicken',
    name: 'Rubber Chicken',
    category: 'comic',
    description: 'Bouncing screaming rubber chicken mortar with hilarious honks',
    iconName: 'chicken',
    damage: 70,
    cooldownMs: 200,
  },
  {
    id: 'tornado',
    name: 'Vortex Blower',
    category: 'comic',
    description: 'Miniature cyclone that sweeps them off their feet and spins them',
    iconName: 'wind',
    damage: 80,
    cooldownMs: 250,
  },

  // Relief & Reset
  {
    id: 'sponge',
    name: 'Magic First-Aid Sponge',
    category: 'relief',
    description: 'Cleans off all tomato splats, pies, and bruises, soothing their ego',
    iconName: 'sponge',
    damage: 0,
    cooldownMs: 100,
  },
];

export function getWeapon(id: WeaponId): WeaponDef {
  const found = WEAPONS.find((w) => w.id === id);
  return found || WEAPONS[0];
}
