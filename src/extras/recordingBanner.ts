// ============================================================
// RITUAL.exe — Recording Banner
// Strictly adheres to Section 20:
// Persistent banner at top:
// "🔴 THIS SESSION IS BEING RECORDED FOR QUALITY ASSURANCE"
// Subtle red blink animation. Purely cosmetic.
// ============================================================

export function initRecordingBanner(): { destroy: () => void } {
  let banner = document.getElementById('recording-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'recording-banner';
    banner.innerHTML = `
      <span class="rec-dot">●</span>
      <span>THIS SESSION IS BEING RECORDED FOR QUALITY ASSURANCE</span>
      <span class="rec-sub">[STREAM: ENCRYPTED // RETENTION: PERMANENT]</span>
    `;
    document.body.prepend(banner);
  }

  return {
    destroy() {
      banner?.remove();
    },
  };
}
