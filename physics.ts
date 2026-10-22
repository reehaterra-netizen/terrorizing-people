import { Point, Constraint } from '../types/game';
import { sounds } from './audio';

export interface RagdollState {
  points: Point[];
  constraints: Constraint[];
  isDragging: boolean;
  dragPointIndex: number | null;
  dragTargetX: number;
  dragTargetY: number;
  throwVx: number;
  throwVy: number;
  gravityY: number;
  gravityX: number;
  health: number; // 0 to 100
  dizzyTimer: number; // seconds
  shockTimer: number; // seconds
  zapTimer: number; // for electrical skeleton
  totalCatharsisScore: number;
  comboCount: number;
  lastHitTime: number;
  speechText: string | null;
  speechTimer: number;
  splatsOnDoll: Array<{
    pointIndex: number;
    dx: number;
    dy: number;
    radius: number;
    color: string;
    opacity: number;
  }>;
}

export function createInitialRagdoll(centerX: number, centerY: number, scale = 1.0): RagdollState {
  const s = scale;
  const p: Point[] = [
    // 0: Head
    { x: centerX, y: centerY - 95 * s, oldX: centerX, oldY: centerY - 95 * s, radius: 30 * s, mass: 1.2, name: 'head' },
    // 1: Neck
    { x: centerX, y: centerY - 62 * s, oldX: centerX, oldY: centerY - 62 * s, radius: 10 * s, mass: 0.8, name: 'neck' },
    // 2: Chest
    { x: centerX, y: centerY - 32 * s, oldX: centerX, oldY: centerY - 32 * s, radius: 16 * s, mass: 2.0, name: 'chest' },
    // 3: Pelvis / Hips
    { x: centerX, y: centerY + 18 * s, oldX: centerX, oldY: centerY + 18 * s, radius: 15 * s, mass: 2.2, name: 'pelvis' },

    // Left Arm (Screen Left)
    // 4: Left Shoulder
    { x: centerX - 24 * s, y: centerY - 48 * s, oldX: centerX - 24 * s, oldY: centerY - 48 * s, radius: 9 * s, mass: 0.7, name: 'left_shoulder' },
    // 5: Left Elbow
    { x: centerX - 46 * s, y: centerY - 20 * s, oldX: centerX - 46 * s, oldY: centerY - 20 * s, radius: 8 * s, mass: 0.6, name: 'left_elbow' },
    // 6: Left Hand
    { x: centerX - 62 * s, y: centerY + 0 * s, oldX: centerX - 62 * s, oldY: centerY + 0 * s, radius: 8 * s, mass: 0.5, name: 'left_hand' },

    // Right Arm (Screen Right)
    // 7: Right Shoulder
    { x: centerX + 24 * s, y: centerY - 48 * s, oldX: centerX + 24 * s, oldY: centerY - 48 * s, radius: 9 * s, mass: 0.7, name: 'right_shoulder' },
    // 8: Right Elbow
    { x: centerX + 46 * s, y: centerY - 20 * s, oldX: centerX + 46 * s, oldY: centerY - 20 * s, radius: 8 * s, mass: 0.6, name: 'right_elbow' },
    // 9: Right Hand
    { x: centerX + 62 * s, y: centerY + 0 * s, oldX: centerX + 62 * s, oldY: centerY + 0 * s, radius: 8 * s, mass: 0.5, name: 'right_hand' },

    // Left Leg (Screen Left)
    // 10: Left Hip
    { x: centerX - 16 * s, y: centerY + 24 * s, oldX: centerX - 16 * s, oldY: centerY + 24 * s, radius: 10 * s, mass: 1.0, name: 'left_hip' },
    // 11: Left Knee
    { x: centerX - 20 * s, y: centerY + 70 * s, oldX: centerX - 20 * s, oldY: centerY + 70 * s, radius: 9 * s, mass: 0.9, name: 'left_knee' },
    // 12: Left Foot
    { x: centerX - 22 * s, y: centerY + 115 * s, oldX: centerX - 22 * s, oldY: centerY + 115 * s, radius: 9 * s, mass: 0.7, name: 'left_foot' },

    // Right Leg (Screen Right)
    // 13: Right Hip
    { x: centerX + 16 * s, y: centerY + 24 * s, oldX: centerX + 16 * s, oldY: centerY + 24 * s, radius: 10 * s, mass: 1.0, name: 'right_hip' },
    // 14: Right Knee
    { x: centerX + 20 * s, y: centerY + 70 * s, oldX: centerX + 20 * s, oldY: centerY + 70 * s, radius: 9 * s, mass: 0.9, name: 'right_knee' },
    // 15: Right Foot
    { x: centerX + 22 * s, y: centerY + 115 * s, oldX: centerX + 22 * s, oldY: centerY + 115 * s, radius: 9 * s, mass: 0.7, name: 'right_foot' },
  ];

  const makeC = (p1: number, p2: number, stiffness = 1.0, width = 6): Constraint => {
    const dx = p[p1].x - p[p2].x;
    const dy = p[p1].y - p[p2].y;
    return {
      p1,
      p2,
      length: Math.sqrt(dx * dx + dy * dy),
      stiffness,
      width: width * s,
    };
  };

  const constraints: Constraint[] = [
    // Spine & Neck
    makeC(0, 1, 1.0, 10), // Head to Neck
    makeC(1, 2, 1.0, 14), // Neck to Chest
    makeC(2, 3, 1.0, 16), // Chest to Pelvis
    makeC(1, 3, 0.9, 8),  // Neck to Pelvis (Spine stabilizer)

    // Left Arm
    makeC(2, 4, 1.0, 12), // Chest to L Shoulder
    makeC(4, 5, 0.95, 9), // L Shoulder to L Elbow
    makeC(5, 6, 0.95, 7), // L Elbow to L Hand

    // Right Arm
    makeC(2, 7, 1.0, 12), // Chest to R Shoulder
    makeC(7, 8, 0.95, 9), // R Shoulder to R Elbow
    makeC(8, 9, 0.95, 7), // R Elbow to R Hand

    // Shoulders cross support
    makeC(4, 7, 0.95, 10), // L Shoulder to R Shoulder

    // Left Leg
    makeC(3, 10, 1.0, 12),  // Pelvis to L Hip
    makeC(10, 11, 0.95, 10), // L Hip to L Knee
    makeC(11, 12, 0.95, 9),  // L Knee to L Foot

    // Right Leg
    makeC(3, 13, 1.0, 12),  // Pelvis to R Hip
    makeC(13, 14, 0.95, 10), // R Hip to R Knee
    makeC(14, 15, 0.95, 9),  // R Knee to R Foot

    // Hips cross support
    makeC(10, 13, 0.95, 12), // L Hip to R Hip

    // Torso diagonally to hips for natural upright torso integrity
    makeC(4, 13, 0.85, 4),
    makeC(7, 10, 0.85, 4),
  ];

  return {
    points: p,
    constraints,
    isDragging: false,
    dragPointIndex: null,
    dragTargetX: centerX,
    dragTargetY: centerY,
    throwVx: 0,
    throwVy: 0,
    gravityY: 0.55,
    gravityX: 0,
    health: 100,
    dizzyTimer: 0,
    shockTimer: 0,
    zapTimer: 0,
    totalCatharsisScore: 0,
    comboCount: 0,
    lastHitTime: 0,
    speechText: null,
    speechTimer: 0,
    splatsOnDoll: [],
  };
}

export function updateRagdollPhysics(
  ragdoll: RagdollState,
  bounds: { width: number; height: number; groundY?: number },
  deltaTime: number
) {
  const damping = 0.985;
  const restitution = 0.45;
  const wallFriction = 0.92;
  const groundY = bounds.groundY ?? (bounds.height - 30);
  const wallLeft = 20;
  const wallRight = bounds.width - 20;
  const ceiling = 20;

  // Decrease timers
  if (ragdoll.dizzyTimer > 0) ragdoll.dizzyTimer = Math.max(0, ragdoll.dizzyTimer - deltaTime);
  if (ragdoll.shockTimer > 0) ragdoll.shockTimer = Math.max(0, ragdoll.shockTimer - deltaTime);
  if (ragdoll.zapTimer > 0) ragdoll.zapTimer = Math.max(0, ragdoll.zapTimer - deltaTime);
  if (ragdoll.speechTimer > 0) {
    ragdoll.speechTimer -= deltaTime;
    if (ragdoll.speechTimer <= 0) ragdoll.speechText = null;
  }

  // Decay combo if no hit for 2.5s
  if (Date.now() - ragdoll.lastHitTime > 2500 && ragdoll.comboCount > 0) {
    ragdoll.comboCount = 0;
  }

  // Update Points Verlet Integration
  for (let i = 0; i < ragdoll.points.length; i++) {
    const p = ragdoll.points[i];

    // If currently dragged, apply spring pulling force to mouse/touch target
    if (ragdoll.isDragging && ragdoll.dragPointIndex === i) {
      const springK = 0.35;
      const dx = ragdoll.dragTargetX - p.x;
      const dy = ragdoll.dragTargetY - p.y;
      p.x += dx * springK;
      p.y += dy * springK;

      // Track throw velocity
      ragdoll.throwVx = dx * 0.4;
      ragdoll.throwVy = dy * 0.4;
      continue;
    }

    if (p.pinned) continue;

    const vx = (p.x - p.oldX) * damping;
    const vy = (p.y - p.oldY) * damping;

    p.oldX = p.x;
    p.oldY = p.y;

    // Apply gravity and electrical jitter if zapped
    let jitterX = 0;
    let jitterY = 0;
    if (ragdoll.zapTimer > 0) {
      jitterX = (Math.random() - 0.5) * 8;
      jitterY = (Math.random() - 0.5) * 8;
    }

    p.x += vx + ragdoll.gravityX + jitterX;
    p.y += vy + ragdoll.gravityY + jitterY;

    // Boundary Collisions & Bounce
    const r = p.radius;

    // Ground
    if (p.y + r > groundY) {
      const impactSpeed = Math.abs(vy);
      p.y = groundY - r;
      p.oldY = p.y + vy * restitution;
      p.oldX = p.x - vx * wallFriction;
      if (impactSpeed > 7 && (i === 0 || i === 2)) {
        sounds.playBounce(impactSpeed);
      }
    }

    // Left wall
    if (p.x - r < wallLeft) {
      const impactSpeed = Math.abs(vx);
      p.x = wallLeft + r;
      p.oldX = p.x + vx * restitution;
      if (impactSpeed > 7 && (i === 0 || i === 2)) {
        sounds.playBounce(impactSpeed);
      }
    }

    // Right wall
    if (p.x + r > wallRight) {
      const impactSpeed = Math.abs(vx);
      p.x = wallRight - r;
      p.oldX = p.x + vx * restitution;
      if (impactSpeed > 7 && (i === 0 || i === 2)) {
        sounds.playBounce(impactSpeed);
      }
    }

    // Ceiling
    if (p.y - r < ceiling) {
      p.y = ceiling + r;
      p.oldY = p.y + vy * restitution;
    }
  }

  // Relaxation iterations for constraints (solve springs/sticks)
  const iterations = 6;
  for (let iter = 0; iter < iterations; iter++) {
    for (const c of ragdoll.constraints) {
      const p1 = ragdoll.points[c.p1];
      const p2 = ragdoll.points[c.p2];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      if (currentDist === 0) continue;

      const diff = (currentDist - c.length) / currentDist;
      const offsetX = dx * 0.5 * diff * c.stiffness;
      const offsetY = dy * 0.5 * diff * c.stiffness;

      const p1Dragged = ragdoll.isDragging && ragdoll.dragPointIndex === c.p1;
      const p2Dragged = ragdoll.isDragging && ragdoll.dragPointIndex === c.p2;

      if (!p1.pinned && !p1Dragged) {
        p1.x += offsetX;
        p1.y += offsetY;
      }
      if (!p2.pinned && !p2Dragged) {
        p2.x -= offsetX;
        p2.y -= offsetY;
      }
    }
  }
}

// Apply explosive radial blast
export function applyExplosionForce(
  ragdoll: RagdollState,
  centerX: number,
  centerY: number,
  radius: number,
  strength: number
) {
  for (const p of ragdoll.points) {
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
      const falloff = 1 - dist / radius;
      const force = falloff * strength * (1.5 / p.mass);
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.2;
      p.x += Math.cos(angle) * force;
      p.y += Math.sin(angle) * force - force * 0.4; // slight upward pop
      p.oldX -= Math.cos(angle) * force * 0.8;
      p.oldY -= Math.sin(angle) * force * 0.8;
    }
  }
  ragdoll.dizzyTimer = 2.5;
  ragdoll.shockTimer = 1.8;
}

// Apply directional punch / impulse to a specific or closest point
export function applyImpulse(
  ragdoll: RagdollState,
  targetX: number,
  targetY: number,
  forceX: number,
  forceY: number,
  targetPointIdx?: number
) {
  let bestIdx = targetPointIdx ?? 0;
  if (targetPointIdx === undefined) {
    let minDist = Infinity;
    for (let i = 0; i < ragdoll.points.length; i++) {
      const d = Math.hypot(ragdoll.points[i].x - targetX, ragdoll.points[i].y - targetY);
      if (d < minDist) {
        minDist = d;
        bestIdx = i;
      }
    }
  }

  const p = ragdoll.points[bestIdx];
  p.x += forceX * 0.6;
  p.y += forceY * 0.6;
  p.oldX -= forceX * 0.4;
  p.oldY -= forceY * 0.4;

  // Propagate secondary impulse to neighbors
  for (const c of ragdoll.constraints) {
    if (c.p1 === bestIdx) {
      ragdoll.points[c.p2].oldX -= forceX * 0.15;
      ragdoll.points[c.p2].oldY -= forceY * 0.15;
    } else if (c.p2 === bestIdx) {
      ragdoll.points[c.p1].oldX -= forceX * 0.15;
      ragdoll.points[c.p1].oldY -= forceY * 0.15;
    }
  }

  ragdoll.dizzyTimer = Math.max(ragdoll.dizzyTimer, 1.2);
}

// Find closest ragdoll point within threshold
export function findClosestPoint(
  ragdoll: RagdollState,
  x: number,
  y: number,
  maxDistance = 60
): { index: number; dist: number } | null {
  let closestIdx = -1;
  let minDist = maxDistance;

  for (let i = 0; i < ragdoll.points.length; i++) {
    const p = ragdoll.points[i];
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  if (closestIdx !== -1) {
    return { index: closestIdx, dist: minDist };
  }
  return null;
}

// Check if a point is inside the ragdoll's head
export function isPointInHead(ragdoll: RagdollState, x: number, y: number): boolean {
  const head = ragdoll.points[0];
  return Math.hypot(head.x - x, head.y - y) <= head.radius * 1.25;
}
