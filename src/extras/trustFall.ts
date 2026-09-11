// ============================================================
// RITUAL.exe — Trust Fall Feature
// Strictly adheres to Section 17:
// Button: "TRUST THE PROCESS" placed on the loading screen.
// Loading cannot continue beyond checkpoint until pressed.
// Wobbles entire application physically with GSAP:
// "Please trust us. We have no idea what we're doing either."
// Smoothly levels back: "Trust verified." Loading resumes.
// ============================================================

import gsap from 'gsap';
import { playBoom } from '../utils/soundFx';

export function executeTrustFall(
  targetElement: HTMLElement,
  options: {
    onMessage: (msg: string) => void;
    onComplete: () => void;
  }
): void {
  const { onMessage, onComplete } = options;

  onMessage("Please trust us. We have no idea what we're doing either.");
  playBoom();

  // Violent, physically unstable wobble sequence
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(targetElement, {
        rotation: 0,
        skewX: 0,
        skewY: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)',
        onComplete: () => {
          onMessage('Trust verified.');
          setTimeout(onComplete, 600);
        },
      });
    },
  });

  tl.to(targetElement, {
    rotation: -4.5,
    skewX: 3.5,
    skewY: -2.0,
    x: -12,
    y: 18,
    scale: 0.98,
    duration: 0.15,
    ease: 'power2.in',
  })
    .to(targetElement, {
      rotation: 5.5,
      skewX: -4.0,
      skewY: 3.0,
      x: 15,
      y: -14,
      scale: 1.02,
      duration: 0.2,
      ease: 'power1.inOut',
    })
    .to(targetElement, {
      rotation: -3.0,
      skewX: 2.0,
      skewY: -1.5,
      x: -8,
      y: 10,
      duration: 0.25,
      ease: 'power1.inOut',
    })
    .to(targetElement, {
      rotation: 1.8,
      skewX: -1.0,
      skewY: 0.8,
      x: 6,
      y: -5,
      duration: 0.3,
      ease: 'power1.out',
    });
}
