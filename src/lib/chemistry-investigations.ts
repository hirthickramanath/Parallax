import type { AstroInvestigation } from "./astro-investigations";
export const chemistryInvestigations: Record<string, AstroInvestigation> = {
  "CB1.3": {
    title: "Combine equilibrium preference with a conserved amount",
    x: ["Reduced standard reaction Gibbs energy", -3, 3, 0],
    parameter: ["Total A+B amount (model amount)", 1, 3, 1],
    y: "Equilibrium amount of B",
    equation: "A⇌B; K=exp(−g); B=N/(1+exp(g))",
    assumptions:
      "Ideal two-species interconversion at fixed temperature and volume, with conserved total amount. This is an equilibrium balance, not a kinetic mechanism or a complete nonideal reaction network.",
    value: (g, N) => N / (1 + Math.exp(g)),
  },
  "CB1.4": {
    title: "Compare a reduced barrier at fixed Arrhenius prefactor",
    x: ["Reduced activation energy Ea/(RT)", 0, 10, 2],
    parameter: ["Rate prefactor A (model units)", 0.2, 3, 1],
    y: "Rate coefficient",
    equation: "k=A exp(−Ea/(RT))",
    assumptions:
      "A chosen effective Arrhenius model. Changing a barrier does not automatically change equilibrium free energy or determine the voltage/power of an operating electrochemical cell.",
    value: (g, A) => A * Math.exp(-g),
  },
  "CB1.5": {
    title: "Probe a characteristic harmonic bond-stretch scale",
    x: ["Reduced mass (model mass)", 0.5, 5, 1],
    parameter: ["Effective restoring coefficient", 0.2, 5, 1],
    y: "Angular stretch frequency",
    equation: "ω=sqrt(k/μ)",
    assumptions:
      "One isolated harmonic coordinate. Real molecular normal modes mix atoms and can be anharmonic; one characteristic frequency is not a unique organic structure identification.",
    value: (m, k) => Math.sqrt(k / m),
  },
  "CH3.1": {
    title: "Compare a two-level molecular LTE ratio",
    x: ["Temperature (k=1 units)", 0.1, 5, 1],
    parameter: ["Excitation energy gap", 0.2, 3, 1],
    y: "Excited/ground population ratio",
    equation: "n1/n0=exp(−Δ/T) for unit degeneracies",
    assumptions:
      "Two unit-degeneracy levels in local thermodynamic equilibrium. This is a ratio, not a normalized fraction; non-LTE pumping, line opacity and a full partition sum are omitted.",
    value: (T, d) => Math.exp(-d / T),
  },
  "CH3.2": {
    title: "Vary a grain surface-site budget",
    x: ["Grain radius (model length)", 0.2, 3, 1],
    parameter: ["Surface site density (sites/model area)", 1, 5, 1],
    y: "Continuum estimate of surface sites",
    equation: "Nsite≈4πa² ns",
    assumptions:
      "Spherical grain and uniform site density; the continuum estimate need not be an integer. Adsorption, migration, sparse occupancy, reaction and desorption dynamics are not solved.",
    value: (r, n) => 4 * Math.PI * r * r * n,
  },
  "CH3.3": {
    title: "Step through a radio rotational line ladder",
    x: ["Lower rotational quantum number J", 0, 10, 1],
    xStep: 1,
    parameter: ["Rotational constant in frequency units", 0.2, 3, 1],
    y: "J to J+1 transition frequency",
    equation: "ν=2B(J+1)",
    assumptions:
      "Rigid linear rotor with integer J and B expressed in frequency units. Hyperfine structure, isotopes, radiative transfer and observed redshift/velocity corrections need separate treatment.",
    value: (J, B) => 2 * B * (J + 1),
  },
  "CH4.1": {
    title: "Check formal nitrogen electron bookkeeping",
    x: ["Nonbonding electron count on N", 0, 6, 2],
    xStep: 1,
    parameter: ["Bond-order sum around N", 0, 4, 3],
    parameterStep: 1,
    y: "Formal charge on nitrogen",
    equation: "FC=5−nonbonding electrons−bond-order sum",
    assumptions:
      "Ordinary two-electron Lewis-bond assignment and nitrogen valence count five. Sliders only test arithmetic; total electrons, octet/charge constraints and chemical stability must still be checked.",
    value: (n, b) => 5 - n - b,
  },
  "CH4.3": {
    title: "Separate bonding from antibonding occupancy",
    x: ["Bonding electron count", 0, 10, 2],
    xStep: 1,
    parameter: ["Antibonding electron count", 0, 10, 0],
    parameterStep: 1,
    y: "Formal MO bond order",
    equation: "Bond order=(Nb−Na)/2",
    assumptions:
      "Occupation bookkeeping for a defined orbital set. The controls do not assign a ground configuration, Hund occupations or a particular real diatomic molecule.",
    value: (b, a) => (b - a) / 2,
  },
  "CH4.5": {
    title: "Find a pair-potential zero and its minimum separately",
    x: ["Separation r/σ", 0.85, 3, 2 ** (1 / 6)],
    parameter: ["Well-depth scale ε", 0.2, 3, 1],
    y: "Lennard–Jones pair energy",
    equation: "U=4ε[(σ/r)^12−(σ/r)^6]",
    assumptions:
      "Isotropic pair-potential toy; σ is the zero crossing and the minimum occurs at 2^(1/6)σ. Hydrogen bonding, angular multipoles, many-body interactions and liquid dynamics are excluded.",
    value: (r, e) => 4 * e * (r ** -12 - r ** -6),
  },
  "CH4.6": {
    title: "Trace an elementary tight-binding band",
    x: ["Dimensionless wave number ka", -Math.PI, Math.PI, 0],
    parameter: ["Positive hopping t (model energy)", 0.2, 3, 1],
    y: "Band energy relative to ε=0",
    equation: "E=−2t cos(ka)",
    assumptions:
      "One orbital per site in an infinite uniform nearest-neighbor chain. Occupation, gaps, disorder and interactions are not included, so a curve alone does not establish metallic transport.",
    value: (k, t) => -2 * t * Math.cos(k),
  },
  "CH4.7": {
    title: "Count an octahedral field-energy contribution",
    x: ["t₂g electron count", 0, 6, 3],
    xStep: 1,
    parameter: ["eg electron count", 0, 4, 0],
    parameterStep: 1,
    y: "CFSE / Δ",
    equation: "CFSE/Δ=−0.4 nt₂g+0.6 neg",
    assumptions:
      "Octahedral ionic splitting relative to its barycenter. Pairing, covalency and spin-orbit terms are excluded, and slider choices are not a ground-state-assignment algorithm.",
    value: (t, e) => -0.4 * t + 0.6 * e,
  },
  "CH4.8": {
    title: "Test an isotopic harmonic-frequency shift",
    x: ["Reduced mode mass", 0.5, 5, 1],
    parameter: ["Effective mode force constant", 0.2, 5, 1],
    y: "Mode angular frequency",
    equation: "ω=sqrt(k/μ)",
    assumptions:
      "One harmonic normal-coordinate benchmark. Mode assignment, electronic structure, anharmonicity and environmental effects are separate evidence, not established by a single fitted frequency.",
    value: (m, k) => Math.sqrt(k / m),
  },
  "CH5.1": {
    title: "Inspect a restricted effective-charge size scaling",
    x: ["Effective nuclear charge Zeff", 1, 5, 1],
    parameter: ["Principal quantum number n", 1, 4, 1],
    parameterStep: 1,
    y: "Hydrogenic radius scale in a₀ units",
    equation: "rscale=n²/Zeff",
    assumptions:
      "Hydrogenic organizing scale, not an exact many-electron radius. Zeff is a model input; shielding, penetration, correlation and the chosen radius definition require additional physics.",
    value: (Z, n) => (n * n) / Z,
  },
  "CH5.2": {
    title: "Balance formal oxidation state in a ligand complex",
    x: ["Singly negative ligand count", 0, 6, 3],
    xStep: 1,
    parameter: ["Total complex charge", -3, 3, 1],
    parameterStep: 1,
    y: "Formal central-metal oxidation number",
    equation: "Oxidation number=complex charge+negative-ligand count",
    assumptions:
      "All remaining ligands are neutral under a fixed formal assignment. This is charge bookkeeping, not a claim that every selected composition is stable or has an integer localized atomic charge.",
    value: (n, q) => n + q,
  },
  "CH5.3": {
    title: "Combine orbital and spin angular momentum in one LS family",
    x: ["Orbital quantum number L", 0, 3, 1],
    xStep: 1,
    parameter: ["Spin quantum number S", 0.5, 2, 0.5],
    parameterStep: 0.5,
    y: "Landé g for selected J=L+S",
    equation: "g=1+[J(J+1)+S(S+1)−L(L+1)]/[2J(J+1)]",
    assumptions:
      "Isolated LS-coupled maximum-J family with J>0. Ground multiplets, other J branches, crystal fields and intermediate coupling must be analyzed separately for actual f-block ions.",
    value: (L, S) => {
      const J = L + S;
      return 1 + (J * (J + 1) + S * (S + 1) - L * (L + 1)) / (2 * J * (J + 1));
    },
  },
  "CH5.4": {
    title: "Share silicate corners without losing atoms",
    x: ["Bridging corners per tetrahedron", 0, 4, 4],
    xStep: 1,
    parameter: ["Silicon number density (model units)", 0.2, 3, 1],
    y: "Oxygen number density in the connectivity model",
    equation: "nO=(4−nbridge/2)nSi",
    assumptions:
      "Average corner-sharing SiO₄ network bookkeeping. Charge-balancing cations, substitution, detailed topology and condensation kinetics are not determined by the mean oxygen/silicon ratio.",
    value: (n, s) => (4 - n / 2) * s,
  },
  "CH6.1": {
    title: "Vary a conjugate acid/base activity ratio",
    x: ["Conjugate-base/acid activity ratio", 0.1, 10, 1],
    parameter: ["pKa under the stated solvent convention", 2, 10, 5],
    y: "pH in the ideal ratio relation",
    equation: "pH=pKa+log10(aA/aHA)",
    assumptions:
      "A defined weak conjugate equilibrium and consistent activities. Concentration substitution is approximate; total buffer capacity, other equilibria and a full titration are not solved.",
    value: (r, p) => p + Math.log10(r),
  },
  "CH6.2": {
    title: "Rotate a threefold ethane torsion toy",
    x: ["Torsion angle φ (degrees)", 0, 360, 0],
    parameter: ["Torsional barrier scale V3", 0.2, 5, 2],
    y: "Relative torsional energy",
    equation: "U=V3[1+cos(3φ)]/2",
    assumptions:
      "A simple ethane-like threefold torsional potential with a stated energy zero. It is not a butane anti/gauche model, solvent free-energy calculation or molecular-dynamics trajectory.",
    value: (a, V) => (V * (1 + Math.cos((3 * a * Math.PI) / 180))) / 2,
  },
  "CH6.3": {
    title: "Couple two illustrative reaction-coordinate surfaces",
    x: ["Reaction-coordinate parameter q", -2, 2, 0],
    parameter: ["Two-state coupling V", 0.1, 1, 0.3],
    y: "Lower adiabatic toy energy",
    equation: "ER=(q+1)², EP=(q−1)²; E−=q²+1−sqrt(4q²+V²)",
    assumptions:
      "Analytic two-state parabolic toy, not a computed chemical reaction pathway. Electron/atom conservation, intermediates, solvent and evidence for a mechanism must be checked independently.",
    value: (q, V) => q * q + 1 - Math.hypot(2 * q, V),
  },
  "CH6.4": {
    title: "Test idealized nucleophile-order dependence",
    x: ["Nonzero nucleophile concentration / reference", 0.1, 3, 1],
    parameter: ["Rate model: 0=SN1 ionization, 1=SN2", 0, 1, 0],
    parameterStep: 1,
    y: "Relative rate with substrate/coefficient fixed",
    equation: "SN1 ionization rate ratio=1; SN2 rate ratio=cNu/cNu₀",
    assumptions:
      "Two stated effective rate-limiting regimes with fixed substrate and coefficients. Product trapping, solvent changes, elimination and ion pairs can alter the observed rate law.",
    value: (c, m) => (Math.round(m) === 0 ? 1 : c),
  },
  "CH6.5": {
    title: "Separate carbonyl-addition equilibrium from kinetics",
    x: ["Reservoir nucleophile activity", 0, 5, 1],
    parameter: ["Dimensionless addition equilibrium K", 0.2, 3, 1],
    y: "Equilibrium product fraction",
    equation: "P/(C+P)=K aNu/(1+K aNu)",
    assumptions:
      "Ideal reversible C+Nu⇌P with nucleophile activity held fixed. Protonation, multiple species and kinetic mechanisms are excluded; the fraction is not a rate coefficient.",
    value: (a, K) => (K * a) / (1 + K * a),
  },
  "CH6.6": {
    title: "Read a uniform Hückel-ring level pattern",
    x: ["Orbital index m (mod N)", 0, 7, 0],
    xStep: 1,
    parameter: ["Ring-site number N", 3, 8, 6],
    parameterStep: 1,
    y: "Orbital energy for α=0, β=−1",
    equation: "Em=−2cos(2πm/N)",
    assumptions:
      "Uniform nearest-neighbor single-orbital ring; indices repeat modulo N. Planarity, conjugation, electron filling and real-molecule stabilization are not established by level positions alone.",
    value: (m, N) => -2 * Math.cos((2 * Math.PI * m) / N),
  },
  "CH6.7": {
    title: "Keep decadic absorbance separate from transmission",
    x: ["Concentration (model units)", 0, 3, 1],
    parameter: ["Optical path length (model length)", 0.2, 3, 1],
    y: "Decadic absorbance with ε=1",
    equation: "A=εcl; transmission=10^(−A)",
    assumptions:
      "Dilute linear Beer–Lambert regime with a fixed extinction coefficient. Baselines, spectral overlaps, scattering and full organic structure identification are separate analysis.",
    value: (c, l) => c * l,
  },
  "CH6.8": {
    title: "Shield one photodestruction channel",
    x: ["Effective visual extinction AV", 0, 5, 1],
    parameter: ["Attenuation parameter γ", 0.2, 3, 1],
    y: "Photodestruction coefficient / unshielded value",
    equation: "k/k₀=exp(−γAV)",
    assumptions:
      "One specified effective attenuation channel, not a full interstellar chemistry or prebiotic network. Formation, other destruction routes, radiation spectrum and transport remain separate inputs.",
    value: (A, g) => Math.exp(-g * A),
  },
};
