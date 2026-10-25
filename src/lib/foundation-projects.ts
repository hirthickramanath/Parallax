export interface FoundationProject {
  unit: string;
  title: string;
  question: string;
  lessons: string[];
  method: string[];
  deliverables: string[];
  rubric: string[];
  checkpoint: string;
}
export const foundationProjects: FoundationProject[] = [
  {
    unit: "MB1",
    title: "Calibrate a nonlinear detector",
    question: "When can detector counts be inverted into one physical input?",
    lessons: ["MB1.1", "MB1.2", "MB1.3", "MB1.4"],
    method: [
      "Use the synthetic calibration C(x)=x² on −3≤x≤3. Tabulate at least seven pairs and draw the inverse ambiguity.",
      "Restrict to x≥0, derive x=√C and propagate a small positive count perturbation by comparing exact inversions.",
      "Construct a geometric correction series with ratio 0.1, bound its neglected tail, and prove the finite-sum expression by induction.",
    ],
    deliverables: [
      "Domain-labelled graph and table, clearly marked synthetic.",
      "A written argument for invertibility after restriction and a counterexample before it.",
      "A truncation-error bound and an induction proof.",
    ],
    rubric: [
      "Domain and endpoint conditions stated.",
      "Proof and numerical evidence distinguished.",
      "Approximation includes an error bound.",
    ],
    checkpoint:
      "C=4 admits x=±2 before restriction and x=2 afterward. Near C=0 the inverse is particularly sensitive to count errors.",
  },
  {
    unit: "MB2",
    title: "Reconstruct a sky direction",
    question:
      "How can two coordinate descriptions identify the same direction?",
    lessons: ["MB2.1", "MB2.2", "MB2.3"],
    method: [
      "Choose spherical directions with radius 1, polar angle measured from +z, and azimuth from +x.",
      "Convert at least five directions to Cartesian components, checking x²+y²+z²=1.",
      "Draw an ellipse with semiaxes 5 and 3. Locate the foci and compare focal distances for three points.",
    ],
    deliverables: [
      "Convention-labelled direction table and diagrams.",
      "One special-case check at a pole and an explanation of undefined azimuth there.",
      "Ellipse parameters and a distinction between a geometric locus and an orbit produced by dynamics.",
    ],
    rubric: [
      "Radians and degrees are never mixed.",
      "Coordinate singularity is distinguished from physical ambiguity.",
      "Conic geometry is not claimed to prove a force law.",
    ],
    checkpoint:
      "For θ=π/2 and φ=π/2, the direction is (0,1,0). The ellipse foci are (±4,0) and focal-distance sum is 10.",
  },
  {
    unit: "MB3",
    title: "Recover motion from a measured rate",
    question: "Can two position histories have exactly the same velocity?",
    lessons: ["MB3.1", "MB3.2", "MB3.3", "MB3.4", "MB3.5"],
    method: [
      "Choose synthetic velocity v(t)=2t−2 m/s on 0≤t≤3 s. Integrate and retain the initial-position constant.",
      "Find when direction changes, then compare signed displacement with total distance.",
      "Compare a finite-difference velocity with the exact derivative at several step sizes. State the expected error trend.",
    ],
    deliverables: [
      "Position and velocity graphs with units.",
      "A piecewise distance integral and a separate displacement calculation.",
      "A numerical convergence table and an initial-condition explanation.",
    ],
    rubric: [
      "Signed integrals and absolute distance distinguished.",
      "Integration constant is fixed only by an initial condition.",
      "A smaller step is not claimed to remove all measurement or rounding error.",
    ],
    checkpoint:
      "Displacement is 3 m. Distance is 1 m before t=1 plus 4 m afterward, giving 5 m. Adding a constant position changes no velocity.",
  },
  {
    unit: "MB4",
    title: "Evaluate a rare-source detector",
    question: "How reliable is a positive flag when genuine sources are rare?",
    lessons: ["MB4.1", "MB4.2", "MB4.3", "MB4.4"],
    method: [
      "Use 10,000 synthetic locations, prevalence 1%, sensitivity 90% and false-positive rate 5%.",
      "Build a two-by-two expected-count table and compute the posterior for a flagged location.",
      "Repeat with prevalence 10%, holding the detector rates fixed. Explain the change and identify which counts would fluctuate in a real experiment.",
    ],
    deliverables: [
      "Both contingency tables with denominators labelled.",
      "Bayes-rule derivation and expected-count calculation.",
      "A paragraph separating detector calibration, prevalence uncertainty and statistical noise.",
    ],
    rubric: [
      "Sensitivity is not confused with positive predictive probability.",
      "Expected counts are not presented as collected observations.",
      "Independence assumptions and uncertain prevalence are stated.",
    ],
    checkpoint:
      "At 1% prevalence, expected true positives are 90 and false positives 495; posterior is 90/585≈15.4%. At 10%, it is 900/1350≈66.7%.",
  },
  {
    unit: "PB1",
    title: "Estimate gravity with a pendulum",
    question:
      "Which experimental choices make a pendulum estimate of g trustworthy?",
    lessons: ["PB1.1", "PB1.2", "PB1.3", "PB1.4"],
    method: [
      "Use the pendulum bench and predict how period varies with length. Keep amplitude and local g fixed.",
      "Record ten-cycle synthetic timings at at least five lengths. Convert to periods and plot T² against L.",
      "Derive g from the slope and repeat at larger amplitude to discuss the small-angle assumption.",
    ],
    deliverables: [
      "Apparatus diagram, control variables and synthetic observation table.",
      "Slope calculation with units and a derivation of g=4π²/slope.",
      "An uncertainty budget distinguishing timing resolution, length measurement and model error.",
    ],
    rubric: [
      "Suspension length is measured to the bob’s effective centre.",
      "Ten-cycle timing is divided by ten before squaring.",
      "Agreement with the built-in model is not called independent experimental confirmation.",
    ],
    checkpoint:
      "For g=9.81 m/s² and small amplitude, expected slope is approximately 4.024 s²/m. A model-generated table cannot independently establish Earth's measured gravity.",
  },
  {
    unit: "PB2",
    title: "Audit a gas expansion",
    question: "Can two expansions to the same volume exchange different heat?",
    lessons: ["PB2.1", "PB2.2", "PB2.3"],
    method: [
      "In the gas bench compare expansion from volume ratio 1 to 2 on isothermal, reversible-adiabatic and isobaric paths.",
      "Record final temperature, pressure, heat, work and internal-energy change for each.",
      "Check Q−W=ΔU and explain why final volume alone does not determine state or heat transfer.",
    ],
    deliverables: [
      "Three p–V paths and an energy table.",
      "First-law derivations using the stated work convention.",
      "A discussion of friction, finite-rate temperature differences and ideal-gas limits.",
    ],
    rubric: [
      "Heat and work are identified as path transfers.",
      "Temperatures use kelvin.",
      "Different final temperatures are not called the same final state.",
    ],
    checkpoint:
      "For one mole initially at 300 K, reversible isothermal doubling has W=Q≈1729 J and ΔU=0. Adiabatic doubling cools to about 189 K with Q=0.",
  },
  {
    unit: "PB3",
    title: "Measure a wavelength from interference",
    question:
      "How can fringe positions reveal wavelength without measuring one oscillation?",
    lessons: ["PB3.1", "PB3.2", "PB3.3"],
    method: [
      "Use the double-slit bench at fixed wavelength and screen distance. Record at least four slit separations.",
      "Plot fringe spacing against reciprocal slit separation and infer wavelength from the slope divided by screen distance.",
      "Compare with the string bench: identify what is common about phase and what differs about medium, boundary conditions and coherence.",
    ],
    deliverables: [
      "Synthetic fringe table, graph and dimensional slope analysis.",
      "A derivation of Δy≈λL/d with assumptions.",
      "A paragraph explaining finite-slit envelopes, coherence and atmospheric telescope resolution.",
    ],
    rubric: [
      "Millimetres and nanometres are converted consistently.",
      "The small-angle and far-field assumptions are explicit.",
      "Ray magnification is distinguished from diffraction-limited detail.",
    ],
    checkpoint:
      "At λ=500 nm and L=2 m, separation 0.5 mm produces approximately 2 mm fringe spacing. A doubled separation produces 1 mm.",
  },
  {
    unit: "PB4",
    title: "Test an electrical energy budget",
    question:
      "How can the same resistors draw different power when their topology changes?",
    lessons: ["PB4.1", "PB4.2", "PB4.3", "PB4.4"],
    method: [
      "At 6 V, set 100 Ω and 200 Ω in the circuit bench. Record series and parallel results.",
      "Compute branch currents and powers independently, checking source power equals total resistor power.",
      "Draw correct meter connections, then explain why an ideal ammeter across the supply is outside the safe intended topology.",
    ],
    deliverables: [
      "Two labelled circuit diagrams and synthetic observation tables.",
      "Kirchhoff and power-balance calculations.",
      "A limitations note on internal resistance, heating and meter loading.",
    ],
    rubric: [
      "Ammeter is in series and voltmeter across the measured element.",
      "Topology is kept consistent between diagram and equations.",
      "Ideal readings are not used as instructions for unrestricted physical supplies.",
    ],
    checkpoint:
      "Series equivalent resistance is 300 Ω and source power 0.12 W. Parallel equivalent resistance is 66.67 Ω and source power 0.54 W.",
  },
  {
    unit: "PB5",
    title: "Separate thresholds from count rates",
    question:
      "Which control changes emitted electron energy, and which changes their number?",
    lessons: ["PB5.1", "PB5.2", "PB5.3"],
    method: [
      "Choose a synthetic work function of 2 eV and photon energies from 1 to 5 eV. Tabulate emission/no emission and stopping potential in the elementary model.",
      "At one above-threshold frequency vary intensity conceptually and identify which observable should change.",
      "Build a radioactive coin-decay analogy and compare ensemble expectation, individual randomness and detector efficiency.",
    ],
    deliverables: [
      "Threshold plot with a correctly excluded no-emission region.",
      "An explanation distinguishing photon energy, intensity, activity and registered count.",
      "A discussion of semiconductor photon detection, dark counts and quantum efficiency.",
    ],
    rubric: [
      "Zero stopping voltage at threshold is distinguished from a below-threshold emission measurement.",
      "Single-event randomness is consistent with population expectations.",
      "Bohr trajectories are not presented as modern electron paths.",
    ],
    checkpoint:
      "A 3 eV photon yields maximum kinetic energy 1 eV and stopping potential 1 V for work function 2 eV. At 1 eV there is no single-photon emission in this model.",
  },
  {
    unit: "CB1",
    title: "Separate equilibrium, kinetics and structure",
    question:
      "What can a chemical formula, an equilibrium constant and a rate constant each tell us?",
    lessons: ["CB1.1", "CB1.2", "CB1.3", "CB1.4", "CB1.5"],
    method: [
      "For ideal A⇌B with total amount 10 mol, calculate equilibrium composition at K=1 and K=4.",
      "Choose two first-order forward/reverse rate pairs with the same ratio and compare their approach times to the same equilibrium.",
      "Build two structures with formula C₂H₆O and state which extra evidence could distinguish them.",
    ],
    deliverables: [
      "Mass-balance and reaction-quotient derivation.",
      "Synthetic concentration curves labelled with rate units and a statement of the simple reversible-first-order assumptions.",
      "Connectivity diagrams and a proposed spectroscopic comparison.",
    ],
    rubric: [
      "A catalyst changes rates without changing K for the same reaction at fixed temperature.",
      "Activity assumptions and total-amount constraint are explicit.",
      "Molecular formula is not treated as unique structure or evidence of life.",
    ],
    checkpoint:
      "At K=4, ideal B/A=4 gives A=2 mol and B=8 mol. Rate pairs 0.4/0.1 s⁻¹ and 0.04/0.01 s⁻¹ share that ratio but have tenfold different relaxation times.",
  },
];
