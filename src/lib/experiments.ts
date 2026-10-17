export const GRAVITY = 9.81;
export const DROP_HEIGHT = 20;
/** Downward displacement before impact, from rest, for F = mg - b v. */
export function fallDistance(time: number, mass: number, drag: number): number {
  if (time < 0 || mass <= 0 || drag < 0) throw new RangeError('Use non-negative time/drag and positive mass.');
  if (drag === 0) return 0.5 * GRAVITY * time * time;
  const tau = mass / drag;
  // expm1 preserves precision when time/tau is small.
  return GRAVITY * tau * (time + tau * Math.expm1(-time / tau));
}
export function secantSlope(a: number, h: number): number {
  if (h === 0) throw new RangeError('A secant requires h ≠ 0.');
  return 2 * a + h;
}
