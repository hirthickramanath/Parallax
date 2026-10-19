import type { AstroInvestigation } from "./astro-investigations";
export const matterInvestigations: Record<string, AstroInvestigation> = {
  "PH11.1": {
    title: "Probe a subluminal Lorentz factor",
    x: ["Speed β", -0.95, 0.95, 0.6],
    parameter: ["Proper interval Δτ", 0.2, 3, 1],
    y: "Coordinate time along one inertial clock",
    equation: "Δt=γΔτ",
    assumptions:
      "Timelike inertial clock worldline; not an arbitrary pair of separated events or a light rest frame.",
    value: (b, t) => t / Math.sqrt(1 - b * b),
  },
  "PH11.2": {
    title: "Compare rest mass and total energy",
    x: ["Momentum magnitude p", 0, 5, 1],
    parameter: ["Positive rest mass m", 0.2, 3, 1],
    y: "Total energy with c=1",
    equation: "sqrt(m²+p²)",
    assumptions:
      "Free positive-energy branch; system masses require summing full four-momenta.",
    value: (p, m) => Math.hypot(p, m),
  },
  "PH11.3": {
    title: "Vary a symmetric collision invariant energy",
    x: ["Opposite momentum magnitude p", 0, 5, 1],
    parameter: ["Common rest mass m", 0.2, 3, 1],
    y: "Center-of-momentum energy",
    equation: "2sqrt(m²+p²)",
    assumptions:
      "Equal-mass head-on symmetric collider with c=1; no reaction rate or final-state phase space.",
    value: (p, m) => 2 * Math.hypot(p, m),
  },
  "PH11.4": {
    title: "Rotate a relativistic photon direction",
    x: ["Original direction cosine", -1, 1, 0],
    parameter: ["Boost β", -0.9, 0.9, 0.6],
    y: "Transformed direction cosine",
    equation: "(μ−β)/(1−βμ)",
    assumptions:
      "One inertial Lorentz boost convention; no accelerated frame or Thomas-precession integration.",
    value: (u, b) => (u - b) / (1 - b * u),
  },
  "PH12.1": {
    title: "Inspect a hydrogenic splitting scale",
    x: ["Integer nuclear charge Z", 1, 8, 1],
    parameter: ["Integer principal n", 1, 6, 1],
    y: "Relative splitting scale",
    equation: "Z⁴/n³",
    assumptions:
      "Scaling toy with unit coefficient, not a complete fine/hyperfine spectrum or high-Z prediction.",
    xStep: 1,
    parameterStep: 1,
    value: (Z, n) => Z ** 4 / n ** 3,
  },
  "PH12.2": {
    title: "Count an LS angular-momentum multiplet",
    x: ["Integer orbital L", 0, 4, 1],
    parameter: ["Half-integer total spin S", 0.5, 2, 0.5],
    y: "Number of allowed J values",
    equation: "2min(L,S)+1",
    assumptions:
      "LS coupling with allowed integer L and half-integer/integer S; counting does not determine a ground term.",
    xStep: 1,
    parameterStep: 0.5,
    value: (L, S) => 2 * Math.min(L, S) + 1,
  },
  "PH12.3": {
    title: "Vary a weak-field Zeeman level shift",
    x: ["Signed magnetic field B", -3, 3, 1],
    parameter: ["Chosen gJ mJ factor", -2, 2, 1],
    y: "Level shift with μB=1",
    equation: "ΔE=(gJ mJ)B",
    assumptions:
      "One weak-field level with prescribed allowed quantum labels; no complete spectrum or strong-field remixing.",
    value: (B, g) => g * B,
  },
  "PH12.4": {
    title: "Separate rotor energies from spectral strengths",
    x: ["Integer rotational J", 0, 10, 1],
    parameter: ["Rotational constant B", 0.2, 3, 1],
    y: "Rotational energy",
    equation: "BJ(J+1)",
    assumptions:
      "Rigid rotor with B in energy units; no intensity, anharmonicity or radiative transfer calculation.",
    xStep: 1,
    value: (J, B) => B * J * (J + 1),
  },
  "PH12.5": {
    title: "Probe a detuned atom-light transition",
    x: ["Time t", 0, 8, 0],
    parameter: ["Detuning Δ with Ω=1", -3, 3, 0],
    y: "Excitation probability",
    equation: "sin²(sqrt(1+Δ²)t/2)/(1+Δ²)",
    assumptions:
      "Coherent rotating-wave model; spontaneous decay, motion and laser noise omitted.",
    value: (t, d) =>
      Math.sin((Math.sqrt(1 + d * d) * t) / 2) ** 2 / (1 + d * d),
  },
  "PH12.6": {
    title: "Compare atomic recoil scales",
    x: ["Photon wave number k", 0.2, 4, 1],
    parameter: ["Positive atomic mass m", 0.2, 5, 1],
    y: "Recoil energy with ℏ=1",
    equation: "k²/(2m)",
    assumptions:
      "Single-photon momentum kick; not a cooling simulation or condensation criterion.",
    value: (k, m) => (k * k) / (2 * m),
  },
  "PH13.1": {
    title: "Probe a saturated nuclear-size scaling",
    x: ["Integer mass number A", 1, 250, 64],
    parameter: ["Radius coefficient r0", 0.5, 2, 1],
    y: "Nuclear radius scale",
    equation: "r0 A^(1/3)",
    assumptions:
      "Empirical saturation scaling; not a complete liquid-drop binding or shell-model calculation.",
    xStep: 1,
    value: (A, r) => r * Math.cbrt(A),
  },
  "PH13.2": {
    title: "Follow a fed radioactive daughter",
    x: ["Time t", 0, 5, 1],
    parameter: ["Parent decay rate λA", 0.2, 1.8, 1],
    y: "Expected daughter fraction",
    equation: "λA[e^(−λAt)−e^(−2t)]/(2−λA)",
    assumptions:
      "Two-step unit parent, initially zero daughter, fixed daughter rate two; equal-rate limit excluded from slider.",
    value: (t, l) => (l * (Math.exp(-l * t) - Math.exp(-2 * t))) / (2 - l),
  },
  "PH13.3": {
    title: "Separate nuclear Q from reaction rate",
    x: ["Signed mass defect Δm", -2, 2, 0.2],
    parameter: ["Energy conversion c²", 0.5, 3, 1],
    y: "Reaction Q",
    equation: "Q=Δm c²",
    assumptions:
      "Rest-energy bookkeeping only; no reaction cross section, barrier penetration or recoil threshold solver.",
    value: (m, c2) => m * c2,
  },
  "PH13.4": {
    title: "Inspect a pair-production kinetic budget",
    x: ["Center-of-momentum energy", 0, 10, 4],
    parameter: ["Common final rest mass", 0.2, 3, 1],
    y: "Nonnegative excess above threshold",
    equation: "max(0,Ecm−2m)",
    assumptions:
      "Zero below threshold means forbidden kinematics, not an actual zero-energy event; interaction rates omitted.",
    value: (E, m) => Math.max(0, E - 2 * m),
  },
  "PH13.5": {
    title: "Normalize two partial decay channels",
    x: ["First positive partial rate", 0.1, 4, 2],
    parameter: ["Second positive partial rate", 0.1, 4, 3],
    y: "Channel-one branching fraction",
    equation: "Γ1/(Γ1+Γ2)",
    assumptions:
      "Assumes exactly two allowed channels; rates are inputs, not derived Standard Model matrix elements.",
    value: (a, b) => a / (a + b),
  },
  "PH13.6": {
    title: "Probe a normalized count asymmetry",
    x: ["Expected count N", 1, 200, 120],
    parameter: ["Expected conjugate count Nbar", 1, 200, 80],
    y: "Count asymmetry",
    equation: "(N−Nbar)/(N+Nbar)",
    assumptions:
      "Positive expected counts; no sampled significance, efficiency correction or CP-amplitude calculation.",
    value: (n, b) => (n - b) / (n + b),
  },
  "PH13.7": {
    title: "Vary a charged-track curvature radius",
    x: ["Transverse momentum", 0.2, 6, 1],
    parameter: ["Positive field magnitude with |q|=1", 0.2, 3, 1],
    y: "Bending radius",
    equation: "r=pT/B",
    assumptions:
      "Uniform perpendicular magnetic field and unit charge; scattering and reconstruction errors omitted.",
    value: (p, B) => p / B,
  },
  "PH14.1": {
    title: "Probe a first-order Bragg condition",
    x: ["Plane angle θ (rad)", 0, 1.5707963267948966, 0.5235987755982988],
    parameter: ["Plane spacing d", 0.2, 3, 1],
    y: "Allowed first-order wavelength",
    equation: "λ=2d sinθ",
    assumptions:
      "θ is to the lattice planes, not detector 2θ; structure factors and finite crystal width omitted.",
    value: (t, d) => 2 * d * Math.sin(t),
  },
  "PH14.2": {
    title: "Trace a harmonic lattice branch",
    x: [
      "Dimensionless wave number ka",
      -3.141592653589793,
      3.141592653589793,
      0,
    ],
    parameter: ["Spring constant K with m=1", 0.2, 3, 1],
    y: "Angular frequency",
    equation: "2sqrt(K)|sin(ka/2)|",
    assumptions:
      "Monatomic harmonic nearest-neighbor chain, a=m=1; no scattering or optical branch.",
    value: (k, K) => 2 * Math.sqrt(K) * Math.abs(Math.sin(k / 2)),
  },
  "PH14.3": {
    title: "Probe a thermal Fermi occupation",
    x: ["Energy relative to μ", -4, 4, 0],
    parameter: ["Temperature with k=1", 0.2, 3, 1],
    y: "Occupation per spin-orbital",
    equation: "1/[exp((E−μ)/T)+1]",
    assumptions:
      "Positive temperature and prescribed chemical potential; no material density-of-states calculation.",
    value: (e, T) => 1 / (Math.exp(e / T) + 1),
  },
  "PH14.4": {
    title: "Probe a band slope rather than its height",
    x: [
      "Dimensionless wave number ka",
      -3.141592653589793,
      3.141592653589793,
      0,
    ],
    parameter: ["Hopping energy t", 0.2, 3, 1],
    y: "Group velocity with a=ℏ=1",
    equation: "2t sin(ka)",
    assumptions:
      "One tight-binding band; filling, scattering and interactions are not solved.",
    value: (k, t) => 2 * t * Math.sin(k),
  },
  "PH14.5": {
    title: "Inspect an intrinsic activation factor",
    x: ["Temperature with k=1", 0.2, 3, 1],
    parameter: ["Positive band gap Eg", 0.2, 5, 1],
    y: "Relative carrier factor",
    equation: "exp(−Eg/(2T))",
    assumptions:
      "Fixed prefactor and nondegenerate intrinsic limit; no doped junction, mobility or contact model.",
    value: (T, g) => Math.exp(-g / (2 * T)),
  },
  "PH14.6": {
    title: "Probe an ideal paramagnetic response",
    x: ["Positive temperature", 0.2, 5, 1],
    parameter: ["Curie constant C", 0.2, 3, 1],
    y: "Susceptibility",
    equation: "χ=C/T",
    assumptions:
      "Weak-field ideal Curie regime; interactions, ordering, saturation and hysteresis excluded.",
    value: (T, C) => C / T,
  },
  "PH14.7": {
    title: "Inspect a conventional gap interpolation",
    x: ["Reduced temperature T/Tc", 0.05, 0.99, 0.5],
    parameter: ["Zero-temperature gap Δ0", 0.2, 3, 1],
    y: "Approximate superconducting gap",
    equation: "Δ0 tanh[1.74sqrt(Tc/T−1)]",
    assumptions:
      "Conventional BCS interpolation strictly below Tc; not universal or a field-driven transition calculation.",
    value: (r, d) => d * Math.tanh(1.74 * Math.sqrt(1 / r - 1)),
  },
  "PH14.8": {
    title: "Step through ideal integer Hall plateaus",
    x: ["Integer filling ν", 1, 8, 1],
    parameter: ["Integer identical parallel layers", 1, 3, 1],
    y: "Conductance in e²/h units",
    equation: "layers × ν",
    assumptions:
      "Ideal integer plateaus and independent identical parallel layers; no derived Chern number or fractional Hall model.",
    xStep: 1,
    parameterStep: 1,
    value: (n, l) => n * l,
  },
};
