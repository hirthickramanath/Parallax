import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { sphericalField, type SphereModel } from "../../lib/spherical-field";
export function SphericalFieldLab() {
  const [model, setModel] = useState<SphereModel>("solid"),
    [radius, setRadius] = useState(2),
    [charge, setCharge] = useState(1),
    [probe, setProbe] = useState(1);
  const [rows, setRows] = useState<
    {
      model: SphereModel;
      radius: number;
      charge: number;
      probe: number;
      field: number;
      potential: number;
    }[]
  >([]);
  const result = sphericalField(probe, radius, charge, model);
  const scale = Math.abs(charge) / radius ** 2 || 1;
  const samples = Array.from({ length: 181 }, (_, i) => {
    const r = i / 30,
      e = sphericalField(r, radius, charge, model).field;
    return { r, e };
  });
  const points = (side: "inside" | "outside") =>
    samples
      .filter(
        (p) =>
          p.e !== null && (side === "inside" ? p.r < radius : p.r > radius),
      )
      .map((p) => `${55 + p.r * 80},${150 - (p.e! / scale) * 85}`)
      .join(" ");
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · SPHERICAL FIELD PROBE</p>
      <p>
        Choose a uniformly charged solid sphere or an ideal conducting spherical
        shell. The virtual probe reports signed radial field and potential with
        k=1 and V at infinity=0. All values are computed in normalized units,
        not physical sensor readings.
      </p>
      <div className="lab-subjects">
        <button
          aria-pressed={model === "solid"}
          onClick={() => setModel("solid")}
        >
          Uniform solid sphere
        </button>
        <button
          aria-pressed={model === "shell"}
          onClick={() => setModel("shell")}
        >
          Conducting shell
        </button>
      </div>
      <div className="simulation-control-label">
        Sphere radius: {radius.toFixed(1)}
        <SimulationSlider
          aria-label="Charged sphere radius"
          type="range"
          min="1"
          max="3"
          step=".5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Total charge: {charge}
        <SimulationSlider
          aria-label="Total sphere charge"
          type="range"
          min="-4"
          max="4"
          step="1"
          value={charge}
          onChange={(e) => setCharge(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Probe radius: {probe.toFixed(1)}
        <SimulationSlider
          aria-label="Field probe radius"
          type="range"
          min="0"
          max="6"
          step=".1"
          value={probe}
          onChange={(e) => setProbe(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-label={`${model === "solid" ? "Uniform volume charge" : "Surface charge"} sphere with radial probe schematic`}
      >
        <circle
          cx="180"
          cy="105"
          r={radius * 25}
          fill={model === "solid" ? "#bbf7d0" : "none"}
          stroke="currentColor"
          strokeWidth={model === "shell" ? 5 : 2}
        />
        <path d="M180 105H360" stroke="currentColor" strokeDasharray="5 5" />
        <circle cx={180 + probe * 25} cy="105" r="6" fill="#2563eb" />
        <text x="30" y="25" fill="currentColor">
          Charge{" "}
          {model === "solid" ? "throughout volume" : "on conducting surface"}
        </text>
        <text x="375" y="110" fill="currentColor">
          Radial probe
        </text>
        <text x="30" y="205" fill="currentColor">
          R = {radius.toFixed(1)} · r = {probe.toFixed(1)} · Q = {charge}
        </text>
      </svg>
      <svg
        viewBox="0 0 600 310"
        role="img"
        aria-label="Signed electric field versus radius with separate interior and exterior curves"
      >
        <path d="M55 40V250M55 150H535" fill="none" stroke="currentColor" />
        <polyline
          points={points("inside")}
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
        />
        <polyline
          points={points("outside")}
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
        />
        <path
          d={`M${55 + radius * 80} 45V250`}
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <circle
          cx={55 + radius * 80}
          cy={
            150 - ((model === "shell" ? 0 : charge / radius ** 2) / scale) * 85
          }
          r="4"
          fill={
            model === "shell" && charge !== 0
              ? "hsl(var(--background))"
              : "currentColor"
          }
          stroke="currentColor"
        />
        <circle
          cx={55 + radius * 80}
          cy={150 - (charge / radius ** 2 / scale) * 85}
          r="4"
          fill={
            model === "shell" && charge !== 0
              ? "hsl(var(--background))"
              : "currentColor"
          }
          stroke="currentColor"
        />
        {result.field !== null && (
          <circle
            cx={55 + probe * 80}
            cy={150 - (result.field / scale) * 85}
            r="6"
            fill="#2563eb"
          />
        )}
        <text x="65" y="30" fill="currentColor">
          Er · top scale +{scale.toFixed(3)}, bottom −{scale.toFixed(3)}
        </text>
        <text x="55" y="285" fill="currentColor">
          r = 0
        </text>
        <text x="260" y="285" fill="currentColor">
          Dashed: r = R
        </text>
        <text x="500" y="285" fill="currentColor">
          r = 6
        </text>
      </svg>
      <div className="info-box" aria-live="polite">
        <p>Potential: {result.potential.toFixed(4)}</p>
        {result.surface ? (
          <p>
            Ideal charged surface: field has no single assigned value. Inner
            limit: {result.innerField.toFixed(4)} · Outer limit:{" "}
            {result.outerField.toFixed(4)}. Move the probe off the sheet for an
            ordinary reading.
          </p>
        ) : (
          <p>
            Radial field: {result.field!.toFixed(4)} · Enclosed charge:{" "}
            {result.enclosed!.toFixed(4)}
          </p>
        )}
      </div>
      <button
        className="text-button"
        disabled={result.field === null || rows.length >= 20}
        onClick={() => {
          const field = result.field;
          if (field === null) return;
          setRows([
            ...rows,
            {
              model,
              radius,
              charge,
              probe,
              field,
              potential: result.potential,
            },
          ]);
        }}
      >
        Record spherical reading
      </button>
      <button className="text-button" onClick={() => setRows([])}>
        Clear spherical readings
      </button>
      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption>
              Synthetic electrostatic readings · every row retains its model and
              controls
            </caption>
            <thead>
              <tr>
                {["Model", "R", "Q", "r", "Er", "V"].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.model}</td>
                  {[r.radius, r.charge, r.probe, r.field, r.potential].map(
                    (v, j) => (
                      <td key={j}>{v.toFixed(4)}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details>
        <summary>Test Gauss, potential and the surface jump</summary>
        <p>
          At Q=1 and R=2, compare r=1: solid-sphere field is 0.125 while shell
          field is zero. Their exterior fields agree at the same radius. At the
          ideal charged shell surface the two one-sided fields differ; the bench
          leaves a gap rather than inventing a continuous transition. Potential
          remains continuous.
        </p>
        <p>
          Check Er=Qenc/r² away from r=0 and charged interfaces. Check Er=−dV/dr
          with finite differences away from the shell. Reversing Q reverses
          field and potential. The field axis rescales with Q and R; compare
          numeric values across settings, not pixel heights. Assumptions: exact
          spherical symmetry, vacuum, electrostatic equilibrium for the shell
          and no probe perturbation. This is not a full dielectric,
          finite-conductivity or time-varying instrument model.
        </p>
      </details>
    </div>
  );
}
