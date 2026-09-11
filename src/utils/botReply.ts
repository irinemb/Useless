// ============================================================
// RITUAL.exe — Keyword-Swap Sarcastic Bot Reply Generator
// (Stretch feature: keyword-swap chatbot)
// ============================================================

interface BotInput {
  screamPeak: number;
  catchTimeMs: number;
}

const OPENERS = [
  "Thank you for your compliance.",
  "Your enthusiasm has been logged.",
  "Noted with moderate interest.",
  "We have received your morning.",
  "This interaction has been archived for training purposes.",
];

const SCREAM_COMMENTS: Record<string, string> = {
  high: "Your vocal output exceeded recommended decibel guidelines. HR is reviewing the acoustics report.",
  medium: "Your scream registered as 'acceptable.' We were hoping for more.",
  low: "Your scream was technically a sound. We have noted this.",
  none: "No scream was detected. We are choosing to believe you tried.",
};

const CATCH_COMMENTS: Record<string, string> = {
  fast: "Your letter-acquisition velocity was above the 73rd percentile. This will not be rewarded.",
  medium: "You caught the letters in a time frame we have decided to call 'adequate.'",
  slow: "The letters were eventually assembled. Our records show this took a while. Our records are permanent.",
};

const CLOSERS = [
  "Your presence has been noted 👍",
  "Please enjoy the rest of your shift.",
  "You may now experience the morning.",
  "This concludes the mandatory portion of your day.",
  "Your soul has been provisionally approved.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateBotReply(input: BotInput): string {
  const screamKey =
    input.screamPeak > 0.75 ? 'high' :
    input.screamPeak > 0.4 ? 'medium' :
    input.screamPeak > 0.05 ? 'low' : 'none';

  const catchKey =
    input.catchTimeMs < 10000 ? 'fast' :
    input.catchTimeMs < 25000 ? 'medium' : 'slow';

  const lines = [
    pick(OPENERS),
    SCREAM_COMMENTS[screamKey],
    CATCH_COMMENTS[catchKey],
    pick(CLOSERS),
  ];

  return lines.join(' ');
}
