export interface Point {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned?: boolean;
  radius: number;
  mass: number;
  name?: string;
}

export interface Constraint {
  p1: number; // index of point 1
  p2: number; // index of point 2
  length: number;
  stiffness: number;
  color?: string;
  width?: number;
}

export interface CharacterTarget {
  id: string;
  name: string;
  annoyance: string;
  photoUrl: string; // data URL or asset path
  crop?: {
    zoom: number;
    offsetX: number;
    offsetY: number;
  };
  quotes: string[];
  shirtColor: string;
  pantsColor: string;
}

export type WeaponId =
  | 'drag'
  | 'slap'
  | 'mallet'
  | 'boxing_glove'
  | 'tomato'
  | 'pie'
  | 'dynamite'
  | 'rocket'
  | 'anvil'
  | 'laser'
  | 'tesla'
  | 'rubber_chicken'
  | 'tornado'
  | 'sponge';

export type WeaponCategory = 'kinetic' | 'ballistic' | 'comic' | 'relief';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: WeaponCategory;
  description: string;
  iconName: string;
  damage: number;
  cooldownMs: number;
}

export interface Projectile {
  id: string;
  type: WeaponId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  scale?: number;
  targetPointIndex?: number;
}

export interface Splat {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  relativeToRagdoll?: {
    pointIndex: number;
    dx: number;
    dy: number;
  };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'star' | 'lightning' | 'feather' | 'cream';
  text?: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface SpeechBubble {
  text: string;
  life: number;
  maxLife: number;
}
