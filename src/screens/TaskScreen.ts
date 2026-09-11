// ============================================================
// RITUAL.exe — Screen: TASK_SCREEN (Scream to Continue)
// Strictly adheres to Section 21:
// - Microphone RMS scream detection with forgiving threshold
// - Visual meter scaling up to 143% enthusiasm
// - Hold SPACE keyboard fallback emitting SCREAM_DETECTED
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { initAudioGate } from '../sensors/audioGate';
import { playBoom } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  let destroyed = false;
  let triggered = false;
  let audioStop: (() => void) | null = null;
  let peakRms = 0;

  container.innerHTML = `
    <div class="screen active" id="screen-task">
      <div class="card text-center" style="max-width:660px;width:100%;">
        <div class="title-system mb-4">FINAL TASK</div>
        <div class="subtitle mb-8" style="font-size:1.1rem;color:var(--text);">
          Please express your morning enthusiasm.
        </div>
        <div class="title-system text-accent2 mb-16" style="font-size:2rem;letter-spacing:0.15em;">
          SCREAM.
        </div>
        <div class="comic text-dim mb-20" style="font-size:0.88rem;">
          Preferably at the website. Your building management has been pre-notified.
        </div>

        <!-- Meter display -->
        <div class="scream-meter-container mb-16">
          <div class="mono text-dim mb-8" style="display:flex;justify-content:space-between;">
            <span>ENTHUSIASM LEVEL</span>
            <span class="text-accent2 font-bold" id="enthusiasm-pct">0%</span>
          </div>
          <div class="scream-bar-track">
            <div class="scream-bar-fill" id="scream-fill" style="width:0%;"></div>
          </div>
        </div>

        <!-- Microphone status -->
        <div id="scream-status" class="mono text-dim mb-16" style="font-size:0.75rem;">
          MICROPHONE ACTIVE — AWAITING DECIBEL SPIKE…
        </div>

        <!-- Golden Fallback: Hold Space -->
        <div class="key-hint justify-center">
          <span>Microphone unavailable? Hold</span>
          <span class="key-pill">SPACE</span>
          <span>to scream virtually</span>
        </div>
      </div>
    </div>
  `;

  const fillEl = container.querySelector<HTMLElement>('#scream-fill')!;
  const pctEl = container.querySelector<HTMLElement>('#enthusiasm-pct')!;
  const statusEl = container.querySelector<HTMLElement>('#scream-status')!;

  function handleScreamSuccess(peakValue: number) {
    if (triggered || destroyed) return;
    triggered = true;

    playBoom();

    // Max out meter to hilarious 143%
    fillEl.style.width = '100%';
    pctEl.textContent = '143%';
    pctEl.classList.add('text-danger');
    statusEl.textContent = 'SCREAM DETECTED — COMPLIANCE REGISTERED (143%) ✓';
    statusEl.style.color = 'var(--success)';

    setTimeout(() => {
      if (!destroyed) {
        emit('SCREAM_DETECTED', Math.max(0.85, peakValue));
        dispatch('SCREAM_DETECTED', Math.max(0.85, peakValue));
      }
    }, 900);
  }

  function updateMeter(rms: number) {
    peakRms = Math.max(peakRms, rms);
    // Amplify forgivingly so normal speaking can build up, and loud voice hits 100%+
    const displayPct = Math.min(143, Math.round(rms * 280));
    fillEl.style.width = `${Math.min(100, (displayPct / 143) * 100)}%`;
    pctEl.textContent = `${displayPct}%`;
  }

  // Audio Gate RMS detection
  initAudioGate({
    threshold: store.demoMode ? 0.08 : 0.22,
    onLevel: updateMeter,
    onScream: (peak) => handleScreamSuccess(peak),
    onError: (err) => {
      statusEl.textContent = `MIC STATUS: ${err.toUpperCase()} — HOLD [SPACE] TO PROCEED`;
      statusEl.style.color = 'var(--warning)';
    },
  }).then((handle) => {
    if (destroyed) {
      handle.stop();
    } else {
      audioStop = handle.stop;
    }
  });

  // Keyboard Golden Fallback: Hold Space
  let spaceInterval: number | null = null;
  let virtualProgress = 0;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !triggered) {
      e.preventDefault();
      statusEl.textContent = 'SYNTHETIC SCREAM CHARGING…';
      statusEl.style.color = 'var(--accent2)';

      if (!spaceInterval) {
        spaceInterval = window.setInterval(() => {
          virtualProgress += 0.06;
          updateMeter(virtualProgress);
          if (virtualProgress >= 0.5) {
            clearInterval(spaceInterval!);
            handleScreamSuccess(1.0);
          }
        }, 80);
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' && spaceInterval) {
      clearInterval(spaceInterval);
      spaceInterval = null;
      virtualProgress = 0;
      if (!triggered) {
        updateMeter(0);
        statusEl.textContent = 'SCREAM INSUFFICIENT. HOLD SPACE LONGER.';
        statusEl.style.color = 'var(--warning)';
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Demo mode auto-progress
  if (store.demoMode) {
    setTimeout(() => {
      if (!destroyed) handleScreamSuccess(0.9);
    }, 700);
  }

  return {
    destroy() {
      destroyed = true;
      audioStop?.();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (spaceInterval) clearInterval(spaceInterval);
    },
  };
}
