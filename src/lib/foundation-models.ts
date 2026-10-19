/** SI units except conic lengths, which share any consistent unit. */
export function hydrostatic(
  depth: number,
  density = 1000,
  gravity = 9.8,
  surface = 101300,
) {
  const gauge = density * gravity * depth;
  return { gauge, absolute: surface + gauge };
}
/** One mole monatomic ideal gas. Heating paths share T endpoints, not V endpoints. */
export function thermalHeating(deltaT: number, constantPressure: boolean) {
  const internal = 1.5 * 8.314 * deltaT;
  const work = constantPressure ? 8.314 * deltaT : 0;
  return { internal, work, heat: internal + work };
}
/** Bound focus-based conic, angle in radians, a>0 and 0<=e<1. */
export function ellipsePoint(a: number, e: number, angle: number) {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
  return {
    r,
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    periapsis: a * (1 - e),
    apoapsis: a * (1 + e),
  };
}
/** Slice of plane x+2y+2z=3 through P=(x,0,z). */
export function planeProjection(x: number, z: number) {
  const residual = x + 2 * z - 3;
  return {
    signed: residual / 3,
    foot: [x - residual / 9, (-2 * residual) / 9, z - (2 * residual) / 9],
  };
}
