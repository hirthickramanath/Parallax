# Course depth, simulations and review: batch progress

Latest release: [69-lesson astrophysics/multivariable expansion](ASTROPHYSICS-MULTIVARIABLE-EXPANSION.md). Followed by the [21-lesson MA3–MA5 expansion](LINEAR-ODE-PDE-EXPANSION.md). Then the [electromagnetism release](ELECTROMAGNETISM-EXPANSION.md). Then the [physical/molecular chemistry release](PHYSICAL-MOLECULAR-CHEMISTRY-EXPANSION.md). Then the [bonding/organic chemistry release](BONDING-ORGANIC-CHEMISTRY-EXPANSION.md). Then the [complex/probability/variational release](COMPLEX-PROBABILITY-VARIATIONAL-EXPANSION.md). Current partial mappings: 142; lessons without explicit widgets: 132. The counts below describe the earlier three-batch run.

## Completed in this run

| Batch | Lessons deepened | Questions added | New interactive models |
| --- | --- | --- | --- |
| Real analysis, MA1.1–MA1.8 | 8 | 32 | Darboux envelopes; uniform convergence/domain dependence |
| Advanced mechanics, PH1.1–PH1.6 | 6 | 24 | Coriolis vectors; rigid-body inertia; Rutherford scattering |
| Analytical mechanics, PH2.1–PH2.7 | 7 | 28 | Hamiltonian phase contours; canonical shear |
| Total | 21 | 84 | 7 |

Questions include numeric transfer problems, conceptual hypothesis checks, hints and explanations. New models support direct manipulation and accessible numeric/keyboard controls inside lessons. Existing orbit and coupled-oscillator models are reused only where relevant. These displays explain their idealizations and do not pretend to numerically integrate a trajectory when they show an exact contour or instantaneous vector.

Source inspection expanded from 21 to 34 current lesson mappings. Inspected sources include the author-maintained Basic Analysis book, official OpenStax source snapshots and official SymPy mechanics documentation. Every mapping states its scope and source/lesson fingerprint. This is partial AI-assisted inspection, not complete source verification, an independent review, or a learner trial.

Detailed batch notes: [real analysis](REAL-ANALYSIS-BATCH.md), [advanced mechanics](ADVANCED-MECHANICS-BATCH.md), [analytical mechanics source scope](ANALYTICAL-MECHANICS-SOURCE-INSPECTION.md).

## Validation

Final production build passed; all 188 unit/content/model/evidence checks and all 97 browser cases passed. The browser sweep covers all 354 lesson bodies plus shared flows and new model controls. All three batches were committed and pushed to `codex/complete-foundation-course` and `main`. Cloudflare production deployment success remains unverified.

## Still pending across the project

- Continue deeper derivations, worked examples and more varied adaptive question banks through the rest of the curriculum. All 354 lessons have draft bodies; body coverage does not mean publication-level depth.
- Broaden lesson-specific interactive coverage. The generated review queue currently lists 313 lessons without an explicit widget; implicit vector/black-hole widgets are excluded from that count, and some proof-based lessons need a counterexample explorer rather than an apparatus.
- Continue exact-source inspection beyond the 34 partially mapped lessons and beyond the narrow claims already mapped. In particular, advanced canonical, Noether and Hamilton–Jacobi proofs still need theoretical-source inspection.
- Independent expert review of lesson text, questions and model code. Zero lessons are independently verified. The publication gate remains closed without matching independent evidence.
- Run real learner pilots and use their results to tune difficulty, transfer and retention. Pilot forms/reporting infrastructure exists; no genuine learner study has been run.
- Verify the production Pages deployment, real Firebase sign-in/progress and configured optional services. A Git push does not establish that a deployment or live integration succeeded. Browser test authentication is mocked. Optional tutor, shared assessment and reminders infrastructure still needs service configuration and deployed checks; these are distinct from content work.

See [the generated review queue](COURSE-REVIEW-QUEUE.md) for lesson-by-lesson triage and [pending live checks](PENDING-REVIEW-AND-LIVE-CHECKS.md) for service prerequisites. No change in this run activates a paid service or changes eligibility requirements.
