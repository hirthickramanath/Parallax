import { useState } from "react";
import { astroInvestigations } from "../../lib/astro-investigations";
import { Control, Scene } from "./FoundationExplorers";
export function AstroInvestigation({
  lessonId,
  model: suppliedModel,
}: {
  lessonId: string;
  model?: import("../../lib/astro-investigations").AstroInvestigation;
}) {
  const model = suppliedModel ?? astroInvestigations[lessonId];
  const [x, setX] = useState(model.x[3]),
    [p, setP] = useState(model.parameter[3]);
  const xs = Array.from({ length: 121 }, (_, i) =>
    model.xStep
      ? Math.max(
          model.x[1],
          Math.min(
            model.x[2],
            Math.round(
              (model.x[1] + ((model.x[2] - model.x[1]) * i) / 120) /
                model.xStep,
            ) * model.xStep,
          ),
        )
      : model.x[1] + ((model.x[2] - model.x[1]) * i) / 120,
  );
  const ys = xs.map((v) => model.value(v, p));
  const lo = Math.min(0, ...ys),
    hi = Math.max(...ys, lo + 1e-9),
    span = hi - lo;
  const plotX = (v: number) =>
    45 + (310 * (v - model.x[1])) / (model.x[2] - model.x[1]);
  const plotY = (v: number) => 220 - (180 * (v - lo)) / span;
  const value = model.value(x, p);
  const number = (v: number) =>
    Math.abs(v) > 1e5 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)
      ? v.toExponential(4)
      : v.toFixed(4);
  return (
    <section className="virtual-lab">
      <h3>{model.title}</h3>
      <p>
        Predict the effect, then drag the blue point horizontally. Change the
        second quantity to test whether your prediction still holds. The
        vertical axis rescales with the curve; compare numerical values rather
        than pixel heights across settings.
      </p>
      <Control
        label={model.x[0]}
        value={x}
        min={model.x[1]}
        max={model.x[2]}
        step={
          model.xStep ??
          10 ** Math.floor(Math.log10((model.x[2] - model.x[1]) / 1000))
        }
        onChange={setX}
      />
      <Control
        label={model.parameter[0]}
        value={p}
        min={model.parameter[1]}
        max={model.parameter[2]}
        step={
          model.parameterStep ??
          10 **
            Math.floor(
              Math.log10((model.parameter[2] - model.parameter[1]) / 1000),
            )
        }
        onChange={setP}
      />
      <Scene
        keyboardStepX={
          model.xStep ? (310 * model.xStep) / (model.x[2] - model.x[1]) : 4
        }
        label={`Drag investigation point for ${lessonId}`}
        x={plotX(x)}
        y={plotY(value)}
        move={(px) => {
          const proposed =
            model.x[1] + ((px - 45) / 310) * (model.x[2] - model.x[1]);
          const snapped = model.xStep
            ? Math.round(proposed / model.xStep) * model.xStep
            : proposed;
          setX(Math.max(model.x[1], Math.min(model.x[2], snapped)));
        }}
      >
        <path d="M45 30V220H365" fill="none" stroke="currentColor" />
        <polyline
          points={xs.map((v, i) => `${plotX(v)},${plotY(ys[i])}`).join(" ")}
          fill="none"
          stroke="#2584d5"
          strokeWidth="2"
        />
        <text x="46" y="245" fill="currentColor" fontSize="12">
          {number(model.x[1])}
        </text>
        <text x="305" y="245" fill="currentColor" fontSize="12">
          {number(model.x[2])}
        </text>
        <text x="48" y="25" fill="currentColor" fontSize="12">
          y: {number(lo)} to {number(hi)}
        </text>
      </Scene>
      <output aria-live="polite">
        {model.y}: {number(value)}
      </output>
      <p>{model.equation}</p>
      <p>{model.assumptions}</p>
      <p>
        Explain why the curve has this shape using the lesson derivation. Find a
        limiting case and identify a measurement or omitted effect that could
        make this model fail.
      </p>
    </section>
  );
}
