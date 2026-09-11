// ============================================================
// RITUAL.exe — Soul Virus Scan
// Strictly adheres to Section 10:
// Pre-flight scan detecting existential threats before BEGIN
// ============================================================

import { playClick } from '../utils/soundFx';

const THREATS = [
  { file: 'Complacency.exe', status: 'QUARANTINED', color: 'var(--success)' },
  { file: 'Monday.dll', status: 'NEUTRALIZED', color: 'var(--success)' },
  { file: 'UnfinishedTasks.sys', status: 'CONTAINED', color: 'var(--success)' },
  { file: 'SocialAwkwardness.tmp', status: 'UNRESOLVED', color: 'var(--warning)' },
  { file: 'Motivation.dll', status: 'NOT FOUND', color: 'var(--danger)' },
];

export function runSoulScan(options: {
  container: HTMLElement;
  onComplete: () => void;
}): void {
  const { container, onComplete } = options;

  container.innerHTML = `
    <div class="soul-scan-box">
      <div class="title-system text-accent2 mb-8">INITIALIZING SOUL INTEGRITY SCAN…</div>
      <div class="mono text-dim" id="soul-scan-status">Scanning memory addresses for emotional resistance…</div>
      <div class="soul-threat-list mt-12" id="soul-threat-list"></div>
      <div id="soul-scan-summary" class="hidden mt-12 mono"></div>
    </div>
  `;

  const listEl = container.querySelector('#soul-threat-list')!;
  const statusEl = container.querySelector('#soul-scan-status')!;
  const summaryEl = container.querySelector('#soul-scan-summary')!;

  let idx = 0;
  const timer = setInterval(() => {
    if (idx < THREATS.length) {
      const item = THREATS[idx];
      playClick();
      const row = document.createElement('div');
      row.className = 'soul-threat-item';
      row.innerHTML = `
        <span class="mono">✓ ${item.file}</span>
        <span class="mono threat-status" style="color:${item.color};">— ${item.status}</span>
      `;
      listEl.appendChild(row);
      idx++;
    } else {
      clearInterval(timer);
      statusEl.textContent = 'SCAN COMPLETE.';
      summaryEl.classList.remove('hidden');
      summaryEl.innerHTML = `
        <div style="color:var(--warning);font-weight:700;">Minor existential corruption detected.</div>
        <div class="text-dim mt-4">Proceeding against our better judgment.</div>
      `;
      setTimeout(onComplete, 800);
    }
  }, 450);
}
