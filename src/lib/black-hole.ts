/** Equatorial Schwarzschild null geodesic, G=M=c=1. Educational finite-step integration. */
export function photonPath(impact: number) {
  if (!Number.isFinite(impact) || impact < 3 || impact > 8)
    throw Error("Impact parameter must be between 3 and 8");
  let u = 1 / 18,
    v = Math.sqrt(1 / impact ** 2 - u * u + 2 * u ** 3),
    phi = 0;
  const points: number[][] = [];
  const h = 0.002;
  for (let i = 0; i < 7000; i++) {
    const r = 1 / u;
    points.push([r * Math.cos(phi), r * Math.sin(phi)]);
    if (u >= 0.5) return { points, captured: true };
    if (u <= 1 / 25 && v < 0) return { points, captured: false };
    // Fourth-order Runge–Kutta for u'=v, v'=3u²-u.
    const f = (x: number) => 3 * x * x - x;
    const a = v,
      b = f(u),
      c = v + (h * b) / 2,
      d = f(u + (h * a) / 2),
      e = v + (h * d) / 2,
      f2 = f(u + (h * c) / 2),
      g = v + h * f2,
      k = f(u + h * e);
    u += (h * (a + 2 * c + 2 * e + g)) / 6;
    v += (h * (b + 2 * d + 2 * f2 + k)) / 6;
    phi += h;
  }
  return { points, captured: null };
}
