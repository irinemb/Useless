// ============================================================
// RITUAL.exe — Fun Fact Popup
// Strictly adheres to Section 18:
// Tiny dismissible popups during loading with useless corporate trivia
// ============================================================

import { playClick } from '../utils/soundFx';

const FUN_FACTS = [
  'Fun fact: You have now spent more time here than strictly necessary.',
  'Fun fact: Nobody in senior management knows why this exists.',
  'Fun fact: This information has zero practical or monetary value.',
  'Fun fact: Your confidence is currently being monitored by an algorithm.',
  'Fun fact: 98% of employees nod in agreement during this screen.',
  'Fun fact: The ritual cannot be accelerated by sheer willpower.',
];

export function showFunFactPopup(container: HTMLElement): { destroy: () => void } {
  const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  const popup = document.createElement('div');
  popup.className = 'fun-fact-popup';
  popup.innerHTML = `
    <div class="fun-fact-header">
      <span>💡 HR COMPLIANCE INSIGHT</span>
      <button class="fun-fact-close" aria-label="Dismiss">✕</button>
    </div>
    <div class="fun-fact-body">${fact}</div>
  `;

  container.appendChild(popup);

  const closeBtn = popup.querySelector('.fun-fact-close')!;
  const close = () => {
    playClick();
    popup.classList.add('fading');
    setTimeout(() => popup.remove(), 250);
  };
  closeBtn.addEventListener('click', close);

  return {
    destroy() {
      popup.remove();
    },
  };
}
