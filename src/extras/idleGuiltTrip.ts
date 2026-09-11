// ============================================================
// RITUAL.exe — Idle Guilt Trip
// Strictly adheres to Section 25:
// If no user interaction occurs for ~15s, dim the interface
// and show escalating corporate guilt trip messages.
// Restores instantly on any user interaction.
// ============================================================

export function initIdleGuiltTrip(): { destroy: () => void } {
  let timeoutId: number | null = null;
  let overlay: HTMLElement | null = null;
  let stage = 0;

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'idle-guilt-overlay';
    overlay.innerHTML = `
      <div class="idle-guilt-box">
        <div class="title-system text-warning mb-12">PRESENCE REQUIRED</div>
        <div id="idle-guilt-msg" class="comic" style="font-size:1.1rem;line-height:1.6;">
          Return to your Ritual.
        </div>
        <div class="mono mt-16 text-dim" style="font-size:0.75rem;">
          [Move cursor or press any key to re-establish compliance]
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function triggerGuilt() {
    createOverlay();
    const msgEl = document.getElementById('idle-guilt-msg');
    if (!msgEl) return;

    if (stage === 0) {
      msgEl.textContent = 'Return to your Ritual.';
      stage = 1;
      timeoutId = window.setTimeout(triggerGuilt, 6000);
    } else {
      msgEl.textContent = 'We noticed you stepped away. Your hesitation has been logged.';
    }
  }

  function resetTimer() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    stage = 0;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(triggerGuilt, 15000);
  }

  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
  events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

  resetTimer();

  return {
    destroy() {
      if (timeoutId) clearTimeout(timeoutId);
      overlay?.remove();
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    },
  };
}
