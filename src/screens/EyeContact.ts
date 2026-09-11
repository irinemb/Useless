// ============================================================
// RITUAL.exe — Screen: EYE_CONTACT
// Strictly adheres to Section 11 & 37:
// - Webcam face tracking via MediaPipe with confidence indicator
// - 60-second target (accelerated in demo mode)
// - Fake employee readiness score (Gaze stability, Blink frequency, Commitment)
// - If face disappears: "WHERE DID YOU GO?" warning, pauses progress
// - Keyboard fallback: Hold E to emit EYE_CONTACT_CONFIRMED
// - When complete: Microwave-style DING sound, "Eye contact accepted. We found you."
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { initEyeTracking } from '../sensors/eyeTracking';
import { playDing } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const isDemo = store.demoMode;
  const TARGET_MS = isDemo ? 5000 : 60000;
  const RADIUS = 85;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  container.innerHTML = `
    <div class="screen active" id="screen-eye">
      <div class="card text-center" style="max-width:640px;width:100%;">
        <div class="title-system mb-4">EYE CONTACT VERIFICATION</div>
        <div class="subtitle mb-16">Maintain direct gaze with the optical sensor.</div>

        <!-- Progress ring container -->
        <div class="eye-ring-container mb-16">
          <svg width="210" height="210" class="progress-ring">
            <circle class="progress-ring__track" cx="105" cy="105" r="${RADIUS}" stroke-width="12"/>
            <circle class="progress-ring__circle" id="eye-ring" cx="105" cy="105" r="${RADIUS}"
              stroke-width="12"
              stroke-dasharray="${CIRCUMFERENCE}"
              stroke-dashoffset="${CIRCUMFERENCE}"
            />
          </svg>
          <div class="eye-ring-label">
            <div class="elapsed" id="eye-elapsed">0</div>
            <div class="total">/ ${TARGET_MS / 1000} SEC</div>
          </div>
        </div>

        <!-- Metric badges -->
        <div class="eye-metrics-box">
          <div class="eye-metric-row">
            <span class="mono text-dim">Gaze stability:</span>
            <span class="mono text-accent2" id="stat-gaze">CALIBRATING…</span>
          </div>
          <div class="eye-metric-row">
            <span class="mono text-dim">Blink frequency:</span>
            <span class="mono text-warning" id="stat-blink">QUESTIONABLE</span>
          </div>
          <div class="eye-metric-row">
            <span class="mono text-dim">Commitment level:</span>
            <span class="mono text-dim" id="stat-commit">UNDER REVIEW</span>
          </div>
        </div>

        <!-- Status warning / confirmation -->
        <div id="eye-status" class="mono mt-16 eye-status-banner">
          INITIALIZING OPTICAL SENSORS…
        </div>

        <!-- Hidden video element for MediaPipe feed -->
        <video id="eye-video" autoplay muted playsinline style="display:none;"></video>

        <!-- Keyboard Golden Fallback Hint -->
        <div class="key-hint mt-16 justify-center">
          <span>Camera unavailable? Hold</span>
          <span class="key-pill">E</span>
          <span>to simulate synthetic eye contact</span>
        </div>
      </div>
    </div>
  `;

  const ring = container.querySelector<SVGCircleElement>('#eye-ring')!;
  const elapsedEl = container.querySelector<HTMLElement>('#eye-elapsed')!;
  const statusEl = container.querySelector<HTMLElement>('#eye-status')!;
  const gazeEl = container.querySelector<HTMLElement>('#stat-gaze')!;
  const commitEl = container.querySelector<HTMLElement>('#stat-commit')!;
  const videoEl = container.querySelector<HTMLVideoElement>('#eye-video')!;

  let elapsedMs = 0;
  let destroyed = false;
  let finished = false;
  let contactActive = false;
  let lastTimestamp = 0;
  let eyeTrackerStop: (() => void) | null = null;

  function updateProgress(ms: number) {
    const fraction = Math.min(ms / TARGET_MS, 1);
    ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
    elapsedEl.textContent = String(Math.floor(ms / 1000));
    emit('EYE_CONTACT_PROGRESS', ms);
    dispatch('EYE_CONTACT_PROGRESS', ms);

    if (fraction >= 1 && !finished) {
      finished = true;
      playDing();
      statusEl.textContent = 'Eye contact accepted. We found you.';
      statusEl.className = 'mono mt-16 eye-status-banner success-banner';
      gazeEl.textContent = 'OPTIMAL';
      commitEl.textContent = 'COMPLIANT ✓';

      setTimeout(() => {
        if (!destroyed) {
          emit('EYE_CONTACT_CONFIRMED');
          dispatch('EYE_CONTACT_CONFIRMED');
        }
      }, 1600);
    }
  }

  function loop(ts: number) {
    if (destroyed || finished) return;

    if (!lastTimestamp) lastTimestamp = ts;
    const delta = ts - lastTimestamp;
    lastTimestamp = ts;

    if (contactActive) {
      elapsedMs = Math.min(TARGET_MS, elapsedMs + delta);
    } else {
      // Slowly drain if contact lost
      elapsedMs = Math.max(0, elapsedMs - delta * 0.4);
    }

    updateProgress(elapsedMs);
    requestAnimationFrame(loop);
  }

  // Keyboard Golden Fallback: Hold E
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' && !e.repeat && !finished) {
      contactActive = true;
      statusEl.textContent = 'MANUAL EYE CONTACT ENGAGED ◉';
      statusEl.className = 'mono mt-16 eye-status-banner manual-banner';
      gazeEl.textContent = 'SIMULATED';
      commitEl.textContent = 'MANUAL OVERRIDE';
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' && !finished) {
      contactActive = false;
      statusEl.textContent = 'WHERE DID YOU GO?';
      statusEl.className = 'mono mt-16 eye-status-banner warning-banner';
      emit('EYE_CONTACT_LOST');
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Initialize camera tracking
  initEyeTracking({
    video: videoEl,
    onContact: (confidence) => {
      if (finished) return;
      contactActive = true;
      statusEl.textContent = `EYE CONTACT DETECTED (${Math.round(confidence * 100)}%) ◉`;
      statusEl.className = 'mono mt-16 eye-status-banner active-banner';
      gazeEl.textContent = 'ACCEPTABLE';
      commitEl.textContent = 'UNDER REVIEW';
    },
    onLost: () => {
      if (finished) return;
      contactActive = false;
      statusEl.textContent = 'WHERE DID YOU GO?';
      statusEl.className = 'mono mt-16 eye-status-banner warning-banner';
      emit('EYE_CONTACT_LOST');
    },
    onError: (err) => {
      if (finished) return;
      statusEl.textContent = 'CAMERA UNAVAILABLE — HOLD [E] TO SIMULATE';
      statusEl.className = 'mono mt-16 eye-status-banner warning-banner';
    },
  }).then((handle) => {
    if (destroyed) {
      handle.stop();
    } else {
      eyeTrackerStop = handle.stop;
    }
  });

  requestAnimationFrame(loop);

  return {
    destroy() {
      destroyed = true;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      eyeTrackerStop?.();
    },
  };
}
