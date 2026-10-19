export function quadraticLimit(delta: number) {
  return 2 * delta + delta * delta;
}
export function signedQuadraticArea(b: number, n: number) {
  const h = b / n;
  let left = 0;
  for (let i = 0; i < n; i++) left += (i * h) ** 2 - 1;
  left *= h;
  const signed = b ** 3 / 3 - b,
    geometric = b <= 1 ? -signed : signed + 4 / 3;
  return { left, signed, geometric };
}
export function exponentialSteps(
  k: number,
  y0: number,
  time: number,
  steps: number,
) {
  const h = time / steps,
    factor = 1 + k * h;
  return {
    exact: y0 * Math.exp(k * time),
    euler: y0 * factor ** steps,
    h,
    factor,
  };
}
export type Direction = [number, number, number];
export function domainDirections(count: number): Direction[] {
  if (count === 2)
    return [
      [1, 0, 0],
      [-1, 0, 0],
    ];
  if (count === 3)
    return Array.from({ length: 3 }, (_, i) => [
      Math.cos((i * 2 * Math.PI) / 3),
      Math.sin((i * 2 * Math.PI) / 3),
      0,
    ]);
  const s = 1 / Math.sqrt(3);
  return [
    [s, s, s],
    [s, -s, -s],
    [-s, s, -s],
    [-s, -s, s],
  ];
}
