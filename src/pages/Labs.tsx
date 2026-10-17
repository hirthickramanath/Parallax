import { useState } from "react";
import { Link } from "react-router-dom";
import { PendulumLab } from "../components/widgets/PendulumLab";
import { OrbitExplorer } from "../components/widgets/OrbitExplorer";
import { CircuitLab } from "../components/widgets/CircuitLab";
export function Labs() {
  const [lab, setLab] = useState("pendulum");
  return (
    <main id="main" className="workspace-page">
      <p className="eyebrow">APPARATUS → OBSERVATION → THEORY</p>
      <h1>Your virtual lab bench.</h1>
      <p className="page-description">
        See how an experiment works. Control the apparatus, collect explicitly
        synthetic readings, then investigate the theory and its limitations.
      </p>
      <div className="lab-subjects">
        <button
          aria-pressed={lab === "pendulum"}
          onClick={() => setLab("pendulum")}
        >
          Pendulum & gravity
        </button>
        <button aria-pressed={lab === "orbit"} onClick={() => setLab("orbit")}>
          Orbit explorer
        </button>
        <button
          aria-pressed={lab === "circuit"}
          onClick={() => setLab("circuit")}
        >
          Circuit bench
        </button>
      </div>
      {lab === "circuit" ? (
        <CircuitLab />
      ) : lab === "pendulum" ? (
        <PendulumLab />
      ) : (
        <OrbitExplorer />
      )}
      <div className="info-box">
        <h2>Take it into a lesson</h2>
        <p>
          Study the complete derivation, record your reasoning, and answer
          checks.
        </p>
        <Link
          to={`/lesson/${lab === "circuit" ? "PB4.2" : lab === "pendulum" ? "PB1.4" : "AS1.3"}`}
        >
          Open the connected lesson →
        </Link>
      </div>
      <Link to="/teaching-lab" className="text-button">
        Earlier intuition experiments →
      </Link>
    </main>
  );
}
