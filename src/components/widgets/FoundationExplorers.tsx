import { useState } from "react";
import type { ReactNode } from "react";
import {
  ellipsePoint,
  hydrostatic,
  planeProjection,
  thermalHeating,
} from "../../lib/foundation-models";
function Control({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label>
      {label}: {value.toFixed(2)}
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Scene({
  label,
  x,
  y,
  move,
  children,
}: {
  label: string;
  x: number;
  y: number;
  move: (x: number, y: number) => void;
  children?: ReactNode;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <svg
      viewBox="0 0 400 260"
      aria-label={label}
      style={{ touchAction: "none" }}
      onPointerMove={(e) => {
        if (drag) {
          const b = e.currentTarget.getBoundingClientRect();
          const scale = Math.min(b.width / 400, b.height / 260);
          move(
            Math.max(
              0,
              Math.min(
                400,
                (e.clientX - b.left - (b.width - 400 * scale) / 2) / scale,
              ),
            ),
            Math.max(
              0,
              Math.min(
                260,
                (e.clientY - b.top - (b.height - 260 * scale) / 2) / scale,
              ),
            ),
          );
        }
      }}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
    >
      {children}
      <circle
        cx={x}
        cy={y}
        r="9"
        fill="#2584d5"
        stroke="currentColor"
        onPointerDown={(e) => {
          e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
          setDrag(true);
        }}
      />
    </svg>
  );
}
export function HydrostaticExplorer() {
  const [depth, setDepth] = useState(2),
    [density, setDensity] = useState(1000);
  const s = hydrostatic(depth, density);
  return (
    <section className="virtual-lab">
      <h3>Probe a fluid column</h3>
      <p>
        Predict the pressure change when depth doubles. Drag the blue probe
        vertically; the sliders provide the same keyboard controls. Stationary,
        uniform-density liquid; g=9.8 m/s², surface pressure 101300 Pa.
      </p>
      <Control
        label="Probe depth (m)"
        value={depth}
        min={0}
        max={5}
        onChange={setDepth}
      />
      <Control
        label="Fluid density (kg/m³)"
        value={density}
        min={500}
        max={1500}
        step={10}
        onChange={setDensity}
      />
      <Scene
        label="Drag pressure probe"
        x={200}
        y={30 + 40 * depth}
        move={(_, y) => setDepth(Math.max(0, Math.min(5, (y - 30) / 40)))}
      >
        <rect
          x="65"
          y="30"
          width="270"
          height="200"
          fill="#2584d5"
          opacity=".15"
        />
        <path
          d="M65 30H335M65 30V230H335V30"
          fill="none"
          stroke="currentColor"
        />
        <text x="70" y="20" fill="currentColor">
          Free surface
        </text>
      </Scene>
      <output aria-live="polite">
        Gauge pressure: {s.gauge.toFixed(0)} Pa. Absolute pressure:{" "}
        {s.absolute.toFixed(0)} Pa.
      </output>
      <p>
        At zero depth, gauge pressure vanishes while absolute pressure remains
        nonzero. Explain why the container width never enters this local
        balance. Density stratification requires an integral.
      </p>
    </section>
  );
}
export function ThermalPathExplorer() {
  const [delta, setDelta] = useState(20),
    [path, setPath] = useState("volume");
  const s = thermalHeating(delta, path === "pressure");
  return (
    <section className="virtual-lab">
      <h3>Heat is a transfer, not a stored substance</h3>
      <p>
        One mole of monatomic ideal gas starts at 300 K. Predict which heating
        constraint needs more heat for the same temperature rise. These paths
        end at different volumes; they do not join the same pair of states.
      </p>
      <label>
        Heating constraint
        <select
          aria-label="Heating constraint"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        >
          <option value="volume">Constant volume</option>
          <option value="pressure">Constant pressure</option>
        </select>
      </label>
      <Control
        label="Temperature rise (K)"
        value={delta}
        min={0}
        max={100}
        step={1}
        onChange={setDelta}
      />
      <Scene
        label="Drag gas temperature handle"
        x={50 + 3 * delta}
        y={45}
        move={(x) =>
          setDelta(Math.round(Math.max(0, Math.min(100, (x - 50) / 3))))
        }
      >
        <path d="M50 45H350" stroke="currentColor" />
        {[
          [s.internal, "Internal energy", 100],
          [s.work, "Work by gas", 150],
          [s.heat, "Heat supplied", 200],
        ].map(([n, label, y]) => (
          <g key={String(label)}>
            <text x="20" y={Number(y) - 7} fill="currentColor">
              {label}
            </text>
            <rect
              x="20"
              y={Number(y)}
              width={Number(n) / 7}
              height="14"
              fill="#2584d5"
            />
          </g>
        ))}
      </Scene>
      <output aria-live="polite">
        ΔU: {s.internal.toFixed(2)} J. W: {s.work.toFixed(2)} J. Q:{" "}
        {s.heat.toFixed(2)} J.
      </output>
      <p>
        Check Q−W=ΔU at every setting. A rigid vessel does no boundary work. The
        pressure path assumes quasistatic expansion; vibrations, phase changes
        and heat losses are excluded.
      </p>
    </section>
  );
}
export function ConicExplorer() {
  const [e, setE] = useState(0.4),
    [angle, setAngle] = useState(60);
  const a = 5,
    s = ellipsePoint(a, e, (angle * Math.PI) / 180),
    scale = 19;
  return (
    <section className="virtual-lab">
      <h3>Track a conic from its focus</h3>
      <p>
        Predict periapsis and apoapsis as eccentricity increases with semimajor
        axis fixed at 5 AU. Drag the point around the focus to change true
        anomaly; this does not simulate equal time steps.
      </p>
      <Control
        label="Ellipse eccentricity"
        value={e}
        min={0}
        max={0.85}
        step={0.01}
        onChange={setE}
      />
      <Control
        label="True anomaly (degrees)"
        value={angle}
        min={-180}
        max={180}
        step={1}
        onChange={setAngle}
      />
      <Scene
        label="Drag conic position"
        x={200 + scale * s.x}
        y={130 - scale * s.y}
        move={(x, y) =>
          setAngle((Math.atan2(130 - y, x - 200) * 180) / Math.PI)
        }
      >
        <ellipse
          cx={200 - scale * a * e}
          cy="130"
          rx={scale * a}
          ry={scale * a * Math.sqrt(1 - e * e)}
          fill="none"
          stroke="currentColor"
        />
        <circle cx="200" cy="130" r="4" fill="#d47232" />
        <line
          x1="200"
          y1="130"
          x2={200 + scale * s.x}
          y2={130 - scale * s.y}
          stroke="#d47232"
        />
      </Scene>
      <output aria-live="polite">
        Radius: {s.r.toFixed(3)} AU. Periapsis: {s.periapsis.toFixed(3)} AU.
        Apoapsis: {s.apoapsis.toFixed(3)} AU.
      </output>
      <p>
        r=a(1−e²)/(1+e cosν). The orange point is the focus, not the center.
        Only bound ellipses are represented; no claim about orbital time or
        relativistic dynamics is made.
      </p>
    </section>
  );
}
export function PlaneDistanceExplorer() {
  const [x, setX] = useState(3),
    [z, setZ] = useState(3);
  const s = planeProjection(x, z);
  return (
    <section className="virtual-lab">
      <h3>Resolve a point along a plane normal</h3>
      <p>
        Drag P in the y=0 slice. The plane is x+2y+2z=3, with oriented normal
        (1,2,2). Predict where signed distance changes sign. The displayed line
        is the plane's intersection with the slice; the perpendicular foot
        generally leaves the slice.
      </p>
      <Control label="Point x" value={x} min={-3} max={6} onChange={setX} />
      <Control label="Point z" value={z} min={-3} max={6} onChange={setZ} />
      <Scene
        label="Drag point in plane slice"
        x={120 + 30 * x}
        y={170 - 20 * z}
        move={(px, py) => {
          setX(Math.max(-3, Math.min(6, (px - 120) / 30)));
          setZ(Math.max(-3, Math.min(6, (170 - py) / 20)));
        }}
      >
        <path
          d="M30 110L300 200M30 170H330M120 40V230"
          stroke="currentColor"
          fill="none"
        />
        <text x="135" y="45" fill="currentColor">
          z
        </text>
        <text x="335" y="175" fill="currentColor">
          x
        </text>
      </Scene>
      <output aria-live="polite">
        Signed distance: {s.signed.toFixed(3)}. Foot: (
        {s.foot.map((v) => v.toFixed(3)).join(", ")}).
      </output>
      <p>
        Divide the residual x+2z−3 by |n|=3. Verify the foot satisfies
        Hx+2Hy+2Hz=3. Screen axes have different scales, so screen distance is
        not physical distance.
      </p>
    </section>
  );
}
