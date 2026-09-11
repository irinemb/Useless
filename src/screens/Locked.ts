// ============================================================
// RITUAL.exe — Screen: LOCKED
// Strictly adheres to Section 9, 10, 29, 41:
// - Terms of Ritual with mandatory legal clauses
// - Checkbox: "I agree to these completely reasonable terms."
// - Soul Virus Scan running before BEGIN is allowed
// - Reusable Confirmation Modal on click ("ARE YOU SURE? YES / ALSO YES")
// - Battery level slider fallback
// ============================================================

import { emit } from '../store/bus';
import { dispatch } from '../store/reducer';
import { runSoulScan } from '../extras/soulVirusScan';
import { showConfirmModal } from '../extras/confirmEverything';
import { playClick } from '../utils/soundFx';

const TERMS_CLAUSES = [
  'Clause 1.1: By initiating the Ritual, you acknowledge that your enthusiasm may be evaluated without notice, warranty, or mercy.',
  'Clause 4.2: The Ritual reserves the right to judge your posture, your vocal resonance, and your general aura of morning reluctance.',
  'Clause 8.7: Any emotional resistance will be categorized as "growth" and billed back to your department at standard overtime rates.',
  'Clause 12.1: The organization accepts no responsibility for unnecessary confidence resulting from successful completion.',
  'Clause 15.4: In the event of a camera malfunction, your dignity remains provisionally forfeit until keyboard verification is submitted.',
  'Clause 19.0: Participation in the letter catch arena is legally binding. The letters do not negotiate.',
];

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  container.innerHTML = `
    <div class="screen screen-locked active" id="screen-locked">
      <div class="card" style="max-width:720px;width:100%;">
        <div class="text-center mb-16">
          <div class="title-system">RITUAL.exe</div>
          <div class="subtitle">Mandatory Morning Compliance Interface v4.1</div>
          <div class="mono mt-8 text-dim" style="font-size:0.72rem;letter-spacing:0.08em;">
            STATUS: RESTRICTED // AUTH: PENDING // NON-COMPLIANCE IS NOTED 👍
          </div>
        </div>

        <!-- Terms of Ritual -->
        <div class="mono mb-8 text-accent2" style="font-size:0.75rem;letter-spacing:0.1em;">
          ▶ SECTION 1: TERMS OF RITUAL (MANDATORY REVIEW)
        </div>
        <div class="legalese-scroll" id="legalese-scroll">
          ${TERMS_CLAUSES.map((c) => `<p>${c}</p>`).join('')}
        </div>

        <!-- Checkbox -->
        <div class="checkbox-row mt-16">
          <input type="checkbox" id="terms-accept" />
          <label for="terms-accept">
            I agree to these completely reasonable terms.
          </label>
        </div>

        <!-- Soul Virus Scan Section -->
        <div id="soul-scan-container" class="mt-20"></div>

        <!-- Action button -->
        <div class="mt-20 text-center">
          <button class="btn btn-primary w-full" id="begin-btn" disabled>
            BEGIN RITUAL
          </button>
        </div>

        <!-- Battery fallback slider -->
        <div class="mt-24 pt-16" style="border-top:1px solid var(--border);">
          <div class="mono text-dim mb-8" style="font-size:0.68rem;display:flex;justify-content:space-between;">
            <span>COMPLIANCE ENERGY (BATTERY OVERRIDE)</span>
            <span id="slider-val">100%</span>
          </div>
          <input type="range" id="battery-slider" min="0" max="100" value="100"
            style="width:100%;accent-color:var(--accent);" />
          <div id="battery-joke-text" class="comic text-dim mt-4" style="font-size:0.78rem;">
            Suspiciously prepared.
          </div>
        </div>

        <div class="key-hint mt-16 justify-center">
          <span class="key-pill">DEMO MODE</span>
          <span>Add <code style="color:var(--accent2);">?demo=true</code> to URL for accelerated live demo flow</span>
        </div>
      </div>
    </div>
  `;

  const checkbox = container.querySelector<HTMLInputElement>('#terms-accept')!;
  const beginBtn = container.querySelector<HTMLButtonElement>('#begin-btn')!;
  const soulContainer = container.querySelector<HTMLElement>('#soul-scan-container')!;
  const batterySlider = container.querySelector<HTMLInputElement>('#battery-slider')!;
  const sliderVal = container.querySelector<HTMLElement>('#slider-val')!;
  const batteryJoke = container.querySelector<HTMLElement>('#battery-joke-text')!;

  let scanStarted = false;
  let scanDone = false;

  const onCheckboxChange = () => {
    playClick();
    if (checkbox.checked && !scanStarted) {
      scanStarted = true;
      runSoulScan({
        container: soulContainer,
        onComplete: () => {
          scanDone = true;
          beginBtn.disabled = false;
          beginBtn.classList.add('glow-btn');
        },
      });
    } else if (!checkbox.checked) {
      beginBtn.disabled = true;
      beginBtn.classList.remove('glow-btn');
    } else if (scanDone) {
      beginBtn.disabled = false;
    }
  };

  const onBeginClick = () => {
    playClick();
    // Section 41: Show confirmation modal with YES / ALSO YES
    showConfirmModal({
      title: 'ARE YOU SURE?',
      message: 'You are about to initiate the official morning onboarding ritual. There is no going back. All sensors will engage.',
      onConfirm: () => {
        emit('BEGIN_RITUAL');
        dispatch('BEGIN_RITUAL');
      },
    });
  };

  const onBatteryInput = () => {
    const val = parseInt(batterySlider.value, 10);
    sliderVal.textContent = `${val}%`;
    emit('BATTERY_CHANGED', val);
    dispatch('BATTERY_CHANGED', val);

    let joke = 'Suspiciously prepared.';
    if (val < 90 && val >= 50) joke = 'Functioning within acceptable parameters.';
    else if (val < 50 && val >= 15) joke = 'Your machine knows you want to go home.';
    else if (val < 15) joke = 'The Ritual may outlive you.';
    batteryJoke.textContent = joke;
  };

  checkbox.addEventListener('change', onCheckboxChange);
  beginBtn.addEventListener('click', onBeginClick);
  batterySlider.addEventListener('input', onBatteryInput);

  return {
    destroy() {
      checkbox.removeEventListener('change', onCheckboxChange);
      beginBtn.removeEventListener('click', onBeginClick);
      batterySlider.removeEventListener('input', onBatteryInput);
    },
  };
}
