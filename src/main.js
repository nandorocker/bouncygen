import { simulateSpring } from './spring.js';
import { generateKeyframes, generateTailwindConfig } from './keyframes.js';
import '../style.css';

// ── Presets ───────────────────────────────────────────────────────────────
const PRESETS = {
  'Jelly Pop':    { scale: 60, lift: 30, wobble: 8,  squash: 35, stiffness: 280, damping: 8,  mass: 0.8 },
  'Rocket Launch':{ scale: 20, lift: 90, wobble: 4,  squash: 50, stiffness: 350, damping: 12, mass: 0.6 },
  'Rubber Duck':  { scale: 40, lift: 20, wobble: 45, squash: 55, stiffness: 180, damping: 6,  mass: 1.2 },
  'Subtle Nod':   { scale: 15, lift: 10, wobble: 0,  squash: 8,  stiffness: 400, damping: 20, mass: 1.0 },
  'Earthquake':   { scale: 25, lift: 5,  wobble: 80, squash: 20, stiffness: 500, damping: 4,  mass: 0.5 },
};

// ── DOM refs ──────────────────────────────────────────────────────────────
const sliders = {
  scale: document.getElementById('scale'), lift: document.getElementById('lift'),
  wobble: document.getElementById('wobble'), squash: document.getElementById('squash'),
  stiffness: document.getElementById('stiffness'), damping: document.getElementById('damping'),
  mass: document.getElementById('mass'),
};
const valueDisplays = Object.fromEntries(
  Object.keys(sliders).map(k => [k, document.getElementById(`${k}-val`)])
);

const dynamicStyle  = document.getElementById('dynamic-style');
const bigButton     = document.getElementById('big-button');
const codeOutput    = document.getElementById('code-output');
const copyBtn       = document.getElementById('copy-btn');
const tabs          = document.querySelectorAll('.tab');
const presetSelect  = document.getElementById('preset-select');

// ── Tab state ─────────────────────────────────────────────────────────────
let activeTab = 'css';
let currentCSS = '';
let currentTW  = '';

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    codeOutput.textContent = activeTab === 'css' ? currentCSS : currentTW;
  });
});

// ── Presets ───────────────────────────────────────────────────────────────
presetSelect.addEventListener('change', () => {
  const preset = PRESETS[presetSelect.value];
  if (!preset) return;
  Object.keys(preset).forEach(k => { sliders[k].value = preset[k]; });
  update();
});

// ── Core update ───────────────────────────────────────────────────────────
function update() {
  Object.keys(sliders).forEach(k => { valueDisplays[k].textContent = sliders[k].value; });

  const springValues = simulateSpring(
    parseFloat(sliders.stiffness.value),
    parseFloat(sliders.damping.value),
    parseFloat(sliders.mass.value),
    60
  );
  const effects = {
    scale: parseFloat(sliders.scale.value), lift: parseFloat(sliders.lift.value),
    wobble: parseFloat(sliders.wobble.value), squash: parseFloat(sliders.squash.value),
  };

  currentCSS = generateKeyframes(springValues, effects);
  currentTW  = generateTailwindConfig(springValues, effects);
  dynamicStyle.textContent = currentCSS;
  codeOutput.textContent = activeTab === 'css' ? currentCSS : currentTW;
}

Object.values(sliders).forEach(s => s.addEventListener('input', update));

// ── Hover: bounce in, ease out ────────────────────────────────────────────
const EASE_OUT_MS = 250;

bigButton.addEventListener('mouseenter', () => {
  bigButton.style.transition = '';
  bigButton.style.transform = '';
  bigButton.classList.remove('bounce');
  void bigButton.offsetWidth;
  bigButton.classList.add('bounce');
});

bigButton.addEventListener('mouseleave', () => {
  bigButton.classList.remove('bounce');
  bigButton.style.transition = `transform ${EASE_OUT_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  bigButton.style.transform = 'scale(1) translateY(0) rotate(0deg)';
  setTimeout(() => { bigButton.style.transition = ''; }, EASE_OUT_MS);
});

// ── Copy ──────────────────────────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
  const text = activeTab === 'css' ? currentCSS : currentTW;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });
});

// ── Init ──────────────────────────────────────────────────────────────────
update();
