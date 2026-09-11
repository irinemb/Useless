// ============================================================
// RITUAL.exe — Ghost Coworker Cursor
// Strictly adheres to Section 24:
// Semi-transparent phantom cursor that slowly wanders across the screen,
// occasionally hovers near buttons with pointer-events: none
// ============================================================

import gsap from 'gsap';

export function initGhostCursor(): { destroy: () => void } {
  const ghost = document.createElement('div');
  ghost.id = 'ghost-coworker-cursor';
  ghost.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3l7 18 3-7 7-3L3 3z" fill="rgba(255,255,255,0.25)" />
    </svg>
    <div class="ghost-cursor-label">co-worker_0492</div>
  `;
  document.body.appendChild(ghost);

  let running = true;

  function moveToNextPoint() {
    if (!running) return;

    // Pick either a random button or random coordinates
    const buttons = document.querySelectorAll('button:not(:disabled)');
    let targetX = Math.random() * (window.innerWidth - 60);
    let targetY = Math.random() * (window.innerHeight - 60);

    if (buttons.length > 0 && Math.random() > 0.45) {
      const btn = buttons[Math.floor(Math.random() * buttons.length)];
      const rect = btn.getBoundingClientRect();
      targetX = rect.left + rect.width * 0.5 + (Math.random() - 0.5) * 20;
      targetY = rect.top + rect.height * 0.5 + (Math.random() - 0.5) * 10;
    }

    const duration = 2.5 + Math.random() * 3.5;

    gsap.to(ghost, {
      x: targetX,
      y: targetY,
      duration,
      ease: 'power1.inOut',
      onComplete: () => {
        // Hesitate like a confused coworker
        setTimeout(moveToNextPoint, 800 + Math.random() * 2000);
      },
    });
  }

  moveToNextPoint();

  return {
    destroy() {
      running = false;
      gsap.killTweensOf(ghost);
      ghost.remove();
    },
  };
}
