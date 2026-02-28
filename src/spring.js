/**
 * Simulate a damped spring from 0 → 1 with overshoot/oscillation.
 * Returns an array of `steps` values representing the spring position over time.
 */
export function simulateSpring(stiffness = 200, damping = 10, mass = 1, steps = 60) {
  const dt = 1 / steps;
  const target = 1;
  let position = 0;
  let velocity = 0;
  const result = [0];

  for (let i = 1; i <= steps; i++) {
    const springForce = -stiffness * (position - target);
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
    result.push(position);
  }

  return result;
}
