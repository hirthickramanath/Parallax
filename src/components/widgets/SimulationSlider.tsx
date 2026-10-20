import { useEffect, useId, useState } from "react";
import { clampSliderValue } from "../../lib/simulation-controls";
/** Native range input retains browser keyboard/touch behavior; number entry is an alternative. */
export function SimulationSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ...props
}: {
  value: number;
  min: number | string;
  max: number | string;
  step?: number | string;
  "aria-label": string;
  type?: "range";
  onChange: (event: { target: { value: string } }) => void;
}) {
  const id = useId(),
    [draft, setDraft] = useState(String(value)),
    [error, setError] = useState("");
  useEffect(() => {
    setDraft(String(value));
    setError("");
  }, [value]);
  function apply() {
    const next = clampSliderValue(
      draft,
      Number(min),
      Number(max),
      Number(step),
    );
    if (next === null) {
      setError("Enter a finite number within the displayed range.");
      return;
    }
    setDraft(String(next));
    setError("");
    onChange({ target: { value: String(next) } });
  }
  return (
    <div className="simulation-slider">
      <input
        {...props}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      <details className="simulation-number-entry">
        <summary>Type a value</summary>
        <label htmlFor={`${id}-number`}>
          Set {props["aria-label"]} ({min} to {max})
        </label>
        <div className="simulation-number-row">
          <input
            id={`${id}-number`}
            type="number"
            step={step}
            min={min}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
          />
          <button type="button" onClick={apply}>
            Apply value
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </details>
    </div>
  );
}
