import type { AstroInvestigation } from "./astro-investigations";
export const physicalChemistryInvestigations: Record<
  string,
  AstroInvestigation
> = {
  "CH1.1": {
    title: "Vary a dimensionless activity in chemical potential",
    x: ["Dimensionless activity a", 0.1, 10, 1],
    parameter: ["Temperature T (R=1 units)", 0.2, 3, 1],
    y: "Chemical potential μ−μ°",
    equation: "μ−μ°=T ln a",
    assumptions:
      "A fixed standard-state convention and dimensionless activity. The standard potential can depend on temperature; this isolates its activity contribution.",
    value: (a, T) => T * Math.log(a),
  },
  "CH1.2": {
    title: "Probe a binary ideal Raoult pressure line",
    x: ["Liquid mole fraction xA", 0, 1, 0.5],
    parameter: ["Pure A vapor pressure (model pressure)", 0.5, 4, 2],
    y: "Total vapor pressure with pB*=1",
    equation: "P=xA pA*+(1−xA)pB*",
    assumptions:
      "Ideal solution, ideal vapor and specified pure-component pressures at fixed temperature. Nonideal azeotropes and liquid–liquid phase separation are not modeled.",
    value: (x, p) => x * p + 1 - x,
  },
  "CH1.3": {
    title: "Follow a constant-rate first-order concentration",
    x: ["Elapsed time (model time)", 0, 5, 1],
    parameter: ["First-order rate constant", 0.1, 3, 1],
    y: "Concentration / initial concentration",
    equation: "c/c₀=exp(−kt)",
    assumptions:
      "One effective first-order irreversible decay with constant rate coefficient. It does not identify a unique mechanism or include a reverse reaction.",
    value: (t, k) => Math.exp(-k * t),
  },
  "CH1.4": {
    title: "Separate a reduced activation barrier from transmission",
    x: ["Reduced barrier ΔG‡/(RT)", 0, 10, 2],
    parameter: ["Transmission coefficient κ", 0.1, 1, 1],
    y: "Rate / (kBT/h)",
    equation: "k/(kBT/h)=κ exp(−ΔG‡/(RT))",
    assumptions:
      "A normalized transition-state-theory estimate with a chosen standard state and transmission coefficient. Reaction free energy, tunneling and dynamical recrossing need separate treatment.",
    value: (g, k) => k * Math.exp(-g),
  },
  "CH1.5": {
    title: "Count ideal harmonic vibrational states",
    x: ["Reduced temperature T/θvib", 0.1, 3, 1],
    parameter: ["Independent identical mode count", 1, 3, 1],
    parameterStep: 1,
    y: "Zero-point-shifted vibrational partition factor",
    equation: "q=[1−exp(−θvib/T)]^(−f)",
    assumptions:
      "f independent harmonic modes with the same characteristic temperature and ground energy shifted to zero. Anharmonicity, rotations, nuclear-spin weights and zero-point absolute energies are excluded.",
    value: (t, f) => (-Math.expm1(-1 / t)) ** -Math.round(f),
  },
  "CH1.6": {
    title: "Fill independent Langmuir surface sites",
    x: ["Gas pressure (model units)", 0, 10, 1],
    parameter: ["Adsorption equilibrium coefficient", 0.1, 3, 1],
    y: "Occupied site fraction",
    equation: "θ=KP/(1+KP)",
    assumptions:
      "Equivalent independent one-occupancy equilibrium sites. This is not a turnover-rate model and excludes multilayers, lateral interactions and competing adsorbates.",
    value: (P, K) => (K * P) / (1 + K * P),
  },
  "CH1.7": {
    title: "Compare ideal and nonideal activity contributions",
    x: ["Mole fraction x", 0.01, 1, 0.5],
    parameter: ["Chosen activity coefficient γ", 0.2, 3, 1],
    y: "(μ−μ°)/(RT)",
    equation: "ln(γx)",
    assumptions:
      "A fixed activity/standard-state convention. Varying one local coefficient is illustrative; it does not construct a globally consistent multicomponent excess-Gibbs function.",
    value: (x, g) => Math.log(g * x),
  },
  "CH1.8": {
    title: "Read a dilute colligative freezing-point estimate",
    x: ["Solute molality (mol/kg)", 0, 0.2, 0.1],
    parameter: ["Effective particle factor i", 1, 3, 1],
    y: "Freezing-point depression (K), Kf=1",
    equation: "ΔTf=i Kf m",
    assumptions:
      "Dilute limiting law with an illustrative solvent Kf=1 K kg/mol. Association, dissociation and nonideal activities can invalidate an extrapolation to concentrated solution.",
    value: (m, i) => m * i,
  },
  "CH1.9": {
    title: "Track reaction quotient in a Nernst shift",
    x: ["Dimensionless reaction quotient Q", 0.1, 10, 1],
    parameter: ["Transferred electron number n", 1, 3, 1],
    parameterStep: 1,
    y: "(E−E°)/(RT/F)",
    equation: "−ln(Q)/n",
    assumptions:
      "Equilibrium reversible voltage and a specified reaction direction. Activities and integer electron count are required; kinetic, resistive and concentration drops are excluded.",
    value: (Q, n) => -Math.log(Q) / Math.round(n),
  },
  "CH1.10": {
    title: "Stay in a dilute ionic-strength limiting law",
    x: ["Ionic strength I (mol/L convention)", 0, 0.01, 0.001],
    parameter: ["Ion charge magnitude |z|", 1, 3, 1],
    parameterStep: 1,
    y: "log10 ionic activity coefficient",
    equation: "log10γ≈−0.509 z² sqrt(I/(1 mol/L))",
    assumptions:
      "Illustrative dilute aqueous limiting-law coefficient near 298 K. The concentration convention is explicit; individual-ion conventions, pairing and finite-concentration corrections require further treatment.",
    value: (I, z) => -0.509 * Math.round(z) ** 2 * Math.sqrt(I),
  },
  "CH1.11": {
    title: "Reverse a diffusive concentration gradient",
    x: ["Concentration gradient (model units)", -3, 3, 1],
    parameter: ["Positive diffusion coefficient", 0.2, 3, 1],
    y: "Signed one-dimensional particle flux",
    equation: "J=−D dc/dx",
    assumptions:
      "Isotropic dilute Fick diffusion with positive constant D and no advection/reaction. It does not substitute D for a viscosity or thermal-conduction coefficient.",
    value: (g, D) => -D * g,
  },
  "CH1.12": {
    title: "Move away from electrode equilibrium",
    x: ["Reduced overpotential Fη/(RT)", -3, 3, 0],
    parameter: ["Transfer coefficient α", 0.2, 0.8, 0.5],
    y: "Current / exchange current density",
    equation: "j/j₀=exp(αx)−exp(−(1−α)x)",
    assumptions:
      "One-electron Butler–Volmer toy with a stated current orientation. Ohmic drops, concentration limitations and full-cell voltage are not identical to this local overpotential.",
    value: (x, a) => Math.exp(a * x) - Math.exp(-(1 - a) * x),
  },
  "CH1.13": {
    title: "Count specified photochemical events per absorbed photon",
    x: ["Absorbed photon count", 1, 1000, 200],
    xStep: 1,
    parameter: ["Event quantum yield", 0.1, 3, 0.25],
    y: "Expected counted molecular events",
    equation: "Expected events=ϕ×absorbed photons",
    assumptions:
      "Synthetic expectation budget for a defined event, not a deterministic outcome count. Chain chemistry can give event yield above one using stored chemical energy; this is not an energy-conversion efficiency.",
    value: (N, f) => N * f,
  },
  "CH2.1": {
    title: "Split an orthonormal two-orbital electronic model",
    x: ["Coupling magnitude |t|", 0, 3, 0.5],
    parameter: ["Common on-site energy ε", -2, 2, -1],
    y: "Lower molecular-orbital energy",
    equation: "E−=ε−|t| for H=[[ε,t],[t,ε]]",
    assumptions:
      "Equivalent orthonormal basis states and a real two-state Hamiltonian. Nonorthogonal atomic functions require Hc=ESc; this curve is not a complete molecular bond-energy calculation.",
    value: (t, e) => e - t,
  },
  "CH2.2": {
    title: "Probe an avoided crossing of two electronic surfaces",
    x: ["Nuclear coordinate R (model units)", -2, 2, 0],
    parameter: ["Electronic coupling V", 0.1, 1, 0.3],
    y: "Lower electronic surface energy",
    equation: "E−=−sqrt(R²+V²); gap at R=0 is 2V",
    assumptions:
      "Two diabatic electronic states with diagonal slopes ±1. No nuclear motion or nonadiabatic transition probability is integrated; a small gap can challenge adiabatic following.",
    value: (R, V) => -Math.hypot(R, V),
  },
  "CH2.3": {
    title: "Minimize a normalized Gaussian trial energy",
    x: ["Gaussian width parameter a", 0.1, 3, 0.5],
    parameter: ["Oscillator angular frequency ω", 0.5, 3, 1],
    y: "Variational energy (ħ=m=1)",
    equation: "E(a)=a/2+ω²/(8a)",
    assumptions:
      "Normalized real Gaussian exp(−a x²) for a harmonic oscillator. It illustrates an admissible variational family, not the accuracy of arbitrary approximate density functionals or excitation eigenvalues.",
    value: (a, w) => a / 2 + (w * w) / (8 * a),
  },
  "CH2.4": {
    title: "Step through a rigid rotational ladder",
    x: ["Rotational quantum number J", 0, 10, 1],
    xStep: 1,
    parameter: ["Rotational constant B (model energy)", 0.2, 3, 2],
    y: "Rotational energy above J=0",
    equation: "EJ=B J(J+1)",
    assumptions:
      "Rigid linear rotor with integer J, no centrifugal distortion, spin structure or vibrational coupling. Optical transition strengths require their own matrix elements.",
    value: (J, B) => B * J * (J + 1),
  },
  "CH2.5": {
    title: "Vary a transition matrix element at fixed frequency",
    x: ["Real transition-dipole component (model units)", -3, 3, 1],
    parameter: ["Lower-state population fraction", 0.1, 1, 1],
    y: "Relative dipole absorption strength",
    equation: "Strength∝population×|μif|²",
    assumptions:
      "Frequency-related factors and polarization geometry held fixed. A zero electric-dipole component does not prohibit every higher-multipole or coupling-enabled transition.",
    value: (d, p) => p * d * d,
  },
  "CH2.6": {
    title: "Keep angular and ordinary resonance frequency distinct",
    x: ["Magnetic field (model units)", 0, 3, 1],
    parameter: ["Angular gyromagnetic magnitude |γ|", 0.5, 3, 2],
    y: "Larmor angular frequency",
    equation: "ω=|γ|B; ordinary frequency f=ω/(2π)",
    assumptions:
      "One isolated spin with a stated angular-frequency convention. Shielding, coupling multiplets, anisotropy and relaxation are not modeled by a single clock relation.",
    value: (B, g) => g * B,
  },
};
