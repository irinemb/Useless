// ============================================================
// RITUAL.exe — Screen: EYE_CONTACT
// Strictly adheres to Section 11 & 37:
// - Live webcam video viewport framed inside the glowing progress ring
// - Natural mirrored video with futuristic eye-tracking HUD overlay
// - 60-second target (accelerated in demo mode)
// - Fake employee readiness score (Gaze stability, Blink frequency, Commitment)
// - "WHERE DID YOU GO?" alert when face disappears / eyes look away
// - Hold [E] keyboard Golden Fallback
// - Microwave DING on completion: "Eye contact accepted. We found you."
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { initEyeTracking } from '../sensors/eyeTracking';
import { playDing, playClick } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const isDemo = store.demoMode;
  const TARGET_MS = isDemo ? 5000 : 60000;
  const RADIUS = 110;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  container.innerHTML = `
    <div class="screen active" id="screen-eye">
      <div class="card text-center" style="max-width:680px;width:100%;">
        <div class="title-system mb-4">EYE CONTACT VERIFICATION</div>
        <div class="subtitle mb-16">Look directly into the optical sensor for 60 seconds. Do not look away.</div>

        <!-- Live Camera Viewport Framed by Progress Ring -->
        <div class="eye-camera-viewport-wrap mb-16">
          <!-- Live Mirrored Webcam Video -->
          <div class="camera-lens-frame">
            <video id="eye-video" autoplay muted playsinline class="eye-feed-video"></video>

            <!-- Pre-connect placeholder / button -->
            <div id="camera-placeholder" class="camera-placeholder">
              <div class="cam-icon">📹</div>
              <div class="mono text-dim" style="font-size:0.75rem;">CONNECTING CAMERA…</div>
              <button class="btn btn-secondary mt-8" id="manual-cam-btn" style="font-size:0.72rem;padding:6px 14px;">
                ALLOW CAMERA FEED
              </button>
            </div>

            <!-- Futuristic HUD Reticle Overlay -->
            <div class="camera-hud-overlay" id="camera-hud">
              <div class="hud-corner top-left"></div>
              <div class="hud-corner top-right"></div>
              <div class="hud-corner bottom-left"></div>
              <div class="hud-corner bottom-right"></div>
              <div class="hud-scanline"></div>
              <div class="hud-center-crosshair"></div>
              <div class="hud-rec-tag">● REC [30 FPS]</div>
            </div>
          </div>

          <!-- Circular SVG Progress Ring surrounding the camera -->
          <svg width="250" height="250" class="camera-progress-ring">
            <circle class="progress-ring__track" cx="125" cy="125" r="${RADIUS}" stroke-width="12"/>
            <circle class="progress-ring__circle" id="eye-ring" cx="125" cy="125" r="${RADIUS}"
              stroke-width="12"
              stroke-dasharray="${CIRCUMFERENCE}"
              stroke-dashoffset="${CIRCUMFERENCE}"
            />
          </svg>
        </div>

        <!-- Big Elapsed Timer -->
        <div class="eye-timer-badge mb-16">
          <span class="elapsed-val" id="eye-elapsed">0</span>
          <span class="total-val">/ ${TARGET_MS / 1000} SEC</span>
        </div>

        <!-- Metric badges -->
        <div class="eye-metrics-box mb-16">
          <div class="eye-metric-row">
            <span class="mono text-dim">Gaze stability:</span>
            <span class="mono text-accent2 font-bold" id="stat-gaze">CALIBRATING…</span>
          </div>
          <div class="eye-metric-row">
            <span class="mono text-dim">Blink frequency:</span>
            <span class="mono text-warning font-bold" id="stat-blink">QUESTIONABLE</span>
          </div>
          <div class="eye-metric-row">
            <span class="mono text-dim">Commitment level:</span>
            <span class="mono text-dim font-bold" id="stat-commit">UNDER REVIEW</span>
          </div>
        </div>

        <!-- Status warning / confirmation -->
        <div id="eye-status" class="mono eye-status-banner mb-16">
          CONNECTING OPTICAL FEED…
        </div>

        <!-- Keyboard Golden Fallback Hint -->
        <div class="key-hint justify-center">
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
  const blinkEl = container.querySelector<HTMLElement>('#stat-blink')!;
  const commitEl = container.querySelector<HTMLElement>('#stat-commit')!;
  const videoEl = container.querySelector<HTMLVideoElement>('#eye-video')!;
  const placeholderEl = container.querySelector<HTMLElement>('#camera-placeholder')!;
  const manualCamBtn = container.querySelector<HTMLButtonElement>('#manual-cam-btn')!;
  const hudEl = container.querySelector<HTMLElement>('#camera-hud')!;

  let elapsedMs = 0;
  let destroyed = false;
  let finished = false;
  let contactActive = false;
  let lastTimestamp = 0;
  let eyeTrackerStop: (() => void) | null = null;
  let blinkToggle = 0;

  function updateProgress(ms: number) {
    const fraction = Math.min(ms / TARGET_MS, 1);
    ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
    elapsedEl.textContent = String(Math.floor(ms / 1000));
    emit('EYE_CONTACT_PROGRESS', ms);
    dispatch('EYE_CONTACT_PROGRESS', ms);

    // Dynamic blink metric oscillation
    blinkToggle++;
    if (blinkToggle % 40 === 0) {
      const blinks = ['QUESTIONABLE', 'ACCEPTABLE', 'SUSPICIOUS', 'COMPLIANT'];
      blinkEl.textContent = blinks[Math.floor(Math.random() * blinks.length)];
    }

    if (fraction >= 1 && !finished) {
      finished = true;
      playDing();
      statusEl.textContent = 'Eye contact accepted. We found you.';
      statusEl.className = 'mono eye-status-banner success-banner mb-16';
      gazeEl.textContent = 'OPTIMAL';
      commitEl.textContent = 'COMPLIANT ✓';
      commitEl.style.color = 'var(--success)';

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
      statusEl.className = 'mono eye-status-banner manual-banner mb-16';
      gazeEl.textContent = 'SIMULATED';
      commitEl.textContent = 'MANUAL OVERRIDE';
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' && !finished) {
      contactActive = false;
      statusEl.textContent = 'WHERE DID YOU GO?';
      statusEl.className = 'mono eye-status-banner warning-banner mb-16';
      emit('EYE_CONTACT_LOST');
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function startCamera() {
    initEyeTracking({
      video: videoEl,
      onCameraReady: () => {
        if (placeholderEl) {
          placeholderEl.style.display = 'none';
        }
        hudEl.classList.add('active');
        statusEl.textContent = 'OPTICAL FEED ENGAGED — MAINTAIN EYE CONTACT ◉';
        statusEl.className = 'mono eye-status-banner active-banner mb-16';
      },
      onContact: (confidence) => {
        if (finished) return;
        contactActive = true;
        statusEl.textContent = `EYE CONTACT DETECTED (${Math.round(confidence * 100)}%) ◉`;
        statusEl.className = 'mono eye-status-banner active-banner mb-16';
        gazeEl.textContent = 'OPTIMAL';
        commitEl.textContent = 'UNDER REVIEW';
      },
      onLost: () => {
        if (finished) return;
        contactActive = false;
        statusEl.textContent = 'WHERE DID YOU GO?';
        statusEl.className = 'mono eye-status-banner warning-banner mb-16';
        emit('EYE_CONTACT_LOST');
      },
      onError: (err) => {
        if (finished) return;
        statusEl.textContent = `CAMERA STATUS: ${err.toUpperCase()} — HOLD [E] TO SIMULATE`;
        statusEl.className = 'mono eye-status-banner warning-banner mb-16';
        if (placeholderEl) {
          placeholderEl.innerHTML = `
            <div class="mono text-warning" style="font-size:0.75rem;padding:8px;">
              CAMERA ACCESS NEEDED<br>
              <span style="font-size:0.65rem;color:var(--text-dim);">Click below or hold [E]</span>
            </div>
            <button class="btn btn-primary" id="retry-cam-btn" style="font-size:0.7rem;padding:6px 12px;">
              REQUEST PERMISSION
            </button>
          `;
          placeholderEl.querySelector('#retry-cam-btn')?.addEventListener('click', () => {
            playClick();
            startCamera();
          });
        }
      },
    }).then((handle) => {
      if (destroyed) {
        handle.stop();
      } else {
        eyeTrackerStop = handle.stop;
      }
    });
  }

  manualCamBtn.addEventListener('click', () => {
    playClick();
    startCamera();
  });

  // Automatically start camera on mount
  startCamera();

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
