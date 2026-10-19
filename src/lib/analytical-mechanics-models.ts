export function oscillatorPhase(
  q: number,
  p: number,
  m: number,
  omega: number,
) {
  const energy = (p * p) / (2 * m) + (m * omega * omega * q * q) / 2;
  return {
    energy,
    action: energy / omega,
    area: (2 * Math.PI * energy) / omega,
    qdot: p / m,
    pdot: -m * omega * omega * q,
    amplitudeQ: Math.sqrt((2 * energy) / (m * omega * omega)),
    amplitudeP: Math.sqrt(2 * m * energy),
  };
}
export function canonicalShear(q: number, p: number, alpha: number) {
  return { Q: q, P: p - alpha * q, bracket: 1, areaRatio: 1 };
}
