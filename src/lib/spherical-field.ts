export type SphereModel = "solid" | "shell";
/** Vacuum electrostatics with k=1, V(infinity)=0; signed radial field. */
export function sphericalField(
  r: number,
  radius: number,
  charge: number,
  model: SphereModel,
) {
  if (
    ![r, radius, charge].every(Number.isFinite) ||
    r < 0 ||
    radius <= 0 ||
    !["solid", "shell"].includes(model)
  )
    throw new RangeError(
      "Use finite charge, nonnegative probe radius and positive sphere radius",
    );
  const surface = model === "shell" && r === radius && charge !== 0;
  const potential =
    r >= radius
      ? charge / r
      : model === "shell"
        ? charge / radius
        : (charge * (3 * radius ** 2 - r ** 2)) / (2 * radius ** 3);
  const field = surface
    ? null
    : r >= radius
      ? charge / r ** 2
      : model === "shell"
        ? 0
        : (charge * r) / radius ** 3;
  const enclosed = surface
    ? null
    : r >= radius
      ? charge
      : model === "shell"
        ? 0
        : charge * (r / radius) ** 3;
  return {
    potential,
    field,
    enclosed,
    surface,
    innerField: model === "shell" ? 0 : charge / radius ** 2,
    outerField: charge / radius ** 2,
  };
}
