// ============================================================
// RITUAL.exe — Skip Button That Never Skips
// Strictly adheres to Section 16:
// Clicking adds 5 seconds penalty, increments skip counter,
// and escalates HR resistance warnings.
// ============================================================

import { playClick } from '../utils/soundFx';

const ESCALATION_MESSAGES = [
  'Skipping is disabled during Growth Moments.',
  'Please remain present.',
  'The Ritual has noted your resistance.',
  'Your attempted escape has been logged with Facilities & Legal.',
  'Continued resistance will result in mandatory enthusiasm seminars.',
  'We can do this all day. Your calendar is clear.',
];

export function createSkipButton(options: {
  onPenalty: (addedSeconds: number, message: string) => void;
}): HTMLElement {
  const { onPenalty } = options;
  let clickCount = 0;

  const btn = document.createElement('button');
  btn.className = 'btn btn-ghost skip-btn-frustrate';
  btn.textContent = '[ SKIP ]';
  btn.title = 'Attempt to skip mandatory procedure';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    playClick();

    clickCount++;
    const msg = ESCALATION_MESSAGES[Math.min(clickCount - 1, ESCALATION_MESSAGES.length - 1)];

    // Button shakes
    btn.classList.add('shake-btn');
    setTimeout(() => btn.classList.remove('shake-btn'), 350);

    onPenalty(5, msg);
  });

  return btn;
}
