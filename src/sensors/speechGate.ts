// ============================================================
// RITUAL.exe — Speech Gate (Web Speech API + Fuzzy Matching)
// Strictly adheres to Section 12
// Target tolerance: approx 15-20% edit-distance tolerance
// ============================================================

import { isMatch } from '../utils/fuzzyMatch';

export interface SpeechGateOptions {
  target: string;
  onRep: () => void;
  onInterim?: (transcript: string) => void;
  onError: (reason: string) => void;
}

export function initSpeechGate(opts: SpeechGateOptions): { stop: () => void } {
  const { target, onRep, onInterim, onError } = opts;
  const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

  if (!SR) {
    onError('Speech recognition not supported in this browser');
    return { stop: () => {} };
  }

  let running = true;
  let recognition: any = null;

  function createAndStart() {
    if (!running) return;

    try {
      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          transcript += e.results[i][0].transcript;
        }
        transcript = transcript.trim();
        if (onInterim) onInterim(transcript);

        // 15-20% edit-distance tolerance (threshold 0.75)
        if (isMatch(transcript, target, 0.75)) {
          onRep();
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          running = false;
          onError('Microphone permission denied');
        } else if (e.error !== 'no-speech') {
          onError(`Speech error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        if (running) {
          // Restart if still running
          setTimeout(() => {
            if (running) {
              try {
                recognition.start();
              } catch {}
            }
          }, 200);
        }
      };

      recognition.start();
    } catch (err: any) {
      onError(err?.message || 'Speech recognition failed to start');
    }
  }

  createAndStart();

  return {
    stop() {
      running = false;
      try {
        recognition?.stop();
      } catch {}
    },
  };
}
