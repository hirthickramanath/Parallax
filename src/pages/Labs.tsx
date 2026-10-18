import { PdeModesLab } from "../components/widgets/PdeModesLab";
import { CoupledOscillatorLab } from "../components/widgets/CoupledOscillatorLab";
import { SphericalFieldLab } from "../components/widgets/SphericalFieldLab";
import { RadiationLab } from "../components/widgets/RadiationLab";
import { GasLab } from "../components/widgets/GasLab";
import { WaveLab } from "../components/widgets/WaveLab";
import { DoubleSlitLab } from "../components/widgets/DoubleSlitLab";
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
        {[
          ["pde", "Heat flow and waves"],
          ["coupled", "Coupled oscillators"],
          ["field", "Spherical field"],
          ["radiation", "Radiation bench"],
          ["gas", "Gas piston"],
          ["wave", "Standing waves"],
          ["slit", "Double slit"],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={lab === id} onClick={() => setLab(id)}>
            {label}
          </button>
        ))}
      </div>
      {lab === "pde" ? (
        <PdeModesLab />
      ) : lab === "coupled" ? (
        <CoupledOscillatorLab />
      ) : lab === "field" ? (
        <SphericalFieldLab />
      ) : lab === "radiation" ? (
        <RadiationLab />
      ) : lab === "gas" ? (
        <GasLab />
      ) : lab === "wave" ? (
        <WaveLab />
      ) : lab === "slit" ? (
        <DoubleSlitLab />
      ) : lab === "circuit" ? (
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
          to={`/lesson/${lab === "pde" ? "MA5.4" : lab === "coupled" ? "PH2.7" : lab === "field" ? "PH4.1" : lab === "radiation" ? "AS2.3" : lab === "gas" ? "PB2.2" : lab === "wave" ? "PB3.1" : lab === "slit" ? "PB3.3" : lab === "circuit" ? "PB4.2" : lab === "pendulum" ? "PB1.4" : "AS1.3"}`}
        >
          Open the connected lesson →
        </Link>
      </div>
      <Link to="/projects" className="text-button">
        Investigate a foundation project →
      </Link>
      <Link to="/teaching-lab" className="text-button">
        Earlier intuition experiments →
      </Link>
    </main>
  );
}
