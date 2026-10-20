import { SimulationSlider } from "./SimulationSlider";
import { useMemo, useState } from "react";
import { photonPath } from "../../lib/black-hole";
export function BlackHoleExplorer() {
  const [impact, setImpact] = useState(6),
    [drag, setDrag] = useState(false);
  const result = useMemo(() => photonPath(impact), [impact]);
  return (
    <section className="virtual-lab">
      <h3>Steer light past a black hole</h3>
      <p>
        Drag the launch handle or use the slider. Watch the path bend, escape or
        cross the horizon. Schwarzschild, nonrotating black hole; G = M = c = 1.
      </p>
      <div className="simulation-control-label">
        Photon impact parameter: {impact.toFixed(2)}
        <SimulationSlider
          aria-label="Photon impact parameter"
          type="range"
          min="3"
          max="8"
          step=".01"
          value={impact}
          onChange={(e) => setImpact(Number(e.target.value))}
        />
      </div>
      <svg
        viewBox="-26 -26 52 55"
        aria-label="Interactive black hole light trajectory"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => {
          if (!drag) return;
          const r = e.currentTarget.getBoundingClientRect();
          setImpact(
            Math.max(
              3,
              Math.min(
                8,
                3 + (5 * ((52 * (e.clientX - r.left)) / r.width - 6)) / 40,
              ),
            ),
          );
        }}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
      >
        <circle
          r="3"
          fill="none"
          stroke="var(--gold)"
          strokeDasharray=".5 .5"
          strokeWidth=".15"
        />
        <circle
          r="2"
          fill="#080a12"
          stroke="var(--primary-color)"
          strokeWidth=".2"
        />
        <path
          d={result.points
            .map(([x, y], i) => `${i ? "L" : "M"}${x},${-y}`)
            .join(" ")}
          stroke="var(--primary-color)"
          strokeWidth=".3"
          fill="none"
        />
        <path d="M-20 25H20" stroke="currentColor" strokeWidth=".2" />
        <circle
          cx={-20 + 8 * (impact - 3)}
          cy="25"
          r="1.2"
          fill="var(--gold)"
          role="button"
          tabIndex={0}
          aria-label="Drag photon launch handle or use arrow keys"
          onPointerDown={(e) => {
            e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
            setDrag(true);
          }}
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
              e.preventDefault();
              setImpact((x) =>
                Math.max(
                  3,
                  Math.min(8, x + (e.key === "ArrowRight" ? 0.05 : -0.05)),
                ),
              );
            }
          }}
        />
      </svg>
      <output aria-live="polite">
        {result.captured === true
          ? "Captured: the ray crosses r = 2."
          : result.captured === false
            ? "Scattered: the ray returns toward large radius."
            : "Near-critical path: integration window reached."}
      </output>
      <p>
        The dashed circle is the unstable photon orbit r = 3. The capture
        boundary for an incoming ray is b = 3√3 ≈ 5.196. The handle changes b;
        it is not a physical object or a depiction of an observer’s sky. This
        finite-step equatorial trajectory omits spin and emission.
      </p>
    </section>
  );
}
