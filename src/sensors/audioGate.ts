// ============================================================
// RITUAL.exe — Audio Sensor: RMS Scream Gate
// Strictly adheres to Section 21:
// Use microphone RMS detection when available.
// Threshold should be forgiving.
// When loud enough: emits scream detection.
// ============================================================

export interface AudioGateOptions {
  onLevel: (rms: number) => void;
  onScream: (peak: number) => void;
  onError: (err: string) => void;
  threshold?: number;
}

export async function initAudioGate(options: AudioGateOptions): Promise<{ stop: () => void }> {
  const { onLevel, onScream, onError, threshold = 0.25 } = options;

  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let rafId = 0;
  let running = true;
  let peak = 0;
  let screamFired = false;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtx();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.2;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);

    function check() {
      if (!running || !analyser) return;

      analyser.getFloatTimeDomainData(buffer);

      let sumSq = 0;
      for (let i = 0; i < buffer.length; i++) {
        sumSq += buffer[i] * buffer[i];
      }
      const rms = Math.sqrt(sumSq / buffer.length);

      peak = Math.max(peak, rms);
      onLevel(rms);

      if (rms >= threshold && !screamFired) {
        screamFired = true;
        onScream(peak);
      }

      rafId = requestAnimationFrame(check);
    }

    check();
  } catch (err: any) {
    onError(err?.message || 'Microphone unavailable');
  }

  return {
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch {}
      }
    },
  };
}
