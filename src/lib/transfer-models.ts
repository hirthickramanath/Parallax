export function bayesPopulation(
  prevalence: number,
  sensitivity: number,
  falsePositive: number,
  population = 10000,
) {
  const truePositives = population * prevalence * sensitivity;
  const falsePositives = population * (1 - prevalence) * falsePositive;
  return {
    truePositives,
    falsePositives,
    posterior:
      truePositives + falsePositives === 0
        ? null
        : truePositives / (truePositives + falsePositives),
  };
}
/** Positive real-object distance, positive converging focal length, lengths in cm. */
export function thinLens(f: number, u: number) {
  if (Math.abs(u - f) < 1e-8) return { image: null, magnification: null };
  const image = (f * u) / (u - f);
  return { image, magnification: -image / u };
}
/** Stationary planar coil in a spatially uniform changing field; SI units. */
export function induction(
  turns: number,
  area: number,
  rate: number,
  angleDegrees: number,
) {
  return -turns * area * rate * Math.cos((angleDegrees * Math.PI) / 180);
}
/** Exact radial differential field against the linear tidal approximation, GM=1. */
export function radialTide(radius: number, separation: number) {
  const near = radius - separation / 2,
    far = radius + separation / 2;
  return {
    exact: 1 / (near * near) - 1 / (far * far),
    linear: (2 * separation) / radius ** 3,
    ratio: separation / radius,
  };
}
