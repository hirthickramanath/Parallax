import { useState } from "react";
import { Control, Scene } from "./FoundationExplorers";
import {
  oscillatorPhase,
  canonicalShear,
} from "../../lib/analytical-mechanics-models";
export function HamiltonianPhaseExplorer() {
  const [q, setQ] = useState(1),
    [p, setP] = useState(0),
    [m, setM] = useState(1),
    [omega, setOmega] = useState(1);
  const s = oscillatorPhase(q, p, m, omega),
    sx = 90 / Math.max(3, s.amplitudeQ),
    sy = 90 / Math.max(3, s.amplitudeP);
  const x = 200 + sx * q,
    y = 130 - sy * p,
    dx = sx * s.qdot,
    dy = -sy * s.pdot,
    norm = Math.hypot(dx, dy);
  return (
    <section className="virtual-lab">
      <h3>Move a phase point and read its energy contour</h3>
      <p>
        Drag the canonical (q,p) point for a one-degree harmonic oscillator.
        Units are consistent model units; ω is angular frequency. The axes
        rescale independently to keep the energy ellipse visible, so pixel area
        is not physical phase area. This is an exact contour/vector display, not
        a numerical trajectory.
      </p>
      <Control
        label="Phase position q"
        value={q}
        min={-3}
        max={3}
        step={0.1}
        onChange={setQ}
      />
      <Control
        label="Phase momentum p"
        value={p}
        min={-3}
        max={3}
        step={0.1}
        onChange={setP}
      />
      <Control
        label="Phase mass"
        value={m}
        min={0.5}
        max={3}
        step={0.1}
        onChange={setM}
      />
      <Control
        label="Phase angular frequency"
        value={omega}
        min={0.5}
        max={3}
        step={0.1}
        onChange={setOmega}
      />
      <Scene
        label="Drag Hamiltonian phase point"
        x={x}
        y={y}
        move={(px, py) => {
          setQ(Math.max(-3, Math.min(3, (px - 200) / sx)));
          setP(Math.max(-3, Math.min(3, (130 - py) / sy)));
        }}
      >
        <path d="M50 130H350M200 25V235" stroke="currentColor" />
        <ellipse
          cx="200"
          cy="130"
          rx={sx * s.amplitudeQ}
          ry={sy * s.amplitudeP}
          stroke="#2584d5"
          fill="none"
        />
        <line
          x1={x}
          y1={y}
          x2={x + (norm ? (40 * dx) / norm : 0)}
          y2={y + (norm ? (40 * dy) / norm : 0)}
          stroke="#d47232"
          strokeWidth="3"
        />
      </Scene>
      <output aria-live="polite">
        Energy: {s.energy.toFixed(4)}. Action J: {s.action.toFixed(4)}. Enclosed
        phase area: {s.area.toFixed(4)}. Flow (qdot, pdot): ({s.qdot.toFixed(4)}
        , {s.pdot.toFixed(4)}).
      </output>
      <p>
        H=p²/(2m)+mω²q²/2; the orange direction is (H_p,−H_q). The ellipse area
        is 2πH/ω, so J=H/ω. At q=p=0 the contour collapses and an oscillator
        angle is undefined; a regular action–angle chart must exclude that
        singular coordinate point.
      </p>
    </section>
  );
}
export function CanonicalShearExplorer() {
  const [q, setQ] = useState(1),
    [p, setP] = useState(1),
    [alpha, setAlpha] = useState(1);
  const s = canonicalShear(q, p, alpha);
  const corners = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].map(([q, p]) => canonicalShear(q, p, alpha));
  return (
    <section className="virtual-lab">
      <h3>Shear a canonical square without changing its area</h3>
      <p>
        Drag the old (q,p) point on the left. The right point is Q=q, P=p−αq.
        Both diagrams use the same canonical-coordinate scale; q and p use
        consistent model units. The shaded unit square maps to a parallelogram.
      </p>
      <Control
        label="Canonical old q"
        value={q}
        min={-2}
        max={2}
        step={0.1}
        onChange={setQ}
      />
      <Control
        label="Canonical old p"
        value={p}
        min={-2}
        max={2}
        step={0.1}
        onChange={setP}
      />
      <Control
        label="Canonical shear alpha"
        value={alpha}
        min={-2}
        max={2}
        step={0.1}
        onChange={setAlpha}
      />
      <Scene
        label="Drag canonical old point"
        x={90 + 20 * q}
        y={130 - 20 * p}
        move={(x, y) => {
          setQ(Math.max(-2, Math.min(2, (x - 90) / 20)));
          setP(Math.max(-2, Math.min(2, (130 - y) / 20)));
        }}
      >
        <path
          d="M35 130H150M90 55V205M235 130H355M290 5V255"
          stroke="currentColor"
        />
        <rect
          x="90"
          y="110"
          width="20"
          height="20"
          fill="#2584d5"
          opacity=".3"
        />
        <polygon
          points={corners
            .map((v) => `${290 + 20 * v.Q},${130 - 20 * v.P}`)
            .join(" ")}
          fill="#d47232"
          opacity=".3"
        />
        <circle cx={290 + 20 * s.Q} cy={130 - 20 * s.P} r="7" fill="#d47232" />
      </Scene>
      <output aria-live="polite">
        New point: Q={s.Q.toFixed(3)}, P={s.P.toFixed(3)}. Poisson bracket:{" "}
        {s.bracket.toFixed(3)}. Canonical area ratio: {s.areaRatio.toFixed(3)}.
      </output>
      <p>
        F₂=qP+αq²/2 gives p=P+αq and Q=q. Directly, dQ∧dP=dq∧dp. This one-degree
        shear is canonical; preserving total volume alone would not establish a
        general higher-dimensional canonical transformation.
      </p>
    </section>
  );
}
