import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { gasPath, GAS_R } from "../../lib/foundation-labs";
export function GasLab() {
  const [mode, setMode] = useState<"isothermal" | "adiabatic" | "isobaric">(
    "isothermal",
  );
  const [ratio, setRatio] = useState(1);
  const [rows, setRows] = useState<
    { ratio: number; t: number; p: number; q: number; w: number }[]
  >([]);
  const result = gasPath(1, 300, 0.025, ratio, mode);
  const points = Array.from({ length: 101 }, (_, i) => {
    const r = 0.5 + i * 0.025;
    const s = gasPath(1, 300, 0.025, r, mode);
    return `${60 + (r - 0.5) * 180},${240 - (s.pressurePa / 1000) * 0.65}`;
  }).join(" ");
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · GAS PISTON</p>
      <p>
        One mole of monatomic ideal gas starts at 300 K and 25 L. A frictionless
        piston moves quasistatically. Computed equilibrium readings; no real gas
        sensor. Work is positive when done by the gas.
      </p>
      <label>
        Thermodynamic path{" "}
        <select
          aria-label="Thermodynamic path"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as typeof mode);
            setRows([]);
          }}
        >
          <option value="isothermal">Isothermal · thermal bath</option>
          <option value="adiabatic">Reversible adiabatic · insulated</option>
          <option value="isobaric">Isobaric · fixed external pressure</option>
        </select>
      </label>
      <div className="simulation-control-label">
        Final volume ratio: {ratio.toFixed(2)}
        <SimulationSlider
          aria-label="Gas volume ratio"
          type="range"
          min=".5"
          max="3"
          step=".05"
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="0 0 600 230"
        role="img"
        aria-label="Gas cylinder with movable piston, temperature readout and thermal boundary"
      >
        <rect
          x="65"
          y="50"
          width="280"
          height="115"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <rect x="67" y="52" width={75 * ratio} height="111" fill="#bbf7d0" />
        <rect
          x={67 + 75 * ratio}
          y="50"
          width="9"
          height="115"
          fill="currentColor"
        />
        <path
          d={`M${76 + 75 * ratio} 107H390`}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
        <text x="80" y="95" fill="#14532d">
          Gas
        </text>
        <text x="80" y="120" fill="#14532d">
          1 mol
        </text>
        <text x="355" y="85" fill="currentColor">
          Piston
        </text>
        <text x="355" y="140" fill="currentColor">
          {result.finalK.toFixed(1)} K
        </text>
        <path d="M90 190H320" fill="none" stroke="currentColor" />
        <text x="90" y="215" fill="currentColor">
          {mode === "adiabatic"
            ? "Insulated boundary · Q = 0"
            : mode === "isothermal"
              ? "300 K thermal bath exchanges heat"
              : "Heat exchange · fixed external pressure"}
        </text>
        <text x="65" y="28" fill="currentColor">
          Apparatus schematic · position follows volume ratio
        </text>
      </svg>
      <svg
        viewBox="0 0 600 310"
        role="img"
        aria-label="Pressure volume path and current final state"
      >
        <path d="M60 30V240H535" stroke="currentColor" fill="none" />
        <polyline
          points={points}
          stroke="#16a34a"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx={60 + (ratio - 0.5) * 180}
          cy={240 - (result.pressurePa / 1000) * 0.65}
          r="6"
          fill="currentColor"
        />
        <text x="70" y="25" fill="currentColor">
          Pressure (kPa), 0–320
        </text>
        <text x="200" y="275" fill="currentColor">
          Volume ratio V/V₀, 0.5–3
        </text>
      </svg>
      <div className="info-box" aria-live="polite">
        <p>
          Temperature: {result.finalK.toFixed(1)} K · Pressure:{" "}
          {(result.pressurePa / 1000).toFixed(2)} kPa · Volume:{" "}
          {(result.finalM3 * 1000).toFixed(2)} L
        </p>
        <p>
          Q = {result.heat.toFixed(1)} J · W = {result.work.toFixed(1)} J · ΔU ={" "}
          {result.deltaU.toFixed(1)} J
        </p>
        <p>
          First-law residual Q − W − ΔU:{" "}
          {(result.heat - result.work - result.deltaU).toFixed(8)} J
        </p>
      </div>
      <button
        className="text-button"
        disabled={rows.length >= 20}
        onClick={() =>
          setRows([
            ...rows,
            {
              ratio,
              t: result.finalK,
              p: result.pressurePa / 1000,
              q: result.heat,
              w: result.work,
            },
          ])
        }
      >
        Record gas reading
      </button>
      <button className="text-button" onClick={() => setRows([])}>
        Clear gas readings
      </button>
      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption>
              Synthetic gas observations · same initial state and path
            </caption>
            <thead>
              <tr>
                {["V/V₀", "T (K)", "p (kPa)", "Q (J)", "W (J)"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {[r.ratio, r.t, r.p, r.q, r.w].map((v, j) => (
                    <td key={j}>{v.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <details>
        <summary>Predict, measure, explain</summary>
        <p>
          Predict which path cools on expansion. Record V/V₀ = 1, 1.5 and 2;
          compare pV, temperature and energy transfers. Check that isothermal ΔU
          is zero, adiabatic Q is zero, and isobaric p remains{" "}
          {((GAS_R * 300) / 0.025 / 1000).toFixed(2)} kPa. Path changes clear
          the observation table.
        </p>
        <p>
          Limits: no friction, leaks, phase transitions, molecular rotations or
          finite-rate temperature gradients. The graph is a process curve, not a
          time trace; different paths require different apparatus constraints.
        </p>
      </details>
    </div>
  );
}
