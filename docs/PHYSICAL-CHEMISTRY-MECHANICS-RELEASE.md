# Physical chemistry and analytical mechanics batch

This is a historical authoring release. See [the current release](FOURIER-PDE-RELEASE.md). The generated [course ledger](COURSE-STATUS.md) records actual coverage.

Twenty new draft lessons cover CH1.1–CH1.13 and PH2.1–PH2.7. The course now contains **142 playable drafts, 573 retrieval cards and 212 missing lesson bodies** within its unchanged 354-entry inventory. All new references remain review leads pending edition/section checks and independent scientific review.

Physical chemistry covers chemical potentials, phase equilibria, reaction mechanisms, transition-state theory, molecular statistics, adsorption, nonideal activity/fugacity, colligative properties, electrochemical potentials, ionic conduction, transport, electrode kinetics and photochemistry. Analytical mechanics covers Lagrange equations, constraints, Noether symmetries, Hamilton equations, canonical transformations/Poisson brackets, Hamilton–Jacobi theory/actions and small oscillations. Each includes assumptions, theory, worked examples, conceptual and numeric checks, an investigation and four recall prompts.

The ninth virtual apparatus bench, **Coupled oscillators**, is available in Labs and PH2.7. Two equal masses connect to equal wall springs and a coupling spring. Controls set mass, wall/coupling stiffness and time; release presets select in-phase, opposite-phase or one-mass displacement from rest. The exact normal-mode solution displays displacements, angular frequencies and kinetic/potential/total energy. Up to twenty local readings retain all control settings. Leaving the bench clears these readings.

The model assumes linear springs, no friction, equal masses and zero initial velocities. It explicitly handles zero coupling, labels synthetic observations, and distinguishes mixed normal modes from beats requiring nearby frequencies. It is an ideal simulation, not measured laboratory data.

Validation covers initial conditions, normal frequencies, energy conservation, pure modes, the uncoupled limit, invalid parameters, authored numerical answers, lesson rendering and mobile apparatus controls. Validation passed: production build, all 50 model/grading/example tests and all 44 browser cases, including every authored lesson and the new mobile bench. Staged whitespace checks also passed. Browser authentication/cloud responses are fixtures; these checks do not verify the live Firebase configuration. Automated checks do not constitute independent scientific review.

Remaining work includes the 212 missing lesson bodies, source and scientific review, live Firestore rules verification and an eligible provider setup for the disabled tutor. No new database schema, billing service or production deployment was introduced by this batch. Pushing the feature branch does not update production until it is merged into the configured production branch.
