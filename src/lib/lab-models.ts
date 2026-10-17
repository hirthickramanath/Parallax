export function pendulumPeriod(length: number, angle: number, g = 9.81) {
  const k = Math.sin((angle * Math.PI) / 360);
  let sum = 0;
  const n = 256;
  for (let i = 0; i <= n; i++) {
    const x = (i * Math.PI) / (2 * n);
    const f = 1 / Math.sqrt(1 - k * k * Math.sin(x) ** 2);
    sum += (i === 0 || i === n ? 1 : i % 2 ? 4 : 2) * f;
  }
  return (4 * Math.sqrt(length / g) * (Math.PI / (2 * n)) * sum) / 3;
}
export function orbitalElements(speed: number, angle: number) {
  const vy = speed * Math.cos((angle * Math.PI) / 180);
  const energy = speed ** 2 / 2 - 1,
    h = vy,
    e = Math.sqrt(Math.max(0, 1 + 2 * energy * h * h));
  return {
    energy,
    h,
    e,
    a: Math.abs(energy) < 1e-8 ? null : -1 / (2 * energy),
    type:
      Math.abs(energy) < 1e-6
        ? "Parabola"
        : energy > 0
          ? "Hyperbola"
          : e < 0.01
            ? "Circle (near circular)"
            : "Ellipse",
  };
}
