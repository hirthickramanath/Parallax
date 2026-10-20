import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { Link } from "react-router-dom";
import { radialShift, slabTransfer } from "../../lib/radiation";
export function RadiationLab() {
  const [mode, setMode] = useState("slab"),
    [incident, setIncident] = useState(10),
    [source, setSource] = useState(2),
    [depth, setDepth] = useState(String(Math.log(2)));
  const [rest, setRest] = useState(500),
    [beta, setBeta] = useState(0.6);
  const [rows, setRows] = useState<
    { incident: number; source: number; tau: number; out: number }[]
  >([]);
  const tau = Number(depth),
    valid =
      depth.trim() !== "" && Number.isFinite(tau) && tau >= 0 && tau <= 10;
  const slab = valid ? slabTransfer(incident, source, tau) : null;
  const shift = radialShift(rest, beta);
  const low = Math.min(rest, shift.observedNm) * 0.8,
    high = Math.max(rest, shift.observedNm) * 1.2;
  const position = (nm: number) => 55 + ((nm - low) / (high - low)) * 490;
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · RADIATION BENCH</p>
      <div className="lab-subjects">
        <button aria-pressed={mode === "slab"} onClick={() => setMode("slab")}>
          Emitting slab
        </button>
        <button
          aria-pressed={mode === "shift"}
          onClick={() => setMode("shift")}
        >
          Doppler markers
        </button>
      </div>
      {mode === "slab" ? (
        <>
          <p>
            Apparatus model: incident beam → uniform plane-parallel
            emitting/extinguishing slab → intensity readout at one frequency.
            Intensities use shared arbitrary units. These are computed values,
            not measured photons or a global energy budget.
          </p>
          <div className="simulation-control-label">
            Incident intensity: {incident}
            <SimulationSlider
              aria-label="Incident intensity"
              type="range"
              min="0"
              max="20"
              step="1"
              value={incident}
              onChange={(e) => setIncident(Number(e.target.value))}
            />
          </div>
          <div className="simulation-control-label">
            Source function: {source}
            <SimulationSlider
              aria-label="Slab source function"
              type="range"
              min="0"
              max="20"
              step="1"
              value={source}
              onChange={(e) => setSource(Number(e.target.value))}
            />
          </div>
          <label>
            Optical depth (0–10)
            <input
              aria-label="Slab optical depth"
              type="number"
              min="0"
              max="10"
              step="any"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </label>
          {!slab ? (
            <p role="alert">Enter a finite optical depth from 0 to 10.</p>
          ) : (
            <>
              <svg
                viewBox="0 0 600 220"
                role="img"
                aria-label="Incident ray crosses an emitting slab and combines transmitted and emitted intensity"
              >
                <rect
                  x="200"
                  y="40"
                  width="160"
                  height="130"
                  rx="10"
                  fill="#bbf7d0"
                  stroke="currentColor"
                />
                <path
                  d="M30 105H190M180 95L190 105L180 115M370 105H560M550 95L560 105L550 115"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <text x="30" y="80" fill="currentColor">
                  I₀ = {incident}
                </text>
                <text x="220" y="88" fill="#14532d">
                  τ = {tau.toFixed(3)}
                </text>
                <text x="220" y="128" fill="#14532d">
                  S = {source}
                </text>
                <text x="390" y="80" fill="currentColor">
                  Iout = {slab.output.toFixed(3)}
                </text>
                <text x="35" y="205" fill="currentColor">
                  Geometry schematic · arrow size does not encode intensity
                </text>
              </svg>
              <p aria-live="polite">
                Transmission: {slab.transmission.toFixed(4)} · Transmitted:{" "}
                {slab.transmitted.toFixed(3)} · Emitted into ray:{" "}
                {slab.emitted.toFixed(3)} · Output: {slab.output.toFixed(3)}
              </p>
              <button
                className="text-button"
                disabled={rows.length >= 20}
                onClick={() =>
                  setRows([
                    ...rows,
                    { incident, source, tau, out: slab.output },
                  ])
                }
              >
                Record slab reading
              </button>
            </>
          )}
          <button className="text-button" onClick={() => setRows([])}>
            Clear slab readings
          </button>
          {rows.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table>
                <caption>Synthetic slab observations at one frequency</caption>
                <thead>
                  <tr>
                    {["I₀", "S", "τ", "Iout"].map((x) => (
                      <th key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {[r.incident, r.source, r.tau, r.out].map((x, j) => (
                        <td key={j}>{x.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <details>
            <summary>Predict and test the limits</summary>
            <p>
              At τ=0 the slab leaves the incoming intensity unchanged. At large
              τ, a constant-source slab approaches S. Hold τ=ln2≈0.693147 fixed
              and compare S=2 with S=20: output changes from 6 to 15 for I₀=10.
              At I₀=S it stays unchanged at every depth. Record all controls
              with each reading.
            </p>
            <p>
              Assumptions: constant source function at one frequency,
              nonnegative extinction and no solved angular scattering field or
              depth-dependent temperature. This is not a complete
              stellar-atmosphere or maser model.
            </p>
          </details>
        </>
      ) : (
        <>
          <p>
            Known rest-line marker → exact radial special-relativistic
            wavelength shift → observed marker. Positive β means recession. This
            model does not convert cosmological redshift into a global recession
            velocity. No line-width or continuum model is implied.
          </p>
          <div className="simulation-control-label">
            Rest wavelength: {rest} nm
            <SimulationSlider
              aria-label="Rest wavelength"
              type="range"
              min="400"
              max="700"
              step="10"
              value={rest}
              onChange={(e) => setRest(Number(e.target.value))}
            />
          </div>
          <div className="simulation-control-label">
            Radial speed β: {beta.toFixed(2)}
            <SimulationSlider
              aria-label="Radial speed beta"
              type="range"
              min="-.8"
              max=".8"
              step=".05"
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
            />
          </div>
          <svg
            viewBox="0 0 600 230"
            role="img"
            aria-label="Rest and observed spectral line markers on a wavelength axis"
          >
            <path d="M55 160H545" stroke="currentColor" fill="none" />
            <path
              d={`M${position(rest)} 55V160`}
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            <path
              d={`M${position(shift.observedNm)} 85V160`}
              stroke="#16a34a"
              strokeWidth="4"
            />
            <text x="55" y="30" fill="currentColor">
              Dashed: rest · solid: observed
            </text>
            <text x="55" y="195" fill="currentColor">
              {low.toFixed(1)} nm
            </text>
            <text x="465" y="195" fill="currentColor">
              {high.toFixed(1)} nm
            </text>
          </svg>
          <p aria-live="polite">
            Observed wavelength: {shift.observedNm.toFixed(2)} nm · Redshift z:{" "}
            {shift.redshift.toFixed(4)} · Wavelength factor:{" "}
            {shift.factor.toFixed(4)}
          </p>
          <details>
            <summary>Control the interpretation</summary>
            <p>
              At β=0 the markers coincide. At β=0.6 the wavelength factor is 2;
              for a 500 nm rest line the observed line is 1000 nm. Compare
              approach and recession with equal |β|: their factors are
              reciprocals. Axis limits adapt to both markers, so compare
              numerical wavelength differences rather than pixel distances
              across different settings.
            </p>
            <p>
              The marker widths and colours are diagram styling. They are not
              predicted physical line profiles, calibrated colours or measured
              spectra.
            </p>
          </details>
          <Link className="text-button" to="/lesson/AS2.4">
            Study Doppler shift and redshift →
          </Link>
        </>
      )}
    </div>
  );
}
