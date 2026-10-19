import type { AstroInvestigation } from "./astro-investigations";
export const foundationNextInvestigations: Record<string, AstroInvestigation> =
  {
    "MB1.1": {
      title: "Probe a quadratic sign region",
      x: ["Coordinate x", -4, 4, 0],
      parameter: ["Positive half-separation a", 0.2, 3, 1],
      y: "Signed quadratic",
      equation: "x²−a²",
      assumptions:
        "Symmetric-root example; exact endpoint inclusion comes from the stated inequality, not plot resolution.",
      value: (x, a) => x * x - a * a,
    },
    "MB1.2": {
      title: "Keep a logarithm domain explicit",
      x: ["Positive x", 0.05, 5, 1],
      parameter: ["Positive scale a", 0.2, 3, 1],
      y: "Natural logarithm",
      equation: "ln(ax)",
      assumptions:
        "Positive real arguments only; complex logarithm branches are excluded.",
      value: (x, a) => Math.log(a * x),
    },
    "MB1.3": {
      title: "Inspect an exact geometric tail",
      x: ["Integer last retained index N", 0, 20, 3],
      parameter: ["Ratio r", 0.1, 0.9, 0.5],
      y: "Infinite tail after index N",
      equation: "r^(N+1)/(1−r)",
      assumptions:
        "Positive convergent geometric series only; N is an integer and indexing begins at zero.",
      xStep: 1,
      value: (N, r) => r ** (N + 1) / (1 - r),
    },
    "MB1.4": {
      title: "Check a triangular-number identity",
      x: ["Integer n", 1, 30, 5],
      parameter: ["Integer starting offset m", 0, 5, 0],
      y: "Sum of n consecutive shifted integers",
      equation: "n(n+1)/2+mn",
      assumptions:
        "Finite exact-arithmetic diagnostic within small integers; not a substitute for induction.",
      xStep: 1,
      parameterStep: 1,
      value: (n, m) => (n * (n + 1)) / 2 + m * n,
    },
    "MB2.1": {
      title: "Track a signed sinusoidal value",
      x: ["Phase θ (rad)", 0, 6.283185307179586, 0],
      parameter: ["Amplitude A", 0.2, 3, 1],
      y: "Signed amplitude",
      equation: "A sinθ",
      assumptions:
        "Radian phase and positive amplitude; a principal inverse value does not enumerate every root.",
      value: (t, A) => A * Math.sin(t),
    },
    "MB4.1": {
      title: "Explore signed matrix area scaling",
      x: ["First diagonal scale x", -3, 3, 1],
      parameter: ["Positive second diagonal scale a", 0.2, 3, 1],
      y: "Determinant",
      equation: "det diag(x,a)=ax",
      assumptions:
        "Diagonal matrix toy; determinant sign tracks orientation but not full conditioning.",
      value: (x, a) => a * x,
    },
    "MB4.2": {
      title: "Separate signed projection from length",
      x: ["Angle θ (rad)", 0, 3.141592653589793, 1.5707963267948966],
      parameter: ["Second vector magnitude", 0.2, 3, 1],
      y: "Dot product with a unit vector",
      equation: "b cosθ",
      assumptions:
        "Euclidean orthonormal geometry; the plotted signed scalar is not a cross-product magnitude.",
      value: (t, b) => b * Math.cos(t),
    },
    "MB4.3": {
      title: "Probe a base-rate update",
      x: ["Prior prevalence p", 0.001, 0.5, 0.01],
      parameter: ["False-positive rate f", 0.001, 0.2, 0.01],
      y: "Posterior after positive",
      equation: "0.9p/[0.9p+f(1−p)]",
      assumptions:
        "Sensitivity fixed at 0.9; illustrative population model, not a calibrated medical test.",
      value: (p, f) => (0.9 * p) / (0.9 * p + f * (1 - p)),
    },
    "MB4.4": {
      title: "Inspect independent Bernoulli sum variance",
      x: ["Success probability p", 0, 1, 0.5],
      parameter: ["Integer number of trials n", 1, 20, 4],
      y: "Variance of the sum",
      equation: "np(1−p)",
      assumptions:
        "Independent identical Bernoulli trials; this is a sum variance, not a mean variance.",
      parameterStep: 1,
      value: (p, n) => n * p * (1 - p),
    },
    "PB2.3": {
      title: "Probe a classical thermal speed",
      x: ["Temperature with k=1", 0.2, 5, 1],
      parameter: ["Particle mass", 0.2, 5, 1],
      y: "Rms speed",
      equation: "sqrt(3T/m)",
      assumptions:
        "Classical monatomic ideal gas; not a full velocity distribution or quantum-degenerate model.",
      value: (T, m) => Math.sqrt((3 * T) / m),
    },
    "PB3.1": {
      title: "Inspect a spatial wave slice",
      x: ["Position x", 0, 4, 0],
      parameter: ["Wave number k", 0.2, 5, 1],
      y: "Displacement with A=1",
      equation: "cos(kx) at t=0",
      assumptions:
        "Single linear sinusoidal spatial slice; not an animated material trajectory.",
      value: (x, k) => Math.cos(k * x),
    },
    "PB3.2": {
      title: "Probe a paraxial real-image distance",
      x: ["Object distance in focal lengths u/f", 1.2, 6, 3],
      parameter: ["Positive focal length f", 0.2, 3, 1],
      y: "Image distance",
      equation: "v=f(u/f)/[(u/f)−1]",
      assumptions:
        "Converging thin lens, real object beyond focus, paraxial convention; aberrations omitted.",
      value: (r, f) => (f * r) / (r - 1),
    },
    "PB3.3": {
      title: "Control a two-wave relative phase",
      x: ["Phase difference δ (rad)", 0, 6.283185307179586, 0],
      parameter: ["Single-wave intensity I0", 0.2, 3, 1],
      y: "Combined intensity",
      equation: "2I0(1+cosδ)",
      assumptions:
        "Coherent equal-amplitude waves; no diffraction envelope or finite-band coherence integration.",
      value: (d, I) => 2 * I * (1 + Math.cos(d)),
    },
    "PB4.1": {
      title: "Compare a signed radial electric field",
      x: ["Positive radius r", 0.2, 4, 1],
      parameter: ["Charge q with k=1", -3, 3, 1],
      y: "Outward radial field",
      equation: "q/r²",
      assumptions:
        "Point source away from r=0; radial sign is a direction component, not a magnitude.",
      value: (r, q) => q / (r * r),
    },
    "PB4.3": {
      title: "Probe a normalized straight-wire field",
      x: ["Radius from wire", 0.2, 4, 1],
      parameter: ["Signed current", -3, 3, 1],
      y: "Signed tangential component",
      equation: "Bφ=I/r when μ0/(2π)=1",
      assumptions:
        "Infinite straight-wire static idealization; no transient induction or finite-wire end effects.",
      value: (r, I) => I / r,
    },
    "PB4.4": {
      title: "Inspect instantaneous resistor power",
      x: ["Phase ωt", 0, 6.283185307179586, 0],
      parameter: ["Positive resistance with V0=1", 0.2, 3, 1],
      y: "Instantaneous power",
      equation: "cos²(ωt)/R",
      assumptions:
        "Pure resistor and unit peak voltage; reactive phase shifts and power factor are excluded.",
      value: (t, R) => Math.cos(t) ** 2 / R,
    },
    "PB5.1": {
      title: "Probe a photoelectric threshold",
      x: ["Photon energy hf", 0, 6, 3],
      parameter: ["Positive work function Φ", 0.2, 3, 1],
      y: "Nonnegative energy excess",
      equation: "max(0,hf−Φ)",
      assumptions:
        "Single-photon model; below threshold there is no emission, not a measured zero-energy electron.",
      value: (E, W) => Math.max(0, E - W),
    },
    "PB5.2": {
      title: "Follow an expected decay population",
      x: ["Elapsed time", 0, 6, 1],
      parameter: ["Decay constant λ with N0=100", 0.1, 2, 1],
      y: "Expected surviving count",
      equation: "100 exp(−λt)",
      assumptions:
        "Independent decay expectation; noninteger values are expected counts, not sampled nuclei.",
      value: (t, l) => 100 * Math.exp(-l * t),
    },
    "PB5.3": {
      title: "Probe a normalized diode response",
      x: ["Voltage V/VT", -3, 3, 0],
      parameter: ["Ideality factor n", 1, 2, 1],
      y: "Current I/Is",
      equation: "exp[(V/VT)/n]−1",
      assumptions:
        "Ideal diode regime only; no series resistance, self-heating, breakdown or component rating.",
      value: (v, n) => Math.expm1(v / n),
    },
  };
