/**
 * Generate CSS @keyframes from spring curve + effect parameters.
 */
export function generateKeyframes(springValues, effects) {
  const steps = buildSteps(springValues, effects);

  const lines = steps.map(({ pct, transform }) => `  ${pct}% { transform: ${transform}; }`);

  const keyframesCSS = `@keyframes bounce-hover {\n${lines.join('\n')}\n}`;
  const ruleCSS = `.my-button:hover {\n  animation: bounce-hover 0.6s forwards;\n}`;

  return `${keyframesCSS}\n\n${ruleCSS}`;
}

/**
 * Generate a Tailwind config snippet for the animation.
 */
export function generateTailwindConfig(springValues, effects) {
  const steps = buildSteps(springValues, effects);

  const frameLines = steps
    .map(({ pct, transform }) => `        '${pct}%': { transform: '${transform}' },`)
    .join('\n');

  return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'bounce-hover': {
${frameLines}
        },
      },
      animation: {
        'bounce-hover': 'bounce-hover 0.6s forwards',
      },
    },
  },
};

// Usage:
// <button class="hover:animate-bounce-hover">...</button>`;
}

// ── Shared step builder ────────────────────────────────────────────────────
function buildSteps(springValues, effects) {
  const { scale, lift, wobble, squash } = effects;

  const maxScale  = 1 + scale  / 100 * 0.5;   // up to 1.5
  const maxLift   = lift  / 100 * 12;           // up to 12px
  const maxWobble = wobble / 100 * 15;          // up to 15deg
  const maxSquash = squash / 100 * 0.3;         // up to 0.3 ratio offset

  const totalSteps = springValues.length - 1;
  const seen = new Set();
  const steps = [];

  for (let i = 0; i <= totalSteps; i++) {
    const pct = Math.round((i / totalSteps) * 100);
    if (seen.has(pct)) continue;
    seen.add(pct);

    const t = springValues[i];
    let transform;

    if (squash > 0) {
      const sx = 1 + (maxScale - 1) * t + maxSquash * (t - 1);
      const sy = 1 + (maxScale - 1) * t - maxSquash * (t - 1);
      const y  = -maxLift * t;
      const r  = maxWobble * (t - 1) * (i < totalSteps ? 1 : 0);
      transform = `scaleX(${sx.toFixed(4)}) scaleY(${sy.toFixed(4)}) translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;
    } else {
      const s = 1 + (maxScale - 1) * t;
      const y = -maxLift * t;
      const r = maxWobble * (t - 1) * (i < totalSteps ? 1 : 0);
      transform = `scale(${s.toFixed(4)}) translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg)`;
    }

    steps.push({ pct, transform });
  }

  return steps;
}
