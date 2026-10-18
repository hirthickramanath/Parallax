/** Two equal masses, equal wall springs and one coupling spring; zero initial velocity. */
export function coupledOscillator(
  m: number,
  k: number,
  coupling: number,
  time: number,
  initial1: number,
  initial2: number,
) {
  if (
    ![m, k, coupling, time, initial1, initial2].every(Number.isFinite) ||
    m <= 0 ||
    k <= 0 ||
    coupling < 0 ||
    time < 0
  )
    throw new RangeError(
      "Use positive mass and wall stiffness, nonnegative coupling and time, and finite displacements",
    );
  const plus = Math.sqrt(k / m),
    minus = Math.sqrt((k + 2 * coupling) / m);
  const a = (initial1 + initial2) / Math.SQRT2,
    b = (initial1 - initial2) / Math.SQRT2;
  const q = a * Math.cos(plus * time),
    r = b * Math.cos(minus * time);
  const u = -a * plus * Math.sin(plus * time),
    v = -b * minus * Math.sin(minus * time);
  const x1 = (q + r) / Math.SQRT2,
    x2 = (q - r) / Math.SQRT2;
  const v1 = (u + v) / Math.SQRT2,
    v2 = (u - v) / Math.SQRT2;
  const kinetic = (m * (v1 * v1 + v2 * v2)) / 2;
  const wall = (k * (x1 * x1 + x2 * x2)) / 2;
  const interaction = (coupling * (x2 - x1) ** 2) / 2;
  return {
    x1,
    x2,
    v1,
    v2,
    plus,
    minus,
    kinetic,
    wall,
    interaction,
    energy: kinetic + wall + interaction,
  };
}
