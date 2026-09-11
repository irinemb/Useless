// ============================================================
// RITUAL.exe — Fake Ad Break
// Strictly adheres to Section 14:
// Unavoidable 3-second commercial break before loading:
// Product: DATA WIDGETS™ — Now With More Data.
// Tagline: "Because some data was apparently insufficient."
// CONTINUE button disabled until timer finishes.
// ============================================================

import { playClick } from '../utils/soundFx';

export function showAdBreak(onFinished: () => void): void {
  const adOverlay = document.createElement('div');
  adOverlay.className = 'ad-break-overlay';
  adOverlay.innerHTML = `
    <div class="ad-card">
      <div class="ad-badge">SPONSORED MANDATORY BROADCAST</div>

      <div class="ad-logo">DATA WIDGETS™</div>
      <div class="ad-sub">Now With More Data.</div>

      <div class="ad-graphic">
        <div class="ad-bar" style="height:40%;"></div>
        <div class="ad-bar" style="height:75%;"></div>
        <div class="ad-bar" style="height:55%;"></div>
        <div class="ad-bar" style="height:90%;"></div>
        <div class="ad-bar" style="height:65%;"></div>
      </div>

      <p class="ad-tagline">
        “Because some data was apparently insufficient.”
      </p>

      <div class="ad-timer mono" id="ad-timer">
        AD WILL CLOSE IN 3s…
      </div>

      <button class="btn btn-primary" id="ad-continue-btn" disabled>
        CONTINUE TO RITUAL
      </button>
    </div>
  `;

  document.body.appendChild(adOverlay);

  let seconds = 3;
  const timerEl = adOverlay.querySelector('#ad-timer')!;
  const btn = adOverlay.querySelector<HTMLButtonElement>('#ad-continue-btn')!;

  const interval = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      timerEl.textContent = `AD WILL CLOSE IN ${seconds}s…`;
    } else {
      clearInterval(interval);
      timerEl.textContent = 'AD CONCLUDED. COMPLIANCE MAY RESUME.';
      btn.disabled = false;
      btn.classList.add('glow-btn');
    }
  }, 1000);

  btn.addEventListener('click', () => {
    playClick();
    adOverlay.remove();
    onFinished();
  });
}
