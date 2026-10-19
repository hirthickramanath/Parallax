import { useState } from "react";
import { collision, rolling } from "../../lib/mechanics";
export function CollisionExplorer() {
  const [u, setU] = useState(3),
    [m, setM] = useState(2),
    [e, setE] = useState(1),
    [time, setTime] = useState(0),
    [drag, setDrag] = useState(false);
  const model = collision(m, 1, u, 0, e);
  return (
    <section className="virtual-lab">
      <h3>Momentum can stay while kinetic energy changes</h3>
      <p>
        Predict: which choice makes the carts move together? Drag the blue
        velocity handle or use the controls. This is an isolated one-dimensional
        impact with a stationary second cart.
      </p>
      <label>
        First cart mass (kg)
        <input
          aria-label="Collision first mass"
          type="range"
          min="1"
          max="5"
          step=".5"
          value={m}
          onChange={(e) => setM(Number(e.target.value))}
        />
      </label>
      <label>
        First velocity (m/s)
        <input
          aria-label="Collision first velocity"
          type="range"
          min="0"
          max="6"
          step=".1"
          value={u}
          onChange={(e) => setU(Number(e.target.value))}
        />
      </label>
      <label>
        Restitution
        <input
          aria-label="Collision restitution"
          type="range"
          min="0"
          max="1"
          step=".05"
          value={e}
          onChange={(e) => setE(Number(e.target.value))}
        />
      </label>
      <label>
        Time after impact (s)
        <input
          aria-label="Collision time"
          type="range"
          min="0"
          max="1"
          step=".02"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        />
      </label>
      <svg
        viewBox="0 0 400 180"
        aria-label="Drag collision velocity handle"
        style={{ touchAction: "none" }}
        onPointerMove={(ev) => {
          if (drag) {
            const b = ev.currentTarget.getBoundingClientRect();
            setU(
              Math.max(
                0,
                Math.min(
                  6,
                  ((400 * (ev.clientX - b.left)) / b.width - 70) / 35,
                ),
              ),
            );
          }
        }}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
      >
        <path d="M20 140H380M70 45H280" stroke="currentColor" />
        <rect
          x={160 + model.v1 * time * 20}
          y="105"
          width="35"
          height="35"
          fill="#2584d5"
        />
        <rect
          x={195 + model.v2 * time * 20}
          y="105"
          width="35"
          height="35"
          fill="#d47232"
        />
        <circle
          cx={70 + 35 * u}
          cy="45"
          r="9"
          fill="#2584d5"
          tabIndex={0}
          role="button"
          aria-label="Collision velocity handle"
          onPointerDown={(ev) => {
            ev.currentTarget.ownerSVGElement?.setPointerCapture(ev.pointerId);
            setDrag(true);
          }}
          onKeyDown={(ev) => {
            if (["ArrowLeft", "ArrowRight"].includes(ev.key)) {
              ev.preventDefault();
              setU((v) =>
                Math.max(
                  0,
                  Math.min(6, v + (ev.key === "ArrowRight" ? 0.1 : -0.1)),
                ),
              );
            }
          }}
        />
      </svg>
      <output aria-live="polite">
        Momentum before/after: {model.before.toFixed(3)} /{" "}
        {model.after.toFixed(3)} kg m/s. Kinetic energy lost:{" "}
        {model.lost.toFixed(3)} J. Final velocities: {model.v1.toFixed(3)},{" "}
        {model.v2.toFixed(3)} m/s.
      </output>
      <p>
        Explain why momentum conservation alone cannot determine both final
        velocities. Restitution supplies the second relation. Real collision
        models also need deformation and external-impulse checks.
      </p>
    </section>
  );
}
export function RollingExplorer() {
  const [beta, setBeta] = useState(0.5),
    [fraction, setFraction] = useState(0.5),
    [drag, setDrag] = useState(false);
  const state = rolling(2 * fraction, beta),
    angle = (Math.sqrt(5) * 2 * fraction) / 0.2;
  return (
    <section className="virtual-lab">
      <h3>Where does the gravitational energy go?</h3>
      <p>
        Drag the body down the ramp or use the slider. Predict which mass
        distribution reaches a given height loss with greater speed. Ideal
        rigid-body rolling without slipping, starting from rest.
      </p>
      <label>
        Mass distribution
        <select
          aria-label="Rolling mass distribution"
          value={beta}
          onChange={(e) => setBeta(Number(e.target.value))}
        >
          <option value="0.4">Solid sphere · I/(mR²)=0.4</option>
          <option value="0.5">Solid cylinder · 0.5</option>
          <option value="1">Thin hoop · 1</option>
        </select>
      </label>
      <label>
        Fraction of ramp travelled
        <input
          aria-label="Ramp travel"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={fraction}
          onChange={(e) => setFraction(Number(e.target.value))}
        />
      </label>
      <svg
        viewBox="0 0 400 250"
        aria-label="Drag rolling body down the ramp"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => {
          if (drag) {
            const box = e.currentTarget.getBoundingClientRect();
            setFraction(
              Math.max(
                0,
                Math.min(
                  1,
                  ((400 * (e.clientX - box.left)) / box.width - 50) / 300,
                ),
              ),
            );
          }
        }}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
      >
        <path d="M30 65L350 225" stroke="currentColor" strokeWidth="3" />
        <g
          transform={`translate(${50 + 300 * fraction},${55 + 150 * fraction}) rotate(${(angle * 180) / Math.PI})`}
        >
          <circle
            r="18"
            fill="var(--soft-green)"
            stroke="var(--primary-color)"
            strokeWidth="3"
            tabIndex={0}
            role="button"
            aria-label="Rolling body handle"
            onPointerDown={(e) => {
              e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
              setDrag(true);
            }}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                setFraction((x) =>
                  Math.max(
                    0,
                    Math.min(1, x + (e.key === "ArrowRight" ? 0.05 : -0.05)),
                  ),
                );
              }
            }}
          />
          <path d="M0 0H18" stroke="var(--primary-color)" />
        </g>
      </svg>
      <output aria-live="polite">
        Speed: {state.speed.toFixed(3)} m/s. Translation:{" "}
        {state.translation.toFixed(3)} J. Rotation: {state.rotation.toFixed(3)}{" "}
        J. Potential energy lost: {state.potentialLost.toFixed(3)} J.
      </output>
      <p>
        Mass is 1 kg, initial height is 2 m and radius is 0.2 m. Sufficient
        static friction is assumed. Energy conservation alone does not establish
        that the no-slip condition is physically possible on a particular
        surface.
      </p>
    </section>
  );
}
