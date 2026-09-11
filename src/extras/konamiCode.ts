// ============================================================
// RITUAL.exe — Konami Code Detection
// Strictly adheres to Section 32:
// Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
// Works from ANY state.
// Bypasses normal transitions directly to COMPLETED.
// Rank: "CHEATER — WE SEE YOU."
// ============================================================

import { triggerKonamiBypass } from '../store/reducer';
import { playBoom } from '../utils/soundFx';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function initKonamiCode(): { destroy: () => void } {
  let progress = 0;

  const onKeyDown = (e: KeyboardEvent) => {
    const expected = KONAMI_SEQUENCE[progress];
    const keyMatch = e.code === expected || e.key === expected;

    if (keyMatch) {
      progress++;
      if (progress === KONAMI_SEQUENCE.length) {
        progress = 0;
        triggerEasterEgg();
      }
    } else {
      progress = 0;
      // If the wrong key happened to be the start of the sequence, recount
      if (e.code === KONAMI_SEQUENCE[0] || e.key === KONAMI_SEQUENCE[0]) {
        progress = 1;
      }
    }
  };

  function triggerEasterEgg() {
    playBoom();

    // Glitch flash overlay
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 99999; pointer-events: none;
      background: radial-gradient(circle, #ff0055 0%, #000 80%);
      opacity: 0.9;
      display: flex; align-items: center; justify-content: center;
      color: #00ffcc; font-family: monospace; font-size: 2rem; font-weight: bold;
      text-shadow: 0 0 20px #00ffcc;
    `;
    flash.innerHTML = `<div>SYSTEM BYPASS DETECTED<br><span style="font-size:1.2rem;color:#ff0055;">RANK: CHEATER — WE SEE YOU.</span></div>`;
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.remove();
      triggerKonamiBypass();
    }, 1100);
  }

  window.addEventListener('keydown', onKeyDown);

  return {
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
