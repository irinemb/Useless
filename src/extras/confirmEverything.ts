// ============================================================
// RITUAL.exe — Reusable Confirmation Modal
// Strictly adheres to Section 41:
// Displays: "ARE YOU SURE?"
// Buttons: "YES" and "ALSO YES" (both execute confirmed action)
// ============================================================

import { playClick } from '../utils/soundFx';

export function showConfirmModal(options: {
  title?: string;
  message?: string;
  onConfirm: () => void;
}): void {
  const {
    title = 'CONFIRMATION REQUIRED',
    message = 'Are you completely, legally, and spiritually sure you wish to proceed?',
    onConfirm,
  } = options;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="title-system text-warning mb-8">${title}</div>
      <div class="comic text-dim mb-20" style="font-size:0.95rem;line-height:1.6;">
        ${message}
      </div>
      <div class="modal-buttons">
        <button class="btn btn-primary" id="confirm-yes">
          YES
        </button>
        <button class="btn btn-secondary" id="confirm-also-yes">
          ALSO YES
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    playClick();
    overlay.remove();
    onConfirm();
  };

  overlay.querySelector('#confirm-yes')!.addEventListener('click', close);
  overlay.querySelector('#confirm-also-yes')!.addEventListener('click', close);
}
