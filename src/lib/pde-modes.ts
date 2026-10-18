export type Evolution = "heat" | "wave";
/** Dimensionless interval [0,π], homogeneous Dirichlet ends, three sine modes.
 * Heat: u_t=D u_xx. Wave: u_tt=c² u_xx, initially at rest.
 * The modal solution is exact for these finite-mode initial data, not a grid solver.
 */
export function pdeModes(
  kind: Evolution,
  coefficient: number,
  time: number,
  amplitudes: readonly number[],
) {
  if (
    !["heat", "wave"].includes(kind) ||
    !Number.isFinite(coefficient) ||
    coefficient <= 0 ||
    !Number.isFinite(time) ||
    time < 0 ||
    amplitudes.length !== 3 ||
    !amplitudes.every(Number.isFinite)
  )
    throw new RangeError(
      "Choose heat or wave, positive finite coefficient, nonnegative finite time and three finite amplitudes",
    );
  const modes = amplitudes.map((initial, i) => {
    const n = i + 1;
    const rate = kind === "heat" ? coefficient * n * n : coefficient * n;
    const value =
      initial *
      (kind === "heat" ? Math.exp(-rate * time) : Math.cos(rate * time));
    const velocity =
      kind === "heat" ? -rate * value : -initial * rate * Math.sin(rate * time);
    return { n, initial, rate, value, velocity };
  });
  const at = (x: number) => {
    if (!Number.isFinite(x) || x < 0 || x > Math.PI)
      throw new RangeError("Probe must lie in [0,π]");
    return modes.reduce(
      (sum, mode) => sum + mode.value * Math.sin(mode.n * x),
      0,
    );
  };
  // Exact orthogonality integrals, with wave density=1 and tension=c².
  const squaredNorm =
    (Math.PI / 2) * modes.reduce((sum, mode) => sum + mode.value ** 2, 0);
  const kinetic =
    (Math.PI / 4) * modes.reduce((sum, mode) => sum + mode.velocity ** 2, 0);
  const elastic =
    (Math.PI / 4) *
    coefficient ** 2 *
    modes.reduce((sum, mode) => sum + (mode.n * mode.value) ** 2, 0);
  return {
    modes,
    at,
    squaredNorm,
    waveEnergy: kind === "wave" ? kinetic + elastic : null,
  };
}
