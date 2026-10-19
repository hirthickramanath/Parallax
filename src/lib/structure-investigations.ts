import type { AstroInvestigation } from "./astro-investigations";
export const structureInvestigations: Record<string, AstroInvestigation> = {
  "MA10.1": {
    title: "Explore an additive quotient map",
    x: ["Integer representative", -12, 12, 1],
    parameter: ["Integer modulus n", 2, 8, 5],
    y: "Residue in 0..n−1",
    equation: "((x mod n)+n) mod n",
    assumptions:
      "Integer representatives with addition; graph jumps are quotient representatives, not discontinuity of a real homomorphism.",
    xStep: 1,
    parameterStep: 1,
    value: (x, n) => ((x % n) + n) % n,
  },
  "MA10.2": {
    title: "Follow repeated cyclic permutation",
    x: ["Integer step count", 0, 20, 1],
    parameter: ["Integer cycle length", 2, 8, 4],
    y: "Image of index zero",
    equation: "j ↦ j mod n",
    assumptions:
      "One cyclic subgroup only; not a full permutation multiplication table.",
    xStep: 1,
    parameterStep: 1,
    value: (j, n) => j % n,
  },
  "MA10.3": {
    title: "Expose modular zero divisors",
    x: ["Integer residue representative", 0, 12, 1],
    parameter: ["Integer modulus", 2, 10, 6],
    y: "Twice the residue modulo n",
    equation: "2x mod n",
    assumptions:
      "Residue-ring multiplication; choosing n does not assert primality or field structure.",
    xStep: 1,
    parameterStep: 1,
    value: (x, n) => (2 * x) % n,
  },
  "MA10.4": {
    title: "Probe a rotation character",
    x: ["Angle θ (rad)", -3.141592653589793, 3.141592653589793, 0],
    parameter: ["Integer harmonic m", 1, 5, 1],
    y: "Character",
    equation: "2cos(mθ)",
    assumptions:
      "Real two-dimensional SO(2) representation; not a universal character classification.",
    parameterStep: 1,
    value: (t, m) => 2 * Math.cos(m * t),
  },
  "MA10.5": {
    title: "Track a half-angle phase",
    x: ["Rotation angle θ (rad)", 0, 12.566370614359172, 0],
    parameter: ["Integer winding multiplier", 1, 3, 1],
    y: "Real spinor phase",
    equation: "cos(mθ/2)",
    assumptions:
      "One component of a z rotation; not a probability and not the full spinor transformation.",
    parameterStep: 1,
    value: (t, m) => Math.cos((m * t) / 2),
  },
  "MA10.6": {
    title: "Add collinear boost rapidities",
    x: ["First rapidity", -2, 2, 0.5],
    parameter: ["Second rapidity", -2, 2, 0.5],
    y: "Combined velocity β",
    equation: "tanh(η1+η2)",
    assumptions:
      "Collinear proper boosts and c=1; noncollinear rotations are excluded.",
    value: (a, b) => Math.tanh(a + b),
  },
  "MA11.1": {
    title: "Separate components from metric norm",
    x: ["Second vector component", -3, 3, 1],
    parameter: ["Metric scale a", 0.2, 3, 1],
    y: "Squared vector norm",
    equation: "g(v,v)=a²v² for v=(0,v)",
    assumptions:
      "Positive diagonal metric example; not a general coordinate transformation solver.",
    value: (v, a) => a * a * v * v,
  },
  "MA11.2": {
    title: "Follow a coordinate-chart circle projection",
    x: ["Angle θ (rad)", -3.141592653589793, 3.141592653589793, 0],
    parameter: ["Positive radius r", 0.2, 3, 1],
    y: "Cartesian x",
    equation: "x=r cosθ",
    assumptions:
      "Polar chart excludes r=0 and needs angle branches; projection is not a global manifold chart.",
    value: (t, r) => r * Math.cos(t),
  },
  "MA11.3": {
    title: "Probe a flat-coordinate connection",
    x: ["Positive radius r", 0.2, 4, 1],
    parameter: ["Angular component scale", 0.2, 3, 1],
    y: "Radial connection contribution",
    equation: "Γrθθ(vθ)²=−r(vθ)²",
    assumptions:
      "Euclidean plane in polar coordinates; nonzero coefficient does not mean curvature.",
    value: (r, v) => -r * v * v,
  },
  "MA11.4": {
    title: "Separate radial coordinate and covariant acceleration",
    x: ["Radius r", 0.2, 4, 1],
    parameter: ["Angular coordinate rate", 0.2, 3, 1],
    y: "Required radial coordinate acceleration",
    equation: "r″=r(θ′)²",
    assumptions:
      "Instantaneous flat polar geodesic equation; not a global path integrator.",
    value: (r, w) => r * w * w,
  },
  "MA11.5": {
    title: "Compare spherical intrinsic curvature",
    x: ["Sphere radius R", 0.2, 5, 1],
    parameter: ["Positive radius scaling factor", 0.5, 2, 1],
    y: "Gaussian curvature",
    equation: "K=1/(sR)²",
    assumptions:
      "Round two-sphere family; extrinsic bending of other surfaces is not inferred.",
    value: (r, s) => 1 / (s * r) ** 2,
  },
  "MA11.6": {
    title: "Check a planar Stokes benchmark",
    x: ["Oriented rectangle area", -5, 5, 1],
    parameter: ["Coefficient a in α=a x dy", 0.2, 3, 1],
    y: "Boundary integral",
    equation: "∮α=a·oriented area",
    assumptions:
      "Smooth planar form and compatible boundary orientation; no arbitrary mesh integration.",
    value: (A, a) => a * A,
  },
  "MA11.7": {
    title: "Inspect a U(1) loop phase",
    x: ["Loop phase Φ (rad)", -6.283185307179586, 6.283185307179586, 0],
    parameter: ["Integer charge multiplier", 1, 3, 1],
    y: "Real holonomy",
    equation: "Re exp(iqΦ)=cos(qΦ)",
    assumptions:
      "Abelian loop toy; not a non-Abelian path-ordered connection calculation.",
    parameterStep: 1,
    value: (p, q) => Math.cos(q * p),
  },
  "MA12.1": {
    title: "Compare a finite-dimensional p-norm",
    x: ["First coordinate x", -4, 4, 1],
    parameter: ["Norm exponent p", 1, 5, 2],
    y: "p-norm of (x,1)",
    equation: "(|x|^p+1)^(1/p)",
    assumptions:
      "Finite-dimensional p≥1 family; not an infinite-dimensional norm-equivalence theorem.",
    value: (x, p) => (Math.abs(x) ** p + 1) ** (1 / p),
  },
  "MA12.2": {
    title: "Probe an orthogonal residual",
    x: ["Perpendicular component", -4, 4, 1],
    parameter: ["Positive metric scale", 0.2, 3, 1],
    y: "Squared distance to the x-axis",
    equation: "s² y²",
    assumptions:
      "Two-dimensional Euclidean projection with a fixed coordinate scaling; not an arbitrary Banach projection.",
    value: (y, s) => s * s * y * y,
  },
  "MA12.3": {
    title: "Expose differentiation amplification",
    x: ["Integer Fourier index n", 0, 30, 1],
    parameter: ["Positive frequency scale", 0.2, 3, 1],
    y: "Norm amplification",
    equation: "||∂x e^(isnx)||/||e^(isnx)||=s|n|",
    assumptions:
      "L² mode sequence; domain and choice of norm matter for unboundedness.",
    xStep: 1,
    value: (n, s) => s * Math.abs(n),
  },
  "MA12.4": {
    title: "Narrow a unit-area delta approximant",
    x: ["Coordinate x", -3, 3, 0],
    parameter: ["Positive Gaussian width σ", 0.1, 1, 0.5],
    y: "Gaussian density",
    equation: "exp(−x²/(2σ²))/(sqrt(2π)σ)",
    assumptions:
      "Positive finite-width approximation; distributional convergence is tested by integrals, not peak height alone.",
    value: (x, s) =>
      Math.exp((-x * x) / (2 * s * s)) / (Math.sqrt(2 * Math.PI) * s),
  },
  "MA12.5": {
    title: "Probe a resolvent away from its pole",
    x: ["Real z below spectrum", -3, 1, 0],
    parameter: ["Eigenvalue λ", 2, 4, 2],
    y: "Resolvent factor",
    equation: "1/(λ−z)",
    assumptions:
      "Single finite-dimensional eigenvalue with z kept away from λ; no continuous-spectrum resolution is computed.",
    value: (z, l) => 1 / (l - z),
  },
  "MA13.1": {
    title: "Probe a nonlinear one-step map",
    x: ["Current state x", 0, 1, 0.5],
    parameter: ["Logistic parameter r", 1, 4, 2],
    y: "Next state",
    equation: "r x(1−x)",
    assumptions:
      "One-step logistic map only; no chaos classification or long-time numerical guarantee.",
    value: (x, r) => r * x * (1 - x),
  },
  "MA13.2": {
    title: "Follow an exact stochastic variance",
    x: ["Time t", 0, 5, 1],
    parameter: ["Diffusion coefficient D with κ=1", 0.2, 3, 1],
    y: "OU variance from zero",
    equation: "D(1−exp(−2t))",
    assumptions:
      "Additive-noise OU exact moment, not a simulated path or multiplicative-noise convention comparison.",
    value: (t, D) => D * (1 - Math.exp(-2 * t)),
  },
  "MA13.3": {
    title: "Probe a linearized scale flow",
    x: ["Log coarse-graining scale ℓ", 0, 3, 1],
    parameter: ["Scaling eigenvalue y", -2, 2, 1],
    y: "Coupling ratio u/u0",
    equation: "exp(yℓ)",
    assumptions:
      "Local fixed-point linearization; marginal nonlinear terms and microscopic beta functions are not computed.",
    value: (l, y) => Math.exp(y * l),
  },
  "MA13.4": {
    title: "Explore a spin-half geometric phase",
    x: ["Polar angle θ (rad)", 0, 3.141592653589793, 1.5707963267948966],
    parameter: ["Integer loop winding", 1, 3, 1],
    y: "Unwrapped geometric phase",
    equation: "−mπ(1−cosθ)",
    assumptions:
      "Adiabatic nondegenerate spin-half loop and stated eigenstate convention; phase is modulo 2π and excludes dynamics.",
    parameterStep: 1,
    value: (t, m) => -m * Math.PI * (1 - Math.cos(t)),
  },
};
