// ============================================================
// RITUAL.exe — Screen: BOT_REPLY
// Strictly adheres to Section 26:
// Official enterprise AI system typewriter response
// Emits REPLY_SHOWN to transition to VICTORY
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { playClick } from '../utils/soundFx';

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const reply =
    store.botReply ||
    'Good morning. That was completely unnecessary. But technically successful. Please do not exceed expectations again.';

  let destroyed = false;
  let typeIndex = 0;
  let typeTimer: number | null = null;

  container.innerHTML = `
    <div class="screen active" id="screen-bot">
      <div class="card text-center" style="max-width:660px;width:100%;">
        <div class="bot-header mb-16">
          <div class="bot-avatar">🤖</div>
          <div class="bot-info text-left">
            <div class="mono font-bold text-accent2">HR COMPLIANCE BOT v4.1.9</div>
            <div class="mono text-dim" style="font-size:0.7rem;">STATUS: OMNIPRESENT // MOOD: INDIFFERENT</div>
          </div>
        </div>

        <div class="bot-chat-bubble mb-20 text-left">
          <div id="bot-typewriter" class="comic" style="font-size:1.1rem;line-height:1.6;"></div>
          <span class="typewriter-cursor">█</span>
        </div>

        <div class="mono text-dim mb-20" style="font-size:0.75rem;">
          Response generated in 0ms (pre-ordained by organization bylaws).
        </div>

        <button class="btn btn-primary w-full hidden" id="bot-continue-btn">
          ACKNOWLEDGE VERDICT & CONTINUE
        </button>
      </div>
    </div>
  `;

  const typewriterEl = container.querySelector<HTMLElement>('#bot-typewriter')!;
  const continueBtn = container.querySelector<HTMLButtonElement>('#bot-continue-btn')!;

  function typeNextChar() {
    if (destroyed) return;

    if (typeIndex < reply.length) {
      typewriterEl.textContent += reply.charAt(typeIndex);
      typeIndex++;
      typeTimer = window.setTimeout(typeNextChar, store.demoMode ? 10 : 25);
    } else {
      const cursor = container.querySelector('.typewriter-cursor');
      cursor?.remove();
      continueBtn.classList.remove('hidden');
      continueBtn.classList.add('glow-btn');
    }
  }

  const onContinue = () => {
    playClick();
    emit('REPLY_SHOWN');
    dispatch('REPLY_SHOWN');
  };

  continueBtn.addEventListener('click', onContinue);
  typeNextChar();

  if (store.demoMode) {
    setTimeout(() => {
      if (!destroyed) onContinue();
    }, 1800);
  }

  return {
    destroy() {
      destroyed = true;
      if (typeTimer) clearTimeout(typeTimer);
      continueBtn.removeEventListener('click', onContinue);
    },
  };
}
