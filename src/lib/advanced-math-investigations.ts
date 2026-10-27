import type { AstroInvestigation } from "./astro-investigations";
export const advancedMathInvestigations: Record<string, AstroInvestigation> = {
  "MA6.1": {
    title: "Check the real part of a complex square",
    x: ["Real coordinate x", -3, 3, 1],
    parameter: ["Imaginary coordinate y", -3, 3, 1],
    y: "Real part of z²",
    equation: "Re(z²)=x²−y²",
    assumptions:
      "Polynomial example; this real slice is not a test of arbitrary functions for holomorphicity.",
    value: (x, y) => x * x - y * y,
  },
  "MA6.2": {
    title: "Accumulate a winding integral",
    x: ["Traversal angle t (rad)", 0, 6.283185307179586, 3.141592653589793],
    parameter: ["Integer winding multiplier", -3, 3, 1],
    y: "Imaginary accumulated integral",
    equation: "Im ∫ dz/z = n t",
    assumptions:
      "Circular parametrization avoids zero; integer multiplier changes winding/orientation.",
    parameterStep: 1,
    value: (t, n) => n * t,
  },
  "MA6.3": {
    title: "Vary an analytic numerator at a pole",
    x: ["Real pole position a", -2, 2, 0],
    parameter: ["Numerator amplitude", 0.2, 3, 1],
    y: "Residue",
    equation: "Res[A exp(z)/(z−a)]=A exp(a)",
    assumptions:
      "Assumes a simple pole and a contour enclosing it; no real-axis prescription is computed.",
    value: (a, A) => A * Math.exp(a),
  },
  "MA6.4": {
    title: "Inspect a Laurent truncation",
    x: ["Positive real z", 0.05, 0.85, 0.5],
    parameter: ["Truncation degree N", 1, 12, 4],
    y: "Truncated function",
    equation: "−1/z−Σ(j=0..N) z^j",
    assumptions:
      "Only 0<z<1, integer N; this truncation does not represent the outer annulus.",
    parameterStep: 1,
    value: (z, N) => -1 / z - (1 - z ** (N + 1)) / (1 - z),
  },
  "MA6.5": {
    title: "Compare local conformal length scaling",
    x: ["Radius |z|", 0, 3, 1],
    parameter: ["Positive amplitude A", 0.2, 3, 1],
    y: "Local length scale",
    equation: "|d(Az²)/dz|=2A|z|",
    assumptions:
      "Local differential only; at zero the derivative vanishes and conformality fails.",
    value: (r, A) => 2 * A * r,
  },
  "MA6.6": {
    title: "Follow an unwrapped logarithm",
    x: [
      "Unwrapped path angle (rad)",
      -12.566370614359172,
      12.566370614359172,
      0,
    ],
    parameter: ["Positive radius (changes Re log only)", 0.2, 3, 1],
    y: "Imaginary part of continued log",
    equation: "log(re^{it})=ln r+it along the path",
    assumptions:
      "Unwrapped continuation, not the principal branch; the radius never crosses zero. The radius sets only the real part ln r, so moving it leaves the plotted imaginary part unchanged: that independence is what the control shows.",
    value: (t, _r) => t,
  },
  "MA7.1": {
    title: "Inspect an unnormalized beta-integrand family",
    x: ["Interior coordinate t", 0.01, 0.99, 0.5],
    parameter: ["Positive exponent parameter p", 0.5, 5, 2],
    y: "Beta integrand for q=2",
    equation: "t^(p−1)(1−t)",
    assumptions:
      "Positive p and q=2 ensure integral convergence; this is not a normalized probability density.",
    value: (t, p) => t ** (p - 1) * (1 - t),
  },
  "MA7.2": {
    title: "Probe a quadrupole angular polynomial",
    x: ["Cosine of polar angle", -1, 1, 0],
    parameter: ["Amplitude", 0.2, 3, 1],
    y: "Scaled P2",
    equation: "A(3x²−1)/2",
    assumptions:
      "Axisymmetric polynomial slice, not a full complex spherical-harmonic visualization.",
    value: (x, A) => (A * (3 * x * x - 1)) / 2,
  },
  "MA7.3": {
    title: "Trace a regular Bessel radial slice",
    x: ["Dimensionless radius", 0, 4, 1],
    parameter: ["Radial wave-number scale", 0.2, 2, 1],
    y: "J0(kr)",
    equation: "Σ(−(kr)²/4)^m/(m!)²",
    assumptions:
      "30-term convergent series restricted to kr≤8; no boundary eigenvalue is automatically imposed.",
    value: (r, k) => {
      let term = 1,
        sum = 1;
      for (let m = 1; m < 30; m++) {
        term *= -((k * r) ** 2) / (4 * m * m);
        sum += term;
      }
      return sum;
    },
  },
  "MA7.4": {
    title: "Inspect an unnormalized second oscillator mode",
    x: ["Dimensionless x", -4, 4, 0],
    parameter: ["Amplitude", 0.2, 3, 1],
    y: "Unnormalized mode amplitude",
    equation: "A(4x²−2) exp(−x²/2)",
    assumptions:
      "Physicists Hermite convention; amplitude changes norm and no physical length scale is inferred.",
    value: (x, A) => A * (4 * x * x - 2) * Math.exp((-x * x) / 2),
  },
  "MA7.5": {
    title: "Check a quadratic saddle benchmark",
    x: ["Large parameter λ", 0.2, 10, 2],
    parameter: ["Positive curvature a", 0.2, 4, 1],
    y: "Gaussian integral",
    equation: "sqrt(2π/(λa))",
    assumptions:
      "Exact for the quadratic Gaussian only; general asymptotic remainder and turning points are not modeled.",
    value: (l, a) => Math.sqrt((2 * Math.PI) / (l * a)),
  },
  "MA8.1": {
    title: "Probe repeated independent successes",
    x: ["Success probability p", 0, 1, 0.5],
    parameter: ["Integer trial count n", 1, 12, 2],
    y: "Probability of all successes",
    equation: "p^n",
    assumptions:
      "Independent identical Bernoulli trials; correlation and selection effects are omitted.",
    parameterStep: 1,
    value: (p, n) => p ** n,
  },
  "MA8.2": {
    title: "Explore independent mean precision",
    x: ["Sample count n", 1, 100, 25],
    parameter: ["Population standard deviation", 0.2, 5, 1],
    y: "Standard error",
    equation: "σ/√n",
    assumptions:
      "Independent common finite variance; does not include bias or autocorrelation.",
    value: (n, s) => s / Math.sqrt(n),
  },
  "MA8.3": {
    title: "Vary a Poisson no-event probability",
    x: ["Time interval", 0, 5, 1],
    parameter: ["Constant event rate", 0.1, 3, 1],
    y: "Probability of zero events",
    equation: "exp(−λt)",
    assumptions:
      "Homogeneous Poisson model with independent increments; no burst correlation.",
    value: (t, l) => Math.exp(-l * t),
  },
  "MA8.4": {
    title: "Compare a Gaussian standardized displacement",
    x: ["Mean displacement", -3, 3, 1],
    parameter: ["Known standard error", 0.2, 2, 1],
    y: "z statistic",
    equation: "(xbar−μ0)/SE",
    assumptions:
      "Known Gaussian sampling model; does not calibrate multiple testing or optional stopping.",
    value: (d, s) => d / s,
  },
  "MA8.5": {
    title: "Update a conjugate Bernoulli mean",
    x: ["Integer successes", 0, 20, 3],
    parameter: ["Integer failures", 0, 20, 1],
    y: "Posterior mean under Beta(1,1)",
    equation: "(s+1)/(s+f+2)",
    assumptions:
      "Independent identical Bernoulli likelihood and uniform prior; not a model-free estimate.",
    xStep: 1,
    parameterStep: 1,
    value: (s, f) => (s + 1) / (s + f + 2),
  },
  "MA8.6": {
    title: "Probe a symmetric Metropolis acceptance",
    x: ["Negative log-target change ΔU", -3, 5, 1],
    parameter: ["Inverse temperature β", 0.2, 3, 1],
    y: "Acceptance probability",
    equation: "min(1,exp(−βΔU))",
    assumptions:
      "Symmetric proposal and positive target support; no Markov chain or mixing diagnostic is executed.",
    value: (u, b) => Math.min(1, Math.exp(-b * u)),
  },
  "MA8.7": {
    title: "Combine independent precision",
    x: ["First standard deviation", 0.2, 4, 1],
    parameter: ["Second standard deviation", 0.2, 4, 1],
    y: "Uncertainty of inverse-variance mean",
    equation: "1/sqrt(1/σ1²+1/σ2²)",
    assumptions:
      "Independent unbiased Gaussian measurements with known variances; shared systematic error is excluded.",
    value: (a, b) => 1 / Math.sqrt(1 / (a * a) + 1 / (b * b)),
  },
  "MA9.1": {
    title: "Probe an Euler–Lagrange restoring law",
    x: ["Coordinate q", -3, 3, 1],
    parameter: ["Frequency ω", 0.2, 3, 1],
    y: "Acceleration",
    equation: "q″=−ω²q",
    assumptions:
      "Unit-mass quadratic Lagrangian and fixed-endpoint variation; not a minimization proof.",
    value: (q, w) => -w * w * q,
  },
  "MA9.2": {
    title: "Inspect a constrained quadratic cost",
    x: ["Coordinate x", -2, 6, 2],
    parameter: ["Fixed sum c", 1, 5, 4],
    y: "Cost along y=c−x",
    equation: "x²+(c−x)²",
    assumptions:
      "Finite-dimensional analog with regular linear constraint; not a general functional solver.",
    value: (x, c) => x * x + (c - x) ** 2,
  },
  "MA9.3": {
    title: "Check an autonomous oscillator charge",
    x: ["Phase ωt", 0, 6.283185307179586, 0],
    parameter: ["Amplitude A with ω=1", 0.2, 3, 1],
    y: "Total energy",
    equation: "(A²sin²t+A²cos²t)/2",
    assumptions:
      "Exact unit-mass unit-frequency solution; no general numerical integrator conservation claim.",
    value: (t, A) => (A * A * (Math.sin(t) ** 2 + Math.cos(t) ** 2)) / 2,
  },
};
