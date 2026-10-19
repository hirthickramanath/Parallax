/** Idealized lesson investigations. These are explicit models, not observational datasets. */
export interface AstroInvestigation {
  xStep?: number;
  title: string;
  x: [string, number, number, number];
  parameter: [string, number, number, number];
  y: string;
  equation: string;
  assumptions: string;
  value: (x: number, p: number) => number;
}
const radians = (x: number) => (x * Math.PI) / 180;
export const astroInvestigations: Record<string, AstroInvestigation> = {
  "AS1.1": {
    title: "Which declinations culminate above your horizon?",
    x: ["Declination (degrees)", -80, 80, 20],
    parameter: ["Observer latitude (degrees)", -60, 60, 30],
    y: "Upper-transit altitude (degrees)",
    equation: "h = 90° − |latitude − declination|",
    assumptions:
      "Geometric upper meridian transit; neglect refraction, precession and proper motion. Negative altitude means the upper transit is below the horizon.",
    value: (d, l) => 90 - Math.abs(l - d),
  },
  "AS1.2": {
    title: "Move the Sun around an inclined ecliptic",
    x: ["Solar ecliptic longitude (degrees)", 0, 360, 90],
    parameter: ["Observer latitude (degrees)", -60, 60, 30],
    y: "Solar-noon altitude (degrees)",
    equation: "δ = asin(sin 23.44° sin λ); h = 90° − |latitude − δ|",
    assumptions:
      "Fixed obliquity, geometric noon and an ecliptic Sun; longitude is not uniform civil date. Atmospheric refraction and the equation of time are excluded.",
    value: (l, p) =>
      90 -
      Math.abs(
        p -
          (Math.asin(Math.sin(radians(23.44)) * Math.sin(radians(l))) * 180) /
            Math.PI,
      ),
  },
  "AS1.3": {
    title: "Change eccentricity while holding the semimajor axis fixed",
    x: ["Orbital eccentricity", 0, 0.8, 0.5],
    parameter: ["Semimajor axis (model length)", 1, 5, 2],
    y: "Periapsis distance (model length)",
    equation: "r_peri = a(1−e)",
    assumptions:
      "Bound Newtonian two-body ellipse; no perturbations or relativistic precession. This is a turning-point relation, not a numerical orbit integration.",
    value: (e, a) => a * (1 - e),
  },
  "AS1.4": {
    title: "Explore the small-mass Hill approximation",
    x: ["Secondary to primary mass ratio", 0.0001, 0.01, 0.001],
    parameter: ["Orbital separation (model length)", 1, 5, 1],
    y: "Hill radius (model length)",
    equation: "r_H ≈ a(μ/3)^(1/3)",
    assumptions:
      "Circular restricted three-body, small secondary mass. The Hill radius is not an exact Lagrange-point coordinate or a guarantee of stability.",
    value: (u, a) => a * Math.cbrt(u / 3),
  },
  "AS1.5": {
    title: "Separate tide strength from ordinary gravity",
    x: ["Distance to perturber (model length)", 2, 10, 4],
    parameter: ["Body radius (model length)", 0.1, 1, 0.5],
    y: "Leading radial tidal acceleration (model units)",
    equation: "Δg ≈ 2GM R/r³, with GM=1",
    assumptions:
      "Small body R/r relative to separation, point-mass perturber. At the largest R/r the leading expansion becomes less accurate; this is not a full Roche disruption calculation.",
    value: (r, R) => (2 * R) / r ** 3,
  },
  "AS2.1": {
    title: "Drag distance along an inverse-square flux curve",
    x: ["Distance (model length)", 1, 10, 2],
    parameter: ["Luminosity (model power)", 0.5, 10, 4],
    y: "Flux (model power/area)",
    equation: "F = L/(4πd²)",
    assumptions:
      "Isotropic source in Euclidean space with no extinction. Cosmological use requires luminosity distance rather than an arbitrary coordinate distance.",
    value: (d, L) => L / (4 * Math.PI * d * d),
  },
  "AS2.2": {
    title: "Compare a Planck spectrum at different temperatures",
    x: ["Wavelength (micrometres)", 0.2, 3, 1],
    parameter: ["Blackbody temperature (K)", 3000, 10000, 6000],
    y: "Spectral radiance relative to Bλ(1 μm,6000 K)",
    equation: "Bλ ∝ λ^−5 / (exp[14387.77/(λ T)]−1)",
    assumptions:
      "Ideal blackbody per unit wavelength; relative normalization is fixed, not renormalized at each temperature. A Bν peak is a different density and has a different peak location.",
    value: (l, T) =>
      Math.expm1(14387.77 / 6000) / (l ** 5 * Math.expm1(14387.77 / (l * T))),
  },
  "AS2.3": {
    title: "Move through an emitting and absorbing slab",
    x: ["Optical depth", 0, 5, 1],
    parameter: ["Constant source function (intensity units)", 0, 3, 2],
    y: "Emergent intensity (same units)",
    equation: "I = I₀ exp(−τ) + S(1−exp(−τ)), I₀=1",
    assumptions:
      "One ray through a uniform source-function slab, no separate scattering-angle solution. I₀ and S must refer to the same frequency and intensity convention.",
    value: (t, S) => Math.exp(-t) + S * (1 - Math.exp(-t)),
  },
  "AS2.4": {
    title: "Drag a receding source through relativistic Doppler shifts",
    x: ["Radial recession speed v/c", 0, 0.8, 0.3],
    parameter: ["Rest wavelength (nm)", 400, 800, 500],
    y: "Observed wavelength (nm)",
    equation: "λ_obs = λ_rest sqrt((1+β)/(1−β))",
    assumptions:
      "Special-relativistic purely radial recession in flat spacetime; cosmological redshift is not generally a single local Doppler velocity.",
    value: (b, l) => l * Math.sqrt((1 + b) / (1 - b)),
  },
  "AS2.5": {
    title: "Trade telescope diameter against diffraction resolution",
    x: ["Aperture diameter (m)", 0.1, 10, 1],
    parameter: ["Observing wavelength (nm)", 400, 1000, 500],
    y: "Rayleigh angle (arcseconds)",
    equation: "θ ≈ 1.22 λ/D; radians ×206265 → arcsec",
    assumptions:
      "Unobstructed circular aperture and the Rayleigh criterion. Seeing, sampling and aberrations can dominate; resolution and collecting area are distinct.",
    value: (D, l) => ((1.22 * l * 1e-9) / D) * 206265,
  },
  "AS2.6": {
    title: "Explore shot noise in a photometric aperture",
    x: ["Source counts (electrons)", 10, 1000, 100],
    parameter: ["Background variance contribution (electron²)", 0, 1000, 100],
    y: "Signal-to-noise ratio",
    equation: "SNR = N_source / sqrt(N_source + V_background)",
    assumptions:
      "Independent Poisson source counts and a known additional variance; calibration systematics, correlated pixels and uncertain background subtraction are excluded.",
    value: (N, V) => N / Math.sqrt(N + V),
  },
  "AS2.7": {
    title: "Convert a messenger arrival delay into a path-time fraction",
    x: ["Arrival delay (seconds)", 0, 10, 2],
    parameter: ["Travel time (million years)", 1, 100, 40],
    y: "Delay/travel time (×10^−15)",
    equation: "fraction = Δt / T; 1 yr = 31557600 s",
    assumptions:
      "Toy simultaneous-emission bound only. Intrinsic emission delay, propagation models and association uncertainty must be analyzed before inferring a speed difference.",
    value: (d, T) => (d / (T * 1e6 * 31557600)) * 1e15,
  },
  "AS3.1": {
    title: "Probe pressure inside a uniform-density star",
    x: ["Fractional radius r/R", 0, 1, 0.5],
    parameter: ["Radius R (model length)", 1, 3, 1],
    y: "Pressure above surface (G=ρ=1 units)",
    equation: "P(r)−P(R) = (2π/3)Gρ²(R²−r²)",
    assumptions:
      "Uniform-density Newtonian nonrotating hydrostatic sphere. This toy does not solve a realistic stellar equation of state or thermal structure.",
    value: (f, R) => ((2 * Math.PI) / 3) * R * R * (1 - f * f),
  },
  "AS3.2": {
    title: "Compare equation-of-state compression exponents",
    x: ["Density ratio ρ/ρ₀", 0.1, 5, 2],
    parameter: ["Polytropic exponent γ", 1, 1.6666667, 5 / 3],
    y: "Pressure ratio P/P₀",
    equation: "P/P₀ = (ρ/ρ₀)^γ",
    assumptions:
      "A chosen fixed polytropic relation; γ=5/3 can model nonrelativistic degeneracy or monatomic adiabatic gas under different assumptions. Equal exponents do not imply identical temperature physics.",
    value: (r, g) => r ** g,
  },
  "AS3.3": {
    title: "Compare local nuclear temperature sensitivities",
    x: ["Temperature ratio T/T₀", 0.8, 1.2, 1],
    parameter: ["Local effective exponent ν", 4, 20, 4],
    y: "Rate ratio at fixed density and composition",
    equation: "ε/ε₀ ≈ (T/T₀)^ν",
    assumptions:
      "Local power-law sensitivity over a narrow range, not a universal reaction rate or complete stellar luminosity. Density, composition, screening and structure are held fixed.",
    value: (t, n) => t ** n,
  },
  "AS3.4": {
    title: "Change opacity in radiative diffusion",
    x: ["Opacity ratio κ/κ₀", 0.2, 5, 1],
    parameter: ["Temperature ratio T/T₀", 0.5, 2, 1],
    y: "Radiative conductivity ratio",
    equation: "K_rad/K₀ = (T/T₀)³/(κ/κ₀) at fixed density",
    assumptions:
      "Optically thick diffusion and local thermodynamic equilibrium; near a photosphere a local diffusion approximation can fail.",
    value: (k, t) => t ** 3 / k,
  },
  "AS3.5": {
    title: "Test the local convection criterion",
    x: ["Radiative logarithmic gradient", 0, 1, 0.5],
    parameter: ["Adiabatic logarithmic gradient", 0.1, 0.6, 0.4],
    y: "Gradient excess ∇rad − ∇ad",
    equation: "Instability in the homogeneous Schwarzschild model: ∇rad > ∇ad",
    assumptions:
      "Composition-uniform parcel criterion. Composition gradients require Ledoux analysis; this signed margin does not compute a convective flux or mixing-length calibration.",
    value: (r, a) => r - a,
  },
  "AS3.6": {
    title: "Inspect an analytic n=1 polytrope",
    x: ["Dimensionless radius ξ", 0.01, Math.PI, 1],
    parameter: ["Central density scale", 0.5, 3, 1],
    y: "Density (scaled units)",
    equation: "θ=sin ξ/ξ; ρ=ρc θ for n=1",
    assumptions:
      "Newtonian spherical Lane–Emden n=1 solution with surface at π. Dimensional mass/radius require the polytropic scale length; this is not a general stellar model.",
    value: (x, c) => (c * Math.sin(x)) / x,
  },
  "AS3.7": {
    title: "Move through a grey stellar atmosphere",
    x: ["Optical depth", 0, 5, 2 / 3],
    parameter: ["Effective temperature (K)", 3000, 10000, 6000],
    y: "Grey-atmosphere temperature (K)",
    equation: "T⁴=(3/4)Teff⁴(τ+2/3)",
    assumptions:
      "Plane-parallel grey LTE radiative equilibrium with Eddington boundary approximation. Real line formation and non-LTE effects require frequency-dependent transfer.",
    value: (t, T) => T * (0.75 * (t + 2 / 3)) ** 0.25,
  },
  "AS4.1": {
    title: "Explore competing Jeans mass scalings",
    x: ["Temperature ratio T/T₀", 0.5, 4, 1],
    parameter: ["Density ratio ρ/ρ₀", 0.25, 4, 1],
    y: "Jeans mass ratio",
    equation: "M_J/M_J0 = (T/T₀)^(3/2)(ρ/ρ₀)^−1/2",
    assumptions:
      "Uniform isothermal gas with fixed mean molecular weight; magnetic fields, turbulence, rotation and boundary geometry are omitted.",
    value: (t, r) => t ** 1.5 / Math.sqrt(r),
  },
  "AS4.2": {
    title: "Separate a stellar radius change from a temperature change",
    x: ["Temperature ratio T/Teff,solar", 0.5, 3, 1],
    parameter: ["Radius ratio R/Rsolar", 0.2, 5, 1],
    y: "Bolometric luminosity ratio L/Lsolar",
    equation: "L/Lsolar=(R/Rsolar)²(T/Tsolar)⁴",
    assumptions:
      "Definition of effective temperature and a spherical radiating surface. This maps the HR diagram but does not impose a stellar evolutionary track.",
    value: (t, r) => r * r * t ** 4,
  },
  "AS4.3": {
    title: "Follow an ideal giant expanding at fixed luminosity",
    x: ["Radius expansion factor", 1, 100, 10],
    parameter: ["Luminosity ratio to initial state", 0.5, 3, 1],
    y: "Effective-temperature ratio",
    equation: "T/T₀=(L/L₀)^(1/4)(R/R₀)^−1/2",
    assumptions:
      "Luminosity ratio is a controlled input, not a computed giant-branch evolution. Core burning, envelope convection and mass loss are outside this relation.",
    value: (r, L) => L ** 0.25 / Math.sqrt(r),
  },
  "AS4.4": {
    title: "Scale a radial pulsation period",
    x: ["Radius ratio R/R₀", 0.5, 5, 1],
    parameter: ["Mass ratio M/M₀", 0.5, 5, 1],
    y: "Dynamical-period ratio",
    equation: "P/P₀ ≈ (R/R₀)^(3/2)(M/M₀)^−1/2",
    assumptions:
      "Homologous stars with the same dimensionless pulsation factor. Actual mode frequencies and driving require structure and nonadiabatic analysis.",
    value: (r, m) => Math.sqrt(r ** 3 / m),
  },
  "AS4.5": {
    title: "Separate radioactive decline from light-curve transport",
    x: ["Elapsed half-lives", 0, 6, 1],
    parameter: ["Initial radioactive heating (model power)", 1, 10, 4],
    y: "Instantaneous radioactive heating",
    equation: "Q=Q₀ 2^(−t/t_half)",
    assumptions:
      "One radioactive species and complete local deposition. This is a heating source, not an observed supernova light curve; diffusion and escaping gamma rays are excluded.",
    value: (n, Q) => Q * 2 ** -n,
  },
  "AS4.6": {
    title: "Compress a nonrelativistic degenerate white-dwarf model",
    x: ["Mass ratio M/M₀", 0.5, 2, 1],
    parameter: ["Reference radius (model length)", 0.5, 2, 1],
    y: "White-dwarf radius (model length)",
    equation: "R/R₀≈(M/M₀)^−1/3",
    assumptions:
      "Cold nonrelativistic electron degeneracy at fixed composition, far from the relativistic limiting mass. This is not a neutron-star equation of state.",
    value: (m, R) => R / Math.cbrt(m),
  },
  "AS4.7": {
    title: "Move the mass ratio inside a Roche-lobe approximation",
    x: ["Mass ratio q=Mdonor/Mcompanion", 0.1, 10, 1],
    parameter: ["Binary separation (model length)", 1, 5, 1],
    y: "Volume-equivalent Roche-lobe radius",
    equation: "rL/a≈0.49q^(2/3)/(0.6q^(2/3)+ln(1+q^(1/3)))",
    assumptions:
      "Eggleton approximation for circular synchronous binary Roche geometry. Overflow onset alone does not determine mass-transfer stability or rate.",
    value: (q, a) =>
      (a * 0.49 * q ** (2 / 3)) /
      (0.6 * q ** (2 / 3) + Math.log1p(Math.cbrt(q))),
  },
  "AS5.1": {
    title: "Separate accretion rate and radiative efficiency",
    x: ["Accretion rate (model mass/time)", 0.1, 5, 1],
    parameter: ["Radiative efficiency", 0.01, 0.3, 0.1],
    y: "Luminosity in c² times mass/time units",
    equation: "L=η Mdot c²; c=1 in this display",
    assumptions:
      "Steady radiatively efficient toy budget, not a radial disc solution. Advection, outflows and spin-dependent inner boundaries can change η.",
    value: (m, e) => m * e,
  },
  "AS5.2": {
    title: "Turn a relativistic jet away from your sightline",
    x: ["Viewing angle (degrees)", 0, 90, 10],
    parameter: ["Bulk Lorentz factor", 2, 20, 5],
    y: "Doppler factor",
    equation: "δ=1/[Γ(1−β cos θ)], β=sqrt(1−Γ^−2)",
    assumptions:
      "One moving emitting element with a fixed bulk velocity. Observed intensity uses a geometry- and spectrum-dependent power of δ; no universal luminosity boost is assumed.",
    value: (a, g) =>
      1 / (g * (1 - Math.sqrt(1 - 1 / (g * g)) * Math.cos(radians(a)))),
  },
  "AS5.3": {
    title: "Constrain an emitting region with a variability time",
    x: ["Observed variability time (seconds)", 0.01, 10, 1],
    parameter: ["Doppler factor", 1, 20, 1],
    y: "Causal size upper scale (light-seconds)",
    equation: "R/c ≲ δ Δt_obs/(1+z); z=1",
    assumptions:
      "Coherently varying causally connected region with assumed z=1. Geometry, engine times and multiple emitting regions can defeat a naive equality.",
    value: (t, d) => (d * t) / 2,
  },
  "AS5.4": {
    title: "Compare gyroradius with an accelerator size",
    x: ["Relativistic momentum pc (model energy)", 0.1, 10, 1],
    parameter: ["Magnetic field B (model units)", 0.1, 5, 1],
    y: "Gyroradius (model length)",
    equation: "rL=p/(|q|B); choose |q|=c=1",
    assumptions:
      "Uniform field and transverse momentum. Confinement is necessary in a Hillas argument, not sufficient for efficient acceleration before losses or escape.",
    value: (p, B) => p / B,
  },
  "AS5.5": {
    title: "Read the chirp frequency dependence",
    x: ["GW frequency ratio f/f₀", 0.5, 3, 1],
    parameter: ["Chirp-mass ratio", 0.5, 3, 1],
    y: "Frequency-derivative ratio",
    equation: "fdot/fdot₀=(Mc/Mc₀)^(5/3)(f/f₀)^(11/3)",
    assumptions:
      "Leading quadrupole, quasi-circular adiabatic inspiral. Spin, eccentricity and merger require higher-order or numerical waveforms.",
    value: (f, M) => M ** (5 / 3) * f ** (11 / 3),
  },
  "AS5.6": {
    title: "Vary a toy neutrino detection exposure",
    x: ["Expected signal events", 0, 20, 3],
    parameter: ["Known expected background events", 0, 10, 1],
    y: "Probability of at least one event",
    equation: "P(N≥1)=1−exp(−[s+b])",
    assumptions:
      "Independent Poisson signal plus known Poisson background. At least one count is not a discovery significance or proof of association.",
    value: (s, b) => -Math.expm1(-s - b),
  },
  "AS6.1": {
    title: "Move along an ideal pressure-equilibrium curve",
    x: ["Gas temperature (K)", 100, 10000, 1000],
    parameter: ["Pressure divided by k (K cm^−3)", 1000, 10000, 3000],
    y: "Particle number density (cm^−3)",
    equation: "n=(P/k)/T",
    assumptions:
      "Ideal thermal gas with specified particle density. Magnetic, turbulent and cosmic-ray pressure and thermal stability are excluded; this is not a complete phase diagram.",
    value: (T, P) => P / T,
  },
  "AS6.2": {
    title: "Change the ionizing budget of a Strömgren sphere",
    x: ["Ionizing photon-rate ratio Q/Q₀", 0.1, 10, 1],
    parameter: ["Hydrogen density ratio n/n₀", 0.2, 5, 1],
    y: "Ionized-radius ratio",
    equation: "Rs/Rs₀=(Q/Q₀)^(1/3)(n/n₀)^−2/3",
    assumptions:
      "Static ionization equilibrium, uniform pure hydrogen, fixed case-B recombination coefficient, no dust or leaking ionizing photons.",
    value: (Q, n) => Math.cbrt(Q / (n * n)),
  },
  "AS6.3": {
    title: "Compare magnetic tension with inertia",
    x: ["Magnetic field ratio B/B₀", 0.1, 5, 1],
    parameter: ["Density ratio ρ/ρ₀", 0.1, 5, 1],
    y: "Alfvén-speed ratio",
    equation: "vA/vA₀=(B/B₀)/sqrt(ρ/ρ₀)",
    assumptions:
      "Ideal nonrelativistic MHD with fixed permeability and a homogeneous background; collisionless, resistive and relativistic effects are omitted.",
    value: (B, r) => B / Math.sqrt(r),
  },
  "AS6.4": {
    title: "Explore adiabatic shock compression",
    x: ["Upstream Mach number", 1, 10, 3],
    parameter: ["Adiabatic index γ", 1.1, 1.6666667, 5 / 3],
    y: "Density compression ratio",
    equation: "ρ₂/ρ₁=(γ+1)M²/[(γ−1)M²+2]",
    assumptions:
      "Planar steady nonradiative hydrodynamic ideal-gas shock. Cooling, magnetic pressure and cosmic-ray acceleration can alter the compression.",
    value: (M, g) => ((g + 1) * M * M) / ((g - 1) * M * M + 2),
  },
  "AS6.5": {
    title: "Compare magnetic diffusion times",
    x: ["Length-scale ratio L/L₀", 0.2, 5, 1],
    parameter: ["Magnetic-diffusivity ratio η/η₀", 0.2, 5, 1],
    y: "Resistive-decay timescale ratio",
    equation: "tη/tη₀=(L/L₀)²/(η/η₀)",
    assumptions:
      "Uniform diffusivity and fixed geometry. Diffusion alone decays a field; an actual dynamo requires flow and induction, not simply a long decay time.",
    value: (L, e) => (L * L) / e,
  },
  "AS7.1": {
    title: "Vary the escape-speed budget",
    x: ["Planet mass ratio M/M₀", 0.1, 5, 1],
    parameter: ["Planet radius ratio R/R₀", 0.2, 3, 1],
    y: "Escape-speed ratio",
    equation: "vesc/vesc₀=sqrt((M/M₀)/(R/R₀))",
    assumptions:
      "Isolated spherical Newtonian body, no atmosphere or rotation. Escape from a multi-body system requires its full potential.",
    value: (M, R) => Math.sqrt(M / R),
  },
  "AS7.2": {
    title: "Explore an isothermal atmospheric scale height",
    x: ["Temperature ratio T/T₀", 0.5, 3, 1],
    parameter: ["Surface-gravity ratio g/g₀", 0.2, 5, 1],
    y: "Pressure-scale-height ratio",
    equation: "H/H₀=(T/T₀)/(g/g₀) at fixed molecular mass",
    assumptions:
      "Ideal isothermal hydrostatic atmosphere, constant gravity over the height range. Molecular mass, radiative structure and escape are not solved.",
    value: (T, g) => T / g,
  },
  "AS7.3": {
    title: "Compare drift and growth clocks",
    x: ["Growth timescale (model time)", 0.1, 10, 1],
    parameter: ["Radial-drift timescale (same units)", 0.1, 10, 3],
    y: "Growth/drift time ratio",
    equation: "t_growth/t_drift",
    assumptions:
      "Controlled timescale comparison, not a planet-formation solver. Values below one allow growth before drift in this toy argument but do not guarantee planet formation.",
    value: (g, d) => g / d,
  },
  "AS7.4": {
    title: "Drag a planet radius through a transit depth curve",
    x: ["Planet/star radius ratio", 0.01, 0.2, 0.1],
    parameter: ["Diluting contaminant flux / star flux", 0, 2, 0],
    y: "Observed transit depth",
    equation: "depth≈(Rp/Rstar)²/(1+f_contamination)",
    assumptions:
      "Small opaque non-grazing planet and uniform stellar surface, no limb darkening or spots. Dilution creates an inference degeneracy.",
    value: (r, f) => (r * r) / (1 + f),
  },
  "AS7.5": {
    title: "Separate equilibrium temperature and a living climate",
    x: ["Bond albedo", 0, 0.8, 0.3],
    parameter: ["Received flux ratio to reference", 0.2, 3, 1],
    y: "Equilibrium-temperature ratio to zero-albedo reference",
    equation: "Teq/T₀=[(1−A)F/F₀]^(1/4)",
    assumptions:
      "Uniform reradiation and unit thermal emissivity. Greenhouse effects, clouds and circulation are omitted; this is not a habitability or biosignature verdict.",
    value: (A, F) => ((1 - A) * F) ** 0.25,
  },
  "AS8.1": {
    title: "Move vertically through an exponential disc model",
    x: ["Height |z| (model length)", 0, 5, 1],
    parameter: ["Disc scale height (model length)", 0.2, 2, 1],
    y: "Density / midplane density",
    equation: "ρ(z)/ρ(0)=exp(−|z|/h)",
    assumptions:
      "One symmetric exponential tracer component; selection effects, multiple populations and self-consistent vertical dynamics are excluded.",
    value: (z, h) => Math.exp(-z / h),
  },
  "AS8.2": {
    xStep: 1,
    title: "Inspect a relaxation-timescale estimate",
    x: ["Number of equal-mass particles N", 100, 100000, 1000],
    parameter: ["Crossing time (model time)", 0.5, 5, 1],
    y: "Two-body relaxation time (model time)",
    equation: "t_relax≈0.1N/ln(N) t_cross",
    assumptions:
      "Order-of-magnitude weak-scattering estimate for a bound equal-mass system. It is not a Jeans equilibrium solution, and collisionless systems can have very long relaxation times.",
    value: (N, t) => ((0.1 * N) / Math.log(N)) * t,
  },
  "AS8.3": {
    title: "Infer a spherical enclosed mass from a rotation speed",
    x: ["Circular radius (model length)", 0.2, 10, 2],
    parameter: ["Flat circular speed (model speed)", 0.5, 3, 1],
    y: "Enclosed mass (G=1 units)",
    equation: "M(<r)=v²r/G for a spherical circular model",
    assumptions:
      "Spherical gravitating distribution and circular tracer motion. A disc is not spherical; pressure support and noncircular motions can bias the inference.",
    value: (r, v) => v * v * r,
  },
  "AS8.4": {
    title: "Test a restricted galaxy scaling relation",
    x: ["Rotation-speed ratio", 0.5, 2, 1],
    parameter: ["Illustrative logarithmic slope", 3, 4, 4],
    y: "Luminosity ratio in the toy power law",
    equation: "L/L₀=(v/v₀)^α",
    assumptions:
      "Illustrative Tully–Fisher-type scaling with chosen exponent, not a universal fit. Bandpass, baryonic mass choice, scatter and selection affect real relations.",
    value: (v, a) => v ** a,
  },
  "AS8.5": {
    title: "Track a closed-box metallicity toy model",
    x: ["Gas mass fraction", 0.05, 1, 0.5],
    parameter: ["Effective yield (mass fraction)", 0.005, 0.04, 0.02],
    y: "Gas metallicity mass fraction",
    equation: "Z=y ln(1/f_gas)",
    assumptions:
      "Instantaneous recycling, homogeneous mixing and a closed box starting metal-free. Inflows, winds and merger histories violate this toy model.",
    value: (f, y) => y * Math.log(1 / f),
  },
  "AS8.6": {
    title: "Vary a point-lens angular Einstein scale",
    x: ["Lens-mass ratio", 0.1, 5, 1],
    parameter: ["Fixed-distance geometry factor ratio", 0.2, 3, 1],
    y: "Einstein-angle ratio",
    equation: "θE/θE₀=sqrt((M/M₀)(geometry/geometry₀))",
    assumptions:
      "Thin isolated point lens with positive angular-diameter distance geometry. Extended cluster mass, shear and source structure need a lens equation.",
    value: (M, g) => Math.sqrt(M * g),
  },
  "AS8.7": {
    title: "Compare AGN luminosity to a limiting-mass scale",
    x: ["Black-hole mass ratio", 0.1, 10, 1],
    parameter: ["Eddington ratio", 0.01, 1, 0.1],
    y: "Luminosity / reference Eddington luminosity",
    equation: "L=λEdd LEdd; LEdd∝M",
    assumptions:
      "Electron-scattering spherical force-balance scale at fixed composition. Geometry, opacity and super-Eddington flows complicate interpretation; correlation does not establish co-evolution causality.",
    value: (M, l) => M * l,
  },
  "AS9.1": {
    title: "Fit the nearby Hubble-law slope",
    x: ["Distance (Mpc)", 1, 100, 10],
    parameter: ["Hubble constant (km/s/Mpc)", 60, 80, 70],
    y: "Recession speed in nearby linear approximation (km/s)",
    equation: "v≈H₀d",
    assumptions:
      "Nearby linear relation with peculiar motions neglected. This is not a high-redshift distance formula or a new H₀ measurement.",
    value: (d, H) => d * H,
  },
  "AS9.2": {
    title: "Compare matter and vacuum terms in a flat background",
    x: ["Scale factor a (today=1)", 0.2, 2, 1],
    parameter: ["Present matter fraction Ωm", 0.1, 0.9, 0.3],
    y: "H(a)/H₀",
    equation: "H/H₀=sqrt(Ωm a^−3 + 1−Ωm)",
    assumptions:
      "Spatially flat matter-plus-cosmological-constant model, radiation neglected. Valid only where radiation is unimportant; no parameter fit is performed.",
    value: (a, m) => Math.sqrt(m / a ** 3 + 1 - m),
  },
  "AS9.3": {
    title: "Cool an adiabatically expanding photon bath",
    x: ["Scale factor ratio a/a₀", 0.1, 3, 1],
    parameter: ["Reference photon temperature (K)", 1, 10, 2.725],
    y: "Photon temperature (K)",
    equation: "T=T₀a₀/a",
    assumptions:
      "Freely redshifting equilibrium-shaped photon spectrum after entropy transfer has ceased. Particle annihilation and separate species temperatures require more bookkeeping.",
    value: (a, T) => T / a,
  },
  "AS9.4": {
    title: "Change the projected acoustic scale",
    x: ["Comoving sound horizon (Mpc)", 100, 180, 144],
    parameter: [
      "Comoving angular-diameter distance (Mpc)",
      10000,
      18000,
      14000,
    ],
    y: "Acoustic multipole scale ℓA",
    equation: "θs=rs/DM; ℓA=πDM/rs",
    assumptions:
      "Small-angle projection using consistent comoving lengths. The first peak is shifted relative to ℓA by plasma/perturbation physics; this is not a Boltzmann-computed CMB spectrum.",
    value: (r, D) => (Math.PI * D) / r,
  },
  "AS9.5": {
    title: "Follow a matter-era growing perturbation",
    x: ["Scale factor ratio a/a₀", 0.2, 5, 1],
    parameter: ["Initial density contrast", 0.001, 0.1, 0.01],
    y: "Linear growing density contrast",
    equation: "δ=δ₀ a/a₀ in a matter-dominated background",
    assumptions:
      "Small linear perturbation, growing mode and pressureless matter domination. Radiation, dark-energy suppression and nonlinear collapse are omitted.",
    value: (a, d) => a * d,
  },
  "AS9.6": {
    title: "Count inflationary e-folds",
    x: ["Number of e-folds", 0, 10, 2],
    parameter: ["Initial proper length (model length)", 0.1, 3, 1],
    y: "Final proper length (model length)",
    equation: "L=L₀ exp(N)",
    assumptions:
      "Constant-H exponential-expansion illustration. It is not a potential fit or evidence for a particular inflation model; perturbations and reheating are excluded.",
    value: (N, L) => L * Math.exp(N),
  },
  "AS9.7": {
    title: "Separate matter dilution from constant vacuum density",
    x: ["Scale factor a", 0.2, 3, 1],
    parameter: ["Present matter/vacuum density ratio", 0.1, 3, 0.3 / 0.7],
    y: "Matter/vacuum density ratio",
    equation: "ρm/ρΛ=(ρm₀/ρΛ₀)a^−3",
    assumptions:
      "Conserved pressureless matter plus a cosmological constant. Dynamical dark energy, interactions and radiation require different evolution.",
    value: (a, r) => r / a ** 3,
  },
  "AS9.8": {
    title: "See how covariance changes a tension estimate",
    x: ["Difference between two estimates", 0, 10, 5],
    parameter: ["Correlation coefficient", -0.8, 0.8, 0],
    y: "Difference in standard-deviation units",
    equation: "Z=|Δ|/sqrt(σ₁²+σ₂²−2ρσ₁σ₂), σ₁=σ₂=2",
    assumptions:
      "Gaussian illustrative measurements with known covariance. Real H₀/S8 tensions depend on data, model, calibration and non-Gaussian posteriors; these are not current measured values.",
    value: (d, r) => d / Math.sqrt(8 - 8 * r),
  },
  "AS10.1": {
    xStep: 1,
    title: "Test the effect of multiple literature searches",
    x: ["Number of independent tests", 1, 100, 20],
    parameter: ["Single-test false-positive rate", 0.001, 0.1, 0.05],
    y: "Probability of at least one false positive",
    equation: "P=1−(1−α)^N",
    assumptions:
      "Toy independent null tests. Literature searches and papers are not generally independent tests; this illustrates why selection and preregistered criteria matter, not a paper-quality score.",
    value: (N, a) => -Math.expm1(N * Math.log1p(-a)),
  },
  "AS10.2": {
    title: "Move a survey threshold through an idealized population",
    x: ["Selection threshold (standardized value)", -2, 2, 0],
    parameter: ["Parent population mean", -1, 1, 0],
    y: "Illustrative selected fraction (logistic parent)",
    equation: "P(X>cut)=1/[1+exp(cut−mean)]",
    assumptions:
      "Synthetic logistic population with unit scale, not Gaia/TESS/SDSS data. Selection changes what is observed; a real survey needs its documented selection function and quality flags.",
    value: (c, m) => 1 / (1 + Math.exp(c - m)),
  },
  "AS10.3": {
    title: "Update prior odds with a likelihood ratio",
    x: ["Likelihood ratio", 0.1, 20, 3],
    parameter: ["Prior probability", 0.01, 0.99, 0.2],
    y: "Posterior probability",
    equation: "P(H|D)=LR·P(H)/(1−P(H)+LR·P(H))",
    assumptions:
      "Two exhaustive hypotheses with a valid likelihood ratio for the stated data and selection. This does not estimate a likelihood or supply a scientific prior.",
    value: (L, p) => (L * p) / (1 - p + L * p),
  },
  "AS10.4": {
    title: "Compare reproduction residuals with stated uncertainty",
    x: ["Observed minus predicted (model units)", -5, 5, 1],
    parameter: ["Stated standard uncertainty (same units)", 0.2, 3, 1],
    y: "Standardized residual",
    equation: "r=(observed−predicted)/σ",
    assumptions:
      "Synthetic single residual and known uncertainty, not a reproduced paper. A complete capstone needs real provenance, code/data versions, correlations and all documented analysis decisions.",
    value: (d, s) => d / s,
  },
};
