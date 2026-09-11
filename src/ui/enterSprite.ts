// ============================================================
// RITUAL.exe — Flying ENTER Sprite
// Strictly adheres to Section 23:
// Spawns giant flying ENTER key bouncing across screen via GSAP
// Clickable or triggered by physical Enter key
// Plays dramatic zoom, screen flash, sound, particles, and emits ENTER_CAUGHT
// ============================================================

import gsap from 'gsap';
import { emit } from '../store/bus';
import { dispatch } from '../store/reducer';
import { playBoom } from '../utils/soundFx';

export interface EnterSpriteHandle {
  destroy: () => void;
  triggerCatch: () => void;
}

export function spawnEnterSprite(options: {
  container: HTMLElement;
  startTimeMs: number;
}): EnterSpriteHandle {
  const { container, startTimeMs } = options;

  let destroyed = false;
  let caught = false;

  const sprite = document.createElement('div');
  sprite.className = 'enter-flying-sprite';
  sprite.innerHTML = `
    <span style="font-size:1.4rem;line-height:1;">↵</span>
    <span style="font-weight:700;letter-spacing:0.1em;">ENTER</span>
  `;
  container.appendChild(sprite);

  const cw = container.clientWidth || window.innerWidth;
  const ch = container.clientHeight || window.innerHeight;

  // Initial random placement
  gsap.set(sprite, {
    x: Math.random() * (cw - 180) + 40,
    y: Math.random() * (ch - 140) + 40,
    scale: 0.8,
  });

  // Erratic flying motion with GSAP
  const tween = gsap.to(sprite, {
    x: `random(40, ${Math.max(100, cw - 180)})`,
    y: `random(40, ${Math.max(100, ch - 140)})`,
    rotation: 'random(-15, 15)',
    duration: 0.7,
    ease: 'power1.inOut',
    repeat: -1,
    repeatRefresh: true,
  });

  function doCatch() {
    if (caught || destroyed) return;
    caught = true;

    tween.kill();
    playBoom();

    // Catch animation: dramatic zoom, screen flash, explosion
    const flash = document.createElement('div');
    flash.className = 'screen-flash-overlay';
    document.body.appendChild(flash);

    gsap.to(flash, {
      opacity: 0.8,
      duration: 0.08,
      yoyo: true,
      repeat: 1,
      onComplete: () => flash.remove(),
    });

    gsap.to(sprite, {
      scale: 2.2,
      opacity: 0,
      filter: 'brightness(3) blur(4px)',
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => {
        sprite.remove();
        const durationMs = Date.now() - startTimeMs;
        emit('ENTER_CAUGHT', durationMs);
        dispatch('ENTER_CAUGHT', durationMs);
      },
    });
  }

  sprite.addEventListener('click', doCatch);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      doCatch();
    }
  };
  window.addEventListener('keydown', onKey);

  return {
    destroy() {
      destroyed = true;
      tween.kill();
      sprite.remove();
      window.removeEventListener('keydown', onKey);
    },
    triggerCatch() {
      doCatch();
    },
  };
}
