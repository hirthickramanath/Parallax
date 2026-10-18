/** Follow z=e^(iθ), starting at z=1, through at most two positive loops.
 * The principal branch excludes the nonpositive real axis; the tracked value
 * is continuation along this path, not a global branch on the punctured plane.
 */
export function branchCircle(degrees: number) {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees > 720)
    throw new RangeError(
      "Choose a finite path angle between 0 and 720 degrees",
    );
  const clean = (value: number) => (Math.abs(value) < 1e-12 ? 0 : value);
  const point = (angle: number) => ({
    real: clean(Math.cos(angle)),
    imaginary: clean(Math.sin(angle)),
  });
  const angle = (degrees * Math.PI) / 180;
  const onCut = degrees === 180 || degrees === 540;
  const principalAngle = onCut
    ? null
    : ((((degrees + 180) % 360) - 180) * Math.PI) / 180;
  return {
    source: point(angle),
    continued: point(angle / 2),
    principal: principalAngle === null ? null : point(principalAngle / 2),
    principalAngle,
    continuedAngle: angle,
    onCut,
  };
}
