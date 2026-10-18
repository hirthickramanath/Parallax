/** Constant-source, nonnegative-extinction slab; intensities share one frequency/unit. */
export function slabTransfer(incident: number, source: number, tau: number) {
  if ([incident, source, tau].some((v) => !Number.isFinite(v) || v < 0))
    throw new RangeError(
      "Slab intensities and optical depth must be finite and nonnegative",
    );
  const transmission = Math.exp(-tau);
  const transmitted = incident * transmission;
  // expm1 preserves thin-slab precision rather than subtracting nearly equal numbers.
  const emitted = source * -Math.expm1(-tau);
  return { transmission, transmitted, emitted, output: transmitted + emitted };
}
/** Pure radial SR recession, not a cosmological distance/velocity conversion. */
export function radialShift(restNm: number, beta: number) {
  if (
    !Number.isFinite(restNm) ||
    restNm <= 0 ||
    !Number.isFinite(beta) ||
    Math.abs(beta) >= 1
  )
    throw new RangeError(
      "Use a positive rest wavelength and a subluminal radial speed",
    );
  const factor = Math.sqrt((1 + beta) / (1 - beta));
  return { factor, observedNm: restNm * factor, redshift: factor - 1 };
}
