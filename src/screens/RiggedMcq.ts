// ============================================================
// RITUAL.exe — Screen: RIGGED_MCQ
// Strictly adheres to Section 19:
// "HOW MANY LEGS DOES A DOG HAVE, REALLY?"
// All answers are accepted. Whatever is chosen: "NOTED."
// Then transitions to TASK_SCREEN.
// ============================================================

import { emit } from '../store/bus';
import { dispatch } from '../store/reducer';
import { playClick } from '../utils/soundFx';

const QUESTION = 'HOW MANY LEGS DOES A DOG HAVE, REALLY?';
const OPTIONS = [
  { id: 'A', text: '4' },
  { id: 'B', text: '3' },
  { id: 'C', text: 'Depends on the dog' },
  { id: 'D', text: 'I refuse to answer' },
];

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  container.innerHTML = `
    <div class="screen active" id="screen-mcq">
      <div class="card text-center" style="max-width:620px;width:100%;">
        <div class="title-system mb-4">CRITICAL COGNITIVE AUDIT</div>
        <div class="subtitle mb-16">Mandatory comprehension verification required before physical expression.</div>

        <div class="mcq-question-box mb-20">
          <div class="mono text-warning mb-8" style="font-size:0.75rem;letter-spacing:0.1em;">
            QUESTION 01 OF 01:
          </div>
          <div class="comic font-bold" style="font-size:1.25rem;line-height:1.4;">
            ${QUESTION}
          </div>
        </div>

        <div class="mcq-options-grid mb-16" id="mcq-options">
          ${OPTIONS.map(
            (opt) => `
            <button class="mcq-option-btn" data-id="${opt.id}">
              <span class="mcq-badge">${opt.id}</span>
              <span class="mcq-text">${opt.text}</span>
            </button>
          `
          ).join('')}
        </div>

        <!-- Noted confirmation banner -->
        <div id="mcq-feedback" class="mcq-feedback-banner hidden">
          <div class="title-system text-success" style="font-size:1.6rem;">NOTED.</div>
          <div class="comic text-dim mt-4">Your response has been added to your permanent employee record.</div>
        </div>
      </div>
    </div>
  `;

  const optionsContainer = container.querySelector('#mcq-options')!;
  const feedbackEl = container.querySelector('#mcq-feedback')!;
  let answered = false;
  let destroyed = false;

  const onClick = (e: Event) => {
    if (answered) return;
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.mcq-option-btn');
    if (!btn) return;

    answered = true;
    playClick();

    // Disable all options and highlight selection
    const allButtons = optionsContainer.querySelectorAll<HTMLButtonElement>('.mcq-option-btn');
    allButtons.forEach((b) => (b.disabled = true));
    btn.classList.add('selected');

    feedbackEl.classList.remove('hidden');

    setTimeout(() => {
      if (!destroyed) {
        emit('MCQ_ANSWERED');
        dispatch('MCQ_ANSWERED');
      }
    }, 1400);
  };

  optionsContainer.addEventListener('click', onClick);

  return {
    destroy() {
      destroyed = true;
      optionsContainer.removeEventListener('click', onClick);
    },
  };
}
