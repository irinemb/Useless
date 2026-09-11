// ============================================================
// RITUAL.exe — Letter Catch Arena
// Strictly adheres to Section 22:
// HTML5 Canvas 2D physics engine, bouncing letters,
// particle bursts, pop scale, glow, satisfying snaps.
// Target: "GOOD MORNING"
// ============================================================

import { emit } from '../store/bus';
import { dispatch } from '../store/reducer';
import { playPop } from '../utils/soundFx';

export const TARGET_PHRASE = 'GOOD MORNING';
export const TARGET_LETTERS = 'GOODMORNING'.split('');
const DECOY_LETTERS = 'BCEFHJKLPQUVWXYZ';
const COLORS = ['#7c4dff', '#00e5ff', '#00c853', '#ff4081', '#ffab00', '#2979ff'];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  letter: string;
  isTarget: boolean;
  color: string;
  caught: boolean;
  scale: number;
  scaleVel: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  r: number;
  life: number;
}

export interface LetterArenaHandle {
  destroy: () => void;
  autoCatchNext: () => boolean;
}

export function initLetterArena(options: {
  canvas: HTMLCanvasElement;
  onSlotCatch: (idx: number, letter: string) => void;
  onComplete: () => void;
}): LetterArenaHandle {
  const { canvas, onSlotCatch, onComplete } = options;
  const ctx = canvas.getContext('2d')!;

  let running = true;
  let nextTargetIdx = 0;
  let rafId = 0;
  const particles: Particle[] = [];

  // Build ball pool: All target letters + decoys
  const pool: string[] = [...TARGET_LETTERS];
  for (let i = 0; i < 8; i++) {
    pool.push(DECOY_LETTERS[Math.floor(Math.random() * DECOY_LETTERS.length)]);
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const balls: Ball[] = pool.map((letter) => {
    const isTarget = TARGET_LETTERS.includes(letter);
    const r = 26 + Math.random() * 6;
    return {
      x: r + Math.random() * Math.max(10, canvas.width - 2 * r),
      y: r + Math.random() * Math.max(10, canvas.height - 2 * r),
      vx: (Math.random() - 0.5) * 3.5,
      vy: (Math.random() - 0.5) * 3.5,
      r,
      letter,
      isTarget,
      color: isTarget
        ? COLORS[Math.floor(Math.random() * COLORS.length)]
        : '#3a3a55',
      caught: false,
      scale: 1,
      scaleVel: 0,
    };
  });

  function spawnParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        r: 2 + Math.random() * 3,
        life: 1,
      });
    }
  }

  function render() {
    if (!running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid backdrop
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const nextExpectedLetter = TARGET_LETTERS[nextTargetIdx];

    // Update & draw balls
    for (const b of balls) {
      if (b.caught) continue;

      b.x += b.vx;
      b.y += b.vy;

      // Bounce against edges
      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
      if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.vx *= -1; }
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }
      if (b.y + b.r > canvas.height) { b.y = canvas.height - b.r; b.vy *= -1; }

      // Clamp velocity
      const speed = Math.hypot(b.vx, b.vy);
      if (speed > 4.5) { b.vx = (b.vx / speed) * 4.5; b.vy = (b.vy / speed) * 4.5; }
      if (speed < 1.2) { b.vx = (b.vx / speed) * 1.2; b.vy = (b.vy / speed) * 1.2; }

      // Scale spring
      b.scale += b.scaleVel;
      b.scaleVel += (1 - b.scale) * 0.25;
      b.scaleVel *= 0.65;

      const isNextLetter = b.letter === nextExpectedLetter && !b.caught;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.scale, b.scale);

      // Glow if next letter or target
      if (isNextLetter) {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 20;
      }

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = isNextLetter ? b.color + '33' : 'rgba(20, 20, 32, 0.7)';
      ctx.fill();

      ctx.strokeStyle = isNextLetter ? b.color : b.isTarget ? '#666688' : '#333348';
      ctx.lineWidth = isNextLetter ? 3 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Text
      ctx.fillStyle = isNextLetter ? '#ffffff' : b.isTarget ? '#cccccc' : '#777799';
      ctx.font = `bold ${Math.round(b.r * 0.95)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.letter, 0, 1);

      ctx.restore();
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(render);
  }

  function handleCatch(b: Ball) {
    b.caught = true;
    b.scaleVel = -0.4;
    spawnParticles(b.x, b.y, b.color);
    playPop();

    onSlotCatch(nextTargetIdx, b.letter);
    emit('LETTER_CAUGHT', b.letter);
    dispatch('LETTER_CAUGHT', b.letter);

    nextTargetIdx++;

    if (nextTargetIdx >= TARGET_LETTERS.length) {
      emit('MESSAGE_COMPLETE');
      dispatch('MESSAGE_COMPLETE');
      onComplete();
    }
  }

  const onClick = (e: MouseEvent) => {
    if (nextTargetIdx >= TARGET_LETTERS.length) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const nextLetter = TARGET_LETTERS[nextTargetIdx];

    for (const b of balls) {
      if (b.caught) continue;
      const dist = Math.hypot(b.x - mx, b.y - my);
      if (dist <= b.r + 10) {
        if (b.letter === nextLetter) {
          handleCatch(b);
        } else {
          // Wrong ball — scatter jitter
          b.vx += (Math.random() - 0.5) * 6;
          b.vy += (Math.random() - 0.5) * 6;
          b.scaleVel = -0.15;
        }
        break;
      }
    }
  };

  canvas.addEventListener('click', onClick);
  rafId = requestAnimationFrame(render);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('click', onClick);
    },
    autoCatchNext() {
      if (nextTargetIdx >= TARGET_LETTERS.length) return false;
      const nextLetter = TARGET_LETTERS[nextTargetIdx];
      const ball = balls.find((b) => !b.caught && b.letter === nextLetter);
      if (ball) {
        handleCatch(ball);
        return true;
      }
      return false;
    },
  };
}
