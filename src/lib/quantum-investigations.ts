import type { AstroInvestigation } from "./astro-investigations";
export const quantumInvestigations: Record<string, AstroInvestigation> = {
  "PH8.1": {
    title: "Vary a matter-wave momentum scale",
    x: ["Positive momentum p", 0.2, 5, 1],
    parameter: ["Planck constant in model units", 0.2, 3, 1],
    y: "de Broglie wavelength",
    equation: "λ=h/p",
    assumptions:
      "Nonzero momentum benchmark; no apparatus, wavepacket preparation or measured diffraction data.",
    value: (p, h) => h / p,
  },
  "PH8.2": {
    title: "Inspect a normalized confined state",
    x: ["Fractional position x/L", 0, 1, 0.5],
    parameter: ["Well width L", 0.5, 3, 1],
    y: "Ground-state probability density",
    equation: "(2/L) sin²(πx/L)",
    assumptions:
      "Infinite one-dimensional well and normalized n=1 eigenstate; not a finite barrier.",
    value: (r, L) => (2 / L) * Math.sin(Math.PI * r) ** 2,
  },
  "PH8.3": {
    title: "Probe a normalized two-state population",
    x: ["Mixing angle θ (rad)", 0, 1.5707963267948966, 0.7853981633974483],
    parameter: ["Integer repeated-preparation count", 1, 100, 10],
    y: "Expected count in state 1",
    equation: "N sin²θ",
    assumptions:
      "Identically prepared pure states; output is an expected count, not a sampled measurement record.",
    parameterStep: 1,
    value: (t, N) => N * Math.sin(t) ** 2,
  },
  "PH8.4": {
    title: "Step through an oscillator ladder",
    x: ["Integer excitation n", 0, 10, 0],
    parameter: ["Angular frequency with ℏ=1", 0.2, 3, 1],
    y: "Energy",
    equation: "ω(n+1/2)",
    assumptions:
      "Ideal harmonic oscillator with integer n; no anharmonicity or driven-transition rate.",
    xStep: 1,
    value: (n, w) => w * (n + 0.5),
  },
  "PH8.5": {
    title: "Compare total angular momentum and projection count",
    x: ["Half-integer j", 0, 4, 0.5],
    parameter: ["Planck scale ℏ", 0.2, 3, 1],
    y: "Total angular momentum magnitude",
    equation: "ℏ sqrt(j(j+1))",
    assumptions:
      "Integer/half-integer representation labels; not a classical fixed-direction spin vector.",
    xStep: 0.5,
    value: (j, h) => h * Math.sqrt(j * (j + 1)),
  },
  "PH8.6": {
    title: "Explore a hydrogenic bound spectrum",
    x: ["Integer principal n", 1, 10, 1],
    parameter: ["Integer nuclear charge Z", 1, 4, 1],
    y: "Energy in Rydberg units",
    equation: "−Z²/n²",
    assumptions:
      "Nonrelativistic one-electron Coulomb spectrum; reduced mass and small corrections omitted.",
    xStep: 1,
    parameterStep: 1,
    value: (n, Z) => (-Z * Z) / (n * n),
  },
  "PH8.7": {
    title: "Rotate a spin measurement axis",
    x: ["Axis angle θ (rad)", 0, 3.141592653589793, 1.5707963267948966],
    parameter: ["Detection efficiency", 0.1, 1, 1],
    y: "Detected up fraction per prepared atom",
    equation: "η cos²(θ/2)",
    assumptions:
      "Ideal prepared spin-up ensemble with a simple efficiency factor; not sampled individual trajectories.",
    value: (t, e) => e * Math.cos(t / 2) ** 2,
  },
  "PH8.8": {
    title: "Follow relative-phase interference",
    x: ["Time t", 0, 6.283185307179586, 0],
    parameter: ["Energy gap divided by ℏ", 0.2, 3, 1],
    y: "Complementary plus probability",
    equation: "(1+cos(Δt))/2",
    assumptions:
      "Closed two-level unitary evolution; no environment or measurement-induced update.",
    value: (t, d) => (1 + Math.cos(d * t)) / 2,
  },
  "PH9.1": {
    title: "Inspect exact two-level energy mixing",
    x: ["Off-diagonal coupling g", 0, 2, 0.2],
    parameter: ["Positive unperturbed gap Δ", 0.2, 3, 1],
    y: "Lower energy",
    equation: "(Δ−sqrt(Δ²+4g²))/2",
    assumptions:
      "Exact finite two-state model; perturbative truncation is valid only for sufficiently small coupling/gap.",
    value: (g, d) => (d - Math.sqrt(d * d + 4 * g * g)) / 2,
  },
  "PH9.2": {
    title: "Resolve a degenerate subspace splitting",
    x: ["Off-diagonal g", -2, 2, 0.5],
    parameter: ["Perturbation scale ε", 0.1, 1, 1],
    y: "Energy splitting",
    equation: "2ε|g|",
    assumptions:
      "Two-dimensional equal-diagonal perturbation; remote-level and higher-order corrections omitted.",
    value: (g, e) => 2 * e * Math.abs(g),
  },
  "PH9.3": {
    title: "Control a resonant transition time",
    x: ["Time t", 0, 6.283185307179586, 0],
    parameter: ["Rabi angular frequency Ω", 0.2, 3, 1],
    y: "Transition probability",
    equation: "sin²(Ωt/2)",
    assumptions:
      "Resonant coherent rotating-wave two-level model; no damping or arbitrary-continuum golden-rule fit.",
    value: (t, O) => Math.sin((O * t) / 2) ** 2,
  },
  "PH9.4": {
    title: "Test a Gaussian variational upper bound",
    x: ["Positive Gaussian a", 0.2, 4, 1],
    parameter: ["Frequency ω in ℏ=m=1", 0.2, 3, 1],
    y: "Trial energy",
    equation: "(a+ω²/a)/4",
    assumptions:
      "Normalized Gaussian family for the same one-dimensional oscillator; not general WKB or a molecular project.",
    value: (a, w) => (a + (w * w) / a) / 4,
  },
  "PH9.5": {
    title: "Count two-fermion occupation configurations",
    x: ["Integer spin-orbital count K", 2, 12, 4],
    parameter: ["Integer fermion count N", 1, 2, 2],
    y: "Fermionic occupation configurations",
    equation: "choose(K,N), N=1 or 2",
    assumptions:
      "One or two identical fermions in distinct spin-orbitals; counts occupations, not a correlated helium energy.",
    xStep: 1,
    parameterStep: 1,
    value: (K, N) => (N === 1 ? K : (K * (K - 1)) / 2),
  },
  "PH9.6": {
    title: "Probe a low-energy elastic cross section",
    x: ["Wave number k", 0, 3, 0],
    parameter: ["Positive scattering length a", 0.2, 3, 1],
    y: "Cross section",
    equation: "4πa²/(1+k²a²)",
    assumptions:
      "Elastic short-range s wave with effective-range corrections omitted; not a Coulomb or multichannel model.",
    value: (k, a) => (4 * Math.PI * a * a) / (1 + k * k * a * a),
  },
  "PH9.7": {
    title: "Separate populations from purity",
    x: ["First-state probability p", 0, 1, 0.5],
    parameter: ["Mixture with maximally mixed fraction q", 0, 1, 0],
    y: "Purity",
    equation: "p′²+(1−p′)², p′=(1−q)p+q/2",
    assumptions:
      "Diagonal two-state mixture; no environment or tomography data is simulated.",
    value: (p, q) => {
      const v = (1 - q) * p + q / 2;
      return v * v + (1 - v) ** 2;
    },
  },
  "PH9.8": {
    title: "Rotate ideal entangled measurement axes",
    x: ["Relative axis angle θ (rad)", 0, 3.141592653589793, 0],
    parameter: ["Correlation visibility", 0, 1, 1],
    y: "Singlet correlation",
    equation: "−v cosθ",
    assumptions:
      "Idealized correlations with phenomenological visibility; no real Bell-test records or loophole analysis.",
    value: (t, v) => -v * Math.cos(t),
  },
  "PH10.1": {
    title: "Inspect a relativistic scalar dispersion",
    x: ["Wave number k", 0, 5, 1],
    parameter: ["Positive mass m", 0.2, 3, 1],
    y: "Positive frequency",
    equation: "sqrt(k²+m²)",
    assumptions:
      "Free Klein–Gordon branch with c=ℏ=1; not a full quantum-field or probability-current construction.",
    value: (k, m) => Math.hypot(k, m),
  },
  "PH10.2": {
    title: "Compare relativistic and rest energy scales",
    x: ["Momentum p", 0, 5, 1],
    parameter: ["Positive mass m", 0.2, 3, 1],
    y: "Kinetic energy",
    equation: "sqrt(p²+m²)−m",
    assumptions:
      "Positive free Dirac branch in c=1 units; no spinor propagation or external fields.",
    value: (p, m) => Math.hypot(p, m) - m,
  },
  "PH10.3": {
    title: "Vary a relative action phase",
    x: ["Action difference ΔS", -6, 6, 0],
    parameter: ["Positive Planck scale ℏ", 0.2, 3, 1],
    y: "Real phase weight",
    equation: "cos(ΔS/ℏ)",
    assumptions:
      "One amplitude phase, not a computed path integral, measure or propagator normalization.",
    value: (S, h) => Math.cos(S / h),
  },
  "PH10.4": {
    title: "Inspect a bosonic creation matrix element",
    x: ["Integer initial occupation n", 0, 12, 0],
    parameter: ["Positive coupling amplitude g", 0.2, 3, 1],
    y: "Squared transition matrix element",
    equation: "g²(n+1)",
    assumptions:
      "One bosonic mode and a specified operator; not a time-dependent transition probability or fermion occupation.",
    xStep: 1,
    value: (n, g) => g * g * (n + 1),
  },
  "PH10.5": {
    title: "Probe a free Fermi-density scaling",
    x: ["Positive density ratio", 0.1, 8, 1],
    parameter: ["Reference Fermi energy", 0.2, 3, 1],
    y: "Fermi-energy scale",
    equation: "EF=EF0(n/n0)^(2/3)",
    assumptions:
      "Three-dimensional free gas with fixed mass and degeneracy; not a Hartree–Fock calculation.",
    value: (n, E) => E * n ** (2 / 3),
  },
  "PH10.6": {
    title: "Follow a completely positive damping benchmark",
    x: ["Time t", 0, 5, 1],
    parameter: ["Nonnegative decay rate γ", 0.1, 3, 1],
    y: "Excited-state population",
    equation: "exp(−γt)",
    assumptions:
      "Markovian amplitude damping from an excited state; no claim that every bath is memoryless.",
    value: (t, g) => Math.exp(-g * t),
  },
};
