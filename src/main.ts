// ============================================================
// RITUAL.exe — Main Entry Point
// Strictly adheres to Section 3, 4, 5, 20, 24, 25, 32, 33
// Hand-written store + reducer + event bus.
// No React, Vue, Svelte, Redux, Zustand, XState.
// ============================================================

import { getStore, onStoreChange, dispatch } from './store/reducer';
import { subscribe } from './store/bus';
import { initKeyboardFallbacks } from './fallbacks/keyboard';
import { initBattery } from './sensors/battery';
import { initRecordingBanner } from './extras/recordingBanner';
import { initGhostCursor } from './extras/ghostCursor';
import { initIdleGuiltTrip } from './extras/idleGuiltTrip';
import { initKonamiCode } from './extras/konamiCode';
import type { RitualState } from './store/state';
import type { RitualEvent } from './store/bus';

// ── DevTools Easter Egg (Section 33) ─────────────────────────
(function () {
  const art = `
   ██████╗ ██╗████████╗██╗   ██╗ █████╗ ██╗
   ██╔══██╗██║╚══██╔══╝██║   ██║██╔══██╗██║
   ██████╔╝██║   ██║   ██║   ██║███████║██║
   ██╔══██╗██║   ██║   ██║   ██║██╔══██║██║
   ██║  ██║██║   ██║   ╚██████╔╝██║  ██║███████╗
   ╚═╝  ╚═╝╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
  `;
  console.log(
    '%c' + art,
    'color: #00e5ff; font-family: monospace; font-size: 11px; line-height: 1.1; font-weight: bold;'
  );
  console.log(
    '%c Congratulations. You found the place where developers hide their shame.',
    'color: #ffab00; font-family: monospace; font-size: 12px; padding: 4px; font-style: italic;'
  );
  console.log(
    '%c HR has been notified of unauthorized inspector access. Your curiosity has been logged as a liability.',
    'color: #ff1744; font-family: monospace; font-size: 10px;'
  );
})();

// ── Wrap main DOM in wobble wrapper for Trust Fall ────────────
let wrapper = document.getElementById('ritual-wrapper');
if (!wrapper) {
  wrapper = document.createElement('div');
  wrapper.id = 'ritual-wrapper';
  const rootEl = document.getElementById('ritual-root');
  if (rootEl && rootEl.parentNode) {
    rootEl.parentNode.insertBefore(wrapper, rootEl);
    wrapper.appendChild(rootEl);
  }
}

const root = document.getElementById('ritual-root')!;
const glitchLayer = document.getElementById('glitch-layer')!;
const ticker = document.getElementById('status-ticker')!;

// ── Screen Lifecycle Routing ─────────────────────────────────
let currentDestroy: (() => void) | null = null;

async function mountScreen(state: RitualState) {
  // Trigger chromatic aberration glitch transition
  glitchLayer.classList.add('active');
  setTimeout(() => glitchLayer.classList.remove('active'), 150);

  // Clean up previous screen
  if (currentDestroy) {
    try {
      currentDestroy();
    } catch (err) {
      console.error('[RITUAL] Screen cleanup error:', err);
    }
    currentDestroy = null;
  }

  root.innerHTML = '';

  // Update status ticker
  if (ticker) {
    ticker.textContent = `SYSTEM STATE: ${state} // COMPLIANCE MANDATORY // ${new Date().toLocaleTimeString()} // ENTHUSIASM AUDIT ACTIVE`;
  }

  switch (state) {
    case 'LOCKED': {
      const { init } = await import('./screens/Locked');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'EYE_CONTACT': {
      const { init } = await import('./screens/EyeContact');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'VOCAL_GATE': {
      const { init } = await import('./screens/VocalGate');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'LOADING': {
      const { init } = await import('./screens/Loading');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'RIGGED_MCQ': {
      const { init } = await import('./screens/RiggedMcq');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'TASK_SCREEN': {
      const { init } = await import('./screens/TaskScreen');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'LETTER_CATCH': {
      const { init } = await import('./screens/LetterCatch');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'BOT_REPLY': {
      const { init } = await import('./screens/BotReply');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'VICTORY': {
      const { init } = await import('./screens/Victory');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'RECEIPT': {
      const { init } = await import('./screens/Receipt');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
    case 'COMPLETED': {
      const { init } = await import('./screens/Completed');
      const { destroy } = init({ container: root });
      currentDestroy = destroy;
      break;
    }
  }
}

// ── Wire canonical event bus to reducer ──────────────────────
const CANONICAL_EVENTS: RitualEvent[] = [
  'BEGIN_RITUAL',
  'EYE_CONTACT_PROGRESS',
  'EYE_CONTACT_LOST',
  'EYE_CONTACT_CONFIRMED',
  'VOCAL_MODE_SELECTED',
  'TWISTER_REP_DETECTED',
  'SINGING_SCORE_UPDATED',
  'VOCAL_ACCEPTED',
  'VOCAL_FALLBACK_ACCEPTED',
  'LOADING_PROGRESS',
  'MCQ_REQUIRED',
  'MCQ_ANSWERED',
  'SCREAM_DETECTED',
  'SCROLL_PULSE',
  'LETTER_CAUGHT',
  'MESSAGE_COMPLETE',
  'ENTER_CAUGHT',
  'REPLY_SHOWN',
  'VICTORY_STARTED',
  'VICTORY_FINISHED',
  'RECEIPT_SHOWN',
  'COMPLETION_RECORDED',
  'BATTERY_CHANGED',
  'RESET_RITUAL',
];

for (const event of CANONICAL_EVENTS) {
  subscribe(event, (payload) => {
    dispatch(event, payload);
  });
}

// ── Subscribe to store state changes ─────────────────────────
let lastState: RitualState = getStore().state;

onStoreChange((store) => {
  if (store.state !== lastState) {
    lastState = store.state;
    mountScreen(store.state);
  }
});

subscribe('RESET_RITUAL', () => {
  setTimeout(() => {
    mountScreen('LOCKED');
  }, 40);
});

// ── Initialize global extras & fallbacks ─────────────────────
initKeyboardFallbacks();
initBattery();
initRecordingBanner();
initGhostCursor();
initIdleGuiltTrip();
initKonamiCode();

// Initial screen mount
mountScreen(getStore().state);
