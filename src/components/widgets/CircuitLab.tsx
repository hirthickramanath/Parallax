import { useState } from "react";
import { resistorCircuit } from "../../lib/circuit";
import { Button } from "../ui/button";
export function CircuitLab() {
  const [voltage, setVoltage] = useState(6),
    [r1, setR1] = useState(100),
    [r2, setR2] = useState(200),
    [mode, setMode] = useState<"series" | "parallel">("series"),
    [readings, setReadings] = useState<{ v: number; i: number }[]>([]);
  const result = resistorCircuit(voltage, r1, r2, mode);
  function changeMode(next: "series" | "parallel") {
    setMode(next);
    setReadings([]);
  }
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · RESISTOR BENCH</p>
      <p>
        Apparatus: ideal DC supply, ideal ammeter in series, ideal voltmeter
        across the load, and two ohmic resistors. These are synthetic ideal
        readings, not hardware measurements.
      </p>
      <div className="lab-subjects">
        <button
          aria-pressed={mode === "series"}
          onClick={() => changeMode("series")}
        >
          Series load
        </button>
        <button
          aria-pressed={mode === "parallel"}
          onClick={() => changeMode("parallel")}
        >
          Parallel load
        </button>
      </div>
      <div className="lab-controls">
        <label>
          Supply: {voltage.toFixed(1)} V
          <input
            aria-label="Supply voltage"
            type="range"
            min=".5"
            max="12"
            step=".5"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
          />
        </label>
        <label>
          R₁: {r1} Ω
          <input
            aria-label="First resistance"
            type="range"
            min="50"
            max="1000"
            step="50"
            value={r1}
            onChange={(e) => {
              setR1(Number(e.target.value));
              setReadings([]);
            }}
          />
        </label>
        <label>
          R₂: {r2} Ω
          <input
            aria-label="Second resistance"
            type="range"
            min="50"
            max="1000"
            step="50"
            value={r2}
            onChange={(e) => {
              setR2(Number(e.target.value));
              setReadings([]);
            }}
          />
        </label>
      </div>
      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label={`${mode} resistor circuit with a series ammeter and parallel voltmeter`}
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M70 100V40H190M230 40H530M70 155V250H530" />
          <path d="M45 100H95M55 155H85" />
          <circle cx="210" cy="40" r="20" />
          <path d="M300 40V110M300 150V250" strokeDasharray="4 4" />
          <circle cx="300" cy="130" r="20" />
          {mode === "series" ? (
            <>
              <path d="M530 40V80M530 125V160M530 205V250" />
              <rect x="519" y="80" width="22" height="45" />
              <rect x="519" y="160" width="22" height="45" />
            </>
          ) : (
            <>
              <path d="M400 40V105M400 160V250M530 40V105M530 160V250" />
              <rect x="389" y="105" width="22" height="55" />
              <rect x="519" y="105" width="22" height="55" />
            </>
          )}
        </g>
        <g fill="currentColor" fontSize="13">
          <text x="205" y="45">
            A
          </text>
          <text x="295" y="135">
            V
          </text>
          <text x="7" y="132">
            {voltage.toFixed(1)} V
          </text>
          <text
            x={mode === "series" ? 550 : 420}
            y={mode === "series" ? 107 : 138}
          >
            R₁
          </text>
          <text x="550" y={mode === "series" ? 185 : 138}>
            R₂
          </text>
        </g>
      </svg>
      <div className="lab-readout">
        <p>
          Ammeter: <strong>{(result.current * 1000).toFixed(2)} mA</strong>
        </p>
        <p>
          Voltmeter: <strong>{voltage.toFixed(2)} V</strong>
        </p>
        <p>
          Equivalent resistance:{" "}
          <strong>{result.resistance.toFixed(2)} Ω</strong>
        </p>
        <p>
          Total power: <strong>{result.power.toFixed(3)} W</strong>
        </p>
      </div>
      <p>
        Across R₁: {result.v1.toFixed(2)} V · Across R₂: {result.v2.toFixed(2)}{" "}
        V. Branch currents: {(result.i1 * 1000).toFixed(2)} and{" "}
        {(result.i2 * 1000).toFixed(2)} mA.
      </p>
      <Button
        variant="outline"
        onClick={() =>
          setReadings((r) =>
            [...r, { v: voltage, i: result.current }].slice(-12),
          )
        }
      >
        Record synthetic meter reading
      </Button>
      {readings.length > 0 && (
        <div className="measurement-table">
          <table>
            <caption>
              Same load configuration · up to 12 recent readings
            </caption>
            <thead>
              <tr>
                <th>Trial</th>
                <th>V / V</th>
                <th>I / mA</th>
                <th>V/I / Ω</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{r.v.toFixed(2)}</td>
                  <td>{(r.i * 1000).toFixed(2)}</td>
                  <td>{(r.v / r.i).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="lab-caveat">
        The ideal model assumes fixed temperature, ohmic elements, zero wire
        resistance and noninvasive meters. A real voltmeter draws some current
        and a real ammeter changes the circuit. Holding resistor settings fixed
        while varying supply tests a model’s linear response; changing resistors
        resets the table so distinct configurations are not silently mixed.
      </p>
    </div>
  );
}
