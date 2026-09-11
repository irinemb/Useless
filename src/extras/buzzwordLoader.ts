// ============================================================
// RITUAL.exe — Buzzword Loader Streamer
// Strictly adheres to Section 15:
// Generates randomized enterprise jargon during loading sequences
// ============================================================

export const BUZZWORDS = [
  'Synergizing vertical enthusiasm…',
  'Aligning stakeholder energy…',
  'Optimizing interpersonal throughput…',
  'Calibrating morning compliance…',
  'Synthesizing cross-functional sincerity…',
  'Auditing coffee readiness…',
  'Normalizing existential friction…',
  'Buffering corporate gratitude…',
  'Deprecating personal boundaries…',
  'De-escalating voluntary thought…',
  'Harvesting ambient optimism…',
  'Benchmarking employee awake-ness…',
  'Reconciling dignity vs KPI targets…',
  'Refactoring baseline morale…',
  'Compressing morning angst into deliverable formats…',
];

export function getRandomBuzzword(previous?: string): string {
  let pick = BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)];
  while (pick === previous && BUZZWORDS.length > 1) {
    pick = BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)];
  }
  return pick;
}
