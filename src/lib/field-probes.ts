export interface PointCharge {
  x: number;
  y: number;
  q: number;
}
/** Three-dimensional Coulomb field evaluated in the z=0 plane, with k=1. */
export function chargeField(x: number, y: number, charges: PointCharge[]) {
  let ex = 0,
    ey = 0,
    potential = 0;
  for (const c of charges) {
    if (c.q === 0) continue;
    const dx = x - c.x,
      dy = y - c.y,
      r = Math.hypot(dx, dy);
    if (r < 0.12) return null;
    ex += (c.q * dx) / r ** 3;
    ey += (c.q * dy) / r ** 3;
    potential += c.q / r;
  }
  return { ex, ey, potential };
}
/** Infinite straight z-directed wire, μ0 I/(2π) normalized to current. */
export function wireField(x: number, y: number, current: number) {
  const r2 = x * x + y * y;
  if (r2 < 0.12 ** 2) return null;
  return { ex: (-current * y) / r2, ey: (current * x) / r2 };
}
