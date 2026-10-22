import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterTarget, Projectile, Particle, FloatingText, WeaponId, Splat } from '../types/game';
import {
  RagdollState,
  createInitialRagdoll,
  updateRagdollPhysics,
  applyExplosionForce,
  applyImpulse,
  findClosestPoint,
  isPointInHead,
} from '../game/physics';
import { sounds } from '../game/audio';
import { getWeapon } from '../game/weapons';

interface GameCanvasProps {
  activeCharacter: CharacterTarget;
  activeWeapon: WeaponId;
  onAddScore: (amount: number) => void;
  onTriggerQuote?: (quote: string) => void;
  combo: number;
  onUpdateCombo: (count: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  activeCharacter,
  activeWeapon,
  onAddScore,
  combo,
  onUpdateCombo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Character head image cache
  const headImageRef = useRef<HTMLImageElement | null>(null);
  const backdropImageRef = useRef<HTMLImageElement | null>(null);

  // Ragdoll & physics state
  const ragdollRef = useRef<RagdollState | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const splatsRef = useRef<Splat[]>([]);

  // Screen shake
  const screenShakeRef = useRef<number>(0);

  // Laser beam active tracking
  const isPointerDownRef = useRef<boolean>(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastWeaponFireRef = useRef<number>(0);

  // Load character image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeCharacter.photoUrl;
    img.onload = () => {
      headImageRef.current = img;
    };
  }, [activeCharacter.photoUrl]);

  // Load arena backdrop
  useEffect(() => {
    const bg = new Image();
    bg.crossOrigin = 'anonymous';
    bg.src = '/src/assets/images/ragdoll_arena_backdrop_1792669155541.jpg';
    bg.onload = () => {
      backdropImageRef.current = bg;
    };
  }, []);

  // Helper to add comic popups
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#f59e0b', size = 20) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 20,
      vy: -2.2,
      text,
      color,
      size,
      opacity: 1,
      life: 0,
      maxLife: 45,
    });
  }, []);

  // Helper to add particles
  const addParticles = useCallback((
    x: number,
    y: number,
    count: number,
    type: Particle['type'],
    color: string,
    speed = 5
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.7 + 0.3) * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        color,
        size: Math.random() * 4 + 3,
        life: 0,
        maxLife: Math.random() * 20 + 20,
        type,
      });
    }
  }, []);

  // Trigger speech bubble from character
  const triggerCharacterQuote = useCallback(() => {
    if (!ragdollRef.current) return;
    if (ragdollRef.current.speechTimer <= 0 && activeCharacter.quotes.length > 0) {
      const randomQuote = activeCharacter.quotes[Math.floor(Math.random() * activeCharacter.quotes.length)];
      ragdollRef.current.speechText = randomQuote;
      ragdollRef.current.speechTimer = 2.5;
    }
  }, [activeCharacter.quotes]);

  // Handle damage, catharsis points, and comic feedback
  const registerImpact = useCallback((
    damage: number,
    hitX: number,
    hitY: number,
    label?: string
  ) => {
    if (!ragdollRef.current) return;
    const newCombo = combo + 1;
    onUpdateCombo(newCombo);
    ragdollRef.current.lastHitTime = Date.now();

    const catharsisScore = Math.round(damage * (1 + newCombo * 0.15));
    onAddScore(catharsisScore);

    if (label) {
      addFloatingText(label, hitX, hitY - 20, '#f43f5e', 22);
    }
    addFloatingText(`+${catharsisScore}`, hitX, hitY, '#fbbf24', 16);

    // Occasional comedic quote when hit
    if (Math.random() < 0.45) {
      triggerCharacterQuote();
    }
  }, [combo, onAddScore, onUpdateCombo, addFloatingText, triggerCharacterQuote]);

  // Initialize or resize canvas & ragdoll
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Scale ragdoll appropriately for mobile vs desktop
      const isMobile = rect.width < 640;
      const ragdollScale = isMobile ? 0.85 : 1.05;

      if (!ragdollRef.current) {
        ragdollRef.current = createInitialRagdoll(rect.width * 0.5, rect.height * 0.45, ragdollScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset doll to center
  const resetDollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const isMobile = rect.width < 640;
    const ragdollScale = isMobile ? 0.85 : 1.05;
    ragdollRef.current = createInitialRagdoll(rect.width * 0.5, rect.height * 0.45, ragdollScale);
    splatsRef.current = [];
    addFloatingText('RESTORED!', rect.width * 0.5, rect.height * 0.45, '#10b981', 24);
  }, [addFloatingText]);

  // Clean doll with sponge
  const cleanDoll = useCallback((x: number, y: number) => {
    if (!ragdollRef.current) return;
    ragdollRef.current.splatsOnDoll = [];
    splatsRef.current = [];
    ragdollRef.current.health = 100;
    ragdollRef.current.dizzyTimer = 0;
    ragdollRef.current.shockTimer = 0;
    sounds.playHealSponge();
    addParticles(x, y, 16, 'cream', '#bae6fd', 4);
    addFloatingText('CLEANSED!', x, y, '#38bdf8', 20);
  }, [addParticles, addFloatingText]);

  // Fire current weapon at position
  const fireWeapon = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !ragdollRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const doll = ragdollRef.current;
    const now = Date.now();
    const weaponDef = getWeapon(activeWeapon);

    if (now - lastWeaponFireRef.current < weaponDef.cooldownMs) {
      return;
    }
    lastWeaponFireRef.current = now;

    switch (activeWeapon) {
      case 'drag': {
        const closest = findClosestPoint(doll, x, y, 80);
        if (closest) {
          doll.isDragging = true;
          doll.dragPointIndex = closest.index;
          doll.dragTargetX = x;
          doll.dragTargetY = y;
        }
        break;
      }

      case 'slap': {
        sounds.playSlap();
        const hitHead = isPointInHead(doll, x, y);
        const impulseX = (Math.random() - 0.5) * 60;
        const impulseY = (Math.random() - 0.5) * 30 - 15;
        applyImpulse(doll, x, y, impulseX, impulseY, hitHead ? 0 : undefined);
        addParticles(x, y, 12, 'star', '#facc15', 6);
        registerImpact(weaponDef.damage, x, y, hitHead ? 'FACE SLAP!' : 'SMACK!');

        // Add comic red slap hand effect
        floatingTextsRef.current.push({
          id: Math.random().toString(),
          x,
          y,
          vy: -1,
          text: '👋 WHAP!',
          color: '#ef4444',
          size: 26,
          opacity: 1,
          life: 0,
          maxLife: 30,
        });
        break;
      }

      case 'mallet': {
        sounds.playHeavyImpact();
        sounds.playSqueak();
        screenShakeRef.current = 12;

        const head = doll.points[0];
        const dx = head.x - x;
        const hammerDir = dx > 0 ? 1 : -1;

        applyImpulse(doll, x, y, hammerDir * 90, 40);
        addParticles(x, y, 20, 'star', '#f59e0b', 8);
        registerImpact(weaponDef.damage, x, y, 'BONK!!');

        // Mallet visual projectile
        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'mallet',
          x,
          y,
          vx: hammerDir * 4,
          vy: -5,
          radius: 35,
          rotation: hammerDir * 0.4,
          vRot: hammerDir * 0.15,
          life: 0,
          maxLife: 20,
        });
        break;
      }

      case 'boxing_glove': {
        sounds.playSpring();
        sounds.playHeavyImpact();
        screenShakeRef.current = 14;

        const head = doll.points[0];
        const fromLeft = x < head.x;
        const startX = fromLeft ? 0 : rect.width;
        const gloveDir = fromLeft ? 1 : -1;

        applyImpulse(doll, head.x, head.y, gloveDir * 110, -30, 0);
        addParticles(head.x, head.y, 16, 'star', '#ef4444', 9);
        registerImpact(weaponDef.damage, head.x, head.y, 'PUNCH!!');

        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'boxing_glove',
          x: startX,
          y: head.y,
          vx: gloveDir * 24,
          vy: 0,
          radius: 32,
          rotation: 0,
          vRot: 0,
          life: 0,
          maxLife: 25,
        });
        break;
      }

      case 'tomato': {
        sounds.playRocketLaunch();
        // Spawn flying tomato from bottom corner towards click
        const startX = rect.width * 0.1;
        const startY = rect.height;
        const angle = Math.atan2(y - startY, x - startX);
        const speed = 26;

        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'tomato',
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 16,
          rotation: 0,
          vRot: 0.2,
          life: 0,
          maxLife: 60,
        });
        break;
      }

      case 'pie': {
        sounds.playRocketLaunch();
        const startX = rect.width * 0.9;
        const startY = rect.height;
        const angle = Math.atan2(y - startY, x - startX);
        const speed = 24;

        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'pie',
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 20,
          rotation: 0,
          vRot: 0.15,
          life: 0,
          maxLife: 60,
        });
        break;
      }

      case 'dynamite': {
        // Drop dynamite at location
        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'dynamite',
          x,
          y: Math.min(y, rect.height - 40),
          vx: (Math.random() - 0.5) * 4,
          vy: -6,
          radius: 18,
          rotation: 0,
          vRot: 0.1,
          life: 0,
          maxLife: 70, // explodes at end of life
        });
        addFloatingText('FUSE LIT! 💣', x, y - 30, '#ef4444', 18);
        break;
      }

      case 'rocket': {
        sounds.playRocketLaunch();
        const startX = Math.random() < 0.5 ? 0 : rect.width;
        const startY = rect.height * 0.3;
        const angle = Math.atan2(y - startY, x - startX);
        const speed = 20;

        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'rocket',
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 18,
          rotation: angle,
          vRot: 0,
          life: 0,
          maxLife: 70,
        });
        break;
      }

      case 'anvil': {
        // Drop 500-lb anvil from sky directly above
        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'anvil',
          x,
          y: -40,
          vx: 0,
          vy: 8,
          radius: 38,
          rotation: 0,
          vRot: 0,
          life: 0,
          maxLife: 100,
        });
        addFloatingText('LOOK UP! ⬇️', x, 40, '#64748b', 18);
        break;
      }

      case 'laser': {
        sounds.playLaser();
        screenShakeRef.current = 4;
        applyImpulse(doll, x, y, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25);
        addParticles(x, y, 10, 'spark', '#38bdf8', 7);
        registerImpact(weaponDef.damage, x, y, 'ZAP!');
        break;
      }

      case 'tesla': {
        sounds.playTeslaZap();
        doll.zapTimer = 0.5;
        doll.shockTimer = 1.5;
        screenShakeRef.current = 6;
        applyImpulse(doll, x, y, (Math.random() - 0.5) * 40, -15);
        addParticles(x, y, 14, 'lightning', '#eab308', 8);
        registerImpact(weaponDef.damage, x, y, 'ELECTROCUTED!');
        break;
      }

      case 'rubber_chicken': {
        sounds.playChickenHonk();
        const startX = rect.width * 0.5;
        const startY = rect.height;
        const angle = Math.atan2(y - startY, x - startX);
        const speed = 22;

        projectilesRef.current.push({
          id: Math.random().toString(),
          type: 'rubber_chicken',
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 22,
          rotation: 0,
          vRot: 0.25,
          life: 0,
          maxLife: 80,
        });
        break;
      }

      case 'tornado': {
        sounds.playRocketLaunch();
        // Cyclone pulls doll in
        const centerX = x;
        const centerY = y;
        for (const p of doll.points) {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            const tangentAngle = Math.atan2(dy, dx) + Math.PI * 0.55;
            p.x += Math.cos(tangentAngle) * 35;
            p.y += Math.sin(tangentAngle) * 35 - 10;
          }
        }
        doll.dizzyTimer = 3.0;
        addParticles(x, y, 25, 'smoke', '#94a3b8', 6);
        registerImpact(weaponDef.damage, x, y, 'CYCLONE!');
        break;
      }

      case 'sponge': {
        cleanDoll(x, y);
        break;
      }
    }
  }, [activeWeapon, registerImpact, addFloatingText, addParticles, cleanDoll]);

  // Pointer event handlers (mouse and touch unified)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isPointerDownRef.current = true;
    pointerPosRef.current = { x: e.clientX, y: e.clientY };
    fireWeapon(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    pointerPosRef.current = { x: e.clientX, y: e.clientY };

    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !ragdollRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeWeapon === 'drag' && ragdollRef.current.isDragging) {
      ragdollRef.current.dragTargetX = x;
      ragdollRef.current.dragTargetY = y;
    } else if (activeWeapon === 'laser' || activeWeapon === 'tesla') {
      fireWeapon(e.clientX, e.clientY);
    } else if (activeWeapon === 'slap') {
      // Rapid slapping when swiping across the face
      if (isPointInHead(ragdollRef.current, x, y)) {
        fireWeapon(e.clientX, e.clientY);
      }
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (ragdollRef.current && ragdollRef.current.isDragging) {
      // Release with fling momentum
      if (ragdollRef.current.dragPointIndex !== null) {
        const p = ragdollRef.current.points[ragdollRef.current.dragPointIndex];
        p.oldX = p.x - ragdollRef.current.throwVx;
        p.oldY = p.y - ragdollRef.current.throwVy;

        // If thrown fast, play whoosh or shock
        const throwSpeed = Math.hypot(ragdollRef.current.throwVx, ragdollRef.current.throwVy);
        if (throwSpeed > 15) {
          sounds.playBounce(throwSpeed);
          ragdollRef.current.dizzyTimer = 2.0;
        }
      }
      ragdollRef.current.isDragging = false;
      ragdollRef.current.dragPointIndex = null;
    }
  };

  // Main Animation / Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const doll = ragdollRef.current;

      if (canvas && ctx && doll) {
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);

        // Screen shake
        let shakeX = 0;
        let shakeY = 0;
        if (screenShakeRef.current > 0) {
          shakeX = (Math.random() - 0.5) * screenShakeRef.current;
          shakeY = (Math.random() - 0.5) * screenShakeRef.current;
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
        }
        ctx.translate(shakeX, shakeY);

        // 1. Clear & Render Backdrop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        if (backdropImageRef.current) {
          ctx.globalAlpha = 0.45;
          ctx.drawImage(backdropImageRef.current, 0, 0, width, height);
          ctx.globalAlpha = 1.0;
        }

        // Arena padded floor line & grid
        const groundY = height - 35;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, groundY, width, 35);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < width; gx += 40) {
          ctx.moveTo(gx, groundY);
          ctx.lineTo(gx, height);
        }
        ctx.stroke();

        // 2. Update Ragdoll Physics
        updateRagdollPhysics(doll, { width, height, groundY }, dt);

        // 3. Render Wall / Ground Splats
        for (const splat of splatsRef.current) {
          ctx.save();
          ctx.fillStyle = splat.color;
          ctx.globalAlpha = splat.opacity;
          ctx.beginPath();
          ctx.arc(splat.x, splat.y, splat.radius, 0, Math.PI * 2);
          ctx.fill();
          // Small splat droplets around it
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + 0.3;
            ctx.beginPath();
            ctx.arc(
              splat.x + Math.cos(angle) * (splat.radius * 1.3),
              splat.y + Math.sin(angle) * (splat.radius * 1.3),
              splat.radius * 0.25,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          ctx.restore();
        }

        // 4. Update & Render Projectiles
        const updatedProjectiles: Projectile[] = [];
        for (const proj of projectilesRef.current) {
          proj.life++;
          proj.x += proj.vx;
          proj.y += proj.vy;
          proj.rotation += proj.vRot;

          let hasHit = false;

          // Projectile specific logic
          if (proj.type === 'tomato') {
            proj.vy += 0.4; // gravity
            // Check collision with doll
            const closest = findClosestPoint(doll, proj.x, proj.y, 45);
            if (closest || proj.y > groundY) {
              sounds.playTomatoSplat();
              hasHit = true;
              const hitX = proj.x;
              const hitY = proj.y;
              addParticles(hitX, hitY, 15, 'spark', '#ef4444', 6);
              registerImpact(50, hitX, hitY, 'SPLAT!!');

              // Add red ketchup splat
              splatsRef.current.push({
                x: hitX,
                y: hitY,
                radius: Math.random() * 12 + 16,
                color: '#dc2626',
                opacity: 0.85,
              });
              if (closest) {
                applyImpulse(doll, hitX, hitY, proj.vx * 0.8, proj.vy * 0.8, closest.index);
              }
            }
          } else if (proj.type === 'pie') {
            proj.vy += 0.4;
            const closest = findClosestPoint(doll, proj.x, proj.y, 45);
            if (closest || proj.y > groundY) {
              sounds.playTomatoSplat();
              hasHit = true;
              const hitX = proj.x;
              const hitY = proj.y;
              addParticles(hitX, hitY, 18, 'cream', '#f8fafc', 6);
              registerImpact(60, hitX, hitY, 'CREAM PIE!');

              splatsRef.current.push({
                x: hitX,
                y: hitY,
                radius: Math.random() * 14 + 18,
                color: '#fef08a',
                opacity: 0.9,
              });
              if (closest) {
                applyImpulse(doll, hitX, hitY, proj.vx * 0.7, proj.vy * 0.7, closest.index);
              }
            }
          } else if (proj.type === 'dynamite') {
            proj.vy += 0.5; // gravity
            if (proj.y + proj.radius > groundY) {
              proj.y = groundY - proj.radius;
              proj.vx *= 0.6;
              proj.vy = -proj.vy * 0.3;
            }
            // Sparking fuse particles
            if (Math.random() < 0.6) {
              addParticles(proj.x, proj.y - 14, 2, 'spark', '#f59e0b', 3);
            }
            // Explode at end of life
            if (proj.life >= proj.maxLife) {
              hasHit = true;
              sounds.playExplosion();
              screenShakeRef.current = 24;
              applyExplosionForce(doll, proj.x, proj.y, 280, 75);
              addParticles(proj.x, proj.y, 40, 'spark', '#f97316', 14);
              addParticles(proj.x, proj.y, 25, 'smoke', '#475569', 8);
              registerImpact(250, proj.x, proj.y, 'KABOOM!!');

              // Charred black blast mark
              splatsRef.current.push({
                x: proj.x,
                y: Math.min(proj.y, groundY - 5),
                radius: 40,
                color: '#0f172a',
                opacity: 0.7,
              });
            }
          } else if (proj.type === 'rocket') {
            // Smoke trail
            addParticles(proj.x, proj.y, 3, 'smoke', '#94a3b8', 2);
            // Slight homing towards doll head
            const head = doll.points[0];
            const dx = head.x - proj.x;
            const dy = head.y - proj.y;
            const dist = Math.hypot(dx, dy);
            proj.vx += (dx / dist) * 0.8;
            proj.vy += (dy / dist) * 0.8;
            proj.rotation = Math.atan2(proj.vy, proj.vx);

            if (dist < 40 || proj.life >= proj.maxLife || proj.y > groundY) {
              hasHit = true;
              sounds.playExplosion();
              screenShakeRef.current = 18;
              applyExplosionForce(doll, proj.x, proj.y, 220, 60);
              addParticles(proj.x, proj.y, 35, 'spark', '#eab308', 12);
              registerImpact(200, proj.x, proj.y, 'DIRECT HIT!');
            }
          } else if (proj.type === 'anvil') {
            proj.vy += 0.8; // heavy gravity
            // Check collision with head or chest
            const head = doll.points[0];
            const chest = doll.points[2];
            const distHead = Math.hypot(head.x - proj.x, head.y - proj.y);
            const distChest = Math.hypot(chest.x - proj.x, chest.y - proj.y);

            if (distHead < 45 || distChest < 45) {
              sounds.playAnvilClang();
              sounds.playHeavyImpact();
              screenShakeRef.current = 22;
              applyImpulse(doll, proj.x, proj.y, 0, 90, 0);
              addParticles(proj.x, proj.y, 20, 'star', '#94a3b8', 9);
              registerImpact(300, proj.x, proj.y, 'CLANGGGG!!');
            }

            if (proj.y + proj.radius >= groundY) {
              sounds.playAnvilClang();
              screenShakeRef.current = 12;
              hasHit = true;
              addParticles(proj.x, groundY, 15, 'smoke', '#64748b', 6);
            }
          } else if (proj.type === 'rubber_chicken') {
            proj.vy += 0.45;
            if (proj.y + proj.radius > groundY) {
              proj.y = groundY - proj.radius;
              proj.vy = -proj.vy * 0.7;
              proj.vx *= 0.8;
              sounds.playChickenHonk();
            }
            const closest = findClosestPoint(doll, proj.x, proj.y, 40);
            if (closest && Math.hypot(proj.vx, proj.vy) > 4) {
              sounds.playChickenHonk();
              applyImpulse(doll, proj.x, proj.y, proj.vx * 1.2, proj.vy * 1.2, closest.index);
              addParticles(proj.x, proj.y, 10, 'feather', '#fde047', 5);
              registerImpact(70, proj.x, proj.y, 'HONK!!');
            }
            if (proj.life >= proj.maxLife) {
              hasHit = true;
            }
          } else if (proj.type === 'mallet' || proj.type === 'boxing_glove') {
            if (proj.life >= proj.maxLife) hasHit = true;
          }

          // Draw Projectile
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(proj.rotation);

          if (proj.type === 'tomato') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(-2, -proj.radius - 3, 4, 6);
          } else if (proj.type === 'pie') {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.ellipse(0, 4, proj.radius, proj.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, proj.radius * 0.9, proj.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -6, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (proj.type === 'dynamite') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-8, -14, 16, 28);
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TNT', 0, 3);
            // Fuse wire
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.quadraticCurveTo(4, -20, 2, -24);
            ctx.stroke();
          } else if (proj.type === 'rocket') {
            ctx.fillStyle = '#f97316';
            ctx.fillRect(-16, -6, 24, 12);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(8, -8);
            ctx.lineTo(18, 0);
            ctx.lineTo(8, 8);
            ctx.closePath();
            ctx.fill();
          } else if (proj.type === 'anvil') {
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.moveTo(-25, -15);
            ctx.lineTo(25, -15);
            ctx.lineTo(15, -2);
            ctx.lineTo(12, 10);
            ctx.lineTo(20, 16);
            ctx.lineTo(-20, 16);
            ctx.lineTo(-12, 10);
            ctx.lineTo(-15, -2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('500 LB', 0, 2);
          } else if (proj.type === 'rubber_chicken') {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(14, -2, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (proj.type === 'boxing_glove') {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(-22, -10, 8, 20);
          } else if (proj.type === 'mallet') {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(-10, -22, 20, 44);
            ctx.fillStyle = '#92400e';
            ctx.fillRect(-35, -4, 70, 8);
          }

          ctx.restore();

          if (!hasHit) {
            updatedProjectiles.push(proj);
          }
        }
        projectilesRef.current = updatedProjectiles;

        // 5. Render Active Continuous Effects (Laser beam / Tesla arc)
        if (isPointerDownRef.current) {
          const rect = canvas.getBoundingClientRect();
          const targetX = pointerPosRef.current.x - rect.left;
          const targetY = pointerPosRef.current.y - rect.top;

          if (activeWeapon === 'laser') {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(width * 0.5, 0);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            // Core white beam
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          } else if (activeWeapon === 'tesla') {
            ctx.save();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            let curX = targetX;
            let curY = targetY;
            const head = doll.points[0];
            ctx.moveTo(curX, curY);
            const steps = 7;
            for (let s = 1; s <= steps; s++) {
              const progress = s / steps;
              const nextX = curX + (head.x - curX) * progress + (Math.random() - 0.5) * 25;
              const nextY = curY + (head.y - curY) * progress + (Math.random() - 0.5) * 25;
              ctx.lineTo(nextX, nextY);
            }
            ctx.stroke();
            ctx.restore();
          }
        }

        // 6. Render Ragdoll Shadow
        const pelvis = doll.points[3];
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        const shadowScale = Math.max(0.2, 1 - (groundY - pelvis.y) / 400);
        ctx.ellipse(pelvis.x, groundY + 4, 45 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 7. Render Ragdoll Skeleton & Limbs
        const isZapMode = doll.zapTimer > 0;
        const shirtColor = isZapMode ? '#ffffff' : activeCharacter.shirtColor;
        const pantsColor = isZapMode ? '#e2e8f0' : activeCharacter.pantsColor;

        // Draw Limbs (Bones/Clothes)
        const drawLimb = (p1Idx: number, p2Idx: number, color: string, width: number) => {
          const p1 = doll.points[p1Idx];
          const p2 = doll.points[p2Idx];
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Outlines
          ctx.strokeStyle = isZapMode ? '#38bdf8' : '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        };

        // Legs
        drawLimb(10, 11, pantsColor, 18); // Left Thigh
        drawLimb(11, 12, pantsColor, 15); // Left Calf
        drawLimb(13, 14, pantsColor, 18); // Right Thigh
        drawLimb(14, 15, pantsColor, 15); // Right Calf

        // Shoes
        [doll.points[12], doll.points[15]].forEach((foot) => {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(foot.x, foot.y, 8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Torso
        const chest = doll.points[2];
        drawLimb(1, 2, shirtColor, 26); // Neck to chest
        drawLimb(2, 3, shirtColor, 28); // Chest to pelvis

        // Arms
        drawLimb(4, 5, shirtColor, 16); // Left upper arm
        drawLimb(5, 6, '#fbcfe8', 13);  // Left forearm/skin
        drawLimb(7, 8, shirtColor, 16); // Right upper arm
        drawLimb(8, 9, '#fbcfe8', 13);  // Right forearm/skin

        // Hands
        [doll.points[6], doll.points[9]].forEach((hand) => {
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.arc(hand.x, hand.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // 8. Render Ragdoll Head with Character Photo!
        const head = doll.points[0];
        const neck = doll.points[1];
        const headAngle = Math.atan2(head.y - neck.y, head.x - neck.x) - Math.PI / 2;

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);

        // Circular Face Clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, head.radius, 0, Math.PI * 2);
        ctx.clip();

        if (headImageRef.current) {
          // Render character photo
          const crop = activeCharacter.crop || { zoom: 1.0, offsetX: 0, offsetY: 0 };
          const imgSize = head.radius * 2 * (crop.zoom || 1.0);
          ctx.drawImage(
            headImageRef.current,
            -imgSize / 2 + (crop.offsetX || 0),
            -imgSize / 2 + (crop.offsetY || 0),
            imgSize,
            imgSize
          );
        } else {
          // Placeholder face
          ctx.fillStyle = '#fbcfe8';
          ctx.fillRect(-head.radius, -head.radius, head.radius * 2, head.radius * 2);
        }

        // Electrical zap overlay (skeleton flash)
        if (isZapMode) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.fillRect(-head.radius, -head.radius, head.radius * 2, head.radius * 2);
          // Cartoon skull eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-8, -4, 5, 0, Math.PI * 2);
          ctx.arc(8, -4, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // end clip

        // Head border
        ctx.strokeStyle = isZapMode ? '#facc15' : '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, head.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Band-aid if damaged
        if (doll.health < 80) {
          ctx.save();
          ctx.rotate(0.3);
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(-12, -head.radius * 0.5, 24, 7);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-2, -head.radius * 0.5 + 2, 4, 3);
          ctx.restore();
        }

        // Dizzy swirling stars or sweat drops
        if (doll.dizzyTimer > 0) {
          const dizzyAngle = currentTime * 0.006;
          for (let star = 0; star < 3; star++) {
            const a = dizzyAngle + (star * Math.PI * 2) / 3;
            const sx = Math.cos(a) * (head.radius * 1.35);
            const sy = Math.sin(a) * (head.radius * 0.7) - head.radius * 0.4;
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('⭐', sx - 6, sy + 5);
          }
        }

        ctx.restore(); // end head transform

        // 9. Speech Bubble for hilarious character quotes
        if (doll.speechText) {
          ctx.save();
          const bubbleX = head.x;
          const bubbleY = head.y - head.radius - 35;
          ctx.font = 'bold 13px system-ui, sans-serif';
          const textWidth = ctx.measureText(doll.speechText).width;
          const padding = 10;
          const bw = textWidth + padding * 2;
          const bh = 28;

          // Bubble background
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bubbleX - bw / 2, bubbleY - bh / 2, bw, bh, 8);
          ctx.fill();
          ctx.stroke();

          // Tail
          ctx.beginPath();
          ctx.moveTo(bubbleX - 6, bubbleY + bh / 2);
          ctx.lineTo(bubbleX, bubbleY + bh / 2 + 8);
          ctx.lineTo(bubbleX + 6, bubbleY + bh / 2);
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(doll.speechText, bubbleX, bubbleY);
          ctx.restore();
        }

        // 10. Update & Render Particles
        const updatedParticles: Particle[] = [];
        for (const p of particlesRef.current) {
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // slight gravity

          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;

          if (p.type === 'star') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'smoke') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + p.life / 10), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (p.life < p.maxLife) {
            updatedParticles.push(p);
          }
        }
        particlesRef.current = updatedParticles;

        // 11. Update & Render Floating Comic Texts
        const updatedTexts: FloatingText[] = [];
        for (const ft of floatingTextsRef.current) {
          ft.life++;
          ft.y += ft.vy;
          ft.opacity = Math.max(0, 1 - ft.life / ft.maxLife);

          ctx.save();
          ctx.globalAlpha = ft.opacity;
          ctx.fillStyle = ft.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.font = `900 ${ft.size}px "Outfit", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.strokeText(ft.text, ft.x, ft.y);
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();

          if (ft.life < ft.maxLife) {
            updatedTexts.push(ft);
          }
        }
        floatingTextsRef.current = updatedTexts;

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeCharacter, activeWeapon, registerImpact]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-none cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block"
      />

      {/* Quick Action Overlay (Reset doll button & Clean doll button) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={resetDollPosition}
          title="Reset Ragdoll Position"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg border border-slate-700 shadow-md backdrop-blur-sm transition-transform active:scale-95 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Reset Position
        </button>

        <button
          onClick={(e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            cleanDoll(rect ? rect.width / 2 : 200, rect ? rect.height / 2 : 200);
          }}
          title="Wash Splats & Bruises"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-200 text-xs font-semibold rounded-lg border border-sky-700 shadow-md backdrop-blur-sm transition-transform active:scale-95 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Clean Ragdoll
        </button>
      </div>

      {/* Target Info Badge on bottom-left of arena */}
      <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-white shadow-lg max-w-sm">
        <img
          src={activeCharacter.photoUrl}
          alt={activeCharacter.name}
          className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
        />
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-100 truncate">{activeCharacter.name}</div>
          <div className="text-[11px] text-slate-400 truncate">{activeCharacter.annoyance}</div>
        </div>
      </div>
    </div>
  );
};
