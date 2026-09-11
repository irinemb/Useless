// ============================================================
// RITUAL.exe — Screen: COMPLETED
// Strictly adheres to Section 49 & 39:
// Exact ASCII banner dashboard:
// ╔══════════════════════════════╗
//        RITUAL COMPLETE
// ╚══════════════════════════════╝
// Buttons: [ RITUAL AGAIN ] and [ ACCEPT MY FATE ]
// Optional offline-safe global counter ("TOTAL HUMANITY WASTED")
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { saveRank, loadRankHistory } from '../utils/localRank';
import { playClick } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const durationSec = Math.max(12, Math.floor((Date.now() - store.sessionStartMs) / 1000));
  const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
  const secs = String(durationSec % 60).padStart(2, '0');
  const rank = store.rank || 'COMPLIANT';

  // Save session to history
  saveRank(rank, {
    screamPeak: store.metrics.screamPeak,
    catchTimeMs: store.metrics.catchTimeMs,
    batteryPercent: store.batteryPercent,
  });

  const history = loadRankHistory();

  container.innerHTML = `
    <div class="screen active" id="screen-completed">
      <div class="card text-center" style="max-width:680px;width:100%;">
        <!-- Section 49 ASCII banner -->
        <pre class="ascii-banner mono text-success mb-16">
╔══════════════════════════════╗
       RITUAL COMPLETE
╚══════════════════════════════╝
        </pre>

        <div class="completed-meta-grid mono text-left mb-20">
          <div class="meta-row">
            <span class="text-dim">STATUS:</span>
            <span class="text-accent2 font-bold">FUNCTIONALLY AWAKE</span>
          </div>
          <div class="meta-row">
            <span class="text-dim">RANK:</span>
            <span class="text-success font-bold">${rank}</span>
          </div>
          <div class="meta-row">
            <span class="text-dim">ENTHUSIASM:</span>
            <span class="text-accent font-bold">143</span>
          </div>
          <div class="meta-row">
            <span class="text-dim">DIGNITY:</span>
            <span class="text-warning font-bold">3</span>
          </div>
          <div class="meta-row">
            <span class="text-dim">TIME WASTED:</span>
            <span class="text-accent2 font-bold">${mins}:${secs}</span>
          </div>
          <div class="meta-row">
            <span class="text-dim">HR NOTIFICATION:</span>
            <span class="text-danger font-bold">PENDING</span>
          </div>
        </div>

        <div class="comic text-dim mb-20" style="font-size:0.95rem;line-height:1.6;">
          You may now continue your day.<br>
          We recommend pretending this never happened.
        </div>

        <!-- Section 39: Humanity Wasted Counter -->
        <div class="global-counter-box mb-24">
          <div class="mono text-dim" style="font-size:0.7rem;letter-spacing:0.1em;">
            TOTAL HUMANITY WASTED ACROSS ALL RUNS:
          </div>
          <div class="mono text-accent2 font-bold mt-4" style="font-size:1.2rem;">
            ${1492 + history.length * 0.1} HOURS
          </div>
        </div>

        <div class="completed-btn-row">
          <button class="btn btn-primary" id="ritual-again-btn">
            [ RITUAL AGAIN ]
          </button>
          <button class="btn btn-secondary" id="accept-fate-btn">
            [ ACCEPT MY FATE ]
          </button>
        </div>
      </div>
    </div>
  `;

  const againBtn = container.querySelector<HTMLButtonElement>('#ritual-again-btn')!;
  const fateBtn = container.querySelector<HTMLButtonElement>('#accept-fate-btn')!;

  const onReset = () => {
    playClick();
    emit('RESET_RITUAL');
    dispatch('RESET_RITUAL');
  };

  const onFate = () => {
    playClick();
    fateBtn.textContent = 'FATE ACCEPTED 👍';
    fateBtn.disabled = true;
  };

  againBtn.addEventListener('click', onReset);
  fateBtn.addEventListener('click', onFate);

  emit('COMPLETION_RECORDED');

  return {
    destroy() {
      againBtn.removeEventListener('click', onReset);
      fateBtn.removeEventListener('click', onFate);
    },
  };
}
