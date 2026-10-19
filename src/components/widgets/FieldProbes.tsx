import { useState } from "react";
import { Control, Scene } from "./FoundationExplorers";
import { chargeField, wireField } from "../../lib/field-probes";
function FieldProbe({ mode }: { mode: "charges" | "image" | "wire" }) {
  const image = mode === "image",
    wire = mode === "wire";
  const [x, setX] = useState(image ? 1 : 0),
    [y, setY] = useState(wire ? 1 : 0),
    [parameter, setParameter] = useState(image ? 1 : wire ? 1 : -1);
  const charges = image
    ? [
        { x: 0, y: parameter, q: 1 },
        { x: 0, y: -parameter, q: -1 },
      ]
    : [
        { x: -1, y: 0, q: 1 },
        { x: 1, y: 0, q: parameter },
      ];
  const field = (a: number, b: number) =>
    wire ? wireField(a, b, parameter) : chargeField(a, b, charges);
  const potential = wire ? undefined : chargeField(x, y, charges)?.potential;
  const state = field(x, y),
    sx = (x: number) => 200 + 50 * x,
    sy = (y: number) => 130 - 50 * y;
  return (
    <section className="virtual-lab">
      <h3>
        {image
          ? "Probe an image-charge boundary solution"
          : wire
            ? "Move around a straight current-carrying wire"
            : "Move a probe through a charge-pair field"}
      </h3>
      <p>
        {image
          ? "The horizontal line is a grounded conducting plane. Move the probe in the physical upper half-space; the lower charge is a mathematical image, not an additional physical source."
          : wire
            ? "Current is along positive z, out of the screen. Move the probe around the wire and reverse the current to test the circulation direction."
            : "Move the probe in two dimensions and change the right-hand charge. Compare equal charges with a dipole: potential can vanish while field remains nonzero."}
      </p>
      <Control
        label="Field probe x"
        value={x}
        min={-3}
        max={3}
        step={0.01}
        onChange={setX}
      />
      <Control
        label="Field probe y"
        value={y}
        min={image ? 0 : -2}
        max={2}
        step={0.01}
        onChange={setY}
      />
      <Control
        label={
          image ? "Source height" : wire ? "Wire current" : "Right-hand charge"
        }
        value={parameter}
        min={image ? 0.5 : -2}
        max={image ? 1.5 : 2}
        step={0.01}
        onChange={setParameter}
      />
      <Scene
        label={`Drag ${mode} field probe`}
        x={sx(x)}
        y={sy(y)}
        move={(px, py) => {
          setX(Math.max(-3, Math.min(3, (px - 200) / 50)));
          setY(Math.max(image ? 0 : -2, Math.min(2, (130 - py) / 50)));
        }}
      >
        {image && (
          <>
            <rect
              x="0"
              y="130"
              width="400"
              height="130"
              fill="currentColor"
              opacity=".08"
            />
            <path d="M25 130H375" stroke="currentColor" strokeWidth="2" />
          </>
        )}
        {Array.from({ length: 11 }, (_, i) => -2.5 + i * 0.5).flatMap((a) =>
          Array.from({ length: 7 }, (_, j) => -1.5 + j * 0.5).map((b) => {
            if (image && b < 0) return null;
            const v = field(a, b);
            if (!v) return null;
            const n = Math.hypot(v.ex, v.ey);
            if (!n) return null;
            const dx = (7 * v.ex) / n,
              dy = (-7 * v.ey) / n,
              cx = sx(a),
              cy = sy(b);
            return (
              <g key={`${a},${b}`} stroke="currentColor" opacity=".5">
                <path
                  d={`M${cx - dx} ${cy - dy}L${cx + dx} ${cy + dy} M${cx + dx - 0.5 * dx + 0.4 * dy} ${cy + dy - 0.5 * dy - 0.4 * dx}L${cx + dx} ${cy + dy}L${cx + dx - 0.5 * dx - 0.4 * dy} ${cy + dy - 0.5 * dy + 0.4 * dx}`}
                  fill="none"
                />
              </g>
            );
          }),
        )}
        {wire ? (
          <>
            <circle cx="200" cy="130" r="8" fill="currentColor" />
            <text x="213" y="125" fill="currentColor" fontSize="12">
              {parameter >= 0 ? "I out" : "I in"}
            </text>
          </>
        ) : (
          charges.map((c, i) => (
            <g key={i}>
              <circle
                cx={sx(c.x)}
                cy={sy(c.y)}
                r="7"
                fill={c.q >= 0 ? "#cf633a" : "#3675bd"}
              />
              <text
                x={sx(c.x) + 10}
                y={sy(c.y) - 7}
                fill="currentColor"
                fontSize="12"
              >
                {image && i === 1 ? "image " : ""}
                {c.q >= 0 ? "+" : ""}
                {c.q.toFixed(2)}
              </text>
            </g>
          ))
        )}
      </Scene>
      <output aria-live="polite">
        {state
          ? `${wire ? "Magnetic" : "Electric"} field: (${state.ex.toFixed(4)}, ${state.ey.toFixed(4)}).${typeof potential === "number" ? ` Potential: ${potential.toFixed(4)}.` : ""}`
          : "Probe is inside an excluded source disc. Choose a point farther from the idealized singular source."}
      </output>
      <p>
        {wire
          ? "Infinite thin straight wire in vacuum; μ₀/(2π)=1 in these model units. The magnetic field is not the electric force on a stationary test charge."
          : "Vacuum point-charge model with 1/(4πε₀)=1 in consistent units. Sources within radius 0.12 are excluded from sampling; the physical point-source singularity is not softened."}{" "}
        Arrows show normalized direction, not relative magnitude. Read the
        numerical field to compare strengths. This is a static field probe, not
        a charged-particle trajectory.
      </p>
      {image && (
        <p>
          The image solution applies only above the grounded infinite plane.
          Zero potential on that boundary does not mean zero normal electric
          field or zero induced surface charge.
        </p>
      )}
    </section>
  );
}
export function ElectrostaticProbe() {
  return <FieldProbe mode="charges" />;
}
export function ImageChargeProbe() {
  return <FieldProbe mode="image" />;
}
export function WireFieldProbe() {
  return <FieldProbe mode="wire" />;
}
