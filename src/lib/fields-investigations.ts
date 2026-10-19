import type { AstroInvestigation } from "./astro-investigations";
export const fieldsInvestigations: Record<string, AstroInvestigation> = {
  "PH15.1": {
    title: "Inspect a continuum mode-count scaling",
    x: ["Positive momentum cutoff K", 0.2, 5, 1],
    parameter: ["Positive volume scale", 0.2, 3, 1],
    y: "Relative mode count",
    equation: "V K³",
    assumptions:
      "Scaling benchmark without degeneracy prefactors; not a renormalized vacuum-energy calculation.",
    value: (K, V) => V * K ** 3,
  },
  "PH15.2": {
    title: "Probe a classical phase-charge density",
    x: ["Mode frequency ω", 0.2, 4, 1],
    parameter: ["Real amplitude A", 0.2, 3, 1],
    y: "Charge density in chosen convention",
    equation: "j0=2ωA²",
    assumptions:
      "Single harmonic complex scalar mode and declared sign normalization; not particle probability or interacting dynamics.",
    value: (w, A) => 2 * w * A * A,
  },
  "PH15.3": {
    title: "Inspect a quantized free-mode energy",
    x: ["Integer occupation n", 0, 10, 0],
    parameter: ["Wave number k with m=ℏ=c=1", 0, 4, 1],
    y: "Free-mode energy",
    equation: "sqrt(1+k²)(n+1/2)",
    assumptions:
      "One free scalar oscillator mode; no continuum interacting calculation or cosmological vacuum prediction.",
    xStep: 1,
    value: (n, k) => Math.hypot(1, k) * (n + 0.5),
  },
  "PH15.4": {
    title: "Compare a leading perturbative amplitude scale",
    x: ["Positive coupling g", 0.1, 2, 1],
    parameter: ["Fixed nonnegative kinematic factor", 0.2, 3, 1],
    y: "Relative squared-amplitude weight",
    equation: "C g⁴",
    assumptions:
      "Declared leading g² amplitude scaling with fixed kinematics; not a full cross section, probability or literal path.",
    value: (g, C) => C * g ** 4,
  },
  "PH15.5": {
    title: "Inspect a leading electromagnetic coupling scale",
    x: ["Dimensionless α", 0.001, 0.2, 0.01],
    parameter: ["Fixed kinematic coefficient", 0.2, 3, 1],
    y: "Relative rate factor",
    equation: "C α²",
    assumptions:
      "Leading-order scaling only; no QED loop, infrared cancellation or detector-level event prediction.",
    value: (a, C) => C * a * a,
  },
  "PH15.6": {
    title: "Probe a declared one-loop running law",
    x: ["Log scale ratio", -2, 2, 0],
    parameter: ["Reference coupling α0", 0.02, 0.2, 0.1],
    y: "Toy running coupling",
    equation: "α0/[1−α0 ln(μ/μ0)]",
    assumptions:
      "b=1 toy kept away from pole; not a universal gauge beta function or an exact strong-coupling prediction.",
    value: (l, a) => a / (1 - a * l),
  },
  "PH15.7": {
    title: "Probe a non-Abelian algebra coefficient",
    x: ["First algebra coefficient a", -3, 3, 1],
    parameter: ["Second algebra coefficient b", -3, 3, 1],
    y: "Coefficient along iT3",
    equation: "[aT1,bT2]=iab T3",
    assumptions:
      "SU(2) generators Ti=σi/2; algebra example only, not a gauge-invariant field observable or solved Yang–Mills system.",
    value: (a, b) => a * b,
  },
  "PH15.8": {
    title: "Inspect a scalar symmetry-breaking potential",
    x: ["Field φ", -3, 3, 0],
    parameter: ["Positive vacuum scale v with λ=1", 0.2, 2, 1],
    y: "Potential energy density",
    equation: "(φ²−v²)²/4",
    assumptions:
      "Canonical real-scalar toy with λ=1; not a complete electroweak gauge-field or vacuum-identification calculation.",
    value: (p, v) => (p * p - v * v) ** 2 / 4,
  },
  "PH16.1": {
    title: "Probe a weak-field clock comparison",
    x: ["Small potential difference ΔΦ/c²", -0.01, 0.01, 0.001],
    parameter: ["Reference clock frequency", 0.5, 3, 1],
    y: "Leading frequency shift",
    equation: "Δν≈ν0 ΔΦ/c²",
    assumptions:
      "First order in a prescribed small static potential difference; no near-horizon exact metric or tide calculation.",
    value: (p, v) => p * v,
  },
  "PH16.2": {
    title: "Inspect a vacuum curvature contraction",
    x: ["Cosmological constant Λ", -2, 2, 0.5],
    parameter: ["Integer spacetime dimension d", 3, 6, 4],
    y: "Ricci scalar in the stated Einstein-space convention",
    equation: "R=dΛ for Rμν=Λgμν",
    assumptions:
      "Λ here is the Ricci-proportionality parameter; only in d=4 does it equal the usual action cosmological constant in vacuum. No metric is solved.",
    parameterStep: 1,
    value: (l, d) => d * l,
  },
  "PH16.3": {
    title: "Probe a static exterior clock factor",
    x: ["Radius r/(2M)", 1.05, 6, 2],
    parameter: ["Reference coordinate time interval", 0.2, 3, 1],
    y: "Static proper interval",
    equation: "Δτ=Δt sqrt(1−1/[r/(2M)])",
    assumptions:
      "Stationary Schwarzschild exterior only; no horizon crossing or infalling proper-time evolution.",
    value: (r, t) => t * Math.sqrt(1 - 1 / r),
  },
  "PH16.4": {
    title: "Vary a subextremal Kerr horizon",
    x: ["Dimensionless spin χ", -0.99, 0.99, 0],
    parameter: ["Positive mass M", 0.2, 3, 1],
    y: "Outer horizon radius",
    equation: "M[1+sqrt(1−χ²)]",
    assumptions:
      "Subextremal Kerr in G=c=1; not the ergosurface, ISCO, full ray tracing or a quantum-gravity solution.",
    value: (s, M) => M * (1 + Math.sqrt(1 - s * s)),
  },
  "PH16.5": {
    title: "Probe an ideal weak gravitational strain",
    x: ["Wave phase", 0, 6.283185307179586, 0],
    parameter: ["Normalized amplitude", 0.2, 3, 1],
    y: "Normalized plus strain",
    equation: "A cosφ",
    assumptions:
      "Weak plane-wave shape in normalized units; no instrument noise, arm transfer function or observed detection.",
    value: (p, A) => A * Math.cos(p),
  },
  "PH16.6": {
    title: "Inspect a matter-only Friedmann history",
    x: ["Positive scale factor a", 0.2, 4, 1],
    parameter: ["Reference Hubble rate H0", 0.2, 3, 1],
    y: "Hubble rate",
    equation: "H0 a^(−3/2)",
    assumptions:
      "Spatially flat matter-only background; no radiation, dark energy, perturbations or observational fit.",
    value: (a, H) => H * a ** -1.5,
  },
  "PH16.7": {
    title: "Check a declared discretization order",
    x: ["Grid spacing h", 0.02, 1, 0.2],
    parameter: ["Positive leading coefficient C", 0.2, 3, 1],
    y: "Leading error benchmark",
    equation: "C h²",
    assumptions:
      "Analytic second-order benchmark, not actual Einstein evolution, gauge constraints or measured run errors.",
    value: (h, C) => C * h * h,
  },
  "PH16.8": {
    title: "Inspect a Planck-length scaling",
    x: ["Positive gravitational constant G", 0.2, 5, 1],
    parameter: ["Positive Planck constant with c=1", 0.2, 3, 1],
    y: "Planck length in model units",
    equation: "sqrt(ℏG)",
    assumptions:
      "Dimensional benchmark with c=1; no claim of a spacetime lattice or solved quantum-gravity dynamics.",
    value: (G, h) => Math.sqrt(G * h),
  },
  "PH17.1": {
    title: "Compare an independent uncertainty budget",
    x: ["First standard uncertainty", 0.1, 5, 3],
    parameter: ["Second standard uncertainty", 0.1, 5, 4],
    y: "Combined uncertainty for a sum",
    equation: "sqrt(σ1²+σ2²)",
    assumptions:
      "Independent additive errors only; covariance and unmodeled bias are excluded.",
    value: (a, b) => Math.hypot(a, b),
  },
  "PH17.2": {
    title: "Probe a sampled sinusoid alias",
    x: ["Integer sample index n", 0, 20, 1],
    parameter: ["Frequency/sample-rate ratio", 0, 2, 0.3],
    y: "Sample amplitude",
    equation: "sin(2πfn/fs)",
    assumptions:
      "Uniform ideal samples, no antialias filter or hardware noise; frequencies separated by integer fs alias.",
    xStep: 1,
    value: (n, r) => Math.sin(2 * Math.PI * r * n),
  },
  "PH17.3": {
    title: "Check a Monte Carlo standard-error benchmark",
    x: ["Integer independent sample count", 10, 10000, 100],
    parameter: ["Bernoulli probability", 0.05, 0.95, 0.2],
    y: "Standard error",
    equation: "sqrt(p(1−p)/N)",
    assumptions:
      "Analytic independent-sampling benchmark; no proposal, random stream or empirical variance estimate is run.",
    xStep: 1,
    value: (N, p) => Math.sqrt((p * (1 - p)) / N),
  },
  "PH17.4": {
    title: "Probe a pair force before integration",
    x: ["Separation r/σ", 0.9, 3, 1],
    parameter: ["Well-depth ε", 0.2, 3, 1],
    y: "Outward radial force",
    equation: "24ε(2r^−13−r^−7)",
    assumptions:
      "Instantaneous isotropic pair force; no many-body trajectory, thermostat or integration stability claim.",
    value: (r, e) => 24 * e * (2 * r ** -13 - r ** -7),
  },
  "PH17.5": {
    title: "Budget independent measurement precision",
    x: ["Integer planned sample count", 1, 400, 100],
    parameter: ["Per-trial standard deviation", 0.2, 5, 2],
    y: "Planned standard error",
    equation: "σ/√N",
    assumptions:
      "Planning assumes independent stable trials; no actual collection, calibration or feasibility result.",
    xStep: 1,
    value: (N, s) => s / Math.sqrt(N),
  },
  "PH18.1": {
    title: "Expose a conditional-independence assumption",
    x: ["Per-study likelihood factor", 0.2, 3, 1],
    parameter: ["Integer conditionally independent studies", 1, 6, 2],
    y: "Combined likelihood factor",
    equation: "LR^n",
    assumptions:
      "Illustrative independent evidence model; no literature quality ranking or actual study evidence is extracted.",
    parameterStep: 1,
    value: (r, n) => r ** n,
  },
  "PH18.2": {
    title: "Check a dimensionless reported residual",
    x: ["Signed residual in common units", -3, 3, 1],
    parameter: ["Standard uncertainty in the same units", 0.2, 3, 1],
    y: "Standardized residual",
    equation: "residual/σ",
    assumptions:
      "Reporting arithmetic with stated uncertainty; no causal claim, significance calibration or writing score.",
    value: (r, s) => r / s,
  },
  "PH18.3": {
    title: "Budget a research precision floor",
    x: ["Integer independent trial count", 1, 400, 100],
    parameter: ["Systematic standard uncertainty", 0.05, 1, 0.2],
    y: "Total planned standard uncertainty",
    equation: "sqrt(1/N+σsys²)",
    assumptions:
      "Unit per-trial random variance and independent uncertainty components; planning model, not executed research or universal test power.",
    xStep: 1,
    value: (N, s) => Math.sqrt(1 / N + s * s),
  },
  "PH18.4": {
    title: "Separate discrepancy from a frontier explanation",
    x: ["Signed model-data difference", -3, 3, 0.6],
    parameter: ["Stated standard uncertainty", 0.1, 2, 0.2],
    y: "Standardized discrepancy",
    equation: "difference/σ",
    assumptions:
      "Diagnostic under the declared uncertainty only; not a calibrated discovery significance or a solution to an open problem.",
    value: (d, s) => d / s,
  },
};
