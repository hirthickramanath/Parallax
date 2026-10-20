import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { branchCircle } from "../../lib/complex-branch";
export function ComplexBranchExplorer() {
  const [degrees, setDegrees] = useState(0);
  const state = branchCircle(degrees);
  const format = (z: { real: number; imaginary: number }) =>
    `${z.real.toFixed(3)} ${z.imaginary < 0 ? "−" : "+"} ${Math.abs(z.imaginary).toFixed(3)}i`;
  return (
    <section className="virtual-lab" aria-label="Complex branch explorer">
      <p className="lab-label">MATHEMATICAL EXPLORER · CONTINUATION</p>
      <h2>Follow a square root around zero</h2>
      <p>
        Track z = exp(iθ) counterclockwise from z = 1, with initial root +1. The
        tracked root uses the whole path from θ = 0 to the selected angle. The
        principal root is evaluated separately at the endpoint, with argument in
        (−π, π) and the nonpositive real axis excluded.
      </p>
      <div className="simulation-control-label">
        Path angle: {degrees}°
        <SimulationSlider
          aria-label="Complex path angle"
          type="range"
          min="0"
          max="720"
          step="1"
          value={degrees}
          onChange={(e) => setDegrees(Number(e.target.value))}
        />
      </div>
      <div className="lab-subjects">
        {[0, 180, 360, 540, 720].map((value) => (
          <button key={value} onClick={() => setDegrees(value)}>
            {value}°
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label="Source point on left and continued square root on right; dashed negative axis is the principal branch cut"
      >
        {[150, 450].map((cx) => (
          <g key={cx}>
            <path
              d={`M${cx - 100} 125H${cx + 100}M${cx} 25V225`}
              fill="none"
              stroke="currentColor"
              opacity=".3"
            />
            <circle
              cx={cx}
              cy="125"
              r="80"
              fill="none"
              stroke="currentColor"
              opacity=".4"
            />
          </g>
        ))}
        <path
          d="M50 125H150"
          stroke="#e07824"
          strokeWidth="3"
          strokeDasharray="5 4"
        />
        <line
          x1="150"
          y1="125"
          x2={150 + 80 * state.source.real}
          y2={125 - 80 * state.source.imaginary}
          stroke="currentColor"
        />
        <circle
          cx={150 + 80 * state.source.real}
          cy={125 - 80 * state.source.imaginary}
          r="6"
          fill="#1685d1"
        />
        <line
          x1="450"
          y1="125"
          x2={450 + 80 * state.continued.real}
          y2={125 - 80 * state.continued.imaginary}
          stroke="currentColor"
        />
        <circle
          cx={450 + 80 * state.continued.real}
          cy={125 - 80 * state.continued.imaginary}
          r="7"
          fill="#58a800"
        />
        {state.principal && (
          <circle
            cx={450 + 80 * state.principal.real}
            cy={125 - 80 * state.principal.imaginary}
            r="11"
            fill="none"
            stroke="#e07824"
            strokeWidth="2"
          />
        )}
        <text x="150" y="250" textAnchor="middle">
          Source z
        </text>
        <text x="450" y="250" textAnchor="middle">
          Square root
        </text>
      </svg>
      <p>
        Filled marker: continued root. Open ring: principal root; it may overlap
        the filled marker.
      </p>
      <p>
        Source: {format(state.source)}. Continued root:{" "}
        <output aria-label="Continued square root">
          {format(state.continued)}
        </output>
        .
      </p>
      <p>
        Principal root:{" "}
        <output aria-label="Principal square root">
          {state.principal
            ? format(state.principal)
            : "Undefined on the chosen cut"}
        </output>
        .
      </p>
      <p>
        Continued logarithm imaginary part:{" "}
        {(state.continuedAngle / Math.PI).toFixed(3)}π. Principal logarithm
        imaginary part:{" "}
        {state.principalAngle === null
          ? "undefined on the chosen cut"
          : `${(state.principalAngle / Math.PI).toFixed(3)}π`}
        .
      </p>
      <p>
        The tracked root changes sign after one loop and returns after two. The
        continued logarithm still gains 4πi after two loops. Moving the cut
        changes the principal convention; it does not remove this path
        dependence. This exact unit-circle example is not a global single-valued
        branch on the punctured plane.
      </p>
    </section>
  );
}
