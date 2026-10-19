import type { AstroInvestigation } from "./astro-investigations";
export const computingInvestigations: Record<string, AstroInvestigation> = {
  "CP1.1": {
    title: "Compute an explicit vector contraction",
    x: ["First vector scale", -3, 3, 1],
    parameter: ["Second vector scale", -3, 3, 1],
    y: "Dot product",
    equation: "(a·[1,2,3])·(b·[4,5,6])=32ab",
    assumptions:
      "Browser arithmetic demonstration; no Python interpreter, performance benchmark or hidden NumPy execution.",
    value: (a, b) => 32 * a * b,
  },
  "CP1.2": {
    title: "Preserve histogram probability mass",
    x: ["Positive bin width", 0.1, 2, 0.5],
    parameter: ["Bin probability mass", 0.05, 0.9, 0.2],
    y: "Density height",
    equation: "mass/width",
    assumptions:
      "One density-histogram bin with fixed mass; no observational dataset or sampling uncertainty.",
    value: (w, p) => p / w,
  },
  "CP1.3": {
    title: "Measure a central-difference truncation error",
    x: ["Positive step h", 0.001, 0.5, 0.1],
    parameter: ["Evaluation coordinate x", 0.2, 2, 1],
    y: "Derivative estimate minus exact derivative",
    equation: "[(x+h)³−(x−h)³]/(2h)−3x²",
    assumptions:
      "Smooth cubic benchmark, direct browser floating-point arithmetic; data noise is absent.",
    value: (h, x) => ((x + h) ** 3 - (x - h) ** 3) / (2 * h) - 3 * x * x,
  },
  "CP1.4": {
    title: "Probe an RK4 stability polynomial",
    x: ["Step h", 0, 3, 1],
    parameter: ["Positive decay rate λ", 0.2, 2, 1],
    y: "One-step amplification",
    equation: "1−z+z²/2−z³/6+z⁴/24, z=λh",
    assumptions:
      "Scalar decay benchmark only; no adaptive controller or Hamiltonian symplectic guarantee.",
    value: (h, l) => {
      const z = h * l;
      return 1 - z + (z * z) / 2 - z ** 3 / 6 + z ** 4 / 24;
    },
  },
  "CP1.5": {
    title: "Expose small-singular-value sensitivity",
    x: ["Small diagonal ε", 0.01, 1, 0.1],
    parameter: ["Right-hand-side perturbation", 0.001, 0.1, 0.01],
    y: "Solution perturbation magnitude",
    equation: "δx=δb/ε",
    assumptions:
      "Diagonal positive matrix toy; no general solver or floating-point backward-error certification.",
    value: (e, b) => b / e,
  },
  "CP1.6": {
    title: "Test a symbolic simplification assumption",
    x: ["Real x", -4, 4, -1],
    parameter: ["Positive multiplier a", 0.2, 3, 1],
    y: "Real square root",
    equation: "sqrt((ax)²)=|ax|",
    assumptions:
      "Numeric real-domain diagnostic, not an embedded SymPy session or a symbolic proof.",
    value: (x, a) => Math.abs(a * x),
  },
  "CP2.1": {
    title: "Test explicit diffusion stability",
    x: ["Diffusion ratio r", 0, 1, 0.25],
    parameter: [
      "Dimensionless mode k dx",
      0,
      3.141592653589793,
      3.141592653589793,
    ],
    y: "Mode amplification",
    equation: "1−4r sin²(k dx/2)",
    assumptions:
      "One-dimensional linear FTCS Fourier test; boundaries and multidimensional stability are excluded.",
    value: (r, k) => 1 - 4 * r * Math.sin(k / 2) ** 2,
  },
  "CP2.2": {
    title: "Compare Monte Carlo information scales",
    x: ["Effective independent count", 10, 10000, 100],
    parameter: ["Bernoulli probability", 0.05, 0.95, 0.5],
    y: "Estimated standard error",
    equation: "sqrt(p(1−p)/Neff)",
    assumptions:
      "Assumed effective independent count; no random chain or empirical ESS diagnostic is run.",
    value: (N, p) => Math.sqrt((p * (1 - p)) / N),
  },
  "CP2.3": {
    title: "Check an ideal parallax unit conversion",
    x: ["Positive parallax in milliarcseconds", 1, 100, 20],
    parameter: ["Unit scale multiplier", 0.5, 2, 1],
    y: "Ideal distance in parsecs",
    equation: "d=1000/(s pmas)",
    assumptions:
      "Positive exact high-signal parallax toy; no catalog query or low-signal distance inference.",
    value: (p, s) => 1000 / (s * p),
  },
  "CP2.4": {
    title: "Inspect a prediction loss",
    x: ["Prediction", -3, 3, 1],
    parameter: ["Target", -3, 3, 0],
    y: "Squared error",
    equation: "(prediction−target)²",
    assumptions:
      "Single-point arithmetic diagnostic; no trained model, held-out dataset or generalization claim.",
    value: (p, t) => (p - t) ** 2,
  },
  "CP2.5": {
    title: "Explore an ideal parallel-speedup ceiling",
    x: ["Integer worker count", 1, 64, 4],
    parameter: ["Parallelizable fraction", 0, 0.99, 0.8],
    y: "Ideal speedup",
    equation: "1/[(1−f)+f/p]",
    assumptions:
      "Amdahl bound without communication or resource overhead; not a measured cluster result.",
    xStep: 1,
    value: (p, f) => 1 / (1 - f + f / p),
  },
};
