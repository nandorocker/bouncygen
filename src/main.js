import { simulateSpring } from './spring.js';
import { generateKeyframes } from './keyframes.js';
import '../style.css';

const sliders = {
  scale: document.getElementById('scale'),
  lift: document.getElementById('lift'),
  wobble: document.getElementById('wobble'),
  squash: document.getElementById('squash'),
  stiffness: document.getElementById('stiffness'),
  damping: document.getElementById('damping'),
  mass: document.getElementById('mass'),
};

const valueDisplays = {};
Object.keys(sliders).forEach(key => {
  valueDisplays[key] = document.getElementById(`${key}-val`);
});

const codeOutput = document.getElementById('code-output');
const copyBtn = document.getElementById('copy-btn');
const dynamicStyle = document.getElementById('dynamic-style');
const bigButton = document.getElementById('big-button');

function update() {
  // Read values
  Object.keys(sliders).forEach(key => {
    valueDisplays[key].textContent = sliders[key].value;
  });

  const stiffness = parseFloat(sliders.stiffness.value);
  const damping = parseFloat(sliders.damping.value);
  const mass = parseFloat(sliders.mass.value);

  const springValues = simulateSpring(stiffness, damping, mass, 60);

  const effects = {
    scale: parseFloat(sliders.scale.value),
    lift: parseFloat(sliders.lift.value),
    wobble: parseFloat(sliders.wobble.value),
    squash: parseFloat(sliders.squash.value),
  };

  const css = generateKeyframes(springValues, effects);
  codeOutput.textContent = css;
  dynamicStyle.textContent = css;
}

// Listen to all sliders
Object.values(sliders).forEach(s => s.addEventListener('input', update));

// Hover trigger — animate in on enter, hold final state, reset on leave
bigButton.addEventListener('mouseenter', () => {
  bigButton.classList.remove('bounce');
  void bigButton.offsetWidth; // force reflow
  bigButton.classList.add('bounce');
});
bigButton.addEventListener('mouseleave', () => {
  bigButton.classList.remove('bounce');
});

// Copy button
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(codeOutput.textContent).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = '📋 Copy CSS'; }, 1500);
  });
});

// Initial render
update();
