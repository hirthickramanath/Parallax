import { useState } from "react";
import { Control, Scene } from "./FoundationExplorers";
import {
  coriolis,
  principalBody,
  rutherford,
} from "../../lib/advanced-mechanics-models";
export function CoriolisExplorer() {
  const [omega, setOmega] = useState(0.5),
    [vx, setVx] = useState(4),
    [vy, setVy] = useState(0);
  const a = coriolis(omega, vx, vy);
  return (
    <section className="virtual-lab">
      <h3>Turn the velocity; watch the Coriolis direction</h3>
      <p>
        Drag the velocity tip in the rotating x-y plane. The positive z axis
        points out of the screen. Predict the acceleration after reversing Ω.
        This is an instantaneous vector relation, not a trajectory integration.
      </p>
      <Control
        label="Frame angular speed"
        value={omega}
        min={-2}
        max={2}
        step={0.1}
        onChange={setOmega}
      />
      <Control
        label="Rotating velocity x"
        value={vx}
        min={-4}
        max={4}
        step={0.1}
        onChange={setVx}
      />
      <Control
        label="Rotating velocity y"
        value={vy}
        min={-4}
        max={4}
        step={0.1}
        onChange={setVy}
      />
      <Scene
        label="Drag rotating velocity"
        x={200 + 20 * vx}
        y={130 - 20 * vy}
        move={(x, y) => {
          setVx(Math.max(-4, Math.min(4, (x - 200) / 20)));
          setVy(Math.max(-4, Math.min(4, (130 - y) / 20)));
        }}
      >
        <path d="M40 130H360M200 25V235" stroke="currentColor" />
        <line
          x1="200"
          y1="130"
          x2={200 + 20 * vx}
          y2={130 - 20 * vy}
          stroke="#2584d5"
          strokeWidth="4"
        />
        <line
          x1="200"
          y1="130"
          x2={200 + 6 * a.ax}
          y2={130 - 6 * a.ay}
          stroke="#d47232"
          strokeWidth="4"
        />
      </Scene>
      <output aria-live="polite">
        Coriolis acceleration: ({a.ax.toFixed(3)}, {a.ay.toFixed(3)}) m/s².
        v·a_C: {(vx * a.ax + vy * a.ay).toFixed(6)}.
      </output>
      <p>
        a_C=−2Ω×v_R. Blue velocity and orange acceleration use separate length
        scales; compare directions, not arrow lengths. Centrifugal, Euler and
        frame-origin terms are not included in this vector display.
      </p>
    </section>
  );
}
export function InertiaTensorExplorer() {
  const [w1, setW1] = useState(1),
    [w2, setW2] = useState(2),
    [w3, setW3] = useState(0);
  const s = principalBody(w1, w2, w3);
  return (
    <section className="virtual-lab">
      <h3>Angular momentum need not point along angular velocity</h3>
      <p>
        For principal moments (2,3,4) kg m² and angular-velocity components in
        rad/s, drag the x-y angular-velocity tip and vary its third component.
        Arrows show x-y projections at separate scales; full-vector quantities
        are reported below. No orientation trajectory is integrated.
      </p>
      <Control
        label="Body omega 1"
        value={w1}
        min={-3}
        max={3}
        step={0.1}
        onChange={setW1}
      />
      <Control
        label="Body omega 2"
        value={w2}
        min={-3}
        max={3}
        step={0.1}
        onChange={setW2}
      />
      <Control
        label="Body omega 3"
        value={w3}
        min={-3}
        max={3}
        step={0.1}
        onChange={setW3}
      />
      <Scene
        label="Drag body angular velocity"
        x={200 + 25 * w1}
        y={130 - 25 * w2}
        move={(x, y) => {
          setW1(Math.max(-3, Math.min(3, (x - 200) / 25)));
          setW2(Math.max(-3, Math.min(3, (130 - y) / 25)));
        }}
      >
        <path d="M40 130H360M200 15V245" stroke="currentColor" />
        <line
          x1="200"
          y1="130"
          x2={200 + 25 * w1}
          y2={130 - 25 * w2}
          stroke="#2584d5"
          strokeWidth="4"
        />
        <line
          x1="200"
          y1="130"
          x2={200 + 12.5 * s.L[0]}
          y2={130 - 12.5 * s.L[1]}
          stroke="#d47232"
          strokeWidth="4"
        />
      </Scene>
      <output aria-live="polite">
        Angular momentum: ({s.L.map((x) => x.toFixed(3)).join(", ")}) kg m²/s.
        Energy: {s.energy.toFixed(3)} J. |ω×L|: {s.crossMagnitude.toFixed(3)}.
        Torque-free body derivative: (
        {s.derivative.map((x) => x.toFixed(3)).join(", ")}) rad/s².
      </output>
      <p>
        Euler’s equations give these instantaneous body derivatives.
        Conservation of inertial angular momentum does not freeze its rotating
        components. A zero cross product identifies principal-direction rotation
        here; projections alone cannot establish full 3D parallelism.
      </p>
    </section>
  );
}
export function RutherfordExplorer() {
  const [impact, setImpact] = useState(1),
    [energy, setEnergy] = useState(2);
  const s = rutherford(impact, energy),
    beamY = 130 - 20 * impact;
  return (
    <section className="virtual-lab">
      <h3>Map an impact parameter to a scattering direction</h3>
      <p>
        Drag the incoming beam vertically. Repulsive point-Coulomb model, κ=4 in
        consistent energy-length units; E is the relative-motion energy. The
        kink sketches incoming/outgoing directions and is not a computed
        hyperbolic trajectory.
      </p>
      <Control
        label="Scattering impact parameter"
        value={impact}
        min={0.2}
        max={4}
        step={0.05}
        onChange={setImpact}
      />
      <Control
        label="Scattering energy"
        value={energy}
        min={0.5}
        max={5}
        step={0.1}
        onChange={setEnergy}
      />
      <Scene
        label="Drag incoming scattering beam"
        x={70}
        y={beamY}
        move={(_, y) => setImpact(Math.max(0.2, Math.min(4, (130 - y) / 20)))}
      >
        <circle cx="200" cy="130" r="9" fill="#d47232" />
        <path
          d={`M25 ${beamY}H200L${200 + 45 * Math.cos(s.angle)} ${beamY - 45 * Math.sin(s.angle)}`}
          stroke="#2584d5"
          strokeWidth="3"
          fill="none"
        />
        <path d="M25 130H375" stroke="currentColor" strokeDasharray="4 4" />
      </Scene>
      <output aria-live="polite">
        Deflection angle: {((s.angle * 180) / Math.PI).toFixed(3)} degrees.
        Differential cross section: {s.crossSection.toFixed(5)} model area/sr.
      </output>
      <p>
        b=[κ/(2E)]cot(θ/2); dσ/dΩ=[κ/(4E)]²/sin⁴(θ/2). This display excludes
        zero impact and the exact forward direction. Real counts need finite
        angular acceptance, exposure, efficiency and any screening model;
        laboratory angles can differ from relative-frame angles. Changing E at
        fixed b changes the evaluated angle; this is not a fixed-detector-angle
        comparison.
      </p>
    </section>
  );
}
