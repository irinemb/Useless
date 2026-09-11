// ============================================================
// RITUAL.exe — Screen: VICTORY
// Strictly adheres to Section 27:
// GENUINELY TRIUMPHANT CELEBRATION!
// Sincere heroic fanfare sound, confetti explosion, huge typography:
// "RITUAL COMPLETE"
// "YOU MAY NOW EXIST NORMALLY."
// Transitions to RECEIPT
// ============================================================

import gsap from 'gsap';
import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { playFanfare, playClick } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const rank = store.rank || 'COMPLIANT';
  let destroyed = false;

  // Fire heroic fanfare immediately
  playFanfare();

  // Confetti full-screen canvas
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'victory-confetti-canvas';
  confettiCanvas.className = 'confetti-layer';
  document.body.appendChild(confettiCanvas);

  container.innerHTML = `
    <div class="screen active" id="screen-victory">
      <div class="card text-center victory-card" style="max-width:680px;width:100%;">
        <div class="trophy-burst mb-12">🏆</div>
        <div class="title-system text-success victory-title mb-8">
          RITUAL COMPLETE
        </div>
        <div class="comic victory-sub mb-20">
          YOU MAY NOW EXIST NORMALLY.
        </div>

        <!-- Rank display -->
        <div class="victory-rank-box mb-20">
          <div class="mono text-dim mb-8" style="font-size:0.75rem;letter-spacing:0.15em;">
            CERTIFIED COMPLIANCE RANK:
          </div>
          <div class="rank-badge" id="rank-badge">
            ${rank}
          </div>
        </div>

        <!-- Metrics summary -->
        <div class="victory-stats-grid mb-24">
          <div class="stat-pill">
            <span class="mono text-dim">SCREAM PEAK:</span>
            <span class="mono text-accent2 font-bold">${Math.round(store.metrics.screamPeak * 100)}%</span>
          </div>
          <div class="stat-pill">
            <span class="mono text-dim">CATCH TIME:</span>
            <span class="mono text-accent2 font-bold">${(store.metrics.catchTimeMs / 1000).toFixed(1)}s</span>
          </div>
          <div class="stat-pill">
            <span class="mono text-dim">BATTERY:</span>
            <span class="mono text-accent2 font-bold">${store.batteryPercent}%</span>
          </div>
        </div>

        <button class="btn btn-primary w-full glow-btn" id="proceed-receipt-btn">
          VIEW ITEMIZED COMPLIANCE RECEIPT
        </button>
      </div>
    </div>
  `;

  // Animate card entrance & rank badge pop
  gsap.from('.victory-card', {
    scale: 0.85,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)',
  });

  gsap.from('#rank-badge', {
    scale: 0.4,
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: 'elastic.out(1, 0.4)',
  });

  // Confetti animation
  const confettiCtx = confettiCanvas.getContext('2d')!;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#7c4dff', '#00e5ff', '#00c853', '#ff4081', '#ffab00', '#ffffff'];
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * -confettiCanvas.height * 0.5,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 8 + 4,
    h: Math.random() * 14 + 6,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
  }));

  let rafId = 0;
  function renderConfetti() {
    if (destroyed) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.y > confettiCanvas.height) {
        p.y = -20;
        p.x = Math.random() * confettiCanvas.width;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.restore();
    }

    rafId = requestAnimationFrame(renderConfetti);
  }
  renderConfetti();

  const proceedBtn = container.querySelector<HTMLButtonElement>('#proceed-receipt-btn')!;
  const onProceed = () => {
    playClick();
    emit('VICTORY_FINISHED');
    dispatch('VICTORY_FINISHED');
  };
  proceedBtn.addEventListener('click', onProceed);

  if (store.demoMode) {
    setTimeout(() => {
      if (!destroyed) onProceed();
    }, 2800);
  }

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      confettiCanvas.remove();
      proceedBtn.removeEventListener('click', onProceed);
    },
  };
}
