import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { doubleSlit } from "../../lib/foundation-labs";
export function DoubleSlitLab() {
  const [nm, setNm] = useState(500),
    [mm, setMm] = useState(0.5),
    [distance, setDistance] = useState(2),
    [readings, setReadings] = useState<
      { nm: number; mm: number; distance: number; fringe: number }[]
    >([]);
  const spacing = doubleSlit(nm * 1e-9, mm * 1e-3, distance, 0).fringeM * 1000;
  const samples = Array.from(
    { length: 301 },
    (_, i) =>
      doubleSlit(nm * 1e-9, mm * 1e-3, distance, ((i / 300) * 20 - 10) / 1000)
        .intensity,
  );
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · DOUBLE-SLIT BENCH</p>
      <p>
        Monochromatic coherent source → two equal, negligibly narrow slits →
        distant screen. Computed normalized intensity, with no photon-counting
        noise or finite-slit envelope. Screen coordinates range from −10 to +10
        mm.
      </p>
      <div className="simulation-control-label">
        Wavelength: {nm} nm
        <SimulationSlider
          aria-label="Light wavelength"
          type="range"
          min="400"
          max="700"
          step="10"
          value={nm}
          onChange={(e) => setNm(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Slit separation: {mm.toFixed(2)} mm
        <SimulationSlider
          aria-label="Slit separation"
          type="range"
          min=".2"
          max="1"
          step=".05"
          value={mm}
          onChange={(e) => setMm(Number(e.target.value))}
        />
      </div>
      <div className="simulation-control-label">
        Screen distance: {distance.toFixed(1)} m
        <SimulationSlider
          aria-label="Screen distance"
          type="range"
          min="1"
          max="3"
          step=".1"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="0 0 620 220"
        role="img"
        aria-label="Coherent source illuminates two slits whose paths overlap on a distant screen"
      >
        <circle cx="45" cy="100" r="10" fill="currentColor" />
        <path
          d={`M200 35V${96 - 25 * mm}M200 ${104 - 25 * mm}V${96 + 25 * mm}M200 ${104 + 25 * mm}V175`}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
        />
        <path
          d={`M55 100L200 ${100 - 25 * mm}L520 100M55 100L200 ${100 + 25 * mm}L520 100M200 ${100 - 25 * mm}L520 55M200 ${100 + 25 * mm}L520 55`}
          stroke="#16a34a"
          strokeWidth="2"
          fill="none"
        />
        <path d="M520 30V175" stroke="currentColor" strokeWidth="5" />
        <text x="15" y="200" fill="currentColor">
          Source
        </text>
        <text x="150" y="200" fill="currentColor">
          Two slits, d
        </text>
        <text x="320" y="200" fill="currentColor">
          Distance L
        </text>
        <text x="500" y="200" fill="currentColor">
          Screen
        </text>
        <text x="45" y="20" fill="currentColor">
          Path schematic · not to scale · rays indicate phase paths
        </text>
      </svg>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-label="Double slit screen brightness and normalized intensity profile"
      >
        {samples.map((v, i) => (
          <rect
            key={i}
            x={10 + i * 2}
            y="15"
            width="2.1"
            height="65"
            fill={`rgb(${Math.round(v * 220)},${Math.round(v * 230)},${Math.round(v * 120)})`}
          />
        ))}
        <path d="M10 100V245H610" fill="none" stroke="currentColor" />
        <polyline
          points={samples
            .map((v, i) => `${10 + i * 2},${245 - v * 125}`)
            .join(" ")}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
        />
        <text x="10" y="278" fill="currentColor">
          −10 mm
        </text>
        <text x="290" y="278" fill="currentColor">
          0
        </text>
        <text x="550" y="278" fill="currentColor">
          +10 mm
        </text>
      </svg>
      <p aria-live="polite">
        Predicted small-angle fringe spacing: {spacing.toFixed(3)} mm. Central
        normalized intensity: 1.000.
      </p>
      <button
        className="text-button"
        disabled={readings.length >= 20}
        onClick={() =>
          setReadings([...readings, { nm, mm, distance, fringe: spacing }])
        }
      >
        Record slit reading
      </button>
      <button className="text-button" onClick={() => setReadings([])}>
        Clear slit readings
      </button>
      {readings.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption>Synthetic interference observations</caption>
            <thead>
              <tr>
                {["λ (nm)", "d (mm)", "L (m)", "Δy (mm)"].map((x) => (
                  <th key={x}>{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i}>
                  {[r.nm, r.mm, r.distance, r.fringe].map((x, j) => (
                    <td key={j}>{x.toFixed(3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details>
        <summary>Plan a controlled experiment</summary>
        <p>
          Hold wavelength and screen distance fixed; double slit separation and
          predict what happens to fringe spacing. Record both states. Then hold
          separation fixed and vary wavelength. Compare the observed profile
          with Δy≈λL/d. Colour is illustrative, not a calibrated spectral
          display.
        </p>
        <p>
          The profile uses sin θ=y/√(L²+y²) for geometric phase, while the
          displayed spacing uses the small-angle approximation. Here L is much
          larger than d and the screen range is near-axis. Real slit widths,
          polarization mismatch, partial coherence and detector noise need
          further terms. No laser use is necessary for this simulation.
        </p>
      </details>
    </div>
  );
}
