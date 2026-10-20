import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { pdeModes, type Evolution } from "../../lib/pde-modes";

export function PdeModesLab() {
  const [kind, setKind] = useState<Evolution>("heat");
  const [coefficient, setCoefficient] = useState(1),
    [time, setTime] = useState(0);
  const [shape, setShape] = useState("Mixed modes");
  const [rows, setRows] = useState<string[]>([]);
  const amplitudes =
    shape === "First mode"
      ? [1, 0, 0]
      : shape === "Third mode"
        ? [0, 0, 1]
        : [1, 0.5, 0.25];
  const model = pdeModes(kind, coefficient, time, amplitudes);
  const initial = pdeModes(kind, coefficient, 0, amplitudes);
  const curve = (state: typeof model) =>
    Array.from(
      { length: 241 },
      (_, i) =>
        `${50 + (500 * i) / 240},${130 - 55 * state.at((Math.PI * i) / 240)}`,
    ).join(" ");
  return (
    <section className="virtual-lab" aria-label="Fourier evolution experiment">
      <p className="lab-label">VIRTUAL LAB · FOURIER MODES</p>
      <h2>Heat flow and waves</h2>
      <p>
        Compare exact finite-mode solutions on the dimensionless interval 0 ≤ x
        ≤ π. Both endpoints stay at zero. The wave starts at rest. The plotted
        field has arbitrary normalized amplitude.
      </p>
      <div className="lab-subjects">
        {(
          [
            ["heat", "Heat diffusion"],
            ["wave", "Wave motion"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={kind === value}
            onClick={() => {
              setKind(value);
              setTime(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <label>
        Initial shape
        <select
          aria-label="PDE initial shape"
          value={shape}
          onChange={(e) => {
            setShape(e.target.value);
            setTime(0);
          }}
        >
          {["First mode", "Third mode", "Mixed modes"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <div className="simulation-control-label">
        {kind === "heat" ? "Diffusivity D" : "Wave speed c"}: {coefficient}
        <SimulationSlider
          aria-label="PDE coefficient"
          type="range"
          min="0.25"
          max="2"
          step="0.25"
          value={coefficient}
          onChange={(e) => setCoefficient(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Time: {time}
        <SimulationSlider
          aria-label="PDE time"
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="0 0 600 270"
        role="img"
        aria-label="Initial field dashed, evolved field solid, on a fixed amplitude scale"
      >
        <path
          d="M50 30V230M550 30V230M50 130H550"
          fill="none"
          stroke="currentColor"
          opacity=".4"
        />
        <polyline
          points={curve(initial)}
          fill="none"
          stroke="currentColor"
          strokeDasharray="5 5"
          opacity=".45"
        />
        <polyline
          points={curve(model)}
          fill="none"
          stroke={kind === "heat" ? "#e07824" : "#1685d1"}
          strokeWidth="3"
        />
        <text x="50" y="255">
          0
        </text>
        <text x="540" y="255">
          π
        </text>
      </svg>
      <p>
        Dashed: initial shape. Solid: field at the selected time. The amplitude
        axis stays fixed across settings.
      </p>
      <p>
        Squared field norm ∫u² dx:{" "}
        <output aria-label="PDE squared norm">
          {model.squaredNorm.toFixed(6)}
        </output>
        .
      </p>
      {kind === "wave" ? (
        <p>
          Wave energy with density 1 and tension c²:{" "}
          <output aria-label="PDE wave energy">
            {model.waveEnergy!.toFixed(6)}
          </output>
          . The squared field norm can oscillate while total wave energy stays
          constant.
        </p>
      ) : (
        <p>
          Diffusion decreases the squared field norm. This norm is not total
          heat; the zero-temperature boundaries allow heat exchange.
        </p>
      )}
      <div className="measurement-table">
        <table>
          <caption>Exact modal amplitudes</caption>
          <thead>
            <tr>
              <th>Mode n</th>
              <th>Initial amplitude</th>
              <th>Current amplitude</th>
              <th>
                {kind === "heat" ? "Decay rate Dn²" : "Angular frequency cn"}
              </th>
            </tr>
          </thead>
          <tbody>
            {model.modes.map((mode) => (
              <tr key={mode.n}>
                <td>{mode.n}</td>
                <td>{mode.initial}</td>
                <td>{mode.value.toFixed(6)}</td>
                <td>{mode.rate.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() =>
          setRows((previous) => [
            ...previous.slice(-19),
            `${kind}; ${kind === "heat" ? "D" : "c"}=${coefficient}; ${shape} [${amplitudes.join(", ")}]; t=${time}; norm=${model.squaredNorm.toFixed(6)}${model.waveEnergy === null ? "" : `; energy=${model.waveEnergy.toFixed(6)}`}`,
          ])
        }
      >
        Record PDE reading
      </button>
      <ol aria-label="PDE readings">
        {rows.map((row, i) => (
          <li key={i}>{row}</li>
        ))}
      </ol>
      <p>
        Synthetic readings stay here until you leave. These are analytic mode
        trajectories, not a finite-difference solver or measured data. No
        damping, sources, nonlinear response or noisy sensor is modeled. Do not
        interpret negative heat-field values as negative absolute temperatures:
        u can represent a signed deviation from a reference.
      </p>
    </section>
  );
}
