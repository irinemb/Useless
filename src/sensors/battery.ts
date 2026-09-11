// ============================================================
// RITUAL.exe — Battery Sensor
// Strictly adheres to Section 29:
// navigator.getBattery() + manual slider fallback + jokes
// ============================================================

import { emit } from '../store/bus';

export function getBatteryJoke(pct: number): string {
  if (pct >= 90) return 'Suspiciously prepared.';
  if (pct >= 50) return 'Functioning within acceptable parameters.';
  if (pct >= 15) return 'Your machine knows you want to go home.';
  return 'The Ritual may outlive you.';
}

export async function initBattery(): Promise<void> {
  function updateBar(pct: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    emit('BATTERY_CHANGED', clamped);

    const fill = document.getElementById('battery-fill');
    const label = document.getElementById('battery-label');
    const jokeEl = document.getElementById('battery-joke');
    const root = document.documentElement;

    if (fill) fill.style.setProperty('--bat-pct', `${clamped}%`);
    if (label) label.textContent = `${clamped}%`;
    if (jokeEl) jokeEl.textContent = getBatteryJoke(clamped);

    if (clamped <= 20) {
      root.setAttribute('data-battery', 'low');
    } else if (clamped <= 50) {
      root.setAttribute('data-battery', 'medium');
    } else {
      root.removeAttribute('data-battery');
    }
  }

  // Try native navigator.getBattery() (Chromium)
  try {
    const nav = navigator as any;
    if (nav.getBattery) {
      const battery = await nav.getBattery();
      updateBar(battery.level * 100);

      battery.addEventListener('levelchange', () => {
        updateBar(battery.level * 100);
      });
      return;
    }
  } catch {
    // Expected on Firefox/Safari or permissions policy
  }

  // Fallback default
  updateBar(100);
}
