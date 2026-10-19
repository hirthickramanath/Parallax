import { useState } from "react";
import { Control, Scene } from "./FoundationExplorers";
import { quadraticDarboux, powerSupremum } from "../../lib/analysis-models";
export function DarbouxExplorer() {
  const [n, setN] = useState(8),
    [fraction, setFraction] = useState(0.5);
  const s = quadraticDarboux(n, fraction),
    cell = Math.floor(n / 2),
    x = (cell + fraction) / n;
  return (
    <section className="virtual-lab">
      <h3>Move the samples inside rigorous bounds</h3>
      <p>
        For x² on [0,1], drag the sample in the middle cell; all cells use the
        same relative sample position. Predict whether any such sum can leave
        the lower/upper Darboux envelope.
      </p>
      <Control
        label="Darboux cells"
        value={n}
        min={1}
        max={40}
        step={1}
        onChange={setN}
      />
      <Control
        label="Cell sample fraction"
        value={fraction}
        min={0}
        max={1}
        step={0.01}
        onChange={setFraction}
      />
      <Scene
        label="Drag Darboux sample"
        x={40 + 320 * x}
        y={230 - 180 * x * x}
        move={(px) =>
          setFraction(Math.max(0, Math.min(1, ((px - 40) / 320) * n - cell)))
        }
      >
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>
            <rect
              x={40 + (320 * i) / n}
              y={230 - 180 * ((i + 1) / n) ** 2}
              width={320 / n}
              height={180 * ((i + 1) / n) ** 2}
              fill="#d47232"
              opacity=".16"
            />
            <rect
              x={40 + (320 * i) / n}
              y={230 - 180 * (i / n) ** 2}
              width={320 / n}
              height={180 * (i / n) ** 2}
              fill="#2584d5"
              opacity=".3"
            />
            <line
              x1={40 + (320 * (i + fraction)) / n}
              y1="230"
              x2={40 + (320 * (i + fraction)) / n}
              y2={230 - 180 * ((i + fraction) / n) ** 2}
              stroke="currentColor"
            />
          </g>
        ))}
        <path
          d={Array.from(
            { length: 81 },
            (_, i) =>
              `${i ? "L" : "M"}${40 + 4 * i} ${230 - 180 * (i / 80) ** 2}`,
          ).join(" ")}
          stroke="currentColor"
          fill="none"
        />
      </Scene>
      <output aria-live="polite">
        Lower: {s.lower.toFixed(5)}. Sampled: {s.sampled.toFixed(5)}. Upper:{" "}
        {s.upper.toFixed(5)}. Gap: {s.gap.toFixed(5)}.
      </output>
      <p>
        Monotonicity bounds every cell sample. Uₙ−Lₙ=1/n, so refining equal
        partitions squeezes all these sums to 1/3. A finite display illustrates
        the inequality; the telescoping identity proves it for every n.
      </p>
    </section>
  );
}
export function UniformPowerExplorer() {
  const [n, setN] = useState(8),
    [b, setB] = useState(1);
  const sup = powerSupremum(n, b);
  return (
    <section className="virtual-lab">
      <h3>Pointwise tails need not be one uniform tail</h3>
      <p>
        Drag the domain endpoint for xⁿ. Predict what changes when the endpoint
        is exactly 1. The horizontal coordinate remains on [0,1]; the curve is
        shown only on the selected domain [0,b].
      </p>
      <Control
        label="Power sequence index"
        value={n}
        min={1}
        max={80}
        step={1}
        onChange={setN}
      />
      <Control
        label="Power domain endpoint"
        value={b}
        min={0.5}
        max={1}
        step={0.01}
        onChange={setB}
      />
      <Scene
        label="Drag power domain endpoint"
        x={40 + 320 * b}
        y={230 - 180 * sup}
        move={(px) => setB(Math.max(0.5, Math.min(1, (px - 40) / 320)))}
      >
        <path
          d="M40 230H360M360 30V230"
          stroke="currentColor"
          strokeDasharray="4 4"
        />
        <path
          d={Array.from({ length: 121 }, (_, i) => {
            const x = (b * i) / 120;
            return `${i ? "L" : "M"}${40 + 320 * x} ${230 - 180 * x ** n}`;
          }).join(" ")}
          stroke="#2584d5"
          fill="none"
        />
        {b === 1 && <circle cx="360" cy="50" r="4" fill="#d47232" />}
      </Scene>
      <output aria-live="polite">
        Supremum error to the pointwise limit: {sup.toFixed(6)}.{" "}
        {b === 1
          ? "Not uniform on [0,1]."
          : "Uniform as n grows on this fixed shorter domain."}
      </output>
      <p>
        At b=1 the pointwise limit is zero for x&lt;1 and one at x=1. The error
        at x=1 itself is zero, yet its supremum over x&lt;1 is 1. For fixed
        b&lt;1 the limit is zero everywhere and the supremum error bⁿ tends to
        zero. Moving b with n is a different question.
      </p>
    </section>
  );
}
