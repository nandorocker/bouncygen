/**
 * Generate CSS @keyframes from spring curve + effect parameters.
 * Effects: scale (0-100), lift (0-100), wobble (0-100), squash (0-100)
 */
export function generateKeyframes(springValues, effects) {
  const { scale, lift, wobble, squash } = effects;

  // Map slider 0-100 to actual CSS ranges
  const maxScale = 1 + scale / 100 * 0.5;       // up to 1.5
  const maxLift = lift / 100 * 30;                // up to 30px
  const maxWobble = wobble / 100 * 15;            // up to 15deg
  const maxSquash = squash / 100 * 0.3;           // up to 0.3 ratio offset

  const totalSteps = springValues.length - 1;
  const lines = [];

  for (let i = 0; i <= totalSteps; i++) {
    const pct = Math.round((i / totalSteps) * 100);
    const t = springValues[i]; // spring value (0→1 with overshoot)

    const s = 1 + (maxScale - 1) * t;
    const y = -maxLift * t;
    const r = maxWobble * (t - 1) * (i < totalSteps ? 1 : 0); // wobble around target
    const sx = 1 + (maxScale - 1) * t + maxSquash * (t - 1);
    const sy = 1 + (maxScale - 1) * t - maxSquash * (t - 1);

    let transform;
    if (squash > 0) {
      transform = `scaleX(${sx.toFixed(4)}) scaleY(${sy.toFixed(4)}) translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;
    } else {
      transform = `scale(${s.toFixed(4)}) translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;
    }

    lines.push(`  ${pct}% { transform: ${transform}; }`);
  }

  // Deduplicate consecutive identical percentages (keep last)
  const deduped = [];
  for (let i = 0; i < lines.length; i++) {
    const pct = lines[i].match(/^\s*(\d+)%/)[1];
    const nextPct = i + 1 < lines.length ? lines[i + 1].match(/^\s*(\d+)%/)[1] : null;
    if (pct !== nextPct) deduped.push(lines[i]);
  }

  const keyframesCSS = `@keyframes bounce-hover {\n${deduped.join('\n')}\n}`;

  const ruleCSS = `.my-button:hover {\n  animation: bounce-hover 0.6s forwards;\n}`;

  return `${keyframesCSS}\n\n${ruleCSS}`;
}
