import { SimulationSlider } from "./SimulationSlider";
import { useMemo, useState } from "react";
import { orbitalElements } from "../../lib/lab-models";
import { Button } from "../ui/button";

export function OrbitExplorer() {
  const [speed, setSpeed] = useState(1),
    [angle, setAngle] = useState(0);
  const elements = orbitalElements(speed, angle);
  const path = useMemo(() => {
    let x = 1,
      y = 0,
      vx = speed * Math.sin((angle * Math.PI) / 180),
      vy = speed * Math.cos((angle * Math.PI) / 180);
    const dt = 0.008;
    const points = [`M${250 + 65 * x},${220 - 65 * y}`];
    for (let i = 0; i < 2000; i++) {
      const r = Math.hypot(x, y);
      if (r < 0.08 || r > 7) break;
      vx -= (dt * x) / r ** 3;
      vy -= (dt * y) / r ** 3;
      x += dt * vx;
      y += dt * vy;
      points.push(`L${250 + 65 * x},${220 - 65 * y}`);
    }
    return points.join(" ");
  }, [speed, angle]);
  return (
    <div className="virtual-lab">
      <p className="lab-label">ORBIT EXPLORER · TWO-BODY MODEL</p>
      <p>
        Launch from r₀ = 1 with μ = 1. Speed is in units of √(μ/r₀); zero
        direction angle is tangential. Drag and other bodies are omitted.
      </p>
      <div className="lab-controls">
        <div className="simulation-control-label">
          Launch speed: {speed.toFixed(3)}
          <SimulationSlider
            aria-label="Launch speed"
            type="range"
            min=".4"
            max="1.8"
            step=".01"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>
        <div className="simulation-control-label">
          Direction from tangent: {angle}°
          <SimulationSlider
            aria-label="Launch direction"
            type="range"
            min="-60"
            max="60"
            step="1"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="lab-actions">
        <Button
          variant="outline"
          onClick={() => {
            setSpeed(1);
            setAngle(0);
          }}
        >
          Circular launch
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSpeed(Math.SQRT2);
            setAngle(0);
          }}
        >
          Escape boundary
        </Button>
      </div>
      <svg
        viewBox="0 0 500 440"
        role="img"
        aria-label={`${elements.type} orbit, eccentricity ${elements.e.toFixed(3)}`}
      >
        <path d="M0 220H500M250 0V440" stroke="currentColor" opacity=".1" />
        <path
          d={path}
          stroke="var(--primary-color)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="250" cy="220" r="8" fill="var(--gold)" />
        <circle cx="315" cy="220" r="5" fill="currentColor" />
      </svg>
      <div className="lab-readout">
        <p>
          <strong>{elements.type}</strong>
        </p>
        <p>e = {elements.e.toFixed(3)}</p>
        <p>Specific energy = {elements.energy.toFixed(3)}</p>
        <p>a = {elements.a === null ? "unbounded" : elements.a.toFixed(3)}</p>
      </div>
      <p className="lab-caveat">
        Conic classification comes from analytic energy and angular momentum.
        The displayed finite arc uses symplectic Euler integration and may
        drift; it stops near collision or at the view boundary. This is a planar
        model, so inclination and ascending-node orientation are not visualized.
      </p>
    </div>
  );
}
