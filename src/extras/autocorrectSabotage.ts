// ============================================================
// RITUAL.exe — Autocorrect Sabotage
// Strictly adheres to Section 13:
// Intentionally "improves" the user's typed tongue twister
// with absurd corporate substitutions while still accepting it.
// ============================================================

const DICTIONARY: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bwoodchuck\b/gi, replacement: 'emotional baggage' },
  { pattern: /\bwood\b/gi, replacement: 'paperwork' },
  { pattern: /\bbear\b/gi, replacement: 'middle manager' },
  { pattern: /\bhair\b/gi, replacement: 'equity options' },
  { pattern: /\bstump\b/gi, replacement: 'key stakeholder' },
  { pattern: /\bskunk\b/gi, replacement: 'external consultant' },
  { pattern: /\bleather\b/gi, replacement: 'thought leadership' },
  { pattern: /\bweather\b/gi, replacement: 'quarterly planning' },
  { pattern: /\bshoeshine\b/gi, replacement: 'synergy alignment' },
  { pattern: /\bshop\b/gi, replacement: 'cross-functional sprint' },
  { pattern: /\bshines\b/gi, replacement: 'optimizes deliverables' },
  { pattern: /\bsits\b/gi, replacement: 'pivots vertically' },
];

export function sabotageInput(original: string): {
  sabotaged: string;
  hasChanged: boolean;
} {
  let modified = original;
  for (const { pattern, replacement } of DICTIONARY) {
    modified = modified.replace(pattern, replacement);
  }

  return {
    sabotaged: modified,
    hasChanged: modified !== original,
  };
}
