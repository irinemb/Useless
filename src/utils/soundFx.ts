// ============================================================
// RITUAL.exe — Sound Design Engine (Howler.js + Web Audio synthesis)
// Strictly adheres to Section 34:
// - Eye contact success: Microwave-style DING
// - Loading: Distorted elevator music loop
// - Button interactions: Tiny UI clicks
// - Letter catch: Satisfying pop/click
// - Enter catch: Huge impact sound
// - Victory: Genuinely triumphant fanfare
// - Receipt: Subtle printer sound
// 100% OFFLINE: Procedurally generated WAV buffers played via Howler
// ============================================================

import { Howl } from 'howler';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Convert AudioBuffer to 16-bit PCM WAV Data URI
function bufferToWavUri(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(out, 0, 'RIFF');
  out.setUint32(4, length - 8, true);
  writeString(out, 8, 'WAVE');
  writeString(out, 12, 'fmt ');
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true); // PCM
  out.setUint16(22, numChannels, true);
  out.setUint32(24, sampleRate, true);
  out.setUint32(28, sampleRate * numChannels * 2, true);
  out.setUint16(32, numChannels * 2, true);
  out.setUint16(34, 16, true);
  writeString(out, 36, 'data');
  out.setUint32(40, buffer.length * numChannels * 2, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      out.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  const blob = new Blob([out.buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// ── Sound generators ─────────────────────────────────────────

// 1. Microwave DING (880Hz + harmonic chime with long decay)
function createDingBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 1.8;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const decay1 = Math.exp(-3.5 * t);
    const decay2 = Math.exp(-6.0 * t);
    // Fundamental + resonant harmonic
    const s1 = Math.sin(2 * Math.PI * 880 * t) * decay1 * 0.7;
    const s2 = Math.sin(2 * Math.PI * 1760 * t) * decay2 * 0.3;
    const s3 = Math.sin(2 * Math.PI * 2640 * t) * decay2 * 0.15;
    data[i] = s1 + s2 + s3;
  }
  return buffer;
}

// 2. Button Click
function createClickBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.04;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-90 * t);
    data[i] = Math.sin(2 * Math.PI * 1200 * t) * decay * 0.5;
  }
  return buffer;
}

// 3. Letter Catch Pop
function createPopBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.12;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const freq = 320 + t * 4200; // pitch sweep up
    const decay = Math.exp(-28 * t);
    data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.6;
  }
  return buffer;
}

// 4. Enter Catch Boom (Huge impact sound)
function createBoomBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 1.2;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const subFreq = Math.max(40, 160 - t * 140);
    const sub = Math.sin(2 * Math.PI * subFreq * t) * Math.exp(-4 * t);
    const noise = (Math.random() * 2 - 1) * Math.exp(-12 * t) * 0.5;
    data[i] = (sub * 0.8 + noise) * 0.9;
  }
  return buffer;
}

// 5. Triumphant Fanfare (Genuine heroic multi-note brass fanfare)
function createFanfareBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 3.2;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  // Notes in sequence: C4, G4, E4, C5, with harmonic richness
  const notes = [
    { start: 0.0, dur: 0.28, freq: 261.63 },
    { start: 0.28, dur: 0.28, freq: 329.63 },
    { start: 0.56, dur: 0.35, freq: 392.00 },
    { start: 0.91, dur: 1.8,  freq: 523.25 }, // final triumphant high note
  ];

  for (const n of notes) {
    const startSample = Math.floor(n.start * sampleRate);
    const numSamples = Math.floor(n.dur * sampleRate);
    for (let i = 0; i < numSamples && (startSample + i) < data.length; i++) {
      const t = i / sampleRate;
      const env = Math.min(1, i / (0.02 * sampleRate)) * Math.exp(-1.2 * t);
      // Brass rich harmonics
      const osc =
        Math.sin(2 * Math.PI * n.freq * t) * 0.5 +
        Math.sin(2 * Math.PI * n.freq * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * n.freq * 3 * t) * 0.15;
      data[startSample + i] += osc * env * 0.5;
    }
  }
  return buffer;
}

// 6. Receipt Printer (Dot-matrix mechanical chatter)
function createPrinterBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.8;
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const pulse = Math.sin(2 * Math.PI * 18 * t) > 0.6 ? 1 : 0;
    const click = (Math.random() * 2 - 1) * pulse * 0.4;
    data[i] = click * Math.exp(-0.8 * t);
  }
  return buffer;
}

// 7. Distorted Cheesy Elevator Music (Bossa-nova lounge loop)
function createElevatorBuffer(): AudioBuffer {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 4.0; // 4s seamless loop
  const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);

  // Loungy chords: Cmaj7 -> Dm7 -> G7 -> Cmaj7
  const chords = [
    { start: 0.0, freqs: [261.63, 329.63, 392.00, 493.88] },
    { start: 1.0, freqs: [293.66, 349.23, 440.00, 523.25] },
    { start: 2.0, freqs: [392.00, 493.88, 587.33, 698.46] },
    { start: 3.0, freqs: [261.63, 329.63, 392.00, 523.25] },
  ];

  for (const c of chords) {
    const startSample = Math.floor(c.start * sampleRate);
    const numSamples = Math.floor(1.0 * sampleRate);
    for (let i = 0; i < numSamples && (startSample + i) < data.length; i++) {
      const t = i / sampleRate;
      let val = 0;
      for (const f of c.freqs) {
        // Vibrato + gentle synth organ
        const vib = Math.sin(2 * Math.PI * 5 * t) * 2;
        val += Math.sin(2 * Math.PI * (f + vib) * t) * 0.06;
      }
      // Light distortion / tape flutter
      val = Math.tanh(val * 1.5) * 0.8;
      data[startSample + i] = val;
    }
  }
  return buffer;
}

// ── Howl Instances ───────────────────────────────────────────
let howlDing: Howl | null = null;
let howlClick: Howl | null = null;
let howlPop: Howl | null = null;
let howlBoom: Howl | null = null;
let howlFanfare: Howl | null = null;
let howlPrinter: Howl | null = null;
let howlElevator: Howl | null = null;

let initialized = false;

function initSounds() {
  if (initialized) return;
  initialized = true;

  try {
    howlDing = new Howl({ src: [bufferToWavUri(createDingBuffer())], format: ['wav'], volume: 0.8 });
    howlClick = new Howl({ src: [bufferToWavUri(createClickBuffer())], format: ['wav'], volume: 0.4 });
    howlPop = new Howl({ src: [bufferToWavUri(createPopBuffer())], format: ['wav'], volume: 0.7 });
    howlBoom = new Howl({ src: [bufferToWavUri(createBoomBuffer())], format: ['wav'], volume: 0.9 });
    howlFanfare = new Howl({ src: [bufferToWavUri(createFanfareBuffer())], format: ['wav'], volume: 0.85 });
    howlPrinter = new Howl({ src: [bufferToWavUri(createPrinterBuffer())], format: ['wav'], volume: 0.6 });
    howlElevator = new Howl({ src: [bufferToWavUri(createElevatorBuffer())], format: ['wav'], volume: 0.35, loop: true });
  } catch (err) {
    console.warn('[RITUAL] Failed to initialize Howler sounds:', err);
  }
}

// Ensure sounds unlock on first user gesture
if (typeof window !== 'undefined') {
  const unlock = () => {
    initSounds();
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function playDing(): void {
  initSounds();
  howlDing?.play();
}

export function playClick(): void {
  initSounds();
  howlClick?.play();
}

export function playPop(): void {
  initSounds();
  howlPop?.play();
}

export function playBoom(): void {
  initSounds();
  howlBoom?.play();
}

export function playFanfare(): void {
  initSounds();
  howlFanfare?.play();
}

export function playPrinter(): void {
  initSounds();
  howlPrinter?.play();
}

export function startElevatorMusic(): void {
  initSounds();
  if (!howlElevator?.playing()) {
    howlElevator?.play();
  }
}

export function stopElevatorMusic(): void {
  howlElevator?.stop();
}
