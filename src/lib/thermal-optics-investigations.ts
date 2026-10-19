import type { AstroInvestigation } from "./astro-investigations";
export const thermalOpticsInvestigations: Record<string, AstroInvestigation> = {
  "PH3.1": {
    title: "Follow a nonlinear logistic orbit",
    x: ["Iteration number n", 0, 80, 10],
    xStep: 1,
    parameter: ["Logistic parameter r", 2.5, 4, 3.8],
    y: "Orbit value starting at x₀=0.2",
    equation: "x[n+1]=r x[n](1−x[n])",
    assumptions:
      "Discrete deterministic map with a fixed initial state; connecting segments are visual guides between integer iterates. This is not a driven-pendulum integration or a computed Lyapunov exponent.",
    value: (n, r) => {
      let x = 0.2;
      for (let i = 0; i < Math.round(n); i++) x = r * x * (1 - x);
      return x;
    },
  },
  "PH3.2": {
    title: "Read a reversible small-strain response",
    x: ["Uniaxial strain ε", -0.02, 0.02, 0.01],
    parameter: ["Young modulus (model pressure)", 1, 5, 2],
    y: "Uniaxial stress (model pressure)",
    equation: "σ=Eε",
    assumptions:
      "Small reversible uniaxial Hooke regime. Negative strain is compression; plasticity, fracture, hysteresis and a full anisotropic stress tensor are excluded.",
    value: (e, E) => E * e,
  },
  "PH3.3": {
    title: "Probe a laminar pipe velocity profile",
    x: ["Signed radial coordinate r/R", -1, 1, 0],
    parameter: ["Positive pressure-drop gradient G", 0.2, 4, 1],
    y: "Axial speed for η=R=1",
    equation: "v=G(1−r²)/4",
    assumptions:
      "Steady fully developed incompressible Newtonian circular-pipe flow with no slip. It is a laminar solution, not a turbulence or arbitrary-Reynolds stability calculation.",
    value: (r, G) => (G * (1 - r * r)) / 4,
  },
  "PH3.4": {
    title: "Move from shallow to deep gravity-wave dispersion",
    x: ["Wave number k (g=1 units)", 0.1, 5, 1],
    parameter: ["Fluid depth h (same length units)", 0.2, 5, 1],
    y: "Phase speed",
    equation: "ω²=k tanh(kh); vphase=sqrt(tanh(kh)/k)",
    assumptions:
      "Linear inviscid incompressible surface gravity waves without capillarity. Nonlinear steepening, viscosity and turbulent coupling are excluded.",
    value: (k, h) => Math.sqrt(Math.tanh(k * h) / k),
  },
  "PH6.1": {
    title: "Compare a derivative speed with a phase ratio",
    x: ["Wave number k (model units)", 0.1, 3, 1],
    parameter: ["Cubic dispersion coefficient a", 0, 2, 1],
    y: "Group speed for ω=2k+a k³",
    equation: "vg=dω/dk=2+3ak²; vphase=2+ak²",
    assumptions:
      "Illustrative narrow-band scalar dispersion in normalized units over its chosen range. This polynomial is not a universal material dispersion or a high-frequency signal-speed law.",
    value: (k, a) => 2 + 3 * a * k * k,
  },
  "PH6.2": {
    title: "Move across interference fringes inside a diffraction envelope",
    x: ["Phase coordinate u=πd sinθ/λ", -6, 6, 0],
    parameter: ["Slit width/separation a/d", 0.1, 0.8, 0.2],
    y: "Intensity / central intensity",
    equation: "I/I0=cos²u·sinc²((a/d)u)",
    assumptions:
      "Equal coherent rectangular slits in the far field with a<d. The sinc at zero is its limit one; partial coherence, unequal amplitudes and near-field geometry are omitted.",
    value: (u, a) =>
      Math.cos(u) ** 2 *
      (Math.abs(a * u) < 1e-10 ? 1 : Math.sin(a * u) / (a * u)) ** 2,
  },
  "PH6.3": {
    title: "Vary coherence while retaining equal beam strengths",
    x: ["Relative phase φ (radians)", -Math.PI, Math.PI, 0],
    parameter: ["Coherence magnitude γ", 0, 1, 1],
    y: "Intensity for each input I₀=1",
    equation: "I=2(1+γ cosφ)",
    assumptions:
      "Two equal-intensity beams and an isolated real coherence magnitude. Low visibility from unequal input intensities is a separate mechanism absent from this controlled display.",
    value: (p, g) => 2 * (1 + g * Math.cos(p)),
  },
  "PH6.4": {
    title: "Turn a linear analyzer",
    x: ["Analyzer angle (degrees)", 0, 180, 0],
    parameter: ["Incident linearly polarized intensity", 0.2, 5, 1],
    y: "Transmitted intensity",
    equation: "I=I₀ cos²θ",
    assumptions:
      "Ideal absorbing linear analyzer and a specified linear incident polarization. Unpolarized averaging and birefringent phase retardation are different operations.",
    value: (a, I) => I * Math.cos((a * Math.PI) / 180) ** 2,
  },
  "PH6.5": {
    title: "Test the noninverting two-level pump limit",
    x: ["Incoherent pump rate R", 0, 5, 1],
    parameter: ["Spontaneous decay rate Γ", 0.2, 3, 1],
    y: "Steady excited-state fraction",
    equation: "pe=R/(2R+Γ)",
    assumptions:
      "Symmetric stimulated upward/downward pumping plus spontaneous decay in a two-level rate model. It is not a multilevel laser, coherent Rabi evolution or a full cavity calculation.",
    value: (R, G) => R / (2 * R + G),
  },
  "PH7.1": {
    title: "Read an isothermal Helmholtz volume contribution",
    x: ["Volume ratio V/V₀", 0.2, 4, 1],
    parameter: ["Temperature (Nk=1 units)", 0.2, 3, 1],
    y: "F(V)−F(V₀) at fixed T",
    equation: "ΔF=−T ln(V/V₀)",
    assumptions:
      "Fixed-particle ideal gas and an isothermal volume difference. Temperature-only terms cancel from this difference but must be restored for entropy or energy derivatives.",
    value: (V, T) => -T * Math.log(V),
  },
  "PH7.2": {
    title: "Probe the classical three-dimensional speed density",
    x: ["Speed v (m=k=1 units)", 0, 5, 1],
    parameter: ["Temperature T", 0.2, 3, 1],
    y: "Maxwell speed probability density",
    equation: "f(v)=4π(1/(2πT))^(3/2) v² exp(−v²/(2T))",
    assumptions:
      "Classical noninteracting equilibrium gas in three dimensions. Probability is the area over a speed interval; this density is not a point probability or a quantum-degenerate distribution.",
    value: (v, T) =>
      4 *
      Math.PI *
      (1 / (2 * Math.PI * T)) ** 1.5 *
      v *
      v *
      Math.exp((-v * v) / (2 * T)),
  },
  "PH7.3": {
    title: "Combine independent state multiplicities",
    x: ["Subsystem A multiplicity", 1, 100, 4],
    xStep: 1,
    parameter: ["Subsystem B multiplicity", 1, 100, 3],
    parameterStep: 1,
    y: "Total entropy in k units",
    equation: "S/k=ln(ΩAΩB)=lnΩA+lnΩB",
    assumptions:
      "Positive integer microstate counts for independently combinable subsystem states under consistent constraints. This is a synthetic count budget, not an enumeration of a real many-body system.",
    value: (a, b) => Math.log(a) + Math.log(b),
  },
  "PH7.4": {
    title: "Thermally populate a two-level spectrum",
    x: ["Temperature T (k=1 units)", 0.1, 5, 1],
    parameter: ["Energy gap Δ", 0.2, 4, 1],
    y: "Canonical excited probability",
    equation: "pe=1/[1+exp(Δ/T)]",
    assumptions:
      "Two nondegenerate levels 0 and Δ in canonical equilibrium, not a driven population. Additional degeneracy changes the partition function.",
    value: (T, d) => 1 / (1 + Math.exp(d / T)),
  },
  "PH7.5": {
    title: "Exchange particles with a one-level fermion reservoir",
    x: ["Chemical potential μ", -3, 3, 1],
    parameter: ["Temperature T (k=1 units)", 0.2, 3, 1],
    y: "Mean occupation of level ε=1",
    equation: "n=1/[exp((1−μ)/T)+1]",
    assumptions:
      "One spinless noninteracting fermionic mode, occupations zero or one. This is a grand canonical mean and does not remove particle-number fluctuations.",
    value: (u, T) => 1 / (1 + Math.exp((1 - u) / T)),
  },
  "PH7.6": {
    title: "Compare Bose and Fermi mode occupations",
    x: ["Reduced energy x=β(ε−μ)", 0.1, 5, 1],
    parameter: ["Statistics: 0=Fermi, 1=Bose", 0, 1, 0],
    parameterStep: 1,
    y: "Mean occupation per mode",
    equation: "nF=1/(exp x+1); nB=1/(exp x−1)",
    assumptions:
      "One ideal noninteracting mode without extra degeneracy. The bosonic branch is restricted to x>0; the singular zero-energy/condensate limit is not crossed.",
    value: (x, s) => 1 / (Math.exp(x) + (Math.round(s) === 0 ? 1 : -1)),
  },
  "PH7.7": {
    title: "Stay inside the low-temperature Debye regime",
    x: ["Reduced temperature T/ΘD", 0, 0.15, 0.05],
    parameter: ["Atom-count scale N", 1, 3, 1],
    parameterStep: 1,
    y: "Heat capacity / k",
    equation: "Cv/k≈(12π⁴/5)N(T/ΘD)³",
    assumptions:
      "Low-temperature three-dimensional Debye asymptotic expression. The reduced-temperature range is deliberately small; it is not the high-temperature mode-count saturation curve.",
    value: (t, N) => ((12 * Math.PI ** 4) / 5) * N * t ** 3,
  },
  "PH7.8": {
    title: "Follow one mean-field order-parameter branch",
    x: ["Reduced quadratic coefficient t=a(T−Tc)", -1, 1, -0.5],
    parameter: ["Positive quartic coefficient b", 0.2, 3, 1],
    y: "Positive equilibrium m branch",
    equation: "F=t m²+b m⁴; m+=sqrt(max(0,−t/(2b)))",
    assumptions:
      "Zero-field quartic mean-field model with b>0; the symmetric negative branch also exists below the transition. Fluctuations, nucleation and first-order variants are excluded.",
    value: (t, b) => Math.sqrt(Math.max(0, -t / (2 * b))),
  },
  "PH7.9": {
    title: "Read the exact zero-field chain correlation length",
    x: ["Temperature T (k=1 units)", 0.2, 4, 1],
    parameter: ["Ferromagnetic coupling J", 0.2, 2, 1],
    y: "Correlation length in lattice spacings",
    equation: "ξ=−1/ln[tanh(J/T)]",
    assumptions:
      "Infinite one-dimensional nearest-neighbor Ising chain at zero field and positive temperature. It has no positive-temperature ordering transition; this is not the square-lattice phase diagram.",
    value: (T, J) => -1 / Math.log(Math.tanh(J / T)),
  },
  "PH7.10": {
    title: "Balance damping and noise in an exact OU variance",
    x: ["Elapsed time", 0, 4, 1],
    parameter: ["Positive damping γ", 0.2, 3, 1],
    y: "Variance from initial value zero",
    equation: "dx=−γx dt+sqrt(2γ)dW; Var[x]=1−exp(−2γt)",
    assumptions:
      "Normalized Ornstein–Uhlenbeck stochastic model with matched noise and unit equilibrium variance. This is an analytic moment, not a sampled random trajectory or a full Boltzmann collision solver.",
    value: (t, g) => -Math.expm1(-2 * g * t),
  },
};
