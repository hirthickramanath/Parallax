import { useState } from "react";
export function VectorExplorer() {
  const [a, setA] = useState([2, 1]),
    [b, setB] = useState([-1, 2]),
    [drag, setDrag] = useState<"a" | "b" | null>(null);
  const scale = 18,
    center = 160;
  function move(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag) return;
    const box = e.currentTarget.getBoundingClientRect();
    const point = [
      Math.max(
        -4,
        Math.min(
          4,
          ((320 * (e.clientX - box.left)) / box.width - center) / scale,
        ),
      ),
      Math.max(
        -4,
        Math.min(
          4,
          (center - (320 * (e.clientY - box.top)) / box.height) / scale,
        ),
      ),
    ];
    (drag === "a" ? setA : setB)(point);
  }
  const sum = [a[0] + b[0], a[1] + b[1]];
  return (
    <section className="virtual-lab">
      <h3>Build a vector, move its tip</h3>
      <p>
        Drag either tip, or focus it and use arrow keys. The diagonal is the
        vector sum, not the sum of the lengths.
      </p>
      <svg
        viewBox="0 0 320 320"
        aria-label="Interactive vector addition"
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        style={{ touchAction: "none" }}
      >
        <path d="M0 160H320M160 0V320" stroke="currentColor" opacity=".3" />
        <path
          d={`M${center + scale * a[0]} ${center - scale * a[1]}l${scale * b[0]} ${-scale * b[1]}M${center + scale * b[0]} ${center - scale * b[1]}l${scale * a[0]} ${-scale * a[1]}`}
          stroke="currentColor"
          strokeDasharray="4 4"
          fill="none"
          opacity=".5"
        />
        {[
          [...a, "a"],
          [...b, "b"],
          [...sum, "sum"],
        ].map(([x, y, name]) => (
          <line
            key={name}
            x1={center}
            y1={center}
            x2={center + scale * Number(x)}
            y2={center - scale * Number(y)}
            stroke={
              name === "a"
                ? "#2584d5"
                : name === "b"
                  ? "#d47232"
                  : "var(--primary-color)"
            }
            strokeWidth="4"
          />
        ))}
        {(["a", "b"] as const).map((name) => {
          const v = name === "a" ? a : b;
          return (
            <circle
              key={name}
              cx={center + scale * v[0]}
              cy={center - scale * v[1]}
              r="10"
              fill={name === "a" ? "#2584d5" : "#d47232"}
              tabIndex={0}
              role="button"
              aria-label={`Move vector ${name} tip with arrow keys`}
              onPointerDown={(e) => {
                e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
                setDrag(name);
              }}
              onKeyDown={(e) => {
                const delta: Record<string, number[]> = {
                  ArrowLeft: [-0.25, 0],
                  ArrowRight: [0.25, 0],
                  ArrowUp: [0, 0.25],
                  ArrowDown: [0, -0.25],
                };
                if (delta[e.key]) {
                  e.preventDefault();
                  (name === "a" ? setA : setB)(
                    v.map((x, i) =>
                      Math.max(-4, Math.min(4, x + delta[e.key][i])),
                    ),
                  );
                }
              }}
            />
          );
        })}
      </svg>
      <output aria-live="polite">
        A = ({a.map((x) => x.toFixed(2)).join(", ")}), B = (
        {b.map((x) => x.toFixed(2)).join(", ")}). Sum = (
        {sum.map((x) => x.toFixed(2)).join(", ")}). Dot product ={" "}
        {(a[0] * b[0] + a[1] * b[1]).toFixed(2)}.
      </output>
      <p>
        Prediction: make perpendicular arrows. Which quantity becomes zero?
        Explain why the sum can remain nonzero.
      </p>
    </section>
  );
}
