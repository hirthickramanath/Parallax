import { useState } from "react";
import { Control, Scene } from "./FoundationExplorers";
import {
  quadraticLimit,
  signedQuadraticArea,
  exponentialSteps,
  domainDirections,
} from "../../lib/calculus-models";
export function LimitBandExplorer() {
  const [delta, setDelta] = useState(0.2),
    [epsilon, setEpsilon] = useState(0.5);
  const path = Array.from({ length: 81 }, (_, i) => {
    const x = i / 40;
    return `${i ? "L" : "M"}${40 + 160 * x} ${230 - 50 * x * x}`;
  }).join(" ");
  return (
    <section className="virtual-lab">
      <h3>A band is a conjecture; the inequality is the proof</h3>
      <p>
        For f(x)=x² near a=1, predict a δ that keeps the graph inside the ε
        band. Drag the right endpoint or use the controls. The picture samples a
        curve; the factorization supplies the all-points argument.
      </p>
      <Control
        label="Limit epsilon"
        value={epsilon}
        min={0.02}
        max={3}
        step={0.01}
        onChange={setEpsilon}
      />
      <Control
        label="Limit delta"
        value={delta}
        min={0.01}
        max={1}
        step={0.01}
        onChange={setDelta}
      />
      <Scene
        label="Drag limit interval endpoint"
        x={200 + 160 * delta}
        y={230 - 50 * (1 + delta) ** 2}
        move={(x) => setDelta(Math.max(0.01, Math.min(1, (x - 200) / 160)))}
      >
        <rect
          x="40"
          y={230 - 50 * (1 + epsilon)}
          width="320"
          height={100 * epsilon}
          fill="#2584d5"
          opacity=".12"
        />
        <rect
          x={200 - 160 * delta}
          y="30"
          width={320 * delta}
          height="200"
          fill="#d47232"
          opacity=".12"
        />
        <path d={path} stroke="currentColor" fill="none" />
        <path
          d="M40 230H360M200 30V230"
          stroke="currentColor"
          strokeDasharray="3 4"
        />
      </Scene>
      <output aria-live="polite">
        Closed-interval supremum |f(x)−1|: {quadraticLimit(delta).toFixed(4)}.
        Sufficient proof choice min(1, ε/3):{" "}
        {Math.min(1, epsilon / 3).toFixed(4)}.
      </output>
      <p>
        For |x−1|&lt;δ≤1, |x+1|&lt;3; hence |x²−1|&lt;3δ. The displayed supremum
        uses a closed interval; the limit definition uses 0&lt;|x−1|&lt;δ. Large
        bands may extend beyond the drawing.
      </p>
    </section>
  );
}
export function SignedAreaExplorer() {
  const [b, setB] = useState(1.5),
    [n, setN] = useState(8);
  const s = signedQuadraticArea(b, n),
    h = b / n;
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = i / 40;
    return `${i ? "L" : "M"}${30 + 160 * x} ${150 - 30 * (x * x - 1)}`;
  }).join(" ");
  return (
    <section className="virtual-lab">
      <h3>Cancellation is not zero geometric area</h3>
      <p>
        Drag the integration endpoint for f(x)=x²−1. Predict where the signed
        integral vanishes, then compare it with total geometric area. Rectangles
        form a left-endpoint signed sum, not exact area measurements.
      </p>
      <Control
        label="Integration endpoint"
        value={b}
        min={0.1}
        max={2}
        step={0.01}
        onChange={setB}
      />
      <Control
        label="Integration panels"
        value={n}
        min={1}
        max={40}
        step={1}
        onChange={setN}
      />
      <Scene
        label="Drag integration endpoint"
        x={30 + 160 * b}
        y={150}
        move={(x) => setB(Math.max(0.1, Math.min(2, (x - 30) / 160)))}
      >
        {Array.from({ length: n }, (_, i) => {
          const f = (i * h) ** 2 - 1;
          return (
            <rect
              key={i}
              x={30 + 160 * i * h}
              y={f >= 0 ? 150 - 30 * f : 150}
              width={160 * h}
              height={30 * Math.abs(f)}
              fill={f >= 0 ? "#d47232" : "#2584d5"}
              opacity=".35"
              stroke="currentColor"
              strokeWidth=".3"
            />
          );
        })}
        <path d={curve} fill="none" stroke="currentColor" />
        <path d="M30 150H365" stroke="currentColor" />
      </Scene>
      <output aria-live="polite">
        Left sum: {s.left.toFixed(4)}. Exact signed integral:{" "}
        {s.signed.toFixed(4)}. Geometric area: {s.geometric.toFixed(4)}.
      </output>
      <p>
        Signed result: b³/3−b. Split the absolute-value integral at x=1 if
        b&gt;1. Increasing panel count is a numerical convergence check; the
        antiderivative supplies the exact result.
      </p>
    </section>
  );
}
export function OdeAccuracyExplorer() {
  const [k, setK] = useState(-2),
    [y0, setY0] = useState(3),
    [time, setTime] = useState(2),
    [steps, setSteps] = useState(4);
  const s = exponentialSteps(k, y0, time, steps),
    scale = Math.max(4, Math.abs(s.euler), y0 * Math.exp(Math.max(0, 2 * k)));
  const py = (y: number) => 130 - (90 * y) / scale;
  const exact = Array.from({ length: 81 }, (_, i) => {
    const t = i / 40;
    return `${i ? "L" : "M"}${35 + 160 * t} ${py(y0 * Math.exp(k * t))}`;
  }).join(" ");
  const approx = Array.from(
    { length: steps + 1 },
    (_, i) =>
      `${i ? "L" : "M"}${35 + (160 * time * i) / steps} ${py(y0 * s.factor ** i)}`,
  ).join(" ");
  return (
    <section className="virtual-lab">
      <h3>A decaying law can have an unstable numerical step</h3>
      <p>
        For y′=ky, drag the endpoint to change time. Compare the exact
        trajectory with explicit Euler. Predict whether one large step can cross
        zero even though the exact solution stays positive. The vertical axis
        rescales to show both results.
      </p>
      <Control
        label="ODE rate k"
        value={k}
        min={-2}
        max={1}
        step={0.1}
        onChange={setK}
      />
      <Control
        label="ODE initial value"
        value={y0}
        min={1}
        max={3}
        step={0.1}
        onChange={setY0}
      />
      <Control
        label="ODE endpoint time"
        value={time}
        min={0}
        max={2}
        step={0.05}
        onChange={setTime}
      />
      <Control
        label="ODE Euler steps"
        value={steps}
        min={1}
        max={40}
        step={1}
        onChange={setSteps}
      />
      <Scene
        label="Drag ODE endpoint"
        x={35 + 160 * time}
        y={py(s.exact)}
        move={(x) => setTime(Math.max(0, Math.min(2, (x - 35) / 160)))}
      >
        <path d="M35 130H365" stroke="currentColor" />
        <path d={exact} stroke="#2584d5" fill="none" />
        <path d={approx} stroke="#d47232" strokeDasharray="5 3" fill="none" />
      </Scene>
      <output aria-live="polite">
        Exact value: {s.exact.toFixed(5)}. Euler value: {s.euler.toFixed(5)}.
        Step h: {s.h.toFixed(4)}. Multiplier: {s.factor.toFixed(4)}.
      </output>
      <p>
        Blue is y₀ exp(kt); orange uses yₙ₊₁=(1+kh)yₙ. For k&lt;0, decay
        stability needs |1+kh|&lt;1 when h&gt;0. Stability does not guarantee
        accuracy; refine steps and compare the actual error.
      </p>
    </section>
  );
}
export function MolecularGeometryExplorer() {
  const [count, setCount] = useState(4),
    [lone, setLone] = useState(0),
    [angle, setAngle] = useState(25);
  const directions = domainDirections(count),
    phi = (angle * Math.PI) / 180;
  const points = directions.map(([x, y, z]) => {
    const rx = x * Math.cos(phi) - y * Math.sin(phi),
      ry = x * Math.sin(phi) + y * Math.cos(phi);
    return [200 + 70 * rx, 130 - 70 * (z * Math.cos(0.6) - ry * Math.sin(0.6))];
  });
  const shape =
    count === 4
      ? ["tetrahedral", "trigonal pyramidal", "bent"][lone]
      : count === 3
        ? ["trigonal planar", "bent", "one bond"][lone]
        : lone
          ? "one bond"
          : "linear";
  return (
    <section className="virtual-lab">
      <h3>Electron domains and visible atom positions differ</h3>
      <p>
        Rotate the projected ideal directions by dragging the blue rotation
        handle. Orange lobes label lone-pair domains; other endpoints label
        bonded atoms. This is an idealized VSEPR picture, not a force or
        quantum-energy calculation.
      </p>
      <label>
        Electron-domain count
        <select
          aria-label="Electron-domain count"
          value={count}
          onChange={(e) => {
            const n = Number(e.target.value);
            setCount(n);
            setLone(Math.min(lone, n - 1));
          }}
        >
          {[2, 3, 4].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        Lone-pair domains
        <select
          aria-label="Lone-pair domains"
          value={lone}
          onChange={(e) => setLone(Number(e.target.value))}
        >
          {Array.from({ length: Math.min(2, count - 1) + 1 }, (_, i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </label>
      <Control
        label="Molecule rotation (degrees)"
        value={angle}
        min={-180}
        max={180}
        step={1}
        onChange={setAngle}
      />
      <Scene
        label="Drag molecular rotation handle"
        x={200 + 95 * Math.cos(phi)}
        y={130 - 95 * Math.sin(phi)}
        move={(x, y) =>
          setAngle((Math.atan2(130 - y, x - 200) * 180) / Math.PI)
        }
      >
        {points.map(([x, y], i) => (
          <g key={i}>
            <line
              x1="200"
              y1="130"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeDasharray={i < lone ? "4 4" : undefined}
            />
            <circle
              cx={x}
              cy={y}
              r={i < lone ? 13 : 8}
              fill={i < lone ? "#d47232" : "#2584d5"}
              opacity={i < lone ? 0.5 : 1}
            />
          </g>
        ))}
        <circle cx="200" cy="130" r="10" fill="currentColor" />
      </Scene>
      <output aria-live="polite">
        Visible atom geometry: {shape}. Bond domains: {count - lone}. Lone-pair
        domains: {lone}. Ideal electron-domain angle:{" "}
        {count === 4 ? "109.471" : count === 3 ? "120" : "180"} degrees.
      </output>
      <p>
        The projected drawing distorts angles. Actual bond angles can relax,
        especially with lone pairs; the ideal tetrahedral angle is not a
        prediction that water has that measured angle. Multiple bonds count as
        one directional domain in this elementary model.
      </p>
    </section>
  );
}
