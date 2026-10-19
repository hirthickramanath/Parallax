export function collision(
  m1: number,
  m2: number,
  u1: number,
  u2: number,
  e: number,
) {
  if (
    ![m1, m2, u1, u2, e].every(Number.isFinite) ||
    m1 <= 0 ||
    m2 <= 0 ||
    e < 0 ||
    e > 1
  )
    throw Error("Invalid collision");
  const total = m1 + m2,
    v1 = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / total,
    v2 = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / total;
  return {
    v1,
    v2,
    before: m1 * u1 + m2 * u2,
    after: m1 * v1 + m2 * v2,
    lost: ((0.5 * m1 * m2) / total) * (1 - e * e) * (u1 - u2) ** 2,
  };
}
export function rolling(height: number, beta: number, mass = 1, g = 9.81) {
  if (
    ![height, beta, mass, g].every(Number.isFinite) ||
    height < 0 ||
    beta < 0 ||
    mass <= 0 ||
    g <= 0
  )
    throw Error("Invalid rolling parameters");
  const speed = Math.sqrt((2 * g * height) / (1 + beta));
  return {
    speed,
    translation: 0.5 * mass * speed ** 2,
    rotation: 0.5 * beta * mass * speed ** 2,
    potentialLost: mass * g * height,
  };
}
