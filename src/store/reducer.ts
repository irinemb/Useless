// ============================================================
// RITUAL.exe — Reducer (ONLY authority for store mutations)
// Strictly adheres to Section 3, 4, 5, 28, 32
// ============================================================

import type { RitualStore } from './state';
import { initialState } from './state';
import type { RitualEvent } from './bus';
import { computeRank } from '../utils/localRank';
import { generateBotReply } from '../utils/botReply';
import { TWISTER_BANK } from '../content/twisterBank';

let _store: RitualStore = {
  ...initialState,
  vocalTarget: TWISTER_BANK[Math.floor(Math.random() * TWISTER_BANK.length)],
};

const _subs: Array<(s: RitualStore) => void> = [];

export function getStore(): Readonly<RitualStore> {
  return _store;
}

export function onStoreChange(cb: (s: RitualStore) => void): () => void {
  _subs.push(cb);
  return () => {
    const i = _subs.indexOf(cb);
    if (i !== -1) _subs.splice(i, 1);
  };
}

function set(partial: Partial<RitualStore>): void {
  _store = { ..._store, ...partial };
  _subs.forEach((cb) => cb(_store));
}

export function dispatch(event: RitualEvent, payload?: any): void {
  const s = _store;

  switch (event) {
    // ── LOCKED ──────────────────────────────────────────────
    case 'BEGIN_RITUAL':
      if (s.state === 'LOCKED') {
        set({ state: 'EYE_CONTACT' });
      }
      break;

    // ── EYE_CONTACT ─────────────────────────────────────────
    case 'EYE_CONTACT_PROGRESS': {
      const elapsed = typeof payload === 'number' ? payload : 0;
      set({ eye: { ...s.eye, elapsedMs: elapsed } });
      break;
    }
    case 'EYE_CONTACT_LOST':
      set({ eye: { ...s.eye, elapsedMs: Math.max(0, s.eye.elapsedMs - 400) } });
      break;
    case 'EYE_CONTACT_CONFIRMED':
      if (s.state === 'EYE_CONTACT') {
        set({
          state: 'VOCAL_GATE',
          eye: { ...s.eye, confirmed: true },
        });
      }
      break;

    // ── VOCAL_GATE ──────────────────────────────────────────
    case 'VOCAL_MODE_SELECTED':
      set({ vocal: { ...s.vocal, mode: payload as 'twister' | 'singing' } });
      break;
    case 'TWISTER_REP_DETECTED': {
      const newReps = s.vocal.reps + 1;
      set({ vocal: { ...s.vocal, reps: newReps } });
      break;
    }
    case 'SINGING_SCORE_UPDATED':
      set({ vocal: { ...s.vocal, score: payload as number } });
      break;
    case 'VOCAL_ACCEPTED':
    case 'VOCAL_FALLBACK_ACCEPTED':
      if (s.state === 'VOCAL_GATE') {
        set({
          state: 'LOADING',
          vocal: { ...s.vocal, accepted: true },
        });
      }
      break;

    // ── LOADING ─────────────────────────────────────────────
    case 'LOADING_PROGRESS':
      set({ loading: { ...s.loading, progress: payload as number } });
      break;
    case 'MCQ_REQUIRED':
      if (s.state === 'LOADING') {
        set({
          state: 'RIGGED_MCQ',
          loading: { ...s.loading, mcqShown: true },
        });
      }
      break;

    // ── RIGGED_MCQ ──────────────────────────────────────────
    case 'MCQ_ANSWERED':
      if (s.state === 'RIGGED_MCQ') {
        set({ state: 'TASK_SCREEN' });
      }
      break;

    // ── TASK_SCREEN ─────────────────────────────────────────
    case 'SCROLL_PULSE':
      break;
    case 'SCREAM_DETECTED':
      if (s.state === 'TASK_SCREEN') {
        const peak = typeof payload === 'number' ? payload : 0.6;
        set({
          state: 'LETTER_CATCH',
          metrics: { ...s.metrics, screamPeak: Math.max(s.metrics.screamPeak, peak) },
        });
      }
      break;

    // ── LETTER_CATCH ────────────────────────────────────────
    case 'LETTER_CAUGHT': {
      const letter = payload as string;
      const target = s.message.target;
      const caught = [...s.message.caught];
      if (caught.length < target.replace(/\s+/g, '').length) {
        caught.push(letter);
      }
      set({ message: { ...s.message, caught } });
      break;
    }
    case 'MESSAGE_COMPLETE':
      set({ message: { ...s.message, complete: true } });
      break;
    case 'ENTER_CAUGHT':
      if (s.state === 'LETTER_CATCH') {
        const catchTimeMs = typeof payload === 'number' ? payload : 15000;
        const rank = computeRank({
          screamPeak: s.metrics.screamPeak,
          catchTimeMs,
          twisterReps: s.vocal.reps,
          eyeElapsedMs: s.eye.elapsedMs,
          batteryPercent: s.batteryPercent,
        });
        const botReply = generateBotReply({
          screamPeak: s.metrics.screamPeak,
          catchTimeMs,
        });
        set({
          state: 'BOT_REPLY',
          metrics: { ...s.metrics, catchTimeMs },
          rank,
          botReply,
        });
      }
      break;

    // ── BOT_REPLY ────────────────────────────────────────────
    case 'REPLY_SHOWN':
      if (s.state === 'BOT_REPLY') {
        set({ state: 'VICTORY' });
      }
      break;

    // ── VICTORY ─────────────────────────────────────────────
    case 'VICTORY_STARTED':
      break;
    case 'VICTORY_FINISHED':
      if (s.state === 'VICTORY') {
        set({ state: 'RECEIPT' });
      }
      break;

    // ── RECEIPT ─────────────────────────────────────────────
    case 'RECEIPT_SHOWN':
      if (s.state === 'RECEIPT') {
        set({ state: 'COMPLETED' });
      }
      break;

    // ── GLOBAL / LIFECYCLE ──────────────────────────────────
    case 'COMPLETION_RECORDED':
      break;

    case 'BATTERY_CHANGED':
      set({ batteryPercent: typeof payload === 'number' ? payload : 100 });
      break;

    case 'RESET_RITUAL':
      _store = {
        ...initialState,
        vocalTarget: TWISTER_BANK[Math.floor(Math.random() * TWISTER_BANK.length)],
        demoMode: s.demoMode,
        batteryPercent: s.batteryPercent,
        sessionStartMs: Date.now(),
      };
      _subs.forEach((cb) => cb(_store));
      break;

    default:
      break;
  }
}

// Konami code deliberate exception jumping directly to COMPLETED
export function triggerKonamiBypass(): void {
  const s = _store;
  set({
    state: 'COMPLETED',
    rank: 'CHEATER — WE SEE YOU.',
    botReply: 'You used the Konami code. Compliance has been artificially simulated.',
  });
}
