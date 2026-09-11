// ============================================================
// RITUAL.exe — Screen: LOADING
// Strictly adheres to Section 15, 16, 17, 18, 19:
// - Realistic progress pausing at 50%
// - Distorted elevator music loop
// - Buzzword loader jargon
// - Skip button that never skips (+5s, logs resistance)
// - Trust Fall button ("TRUST THE PROCESS") with full GSAP wobble
// - Random dismissible Fun Fact popup
// - Triggers MCQ_REQUIRED at checkpoint
// ============================================================

import { emit } from '../store/bus';
import { dispatch } from '../store/reducer';
import { getRandomBuzzword } from '../extras/buzzwordLoader';
import { createSkipButton } from '../extras/skipButton';
import { executeTrustFall } from '../extras/trustFall';
import { showFunFactPopup } from '../extras/funFactPopup';
import { startElevatorMusic, stopElevatorMusic, playClick } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  let destroyed = false;
  let progress = 0;
  let trustFallDone = false;
  let trustFallRequired = false;
  let timeoutId: number | null = null;
  let funFactHandle: { destroy: () => void } | null = null;

  startElevatorMusic();

  container.innerHTML = `
    <div class="screen screen-loading active" id="screen-loading">
      <div class="card text-center" style="max-width:620px;width:100%;">
        <div class="title-system mb-4">INITIALIZING SYSTEM READINESS</div>
        <div class="subtitle mb-16">Please remain patient. Your compliance throughput is optimizing.</div>

        <!-- Progress bar -->
        <div class="loading-bar-track mb-8">
          <div class="loading-bar-fill" id="loading-fill" style="width:0%;"></div>
        </div>
        <div class="loading-progress-numbers mb-16">
          <span class="mono text-dim" id="loading-status-text">INITIALIZING…</span>
          <span class="mono text-accent2 font-bold" id="loading-pct">0%</span>
        </div>

        <!-- Buzzword Jargon Stream -->
        <div class="buzzword-box mb-16" id="buzzword-display">
          Synchronizing stakeholder energy…
        </div>

        <!-- Trust Fall checkpoint section (appears at 50%) -->
        <div id="trust-fall-container" class="trust-fall-section hidden mb-16">
          <div class="mono text-warning mb-8 font-bold">
            ⚠ CHECKPOINT: PHYSICAL SYNCHRONIZATION REQUIRED
          </div>
          <div class="comic text-dim mb-12" id="trust-fall-status">
            The loading sequence cannot continue without complete surrender to the process.
          </div>
          <button class="btn btn-warning w-full glow-btn" id="trust-process-btn">
            TRUST THE PROCESS
          </button>
        </div>

        <!-- Skip button & Resistance log -->
        <div class="skip-section mt-16 pt-16" style="border-top:1px solid var(--border);">
          <div id="skip-btn-slot"></div>
          <div id="skip-warning-text" class="mono text-danger mt-8 hidden" style="font-size:0.75rem;"></div>
        </div>
      </div>
    </div>
  `;

  const fillEl = container.querySelector<HTMLElement>('#loading-fill')!;
  const pctEl = container.querySelector<HTMLElement>('#loading-pct')!;
  const statusEl = container.querySelector<HTMLElement>('#loading-status-text')!;
  const buzzwordEl = container.querySelector<HTMLElement>('#buzzword-display')!;
  const trustContainer = container.querySelector<HTMLElement>('#trust-fall-container')!;
  const trustBtn = container.querySelector<HTMLButtonElement>('#trust-process-btn')!;
  const trustStatus = container.querySelector<HTMLElement>('#trust-fall-status')!;
  const skipSlot = container.querySelector<HTMLElement>('#skip-btn-slot')!;
  const skipWarning = container.querySelector<HTMLElement>('#skip-warning-text')!;

  // Mount Section 16 Skip button
  const skipBtn = createSkipButton({
    onPenalty: (addedSec, msg) => {
      skipWarning.classList.remove('hidden');
      skipWarning.textContent = `[+${addedSec}s PENALTY] ${msg}`;
    },
  });
  skipSlot.appendChild(skipBtn);

  // Mount Section 18 Fun Fact popup after short delay
  setTimeout(() => {
    if (!destroyed) {
      funFactHandle = showFunFactPopup(container);
    }
  }, 2200);

  // Discrete progress stages (0% -> 18% -> 32% -> 47% -> 50%)
  const stages = [
    { target: 18, delay: 700 },
    { target: 32, delay: 900 },
    { target: 47, delay: 800 },
    { target: 50, delay: 600 },
  ];
  let stageIdx = 0;

  function runLoadingStep() {
    if (destroyed) return;

    if (stageIdx < stages.length) {
      const step = stages[stageIdx];
      stageIdx++;
      progress = step.target;
      fillEl.style.width = `${progress}%`;
      pctEl.textContent = `${progress}%`;
      buzzwordEl.textContent = getRandomBuzzword(buzzwordEl.textContent || '');
      emit('LOADING_PROGRESS', progress);
      dispatch('LOADING_PROGRESS', progress);

      timeoutId = window.setTimeout(runLoadingStep, step.delay);
    } else if (!trustFallDone) {
      // Reached 50% checkpoint — stall for Trust Fall!
      trustFallRequired = true;
      statusEl.textContent = 'PROCESSING... PLEASE REMAIN PATIENT.';
      buzzwordEl.textContent = 'Awaiting somatic trust verification…';
      trustContainer.classList.remove('hidden');
    }
  }

  // Section 17: Trust Fall button handler
  trustBtn.addEventListener('click', () => {
    playClick();
    trustBtn.disabled = true;

    const wrapper = document.getElementById('ritual-wrapper') || document.body;
    executeTrustFall(wrapper, {
      onMessage: (msg) => {
        trustStatus.textContent = msg;
        buzzwordEl.textContent = msg;
      },
      onComplete: () => {
        trustFallDone = true;
        trustContainer.classList.add('hidden');
        statusEl.textContent = 'TRUST VERIFIED ✓ RESUMING…';
        fillEl.style.width = '65%';
        pctEl.textContent = '65%';

        // Transition to RIGGED MCQ
        setTimeout(() => {
          if (!destroyed) {
            emit('MCQ_REQUIRED');
            dispatch('MCQ_REQUIRED');
          }
        }, 800);
      },
    });
  });

  runLoadingStep();

  return {
    destroy() {
      destroyed = true;
      stopElevatorMusic();
      if (timeoutId) clearTimeout(timeoutId);
      funFactHandle?.destroy();
    },
  };
}
