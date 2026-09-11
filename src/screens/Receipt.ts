// ============================================================
// RITUAL.exe — Screen: RECEIPT
// Strictly adheres to Section 30 & 31:
// - Itemized fake receipt with Rupee currency (₹0.017)
// - Fake barcode
// - Mechanical dot-matrix printer sound
// - Canvas-generated motivational poster with corporate gradient & quote
// - Transitions to COMPLETED
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { renderMotivationalPoster } from '../extras/posterGenerator';
import { playPrinter, playClick } from '../utils/soundFx';

function padRow(left: string, right: string, width = 36): string {
  const dots = Math.max(1, width - left.length - right.length);
  return left + '.'.repeat(dots) + right;
}

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const receiptNum = Math.floor(Math.random() * 800 + 100);

  // Play dot-matrix printer chatter
  playPrinter();

  const receiptRows = [
    padRow('Eye Contact Verification', '₹0.00'),
    padRow('Tongue-Twister Processing', '₹0.00'),
    padRow('Corporate Buzzword Allocation', '₹0.00'),
    padRow('Unnecessary Trust Exercise', '₹0.01'),
    padRow('Dignity Tax', '₹0.007'),
    padRow('Screaming Services', '₹0.00'),
    padRow('Existential Validation', '₹0.00'),
  ];

  container.innerHTML = `
    <div class="screen active" id="screen-receipt">
      <div class="receipt-screen-layout">
        <!-- Thermal Receipt Slip -->
        <div class="receipt-paper">
          <div class="receipt-header">
            ================================<br>
            ★ RITUAL RECEIPT #${receiptNum} ★<br>
            ================================
          </div>

          <div class="receipt-meta">
            DATE: ${new Date().toLocaleDateString()} &nbsp; TIME: ${new Date().toLocaleTimeString()}<br>
            OPERATOR: HR-COMPLIANCE-DAEMON<br>
            RANK ASSIGNED: ${store.rank || 'COMPLIANT'}
          </div>

          <div class="receipt-divider">--------------------------------</div>

          <div class="receipt-items mono">
            ${receiptRows.map((r) => `<div>${r}</div>`).join('')}
          </div>

          <div class="receipt-divider">--------------------------------</div>
          <div class="receipt-total mono">
            ${padRow('TOTAL', '₹0.017')}
          </div>
          <div class="receipt-divider">--------------------------------</div>

          <div class="receipt-payment">
            PAYMENT METHOD:<br>
            <strong>TIME YOU'LL NEVER GET BACK</strong>
          </div>

          <!-- Fake CSS/Canvas Barcode -->
          <div class="receipt-barcode-box mt-16">
            <div class="barcode-lines"></div>
            <div class="mono" style="font-size:0.6rem;letter-spacing:0.2em;">
              ||| 8942-MORNING-COMPLIANCE-2026 |||
            </div>
          </div>

          <div class="receipt-footer mt-16">
            ================================<br>
            THANK YOU FOR RITUALIZING WITH US.<br>
            Please return tomorrow.<br>
            ================================
          </div>
        </div>

        <!-- Section 31: Canvas Motivational Poster -->
        <div class="poster-section">
          <div class="mono text-dim mb-8" style="font-size:0.75rem;">
            ▶ COMPLIMENTARY CUBICLE POSTER (RIGHT-CLICK TO SAVE)
          </div>
          <canvas id="motivational-poster" width="540" height="360" class="poster-canvas"></canvas>

          <button class="btn btn-primary w-full mt-20" id="receipt-accept-btn">
            ACCEPT RECEIPT & FINALIZE ONBOARDING
          </button>
        </div>
      </div>
    </div>
  `;

  const posterCanvas = container.querySelector<HTMLCanvasElement>('#motivational-poster')!;
  renderMotivationalPoster(posterCanvas);

  const acceptBtn = container.querySelector<HTMLButtonElement>('#receipt-accept-btn')!;
  const onAccept = () => {
    playClick();
    emit('RECEIPT_SHOWN');
    dispatch('RECEIPT_SHOWN');
  };
  acceptBtn.addEventListener('click', onAccept);

  if (store.demoMode) {
    setTimeout(() => {
      onAccept();
    }, 3200);
  }

  return {
    destroy() {
      acceptBtn.removeEventListener('click', onAccept);
    },
  };
}
