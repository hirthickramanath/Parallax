import { useState } from "react";
import {
  bayesPopulation,
  thinLens,
  induction,
  radialTide,
} from "../../lib/transfer-models";
import { Control, Scene } from "./FoundationExplorers";
export function BayesExplorer() {
  const [prior, setPrior] = useState(0.01),
    [sensitivity, setSensitivity] = useState(0.9),
    [falsePositive, setFalsePositive] = useState(0.05);
  const s = bayesPopulation(prior, sensitivity, falsePositive),
    total = s.truePositives + s.falsePositives;
  return (
    <section className="virtual-lab">
      <h3>Which positive results are true positives?</h3>
      <p>
        Predict before moving the prevalence handle: can a sensitive test still
        have many false positives? Bars show expected counts in a model
        population of 10000, not measured people or random experimental
        outcomes.
      </p>
      <Control
        label="Condition prevalence"
        min={0}
        max={1}
        step={0.001}
        value={prior}
        onChange={setPrior}
      />
      <Control
        label="Sensitivity"
        min={0}
        max={1}
        step={0.01}
        value={sensitivity}
        onChange={setSensitivity}
      />
      <Control
        label="False-positive probability"
        min={0}
        max={1}
        step={0.001}
        value={falsePositive}
        onChange={setFalsePositive}
      />
      <Scene
        label="Drag prevalence handle"
        x={40 + 320 * prior}
        y={45}
        move={(x) => setPrior(Math.max(0, Math.min(1, (x - 40) / 320)))}
      >
        <path d="M40 45H360" stroke="currentColor" />
        <text x="40" y="90" fill="currentColor">
          Among expected positive results
        </text>
        <rect
          x="40"
          y="110"
          width={total ? (320 * s.truePositives) / total : 0}
          height="36"
          fill="#2584d5"
        />
        <rect
          x={40 + (total ? (320 * s.truePositives) / total : 0)}
          y="110"
          width={total ? (320 * s.falsePositives) / total : 0}
          height="36"
          fill="#d47232"
        />
        <text x="40" y="180" fill="currentColor">
          Blue: true · orange: false
        </text>
      </Scene>
      <output aria-live="polite">
        True positives: {s.truePositives.toFixed(1)}. False positives:{" "}
        {s.falsePositives.toFixed(1)}. P(condition | positive):{" "}
        {s.posterior === null
          ? "undefined (no positives)"
          : s.posterior.toFixed(4)}
        .
      </output>
      <p>
        Compare sensitivity with the posterior; their denominators differ. The
        model assumes homogeneous rates and a representative population, which
        real selection effects can violate.
      </p>
    </section>
  );
}
export function ThinLensExplorer() {
  const [u, setU] = useState(30),
    [f, setF] = useState(15);
  const s = thinLens(f, u),
    ix = s.image === null ? null : 200 + 3 * s.image,
    iy = s.image === null ? null : 130 + (15 * s.image) / u,
    visible =
      ix !== null && iy !== null && ix > 5 && ix < 395 && iy > 5 && iy < 255;
  return (
    <section className="virtual-lab">
      <h3>Move an object through the focal plane</h3>
      <p>
        Drag the object horizontally or use the distance controls. Predict where
        the image changes between real and virtual. Thin converging lens,
        paraxial rays, distances in cm; the object is 0.05 cm high. The vertical
        scale is exaggerated 100 times relative to the horizontal scale, so
        drawn angles are not physical angles.
      </p>
      <Control
        label="Lens focal length (cm)"
        min={5}
        max={20}
        step={1}
        value={f}
        onChange={setF}
      />
      <Control
        label="Lens object distance (cm)"
        min={1}
        max={60}
        step={1}
        value={u}
        onChange={setU}
      />
      <Scene
        label="Drag lens object"
        x={200 - 3 * u}
        y={115}
        move={(x) => setU(Math.max(1, Math.min(60, (200 - x) / 3)))}
      >
        <path d="M10 130H390M200 20V245" stroke="currentColor" />
        <line
          x1={200 - 3 * u}
          y1="130"
          x2={200 - 3 * u}
          y2="115"
          stroke="#2584d5"
          strokeWidth="4"
        />
        <path
          d={`M${200 - 3 * u} 115H200L380 ${115 + (180 * 5) / f}M${200 - 3 * u} 115L380 ${130 + (180 * 5) / u}`}
          stroke="#d47232"
          fill="none"
        />
        {[200 - 3 * f, 200 + 3 * f].map((x) => (
          <circle key={x} cx={x} cy="130" r="3" fill="currentColor" />
        ))}
        {visible && (
          <>
            <line
              x1={ix!}
              y1="130"
              x2={ix!}
              y2={iy!}
              stroke="#2584d5"
              strokeWidth="3"
            />
            {s.image! < 0 && (
              <path
                d={`M200 115L${ix} ${iy}M200 130L${ix} ${iy}`}
                stroke="#d47232"
                strokeDasharray="5 4"
                fill="none"
              />
            )}
          </>
        )}
      </Scene>
      <output aria-live="polite">
        {s.image === null
          ? "Image at infinity: emerging rays are parallel."
          : `Image distance: ${s.image.toFixed(3)} cm. Magnification: ${s.magnification!.toFixed(3)}. ${s.image > 0 ? "Real image." : "Virtual image."}${visible ? "" : " Image is outside the diagram window."}`}
      </output>
      <p>
        1/f=1/u+1/v and m=−v/u. Dashed extensions locate virtual images. Diagram
        rays illustrate the model; finite apertures, aberrations and diffraction
        need additional physics.
      </p>
    </section>
  );
}
export function InductionExplorer() {
  const [angle, setAngle] = useState(0),
    [rate, setRate] = useState(2),
    [turns, setTurns] = useState(10),
    [area, setArea] = useState(0.1);
  const emf = induction(turns, area, rate, angle),
    radians = (angle * Math.PI) / 180;
  return (
    <section className="virtual-lab">
      <h3>Change flux linkage, not just field strength</h3>
      <p>
        Predict the emf at a right angle. Drag the blue coil-normal handle. The
        coil is held stationary at the selected orientation in a uniform field
        changing at dB/dt; changing this orientation setting selects another
        stationary configuration and does not model rotation transients.
      </p>
      <Control
        label="Coil normal angle (degrees)"
        min={0}
        max={90}
        step={1}
        value={angle}
        onChange={setAngle}
      />
      <Control
        label="Field change rate (T/s)"
        min={-5}
        max={5}
        step={0.1}
        value={rate}
        onChange={setRate}
      />
      <Control
        label="Coil turns"
        min={1}
        max={20}
        step={1}
        value={turns}
        onChange={setTurns}
      />
      <Control
        label="Coil area (m²)"
        min={0.01}
        max={0.2}
        step={0.01}
        value={area}
        onChange={setArea}
      />
      <Scene
        label="Drag coil normal"
        x={200 + 80 * Math.cos(radians)}
        y={150 - 80 * Math.sin(radians)}
        move={(x, y) =>
          setAngle(
            Math.max(
              0,
              Math.min(90, (Math.atan2(150 - y, x - 200) * 180) / Math.PI),
            ),
          )
        }
      >
        {[70, 110, 150, 190].map((y) => (
          <path
            key={y}
            d={`M45 ${y}H350l-10 -5m10 5l-10 5`}
            stroke="currentColor"
            fill="none"
          />
        ))}
        <ellipse
          cx="200"
          cy="150"
          rx="12"
          ry="50"
          transform={`rotate(${-angle} 200 150)`}
          stroke="#2584d5"
          fill="none"
          strokeWidth="3"
        />
        <line
          x1="200"
          y1="150"
          x2={200 + 80 * Math.cos(radians)}
          y2={150 - 80 * Math.sin(radians)}
          stroke="#2584d5"
          strokeWidth="4"
        />
        <text x="45" y="35" fill="currentColor">
          Positive field direction →
        </text>
      </Scene>
      <output aria-live="polite">
        Induced emf: {(Math.abs(emf) < 1e-10 ? 0 : emf).toFixed(3)} V.
      </output>
      <p>
        emf=−NA cosθ dB/dt. Sign uses the right-hand loop orientation about the
        blue normal; it opposes increasing flux linkage. No current is predicted
        without a circuit resistance/impedance model.
      </p>
    </section>
  );
}
export function TidalExplorer() {
  const [radius, setRadius] = useState(4),
    [separation, setSeparation] = useState(0.4);
  const s = radialTide(radius, separation);
  return (
    <section className="virtual-lab">
      <h3>When does a tidal approximation fail?</h3>
      <p>
        Drag the outer probe or use the separation control. Compare exact
        differential acceleration with the leading small-separation
        approximation. Newtonian point source, GM=1 in consistent model units.
        This is an instantaneous field comparison, not a simulated orbit or
        disruption event.
      </p>
      <Control
        label="Tide center radius"
        min={2}
        max={8}
        step={0.1}
        value={radius}
        onChange={setRadius}
      />
      <Control
        label="Tide probe separation"
        min={0.05}
        max={2}
        step={0.05}
        value={separation}
        onChange={setSeparation}
      />
      <Scene
        label="Drag outer tidal probe"
        x={40 + 35 * (radius + separation / 2)}
        y={120}
        move={(x) =>
          setSeparation(
            Math.max(0.05, Math.min(2, 2 * ((x - 40) / 35 - radius))),
          )
        }
      >
        <circle cx="40" cy="120" r="15" fill="#d47232" />
        <path d="M60 120H365" stroke="currentColor" />
        <circle
          cx={40 + 35 * (radius - separation / 2)}
          cy="120"
          r="7"
          fill="#2584d5"
        />
        <text x="65" y="65" fill="currentColor">
          Two freely falling probes, radial separation
        </text>
      </Scene>
      <output aria-live="polite">
        Exact differential acceleration: {s.exact.toFixed(6)}. Linear tide:{" "}
        {s.linear.toFixed(6)}. Separation/radius: {s.ratio.toFixed(3)}.
      </output>
      <p>
        Exact: 1/(r−ℓ/2)²−1/(r+ℓ/2)². Linear: 2ℓ/r³. Increase ℓ/r to expose the
        neglected higher-order terms. Material strength, self-gravity and
        relativistic curvature are outside this model.
      </p>
    </section>
  );
}
