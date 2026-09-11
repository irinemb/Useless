// ============================================================
// RITUAL.exe — Trust Fall Wobble (GSAP)
// ============================================================

import gsap from 'gsap';

/**
 * Tilts the entire page like it's falling backward, then settles.
 * Wraps in try/catch — always resolves even if GSAP fails.
 */
export function playTrustFallWobble(
  target: HTMLElement,
  onComplete: () => void
): void {
  try {
    const tl = gsap.timeline({
      onComplete,
    });

    tl.to(target, {
      rotation: 3,
      y: 18,
      duration: 0.18,
      ease: 'power2.in',
    })
      .to(target, {
        rotation: -2,
        y: 10,
        duration: 0.15,
        ease: 'power1.inOut',
      })
      .to(target, {
        rotation: 1.5,
        y: 14,
        duration: 0.12,
        ease: 'power1.in',
      })
      .to(target, {
        rotation: 0,
        y: 0,
        duration: 0.55,
        ease: 'elastic.out(1, 0.6)',
      });
  } catch (err) {
    console.warn('[RITUAL] Trust Fall wobble failed, proceeding anyway:', err);
    onComplete();
  }
}
