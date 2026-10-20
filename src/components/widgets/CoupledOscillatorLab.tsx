import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { coupledOscillator } from "../../lib/coupled-oscillator";

export function CoupledOscillatorLab() {
  const [mass, setMass] = useState(1),
    [wall, setWall] = useState(1),
    [coupling, setCoupling] = useState(1),
    [time, setTime] = useState(0);
  const [mode, setMode] = useState("One mass released");
  const [rows, setRows] = useState<string[]>([]);
  const initial2 =
    mode === "In phase" ? 0.2 : mode === "Opposite phase" ? -0.2 : 0;
  const s = coupledOscillator(mass, wall, coupling, time, 0.2, initial2);
  const controls: [
    string,
    number,
    (value: number) => void,
    number,
    number,
    number,
  ][] = [
    ["Mass (kg)", mass, setMass, 0.5, 3, 0.5],
    ["Wall stiffness (N/m)", wall, setWall, 1, 4, 0.5],
    ["Coupling stiffness (N/m)", coupling, setCoupling, 0, 4, 0.5],
    ["Time (s)", time, setTime, 0, 20, 0.1],
  ];
  const x = 200 + 150 * s.x1,
    y = 400 + 150 * s.x2;
  function spring(left: number, right: number) {
    return (
      `${left},100 ` +
      Array.from(
        { length: 12 },
        (_, i) =>
          `${left + ((right - left) * (i + 1)) / 13},${i % 2 ? 110 : 90}`,
      ).join(" ") +
      ` ${right},100`
    );
  }
  return (
    <section className="info-box" aria-label="Coupled oscillator experiment">
      <h2>Coupled oscillators</h2>
      <p>
        Synthetic ideal apparatus: two equal masses, equal wall springs, linear
        coupling, no friction. Release from rest with the first mass displaced
        0.20 m. Scrub time to inspect the motion.
      </p>
      <div className="lab-subjects">
        {["In phase", "Opposite phase", "One mass released"].map((label) => (
          <button
            key={label}
            aria-pressed={mode === label}
            onClick={() => {
              setMode(label);
              setTime(0);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {controls.map(([label, value, setter, min, max, step]) => (
        <div className="simulation-control-label">
          {label}: {value}
          <SimulationSlider
            aria-label={label}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
          />
        </div>
      ))}
      <svg
        viewBox="0 0 600 180"
        role="img"
        aria-label="Two masses joined by springs between fixed walls"
        style={{ width: "100%" }}
      >
        <path
          d="M50 60V140 M550 60V140"
          stroke="currentColor"
          strokeWidth="6"
        />
        {[
          [50, x - 20],
          [x + 20, y - 20],
          [y + 20, 550],
        ].map(([a, b], i) => (
          <polyline
            key={i}
            points={spring(a, b)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity={i === 1 && coupling === 0 ? 0.15 : 1}
          />
        ))}
        <rect x={x - 20} y="80" width="40" height="40" fill="#58cc02" />
        <rect x={y - 20} y="80" width="40" height="40" fill="#1cb0f6" />
        <text x={x} y="155" textAnchor="middle">
          Mass 1
        </text>
        <text x={y} y="155" textAnchor="middle">
          Mass 2
        </text>
      </svg>
      <p>
        Displacements: x₁ = {s.x1.toFixed(4)} m; x₂ = {s.x2.toFixed(4)} m.
      </p>
      <p>
        In-phase angular frequency: {s.plus.toFixed(3)} rad/s. Opposite-phase
        angular frequency: {s.minus.toFixed(3)} rad/s.
      </p>
      <p>
        Total energy:{" "}
        <output aria-label="Total oscillator energy">
          {s.energy.toFixed(4)}
        </output>{" "}
        J. Kinetic: {s.kinetic.toFixed(4)} J; wall springs: {s.wall.toFixed(4)}{" "}
        J; coupling: {s.interaction.toFixed(4)} J.
      </p>
      <p>
        Normal coordinates q₊ = (x₁ + x₂)/√2 and q₋ = (x₁ − x₂)/√2 oscillate
        independently. A single displaced mass excites both. With zero coupling
        the frequencies coincide and mass 2 stays still for that release. Beats
        require nearby frequencies.
      </p>
      <button
        onClick={() =>
          setRows((previous) => [
            ...previous.slice(-19),
            `${mode}; m=${mass} kg, k=${wall} N/m, coupling=${coupling} N/m; t=${time} s; x₁=${s.x1.toFixed(4)} m, x₂=${s.x2.toFixed(4)} m; E=${s.energy.toFixed(4)} J`,
          ])
        }
      >
        Record oscillator reading
      </button>
      <ol aria-label="Oscillator readings">
        {rows.map((row, i) => (
          <li key={i}>{row}</li>
        ))}
      </ol>
      <p>
        Readings stay on this bench until you leave. Compare conserved energy
        with PH2.7; these exact harmonic trajectories omit damping, unequal
        masses and nonlinear springs.
      </p>
    </section>
  );
}
