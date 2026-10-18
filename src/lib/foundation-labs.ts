/** Ideal, explicitly synthetic apparatus models. SI units throughout. */
export const GAS_R = 8.314462618;
function positive(...values: number[]) {
  if (values.some((v) => !Number.isFinite(v) || v <= 0))
    throw new RangeError("Model parameters must be finite and positive");
}
export function gasPath(
  moles: number,
  initialK: number,
  initialM3: number,
  volumeRatio: number,
  mode: "isothermal" | "adiabatic" | "isobaric",
) {
  positive(moles, initialK, initialM3, volumeRatio);
  const cv = 1.5 * GAS_R;
  const finalM3 = initialM3 * volumeRatio;
  const finalK =
    mode === "isothermal"
      ? initialK
      : mode === "isobaric"
        ? initialK * volumeRatio
        : initialK * volumeRatio ** (-2 / 3);
  const deltaU = moles * cv * (finalK - initialK);
  const work =
    mode === "isothermal"
      ? moles * GAS_R * initialK * Math.log(volumeRatio)
      : mode === "isobaric"
        ? moles * GAS_R * (finalK - initialK)
        : -deltaU;
  return {
    finalK,
    finalM3,
    pressurePa: (moles * GAS_R * finalK) / finalM3,
    deltaU,
    work,
    heat: deltaU + work,
  };
}
export function doubleSlit(
  wavelengthM: number,
  spacingM: number,
  screenM: number,
  yM: number,
) {
  positive(wavelengthM, spacingM, screenM);
  if (!Number.isFinite(yM))
    throw new RangeError("Screen coordinate must be finite");
  // Exact geometric sin(theta) in an ideal narrow-slit far-field phase model.
  const sinTheta = yM / Math.hypot(screenM, yM);
  return {
    intensity: Math.cos((Math.PI * spacingM * sinTheta) / wavelengthM) ** 2,
    fringeM: (wavelengthM * screenM) / spacingM,
  };
}
export function standingString(
  lengthM: number,
  tensionN: number,
  densityKgM: number,
  harmonic: number,
) {
  positive(lengthM, tensionN, densityKgM, harmonic);
  if (!Number.isInteger(harmonic))
    throw new RangeError("Harmonic must be an integer");
  const speed = Math.sqrt(tensionN / densityKgM);
  return {
    speed,
    frequency: (harmonic * speed) / (2 * lengthM),
    wavelength: (2 * lengthM) / harmonic,
    nodes: Array.from(
      { length: harmonic + 1 },
      (_, i) => (i * lengthM) / harmonic,
    ),
  };
}
