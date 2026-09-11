// ============================================================
// RITUAL.exe — Screen: LETTER_CATCH
// Strictly adheres to Section 22 & 23:
// - HTML5 Canvas 2D bouncing letter arena ("GOOD MORNING")
// - Letter slots snapping animation
// - Giant flying ENTER sprite with GSAP Erratic flight & explosive capture
// ============================================================

import { getStore } from '../store/reducer';
import { initLetterArena, TARGET_PHRASE, TARGET_LETTERS } from '../ui/letterArena';
import { spawnEnterSprite } from '../ui/enterSprite';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const startTimeMs = Date.now();
  let destroyed = false;
  let enterSpriteHandle: { destroy: () => void; triggerCatch: () => void } | null = null;

  container.innerHTML = `
    <div class="screen active" id="screen-letter">
      <div class="letter-catch-wrapper">
        <div class="title-system mb-4">CATCH YOUR MORNING</div>
        <div class="subtitle mb-16">
          Click the bouncing letters in order to assemble the legally binding greeting.
        </div>

        <!-- Assembly slots display -->
        <div class="message-assembly-row mb-16" id="msg-assembly">
          ${TARGET_PHRASE.split('').map((ch, i) => {
            if (ch === ' ') {
              return `<div class="letter-slot space-slot" key="${i}"></div>`;
            }
            return `<div class="letter-slot" id="slot-${i}" data-char="${ch}">${ch}</div>`;
          }).join('')}
        </div>

        <!-- Arena Canvas -->
        <div class="canvas-container mb-16">
          <canvas id="letter-arena" width="760" height="380"></canvas>
        </div>

        <!-- Hint banner -->
        <div class="key-hint justify-center" id="letter-hint">
          <span>Click the highlighted bouncing letter, or press</span>
          <span class="key-pill">ENTER</span>
          <span>when the flying key appears</span>
        </div>
      </div>
    </div>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>('#letter-arena')!;
  const slotElements = container.querySelectorAll<HTMLElement>('.letter-slot:not(.space-slot)');
  const hintEl = container.querySelector<HTMLElement>('#letter-hint')!;

  // Responsive canvas resizing
  function resizeCanvas() {
    const parentWidth = canvas.parentElement?.clientWidth || 760;
    const w = Math.min(parentWidth, 760);
    canvas.width = w;
    canvas.height = Math.round(w * 0.5);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const arenaHandle = initLetterArena({
    canvas,
    onSlotCatch: (idx, _letter) => {
      const slot = slotElements[idx];
      if (slot) {
        slot.classList.add('caught');
      }
    },
    onComplete: () => {
      hintEl.innerHTML = `
        <span class="text-warning font-bold">MESSAGE COMPLETE! CATCH THE FLYING</span>
        <span class="key-pill">ENTER</span>
        <span class="text-warning font-bold">KEY NOW!</span>
      `;

      // Section 23: Spawn flying ENTER key
      enterSpriteHandle = spawnEnterSprite({
        container,
        startTimeMs,
      });
    },
  });

  // Demo mode auto-progress
  let demoInterval: number | null = null;
  if (store.demoMode) {
    demoInterval = window.setInterval(() => {
      const hasMore = arenaHandle.autoCatchNext();
      if (!hasMore) {
        clearInterval(demoInterval!);
        setTimeout(() => {
          enterSpriteHandle?.triggerCatch();
        }, 600);
      }
    }, 280);
  }

  return {
    destroy() {
      destroyed = true;
      if (demoInterval) clearInterval(demoInterval);
      window.removeEventListener('resize', resizeCanvas);
      arenaHandle.destroy();
      enterSpriteHandle?.destroy();
    },
  };
}
