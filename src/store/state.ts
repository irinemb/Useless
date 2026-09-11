// ============================================================
// RITUAL.exe — Store: State Shape & Initial State
// Strictly adheres to Section 4 & 7 of RITUAL.exe specification
// ============================================================

export type RitualState =
  | 'LOCKED'
  | 'EYE_CONTACT'
  | 'VOCAL_GATE'
  | 'LOADING'
  | 'RIGGED_MCQ'
  | 'TASK_SCREEN'
  | 'LETTER_CATCH'
  | 'BOT_REPLY'
  | 'VICTORY'
  | 'RECEIPT'
  | 'COMPLETED';

export interface RitualStore {
  state: RitualState;

  demoMode: boolean;

  eye: {
    elapsedMs: number;
    targetMs: number;
    confirmed: boolean;
  };

  vocal: {
    mode: 'twister' | 'singing';
    reps: number;
    score: number;
    accepted: boolean;
  };

  loading: {
    progress: number;
    mcqShown: boolean;
  };

  message: {
    target: string;
    caught: string[];
    complete: boolean;
  };

  metrics: {
    screamPeak: number;
    catchTimeMs: number;
    singingScore: number;
  };

  batteryPercent: number;

  rank: string | null;

  // Additional session tracking
  sessionStartMs: number;
  skipCount: number;
  botReply: string | null;
  vocalTarget: string;
}

export const initialState: RitualStore = {
  state: 'LOCKED',
  demoMode: new URLSearchParams(window.location.search).get('demo') === 'true',
  eye: {
    elapsedMs: 0,
    targetMs: 60000,
    confirmed: false,
  },
  vocal: {
    mode: 'twister',
    reps: 0,
    score: 0,
    accepted: false,
  },
  loading: {
    progress: 0,
    mcqShown: false,
  },
  message: {
    target: 'GOOD MORNING',
    caught: [],
    complete: false,
  },
  metrics: {
    screamPeak: 0,
    catchTimeMs: 0,
    singingScore: 0,
  },
  batteryPercent: 100,
  rank: null,
  sessionStartMs: Date.now(),
  skipCount: 0,
  botReply: null,
  vocalTarget: '',
};
