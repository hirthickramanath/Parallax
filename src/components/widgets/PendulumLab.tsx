import { useEffect, useRef, useState } from "react";
import { pendulumPeriod } from "../../lib/lab-models";
import { Button } from "../ui/button";

export function PendulumLab() {
  const [length, setLength] = useState(1),
    [angle, setAngle] = useState(10),
    [time, setTime] = useState(0),
    [running, setRunning] = useState(false),
    [samples, setSamples] = useState<number[]>([]);
  const last = useRef<number | null>(null);
  const period = pendulumPeriod(length, angle),
    small = 2 * Math.PI * Math.sqrt(length / 9.81);
  useEffect(() => {
    if (!running) return;
    let frame: number;
    const tick = (now: number) => {
      if (last.current !== null)
        setTime((t) => t + (now - last.current!) / 1000);
      last.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      last.current = null;
    };
  }, [running]);
  const theta =
    ((angle * Math.PI) / 180) * Math.cos((2 * Math.PI * time) / period);
  const radius = 60 + length * 60;
  const x = 200 + radius * Math.sin(theta),
    y = 25 + radius * Math.cos(theta);
  function reset() {
    setRunning(false);
    setTime(0);
    setSamples([]);
  }
  return (
    <div className="virtual-lab">
      <p className="lab-label">VIRTUAL LAB · PENDULUM BENCH</p>
      <p>
        Apparatus: adjustable string, compact bob, angle scale and simulated
        timer. Release from rest, time ten oscillations, repeat, then estimate
        gravity. No real measurements are being collected.
      </p>
      <div className="lab-controls">
        <label>
          String length: {length.toFixed(2)} m
          <input
            aria-label="Pendulum length"
            type="range"
            min=".3"
            max="2"
            step=".05"
            value={length}
            onChange={(e) => {
              setLength(Number(e.target.value));
              reset();
            }}
          />
        </label>
        <label>
          Release angle: {angle}°
          <input
            aria-label="Release angle"
            type="range"
            min="5"
            max="60"
            step="1"
            value={angle}
            onChange={(e) => {
              setAngle(Number(e.target.value));
              reset();
            }}
          />
        </label>
      </div>
      <svg
        viewBox="0 0 400 260"
        role="img"
        aria-label={`Pendulum with ${length} metre string at time ${time.toFixed(1)} seconds`}
      >
        <path d="M125 25H275" stroke="currentColor" strokeWidth="5" />
        <path d={`M200 25L${x} ${y}`} stroke="currentColor" strokeWidth="2" />
        <circle cx={x} cy={y} r="14" fill="var(--primary-color)" />
        <path
          d="M200 25V235"
          stroke="currentColor"
          opacity=".2"
          strokeDasharray="4 4"
        />
      </svg>
      <div className="lab-actions">
        <Button onClick={() => setRunning(!running)}>
          {running ? "Pause apparatus" : "Run apparatus"}
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset bench
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setSamples((s) => [
              ...s,
              10 * period + [0.08, -0.06, 0.03, -0.04, 0.01][s.length % 5],
            ])
          }
        >
          Record synthetic 10-cycle timing
        </Button>
      </div>
      <p>
        Timer: {time.toFixed(1)} s · Small-angle prediction: {small.toFixed(3)}{" "}
        s · Nonlinear period: {period.toFixed(3)} s
      </p>
      <p className="lab-caveat">
        Illustrative motion uses a sinusoidal phase at the numerically
        integrated nonlinear period; it is not an exact large-angle trajectory.
        Periods use the elliptic-integral solution for an ideal, undamped
        point-mass pendulum. Synthetic readings add stated timing offsets, not
        experimental evidence.
      </p>
      {samples.length > 0 && (
        <div className="measurement-table">
          <table>
            <caption>
              Synthetic observations · timing offsets up to 0.08 s per ten
              cycles
            </caption>
            <thead>
              <tr>
                <th>Trial</th>
                <th>10 cycles / s</th>
                <th>Period / s</th>
                <th>Inferred g / m s⁻²</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((t, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{t.toFixed(3)}</td>
                  <td>{(t / 10).toFixed(3)}</td>
                  <td>
                    {((4 * Math.PI ** 2 * length) / (t / 10) ** 2).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            At larger angles, the small-angle formula biases the inferred g.
            Timing more cycles reduces relative stopwatch error; it does not
            remove model error.
          </p>
        </div>
      )}
    </div>
  );
}
