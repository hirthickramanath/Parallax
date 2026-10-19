export function quadraticDarboux(n: number, fraction: number) {
  let lower = 0,
    upper = 0,
    sampled = 0;
  for (let i = 0; i < n; i++) {
    lower += (i / n) ** 2 / n;
    upper += ((i + 1) / n) ** 2 / n;
    sampled += ((i + fraction) / n) ** 2 / n;
  }
  return { lower, upper, sampled, gap: upper - lower };
}
export function powerSupremum(n: number, b: number) {
  return b ** n;
}
