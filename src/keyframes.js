// ── Shared constants ───────────────────────────────────────────────────────
const SCALE_MAX  = 0.5;  // slider 100 → 0.5 scale delta
const LIFT_PX    = 12;   // slider 100 → 12px lift
const WOBBLE_DEG = 15;   // slider 100 → 15deg wobble
const SQUASH_MAX = 0.3;  // slider 100 → 0.3 scaleX/Y offset

// Shared target value calculator for Framer Motion and React Spring
function calcTargets({ scale, lift, wobble, squash }) {
  const targetScale  = +(1 + scale  / 100 * SCALE_MAX).toFixed(3);
  const targetY      = +(-lift / 100 * LIFT_PX).toFixed(2);
  const targetRotate = +(wobble / 100 * WOBBLE_DEG * 0.3).toFixed(2);
  const targetScaleX = squash > 0 ? +(targetScale + squash / 100 * SQUASH_MAX).toFixed(3) : null;
  const targetScaleY = squash > 0 ? +(targetScale - squash / 100 * SQUASH_MAX).toFixed(3) : null;
  return { targetScale, targetY, targetRotate, targetScaleX, targetScaleY };
}

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

/**
 * Generate a Framer Motion whileHover snippet.
 */
export function generateFramerMotion(springParams, effects) {
  const { stiffness, damping, mass } = springParams;
  const { squash } = effects;
  const { targetScale, targetY, targetRotate, targetScaleX, targetScaleY } = calcTargets(effects);

  const hoverProps = squash > 0
    ? `scaleX: ${targetScaleX}, scaleY: ${targetScaleY}, y: ${targetY}, rotate: ${targetRotate}`
    : `scale: ${targetScale}, y: ${targetY}, rotate: ${targetRotate}`;

  return `import { motion } from "framer-motion";

const spring = {
  type: "spring",
  stiffness: ${stiffness},
  damping: ${damping},
  mass: ${mass},
};

export function MyButton() {
  return (
    <motion.button
      whileHover={{ ${hoverProps} }}
      transition={spring}
    >
      Click me
    </motion.button>
  );
}`;
}

/**
 * Generate a React Spring useSpring snippet.
 * React Spring uses tension (≈ stiffness) and friction (≈ damping).
 */
export function generateReactSpring(springParams, effects) {
  const { stiffness, damping, mass } = springParams;
  const { squash } = effects;
  const { targetScale, targetY, targetRotate, targetScaleX, targetScaleY } = calcTargets(effects);

  const hoverTo = squash > 0
    ? `scaleX: ${targetScaleX}, scaleY: ${targetScaleY}, y: "${targetY}px", rotateZ: ${targetRotate}`
    : `scale: ${targetScale}, y: "${targetY}px", rotateZ: ${targetRotate}`;
  const restTo = squash > 0
    ? `scaleX: 1, scaleY: 1, y: "0px", rotateZ: 0`
    : `scale: 1, y: "0px", rotateZ: 0`;

  return `import { useSpring, animated } from "@react-spring/web";

const config = {
  tension: ${stiffness},
  friction: ${damping},
  mass: ${mass},
};

export function MyButton() {
  const [styles, api] = useSpring(() => ({
    ${restTo},
    config,
  }));

  return (
    <animated.button
      style={styles}
      onMouseEnter={() => api.start({ ${hoverTo} })}
      onMouseLeave={() => api.start({ ${restTo} })}
    >
      Click me
    </animated.button>
  );
}`;
}

// ── Shared step builder ────────────────────────────────────────────────────
function buildSteps(springValues, effects) {
  const { scale, lift, wobble, squash } = effects;

  const maxScale  = 1 + scale  / 100 * SCALE_MAX;
  const maxLift   = lift  / 100 * LIFT_PX;
  const maxWobble = wobble / 100 * WOBBLE_DEG;
  const maxSquash = squash / 100 * SQUASH_MAX;

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
