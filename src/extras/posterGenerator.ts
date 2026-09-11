// ============================================================
// RITUAL.exe — Canvas Motivational Poster Generator
// Strictly adheres to Section 31:
// Renders absurd corporate motivational posters on Canvas 2D
// with sleek gradients, framing, and randomized quotes.
// ============================================================

const POSTER_QUOTES = [
  { line1: 'BELIEVE IN YOURSELF.', line2: 'HR believes in your capacity to remain quiet.' },
  { line1: 'YOUR COMPLIANCE IS YOUR FUTURE.', line2: 'And your future is scheduled from 9 to 5.' },
  { line1: 'YOU WERE NOT BORN TO BE PRODUCTIVE.', line2: 'You were born to complete this form.' },
  { line1: 'EXCELLENCE IS NOT AN ACT.', line2: 'It is a mandatory morning requirement.' },
  { line1: 'PASSION MEETS PROCESS.', line2: 'Process wins every single time.' },
];

export function renderMotivationalPoster(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  const w = (canvas.width = 540);
  const h = (canvas.height = 360);

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a102f');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#06202a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  ctx.strokeStyle = '#7c4dff';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  // Subtle background glow circle
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.4, 160);
  glow.addColorStop(0, 'rgba(124, 77, 255, 0.25)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Pick random quote
  const quote = POSTER_QUOTES[Math.floor(Math.random() * POSTER_QUOTES.length)];

  // Text rendering
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 12;
  ctx.fillText(quote.line1, w / 2, h / 2 - 20);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#a0a0c0';
  ctx.font = '13px "Comic Sans MS", "Nunito", sans-serif';
  ctx.fillText(quote.line2, w / 2, h / 2 + 25);

  // Footer seal
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('OFFICIALLY APPROVED FOR CUBICLE DISPLAY // RITUAL.EXE', w / 2, h - 38);
}
