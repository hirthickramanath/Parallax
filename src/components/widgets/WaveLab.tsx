import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { standingString } from "../../lib/foundation-labs";
export function WaveLab() {
  const [harmonic, setHarmonic] = useState(1),
    [tension, setTension] = useState(10),
    [phase, setPhase] = useState(90);
  const result = standingString(1, tension, 0.01, harmonic);
  const points = Array.from(
    { length: 241 },
    (_, i) =>
      `${50 + i * 2},${130 - 55 * Math.sin((harmonic * Math.PI * i) / 240) * Math.cos((phase * Math.PI) / 180)}`,
  ).join(" ");
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · STRING DRIVER</p>
      <p>
        A 1 m string, linear density 0.010 kg/m, fixed at both ends. The driver
        is tuned to the selected normal mode. Synthetic small-amplitude motion;
        damping and finite resonance width are omitted.
      </p>
      <div className="simulation-control-label">
        Harmonic: {harmonic}
        <SimulationSlider
          aria-label="String harmonic"
          type="range"
          min="1"
          max="6"
          step="1"
          value={harmonic}
          onChange={(e) => setHarmonic(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Tension: {tension} N
        <SimulationSlider
          aria-label="String tension"
          type="range"
          min="1"
          max="40"
          step="1"
          value={tension}
          onChange={(e) => setTension(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Scrub phase: {phase}°
        <SimulationSlider
          aria-label="String phase"
          type="range"
          min="0"
          max="360"
          step="5"
          value={phase}
          onChange={(e) => setPhase(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="0 0 600 270"
        role="img"
        aria-label={`Standing string harmonic ${harmonic} with ${harmonic + 1} fixed nodes`}
      >
        <path
          d="M50 50V210M530 50V210M50 130H530"
          stroke="currentColor"
          fill="none"
        />
        <polyline
          points={points}
          stroke="#16a34a"
          strokeWidth="4"
          fill="none"
        />
        {result.nodes.map((x, i) => (
          <circle
            key={i}
            cx={50 + x * 480}
            cy="130"
            r="5"
            fill="currentColor"
          />
        ))}
        <text x="50" y="245" fill="currentColor">
          0 m
        </text>
        <text x="500" y="245" fill="currentColor">
          1 m
        </text>
      </svg>
      <p aria-live="polite">
        Wave speed: {result.speed.toFixed(2)} m/s · Driver frequency:{" "}
        {result.frequency.toFixed(2)} Hz · Wavelength:{" "}
        {result.wavelength.toFixed(3)} m
      </p>
      <p>
        Node positions (m): {result.nodes.map((x) => x.toFixed(3)).join(", ")}
      </p>
      <details>
        <summary>Use the apparatus</summary>
        <p>
          Predict the second harmonic’s node positions. Scrub phase through a
          cycle: at 90° the whole string crosses equilibrium, but only the
          marked nodes remain there throughout. Compare tension 10 N and 40 N at
          a fixed harmonic: frequency doubles, while node positions do not
          change. Explain using v=√(T/μ) and fₙ=nv/(2L).
        </p>
        <p>
          The displayed amplitude is illustrative and is not a computed
          driven-response amplitude. A real driver, clamps, damping and string
          stretching shift and broaden resonance. Do not interpret every
          equilibrium crossing as a permanent node.
        </p>
      </details>
    </div>
  );
}
