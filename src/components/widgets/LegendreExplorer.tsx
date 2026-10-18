import { useState } from "react";
import { legendre, zonalHarmonic } from "../../lib/legendre";
export function LegendreExplorer() {
  const [degree, setDegree] = useState(2),
    [probe, setProbe] = useState(0);
  const points = (n: number) =>
    Array.from(
      { length: 321 },
      (_, i) =>
        `${50 + (500 * i) / 320},${130 - 80 * legendre(n, -1 + (2 * i) / 320)}`,
    ).join(" ");
  return (
    <section className="virtual-lab" aria-label="Legendre polynomial explorer">
      <p className="lab-label">MATHEMATICAL EXPLORER · ANGULAR MODES</p>
      <h2>Compare spherical angular modes</h2>
      <p>
        Plot standard Pℓ(x), normalized by Pℓ(1) = 1, against its neighbouring
        degree. For a zonal spherical mode, x = cosθ. This is a one-dimensional
        angular profile, not a complete spherical surface or a telescope
        measurement.
      </p>
      <label>
        Degree ℓ: {degree}
        <input
          aria-label="Legendre degree"
          type="range"
          min="0"
          max="6"
          step="1"
          value={degree}
          onChange={(e) => setDegree(Number(e.target.value))}
        />
      </label>
      <label>
        Probe x = cosθ: {probe}
        <input
          aria-label="Legendre probe"
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={probe}
          onChange={(e) => setProbe(Number(e.target.value))}
        />
      </label>
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label={`Legendre degrees ${degree} solid and ${degree + 1} dashed on a fixed vertical scale from minus one to one`}
      >
        <path
          d="M50 50V210H550M50 130H550"
          fill="none"
          stroke="currentColor"
          opacity=".3"
        />
        <polyline
          points={points(degree)}
          fill="none"
          stroke="#1685d1"
          strokeWidth="3"
        />
        <polyline
          points={points(degree + 1)}
          fill="none"
          stroke="#e07824"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <line
          x1={50 + 250 * (probe + 1)}
          x2={50 + 250 * (probe + 1)}
          y1="45"
          y2="215"
          stroke="currentColor"
          opacity=".5"
        />
        <circle
          cx={50 + 250 * (probe + 1)}
          cy={130 - 80 * legendre(degree, probe)}
          r="5"
          fill="#1685d1"
        />
        <text x="50" y="245">
          −1
        </text>
        <text x="295" y="245">
          0
        </text>
        <text x="540" y="245">
          1
        </text>
        <text x="15" y="55">
          1
        </text>
        <text x="10" y="215">
          −1
        </text>
      </svg>
      <p>
        Solid: P{degree}. Dashed: P{degree + 1}. Probe colatitude θ ={" "}
        {((Math.acos(probe) * 180) / Math.PI).toFixed(2)}°.
      </p>
      <p>
        Selected Pℓ(x):{" "}
        <output aria-label="Selected Legendre value">
          {legendre(degree, probe).toFixed(6)}
        </output>
        . Normalized zonal Yℓ⁰:{" "}
        <output aria-label="Selected zonal harmonic">
          {zonalHarmonic(degree, probe).toFixed(6)}
        </output>
        .
      </p>
      <p>
        Theorem: ∫₋₁¹Pℓ² dx ={" "}
        <output aria-label="Legendre squared norm">
          {(2 / (2 * degree + 1)).toFixed(6)}
        </output>
        ; ∫₋₁¹PℓPℓ₊₁ dx = 0. These are analytic identities, not numerical
        quadrature results.
      </p>
      <p>
        Orthonormal Yℓ⁰ = √((2ℓ+1)/(4π)) Pℓ(cosθ). Its squared integral over the
        whole sphere is 1 with dΩ = sinθ dθ dφ. A uniform θ average omits the
        required area weight. The plotted polynomials are not unit normalized.
      </p>
      <div className="measurement-table">
        <table>
          <caption>Degree comparison at this probe</caption>
          <thead>
            <tr>
              <th>Degree</th>
              <th>Pℓ(x)</th>
              <th>Sphere eigenvalue −ℓ(ℓ+1)</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }, (_, n) => (
              <tr key={n}>
                <td>{n}</td>
                <td>{legendre(n, probe).toFixed(6)}</td>
                <td>{-n * (n + 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Try x = 0 and both endpoints, compare even/odd parity, then verify
        orthogonality by refining your own weighted quadrature. This explorer
        covers m = 0 only; nonzero-order azimuthal patterns and observational
        masks require the full harmonic description.
      </p>
    </section>
  );
}
