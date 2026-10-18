/** Standard Legendre polynomial, P_l(1)=1, restricted to a small plotting range. */
export function legendre(degree: number, x: number): number {
  if (
    !Number.isInteger(degree) ||
    degree < 0 ||
    degree > 8 ||
    !Number.isFinite(x) ||
    x < -1 ||
    x > 1
  )
    throw new RangeError("Choose an integer degree 0–8 and finite x in [−1,1]");
  if (degree === 0) return 1;
  let previous = 1,
    current = x;
  for (let n = 1; n < degree; n++) {
    const next = ((2 * n + 1) * x * current - n * previous) / (n + 1);
    previous = current;
    current = next;
  }
  return current;
}
/** Real zonal harmonic in the standard orthonormal complex-harmonic convention. */
export function zonalHarmonic(degree: number, x: number) {
  return Math.sqrt((2 * degree + 1) / (4 * Math.PI)) * legendre(degree, x);
}
