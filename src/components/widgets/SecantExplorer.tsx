import { useState } from "react";
import { secantSlope } from "../../lib/experiments";
import { MathText } from "../teaching/MathText";
import { Derivation } from "../teaching/Derivation";
export function SecantExplorer() {
  const [prediction, setPrediction] = useState("");
  const [a, setA] = useState(1);
  const [h, setH] = useState(1);
  const slope = secantSlope(a, h);
  const px = (x: number) => 50 + (x + 3) * 80;
  const py = (y: number) => 300 - 27 * y;
  const curve = Array.from({ length: 121 }, (_, i) => {
    const x = -3 + i / 20;
    return `${i === 0 ? "M" : "L"}${px(x)},${py(x * x)}`;
  }).join(" ");
  return (
    <article className="lab-example" aria-labelledby="maths-title">
      <p className="eyebrow">EXPERIMENT 02 / MATHEMATICS</p>
      <h2 id="maths-title">When does a slope become a derivative?</h2>
      <p>
        For <MathText>{"f(x)=x^2"}</MathText>, a secant joins the points at a
        and a + h. If h is small but nonzero, is its slope exactly the
        derivative at a?
      </p>
      <fieldset className="prediction">
        <legend>Your conjecture</legend>
        {[
          "Yes, sufficiently small means exact",
          "No, the derivative is the limit",
        ].map((answer) => (
          <label key={answer}>
            <input
              name="slope-prediction"
              type="radio"
              checked={prediction === answer}
              onChange={() => setPrediction(answer)}
            />
            {answer}
          </label>
        ))}
      </fieldset>
      {prediction && (
        <>
          <p role="status" className="lab-feedback">
            <strong>
              {prediction === "No, the derivative is the limit"
                ? "Yes: a finite secant is not the limit."
                : "For this function, every nonzero h leaves an error."}
            </strong>{" "}
            A picture can suggest the answer. It cannot prove it for every real
            a.
          </p>
          <div className="lab-controls">
            <label>
              Point a: {a.toFixed(1)}
              <input
                aria-label="Point a"
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
              />
            </label>
            <label>
              Separation h: {h.toFixed(2)}
              <input
                aria-label="Separation h"
                type="range"
                min="0.02"
                max="1"
                step="0.02"
                value={h}
                onChange={(e) => setH(Number(e.target.value))}
              />
            </label>
          </div>
          <svg
            className="secant-figure"
            viewBox="0 0 600 340"
            role="img"
            aria-labelledby="secant-title secant-desc"
          >
            <title id="secant-title">Secant and tangent to x squared</title>
            <desc id="secant-desc">
              At a = {a.toFixed(1)}, the solid secant has slope{" "}
              {slope.toFixed(2)}. The dashed tangent has slope{" "}
              {(2 * a).toFixed(2)}. Axes are dimensionless.
            </desc>
            <defs>
              <clipPath id="secant-clip">
                <rect x="50" y="20" width="480" height="300" />
              </clipPath>
            </defs>
            <g clipPath="url(#secant-clip)">
              <path
                d={`M50 ${py(0)}H530M${px(0)} 20V320`}
                stroke="currentColor"
                opacity=".25"
              />
              <path
                d={curve}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <path
                d={`M${px(-3)} ${py(a * a + slope * (-3 - a))}L${px(3)} ${py(a * a + slope * (3 - a))}`}
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path
                d={`M${px(-3)} ${py(a * a + 2 * a * (-3 - a))}L${px(3)} ${py(a * a + 2 * a * (3 - a))}`}
                stroke="currentColor"
                strokeDasharray="7 5"
                strokeWidth="2"
              />
              {[a, a + h].map((x, i) => (
                <circle
                  key={i}
                  cx={px(x)}
                  cy={py(x * x)}
                  r="5"
                  fill="var(--accent)"
                />
              ))}
            </g>
            <text x="540" y="305">
              x
            </text>
            <text x="300" y="15">
              y
            </text>
            <text x="50" y="335">
              −3
            </text>
            <text x="525" y="335">
              3
            </text>
          </svg>
          <div className="lab-readout">
            <p>
              Solid secant: <strong>{slope.toFixed(2)}</strong>
            </p>
            <p>
              Dashed tangent: <strong>{(2 * a).toFixed(2)}</strong>
            </p>
            <p>
              Absolute slope error:{" "}
              <strong>{Math.abs(slope - 2 * a).toFixed(2)}</strong>
            </p>
          </div>
          <p className="lab-caveat">
            <strong>Observation is not proof:</strong> the slider samples
            positive h values only. A derivative requires a two-sided limit. The
            algebra below handles positive and negative h. Every coordinate and
            slope here is dimensionless.
          </p>
          <Derivation
            steps={[
              {
                equation: "f^\\prime(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}h",
                why: "Use the definition of the derivative as a limit of secant slopes, if the limit exists.",
              },
              {
                equation: "\\frac{(a+h)^2-a^2}{h}=\\frac{a^2+2ah+h^2-a^2}{h}",
                why: "Substitute f(x) = x² and expand the square exactly; no approximation has been made.",
              },
              {
                equation: "\\frac{2ah+h^2}{h}=2a+h,\\qquad h\\ne0",
                why: "Factor out h and cancel only because h is nonzero. Substituting h = 0 into the original quotient would be invalid.",
              },
              {
                equation: "\\left|\\frac{f(a+h)-f(a)}h-2a\\right|=|h|",
                why: "The slope error is exactly |h| for every real a and every nonzero h, not just the plotted samples.",
              },
              {
                equation:
                  "\\forall\\varepsilon>0,\\;\\delta=\\varepsilon:\\quad 0<|h|<\\delta\\Rightarrow |(2a+h)-2a|<\\varepsilon",
                why: "For any requested error bound ε, choose δ = ε. This proves the two-sided limit by its epsilon–delta definition.",
              },
              {
                equation:
                  "\\therefore\\quad f^\\prime(a)=2a\\qquad\\text{for every }a\\in\\mathbb R",
                why: "The defining limit exists and equals 2a. The experiment motivated a conjecture; the argument establishes the result.",
              },
            ]}
          />
          <section className="lab-transfer">
            <h3>A counterexample to visual confidence</h3>
            <p>
              Does every continuous graph have a derivative? Try the same
              reasoning for <MathText>{"f(x)=|x|"}</MathText> at zero before
              opening the explanation.
            </p>
            <details>
              <summary>Show the counterexample</summary>
              <MathText display>
                {"\\frac{|h|-0}{h}=\\begin{cases}1&h>0\\\\-1&h<0\\end{cases}"}
              </MathText>
              <p>
                The one-sided limits disagree. The function is continuous at
                zero but not differentiable there. A smooth-looking plot or many
                sampled points cannot establish differentiability.
              </p>
            </details>
          </section>
          <p>
            <strong>Physics connection:</strong> instantaneous velocity is a
            derivative, not merely a small-interval average. Experimental
            estimates have finite time resolution; the model’s limit and the
            measurement uncertainty must be distinguished.
          </p>
          <p className="source-note">
            Draft preview. Definition-based elementary calculus; source-review
            targets: Spivak, Calculus, and an introductory analysis text. No
            course credit or verification badge is awarded.
          </p>
        </>
      )}
    </article>
  );
}
