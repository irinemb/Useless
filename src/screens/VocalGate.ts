// ============================================================
// RITUAL.exe — Screen: VOCAL_GATE
// Strictly adheres to Section 12, 13, 14:
// - Exact 5 tongue-twister pool
// - Web Speech API with Levenshtein fuzzy matching
// - Typed fallback with Autocorrect Sabotage
// - Fake Ad Break (DATA WIDGETS™) before transitioning to LOADING
// ============================================================

import { emit } from '../store/bus';
import { dispatch, getStore } from '../store/reducer';
import { initSpeechGate } from '../sensors/speechGate';
import { isMatch } from '../utils/fuzzyMatch';
import { sabotageInput } from '../extras/autocorrectSabotage';
import { showAdBreak } from '../extras/adBreak';
import { playClick } from '../utils/soundFx';

const REQUIRED_REPS = 3;

export function init({ container }: { container: HTMLElement }): { destroy: () => void } {
  const store = getStore();
  const target = store.vocalTarget;
  let reps = store.vocal.reps;
  let destroyed = false;
  let speechStop: (() => void) | null = null;

  container.innerHTML = `
    <div class="screen active" id="screen-vocal">
      <div class="card text-center" style="max-width:700px;width:100%;">
        <div class="title-system mb-4">TONGUE-TWISTER GATE</div>
        <div class="subtitle mb-16">Demonstrate articulation and compliance before stakeholder review.</div>

        <!-- Assigned phrase box -->
        <div class="vocal-phrase-card mb-16">
          <div class="mono text-dim mb-8" style="font-size:0.7rem;letter-spacing:0.1em;">
            ▶ ASSIGNED MORNING RECUSAL PHRASE:
          </div>
          <div class="comic vocal-target-text" id="vocal-target">
            "${target}"
          </div>
        </div>

        <!-- Rep progress -->
        <div class="mono mb-16" style="font-size:0.9rem;">
          REPETITIONS LOGGED: <span id="vocal-reps" class="text-accent2" style="font-weight:700;">${reps}</span> / ${REQUIRED_REPS}
        </div>

        <!-- Microphone status & transcript -->
        <div id="mic-status" class="mono text-dim mb-8" style="font-size:0.75rem;">
          INITIALIZING SPEECH RECOGNITION…
        </div>
        <div id="live-transcript" class="live-transcript-box mb-16">
          [Speak aloud into microphone, or switch to typed compliance below]
        </div>

        <!-- Autocorrect Sabotage Notice (Section 13) -->
        <div id="autocorrect-notice" class="autocorrect-notice hidden mb-16"></div>

        <!-- Typed fallback section -->
        <div class="typed-fallback-card">
          <div class="mono text-dim mb-8" style="font-size:0.72rem;display:flex;justify-content:space-between;">
            <span>TYPED COMPLIANCE (ALTERNATIVE INPUT)</span>
            <span class="text-warning">FUZZY TOLERANT</span>
          </div>
          <textarea id="vocal-input" rows="2"
            placeholder="Type the assigned tongue-twister here to bypass microphone…"
            class="input-box mb-8"
          ></textarea>
          <button class="btn btn-secondary w-full" id="submit-rep-btn">
            SUBMIT REPETITION
          </button>
        </div>
      </div>
    </div>
  `;

  const repsEl = container.querySelector<HTMLElement>('#vocal-reps')!;
  const micStatusEl = container.querySelector<HTMLElement>('#mic-status')!;
  const transcriptEl = container.querySelector<HTMLElement>('#live-transcript')!;
  const autocorrectNotice = container.querySelector<HTMLElement>('#autocorrect-notice')!;
  const textarea = container.querySelector<HTMLTextAreaElement>('#vocal-input')!;
  const submitBtn = container.querySelector<HTMLButtonElement>('#submit-rep-btn')!;

  function proceedNext() {
    // Section 14: Show unavoidable fake ad break before Loading!
    showAdBreak(() => {
      if (!destroyed) {
        emit('VOCAL_ACCEPTED');
        dispatch('VOCAL_ACCEPTED');
      }
    });
  }

  function onSuccessfulRep(typedText?: string) {
    playClick();
    reps++;
    repsEl.textContent = String(reps);
    emit('TWISTER_REP_DETECTED');
    dispatch('TWISTER_REP_DETECTED');

    if (typedText) {
      // Section 13: Autocorrect sabotage
      const { sabotaged, hasChanged } = sabotageInput(typedText);
      if (hasChanged) {
        autocorrectNotice.classList.remove('hidden');
        autocorrectNotice.innerHTML = `
          <div class="mono text-accent2">AUTOCORRECTED VERSION:</div>
          <div class="comic mt-4">"${sabotaged}"</div>
          <div class="mono text-dim mt-4">Your input has been improved. You are welcome.</div>
        `;
      }
    }

    if (reps >= REQUIRED_REPS) {
      micStatusEl.textContent = 'VERBAL COMMITMENT COMPLETE ✓';
      micStatusEl.style.color = 'var(--success)';
      setTimeout(proceedNext, 1200);
    }
  }

  // Web Speech API
  const speechHandle = initSpeechGate({
    target,
    onRep: () => {
      if (reps < REQUIRED_REPS) {
        onSuccessfulRep();
      }
    },
    onInterim: (text) => {
      transcriptEl.textContent = `Hearing: "${text}"`;
    },
    onError: (reason) => {
      micStatusEl.textContent = `MIC STATUS: ${reason.toUpperCase()} — USE TYPED INPUT`;
      micStatusEl.style.color = 'var(--warning)';
    },
  });
  speechStop = speechHandle.stop;

  // Typed fallback submission
  const onSubmit = () => {
    const text = textarea.value.trim();
    if (!text) return;

    if (isMatch(text, target, 0.7) || text.length >= target.length * 0.5) {
      textarea.value = '';
      onSuccessfulRep(text);
    } else {
      textarea.classList.add('shake-input');
      setTimeout(() => textarea.classList.remove('shake-input'), 400);
    }
  };

  submitBtn.addEventListener('click', onSubmit);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  });

  return {
    destroy() {
      destroyed = true;
      speechStop?.();
      submitBtn.removeEventListener('click', onSubmit);
    },
  };
}
