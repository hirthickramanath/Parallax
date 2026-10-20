/** Snap relative to the range minimum, matching native input's step base. */
export function clampSliderValue(
  text: string,
  min: number,
  max: number,
  step: number,
): number | null {
  if (
    !text.trim() ||
    ![Number(text), min, max, step].every(Number.isFinite) ||
    min > max ||
    step <= 0
  )
    return null;
  const n = Math.max(min, Math.min(max, Number(text)));
  const lastStep = Math.floor((max - min) / step + 1e-10);
  const snapped = min + Math.min(lastStep, Math.round((n - min) / step)) * step;
  return Number(Math.max(min, Math.min(max, snapped)).toPrecision(14));
}
export function formatControlValue(value: number, step: number) {
  if (value !== 0 && (Math.abs(value) < 0.0001 || Math.abs(value) >= 1e7))
    return value.toExponential(4);
  const digits = Math.max(0, Math.min(12, -Math.floor(Math.log10(step))));
  return value.toFixed(digits);
}
