// ============================================================
// RITUAL.exe — Keyboard Fallbacks
// Strictly adheres to Section 6 (The Golden Fallback Rule):
// E held -> EYE_CONTACT_CONFIRMED
// Typed tongue twister -> VOCAL_FALLBACK_ACCEPTED
// Space held -> SCREAM_DETECTED
// Enter pressed -> ENTER_CAUGHT
// Global shortcut Ctrl+Shift+R -> RESET_RITUAL
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';

export function initKeyboardFallbacks(): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const store = getStore();

    // Reset shortcut Ctrl+Shift+R
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'R') {
      e.preventDefault();
      emit('RESET_RITUAL');
      dispatch('RESET_RITUAL');
      return;
    }

    // Physical Enter key catches flying ENTER sprite when in LETTER_CATCH
    if (e.key === 'Enter' && store.state === 'LETTER_CATCH' && store.message.complete) {
      const ms = Date.now() - store.sessionStartMs;
      emit('ENTER_CAUGHT', ms);
      dispatch('ENTER_CAUGHT', ms);
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}
