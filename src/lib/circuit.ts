export function resistorCircuit(
  voltage: number,
  r1: number,
  r2: number,
  mode: "series" | "parallel",
) {
  if (
    ![voltage, r1, r2].every(Number.isFinite) ||
    voltage < 0 ||
    r1 <= 0 ||
    r2 <= 0
  )
    throw new RangeError(
      "Use a finite nonnegative voltage and positive resistances.",
    );
  const resistance = mode === "series" ? r1 + r2 : 1 / (1 / r1 + 1 / r2),
    current = voltage / resistance;
  return {
    resistance,
    current,
    v1: mode === "series" ? current * r1 : voltage,
    v2: mode === "series" ? current * r2 : voltage,
    i1: mode === "series" ? current : voltage / r1,
    i2: mode === "series" ? current : voltage / r2,
    power: voltage * current,
  };
}
