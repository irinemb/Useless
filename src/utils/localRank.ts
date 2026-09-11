// ============================================================
// RITUAL.exe — Local Rank Computation
// Strictly adheres to Section 28:
// Possible ranks:
// - OVERACHIEVER
// - COMPLIANT
// - CONCERNINGLY ENTHUSIASTIC
// - FUNCTIONALLY AWAKE
// - QUESTIONABLY MOTIVATED
// - HR HAS BEEN NOTIFIED
// - (CHEATER — WE SEE YOU. for Konami code)
// ============================================================

export interface RankMetricsInput {
  screamPeak: number;       // 0–1 RMS
  catchTimeMs: number;      // ms to catch letters
  twisterReps?: number;     // vocal repetitions
  eyeElapsedMs?: number;    // eye contact duration
  batteryPercent?: number;  // 0-100
  cheater?: boolean;        // Konami code override
}

export function computeRank(input: RankMetricsInput): string {
  if (input.cheater) {
    return 'CHEATER — WE SEE YOU.';
  }

  const {
    screamPeak,
    catchTimeMs,
    twisterReps = 3,
    batteryPercent = 100,
  } = input;

  // Unhinged scream + lightning fast catch = HR notification
  if (screamPeak > 0.85 && catchTimeMs < 10000) {
    return 'HR HAS BEEN NOTIFIED';
  }

  // Extreme scream volume
  if (screamPeak > 0.75) {
    return 'CONCERNINGLY ENTHUSIASTIC';
  }

  // Ultra fast letter catching or high stamina with high battery
  if (catchTimeMs < 12000 && twisterReps >= 3) {
    return 'OVERACHIEVER';
  }

  // Low battery or slow reaction
  if (batteryPercent < 20 || catchTimeMs > 40000) {
    return 'QUESTIONABLY MOTIVATED';
  }

  // Mediocre scream + decent completion
  if (screamPeak > 0.35 || catchTimeMs < 25000) {
    return 'FUNCTIONALLY AWAKE';
  }

  return 'COMPLIANT';
}

const RANK_HISTORY_KEY = 'ritual_rank_history';

export function saveRank(rank: string, metrics: RankMetricsInput): void {
  try {
    const history = loadRankHistory();
    history.push({ rank, metrics, date: new Date().toISOString() });
    localStorage.setItem(RANK_HISTORY_KEY, JSON.stringify(history.slice(-20)));
  } catch {
    // localStorage may be disabled in private mode
  }
}

export function loadRankHistory(): Array<{
  rank: string;
  metrics: RankMetricsInput;
  date: string;
}> {
  try {
    return JSON.parse(localStorage.getItem(RANK_HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}
