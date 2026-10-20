import { SimulationSlider } from "./SimulationSlider";
import { useState } from "react";
import { DROP_HEIGHT, GRAVITY, fallDistance } from "../../lib/experiments";
import { Derivation } from "../teaching/Derivation";
import { MathText } from "../teaching/MathText";
export function FallingBodies() {
  const [prediction, setPrediction] = useState("");
  const [time, setTime] = useState(0);
  const [mass, setMass] = useState(4);
  const [drag, setDrag] = useState(false);
  const b = drag ? 0.8 : 0;
  const distances = [1, mass].map((m) =>
    Math.min(DROP_HEIGHT, fallDistance(time, m, b)),
  );
  return (
    <article className="lab-example" aria-labelledby="physics-title">
      <p className="eyebrow">EXPERIMENT 01 / PHYSICS</p>
      <h2 id="physics-title">Does heavier mean faster?</h2>
      <p>
        Two objects start from rest at the same height. With no air resistance,
        which reaches the ground first?
      </p>
      <fieldset className="prediction">
        <legend>Commit to a prediction</legend>
        {[
          "The heavier object",
          "They arrive together",
          "The lighter object",
        ].map((answer) => (
          <label key={answer}>
            <input
              type="radio"
              name="fall-prediction"
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
              {prediction === "They arrive together"
                ? "Your prediction matches the ideal model."
                : "The ideal model predicts a different result: they arrive together."}
            </strong>{" "}
            Let’s investigate why, then change one assumption.
          </p>
          <div className="lab-controls">
            <div className="simulation-control-label">
              Right-hand mass: {mass} kg
              <SimulationSlider
                aria-label="Right-hand mass"
                type="range"
                min="1"
                max="8"
                step="1"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
              />
            </div>
            <div className="simulation-control-label">
              Elapsed time: {time.toFixed(2)} s
              <SimulationSlider
                aria-label="Elapsed time"
                type="range"
                min="0"
                max="3"
                step="0.02"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={drag}
                onChange={(e) => setDrag(e.target.checked)}
              />
              Add equal linear drag coefficients to both objects
            </label>
          </div>
          <svg
            className="fall-figure"
            viewBox="0 0 520 320"
            role="img"
            aria-labelledby="fall-title fall-description"
          >
            <title id="fall-title">
              Falling bodies at {time.toFixed(2)} seconds
            </title>
            <desc id="fall-description">
              Left mass 1 kilogram has fallen {distances[0].toFixed(2)} metres.
              Right mass {mass} kilograms has fallen {distances[1].toFixed(2)}{" "}
              metres. Ground is 20 metres below the release point.
            </desc>
            <path
              d="M70 50H450M70 270H450"
              stroke="currentColor"
              strokeDasharray="5 5"
              opacity=".4"
            />
            <text x="20" y="45">
              Start
            </text>
            <text x="20" y="290">
              Ground
            </text>
            {distances.map((distance, index) => (
              <g key={index}>
                <path
                  d={`M${180 + index * 180} 50V270`}
                  stroke="currentColor"
                  opacity=".15"
                />
                <circle
                  cx={180 + index * 180}
                  cy={50 + (220 * distance) / DROP_HEIGHT}
                  r="13"
                  fill="currentColor"
                />
                <text x={135 + index * 180} y="25">
                  {index === 0 ? 1 : mass} kg
                </text>
              </g>
            ))}
          </svg>
          <div className="lab-readout" aria-live="off">
            <p>
              1 kg: <strong>{distances[0].toFixed(2)} m fallen</strong>
              {distances[0] === DROP_HEIGHT ? " · on the ground" : ""}
            </p>
            <p>
              {mass} kg: <strong>{distances[1].toFixed(2)} m fallen</strong>
              {distances[1] === DROP_HEIGHT ? " · on the ground" : ""}
            </p>
          </div>
          <p className="lab-caveat">
            <strong>Model, not measurement:</strong> constant gravity {GRAVITY}{" "}
            m/s², release from rest, height 20 m. Drag off: point particles in
            vacuum. Drag on: equal b = 0.8 kg/s, a simplified linear-drag
            model—not a general law of air resistance. Motion stops at ground
            contact; the equations below describe the flight only.
          </p>
          <h3>The intuition</h3>
          <p>
            More mass gives a larger gravitational force, but also more
            resistance to acceleration. In this Newtonian model those factors
            cancel. That cancellation uses the observed equality of
            gravitational and inertial mass; it is not established by the
            animation.
          </p>
          <Derivation
            steps={[
              {
                equation: "F_g=m_g g,\\qquad F_{\\mathrm{net}}=m_i a",
                why: "Separate gravitational mass from inertial mass. Take downward as positive; g is approximately constant over this short drop.",
              },
              {
                equation:
                  "m_g=m_i=m>0\\quad\\Longrightarrow\\quad mg=ma\\quad\\Longrightarrow\\quad a=g",
                why: "Assume equal gravitational and inertial mass and no other forces. Dividing by positive m removes mass from the acceleration.",
              },
              {
                equation:
                  "\\frac{dv}{dt}=g,\\quad v(0)=0\\quad\\Longrightarrow\\quad v(t)=gt",
                why: "Integrate constant acceleration and apply the initial condition: release from rest.",
              },
              {
                equation:
                  "\\frac{dy}{dt}=gt,\\quad y(0)=0\\quad\\Longrightarrow\\quad y(t)=\\frac12gt^2",
                why: "Integrate velocity to obtain downward displacement from the release point.",
              },
              {
                equation:
                  "H=\\frac12gt_*^2\\quad\\Longrightarrow\\quad t_*=\\sqrt{\\frac{2H}{g}}\\approx 2.02\\;\\mathrm{s}",
                why: "Set displacement equal to H = 20 m and choose the non-negative root. Both masses have the same arrival time in this ideal model.",
              },
              {
                equation:
                  "m\\frac{dv}{dt}=mg-bv\\quad\\Longrightarrow\\quad \\frac{dv}{dt}+\\frac bm v=g",
                why: "When linear drag is included, it opposes downward velocity. Unlike gravity, equal drag coefficients do not scale with mass.",
              },
              {
                equation:
                  "\\tau=\\frac mb,\\quad \\frac d{dt}(e^{t/\\tau}v)=ge^{t/\\tau}\\quad\\Longrightarrow\\quad v(t)=g\\tau(1-e^{-t/\\tau})",
                why: "For b > 0, multiply the linear ODE by its integrating factor, integrate, and impose v(0) = 0.",
              },
              {
                equation:
                  "y(t)=\\int_0^t g\\tau(1-e^{-s/\\tau})\\,ds=g\\tau[t-\\tau(1-e^{-t/\\tau})]",
                why: "Integrate the drag-model velocity. Mass now appears through τ; as b tends to zero the expression tends to gt²/2.",
              },
            ]}
          />
          <section className="lab-transfer">
            <h3>Try to break the conclusion</h3>
            <p>
              Set equal masses with drag on. Then use different masses. Explain
              why “all masses fall together” needs its assumptions, and why
              equal drag coefficients are not the same as equal deceleration.
            </p>
            <details>
              <summary>Check your reasoning</summary>
              <p>
                With equal b, the drag acceleration is −bv/m, so different
                masses generally accelerate differently once moving. Equal
                masses released identically still follow identical trajectories.
                Vacuum free fall removes that drag term entirely.
              </p>
            </details>
          </section>
          <p>
            <strong>Astronomy connection:</strong> vacuum free fall prepares the
            idea of orbital motion. Near a planet, gravity varies with distance;
            deriving orbits requires the inverse-square force rather than
            extending constant g indefinitely.
          </p>
          <p className="source-note">
            Draft preview. Standard Newtonian mechanics and the linear-drag ODE;
            source-review targets: Taylor, Classical Mechanics, and an
            introductory mechanics text. Not yet marked verified or assigned
            course credit.
          </p>
          <p className="lab-equation-note">
            The experiment’s central question:{" "}
            <MathText>
              {"m\\ddot y=mg\\quad\\Rightarrow\\quad\\ddot y=g"}
            </MathText>
            —under which assumptions?
          </p>
        </>
      )}
    </article>
  );
}
