export function coriolis(omega: number, vx: number, vy: number) {
  return { ax: 2 * omega * vy, ay: -2 * omega * vx };
}
export function principalBody(w1: number, w2: number, w3: number) {
  const L = [2 * w1, 3 * w2, 4 * w3];
  const derivative = [(-w2 * w3) / 2, (2 * w3 * w1) / 3, (-w1 * w2) / 4];
  return {
    L,
    derivative,
    energy: (2 * w1 * w1 + 3 * w2 * w2 + 4 * w3 * w3) / 2,
    crossMagnitude: Math.hypot(
      w2 * L[2] - w3 * L[1],
      w3 * L[0] - w1 * L[2],
      w1 * L[1] - w2 * L[0],
    ),
  };
}
export function rutherford(impact: number, energy: number, kappa = 4) {
  const angle = 2 * Math.atan(kappa / (2 * energy * impact));
  return {
    angle,
    crossSection: (kappa / (4 * energy)) ** 2 / Math.sin(angle / 2) ** 4,
  };
}
