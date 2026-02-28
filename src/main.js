import { simulateSpring } from './spring.js';
import { generateKeyframes, generateTailwindConfig } from './keyframes.js';
import '../style.css';

// ── Presets ───────────────────────────────────────────────────────────────
const PRESETS = {
  '🍮 Jelly Pop':      { scale: 60, lift: 40, wobble: 8,  squash: 35, stiffness: 280, damping: 8,  mass: 0.8 },
  '🚀 Rocket Launch':  { scale: 20, lift: 100,wobble: 4,  squash: 50, stiffness: 350, damping: 12, mass: 0.6 },
  '🦆 Rubber Duck':    { scale: 40, lift: 25, wobble: 45, squash: 55, stiffness: 180, damping: 6,  mass: 1.2 },
  '🌋 Earthquake':     { scale: 25, lift: 8,  wobble: 80, squash: 20, stiffness: 500, damping: 4,  mass: 0.5 },
  '🎈 Boing':          { scale: 75, lift: 0,  wobble: 0,  squash: 70, stiffness: 200, damping: 5,  mass: 0.7 },
  '🎡 Tilt-A-Whirl':   { scale: 20, lift: 20, wobble: 100,squash: 10, stiffness: 300, damping: 7,  mass: 0.9 },
  '😎 Confident':      { scale: 30, lift: 35, wobble: 0,  squash: 15, stiffness: 450, damping: 22, mass: 0.8 },
  '🐶 Puppy Jump':     { scale: 50, lift: 90, wobble: 12, squash: 40, stiffness: 220, damping: 7,  mass: 0.6 },
  '🌸 Slow Bloom':     { scale: 80, lift: 8,  wobble: 0,  squash: 25, stiffness: 80,  damping: 14, mass: 2.5 },
  '⚡ Snap':           { scale: 40, lift: 0,  wobble: 0,  squash: 0,  stiffness: 500, damping: 18, mass: 0.4 },
  '🫧 Soap Bubble':    { scale: 18, lift: 30, wobble: 0,  squash: 4,  stiffness: 75,  damping: 18, mass: 0.3 },
  '🎳 Bowling Ball':   { scale: 6,  lift: 5,  wobble: 0,  squash: 28, stiffness: 500, damping: 38, mass: 5.0 },
  '🏓 Ping Pong':      { scale: 22, lift: 85, wobble: 0,  squash: 48, stiffness: 460, damping: 6,  mass: 0.3 },
  '🤸 Trampoline':     { scale: 30, lift: 100,wobble: 4,  squash: 65, stiffness: 190, damping: 6,  mass: 0.9 },
  '🐈 Cat Pounce':     { scale: 55, lift: 45, wobble: 6,  squash: 22, stiffness: 380, damping: 11, mass: 0.6 },
  '🍾 Champagne Cork': { scale: 28, lift: 100,wobble: 18, squash: 32, stiffness: 420, damping: 9,  mass: 0.5 },
  '🏀 Basketball':     { scale: 18, lift: 80, wobble: 0,  squash: 78, stiffness: 290, damping: 8,  mass: 1.5 },
  '🐕 Wet Dog':        { scale: 18, lift: 10, wobble: 92, squash: 12, stiffness: 260, damping: 5,  mass: 0.8 },
  '⌨️ Typewriter Key': { scale: 5,  lift: 15, wobble: 0,  squash: 22, stiffness: 500, damping: 30, mass: 0.5 },
  '🍿 Popcorn':        { scale: 32, lift: 60, wobble: 12, squash: 52, stiffness: 430, damping: 8,  mass: 0.4 },
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
const outputPanel   = document.querySelector('.output');
const toggleBtn     = document.getElementById('toggle-btn');
const resetBtn      = document.getElementById('reset-btn');

// ── Toggle collapse ───────────────────────────────────────────────────────
// Clicking the header bar toggles — but not the tabs/copy button
const outputHeader = document.querySelector('.output-header');

outputHeader.addEventListener('click', (e) => {
  if (e.target.closest('.output-actions')) return;
  const isCollapsed = outputPanel.classList.toggle('collapsed');
  toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
});

// ── Reset ─────────────────────────────────────────────────────────────────
const DEFAULTS = { scale: 50, lift: 40, wobble: 10, squash: 20, stiffness: 200, damping: 10, mass: 1 };

resetBtn.addEventListener('click', () => {
  Object.keys(DEFAULTS).forEach(k => { sliders[k].value = DEFAULTS[k]; });
  presetSelect.value = '';
  update();
});

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
const copyIcon = copyBtn.querySelector('svg');
copyBtn.addEventListener('click', () => {
  const text = activeTab === 'css' ? currentCSS : currentTW;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = '✓ Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '';
      copyBtn.appendChild(copyIcon);
      copyBtn.appendChild(document.createTextNode(' Copy Code'));
    }, 1500);
  });
});

// ── Init ──────────────────────────────────────────────────────────────────
update();
