# Advanced content review — 18 October 2026

This is an internal editorial expansion, not independent scientific certification or source verification. All 354 lessons retain draft status. Exact source editions and sections remain unresolved.

Six lessons now include additional derivations, explicit hypotheses, worked transfer examples, counterexamples and graded numeric Core questions:

| Lesson | Added material | Limits made explicit |
| --- | --- | --- |
| PH7.4 Canonical ensemble | Partition-function derivatives, energy variance, finite-reservoir entropy correction, degenerate two-level heat capacity | Fixed spectrum, convergence, finite versus unbounded spectra |
| MA11.4 Geodesics | Stationary-energy derivation, nonlinear reparametrization, explicit polar-coordinate straight line | Regular parameters, fixed endpoints, local versus global minimization |
| PH15.2 Classical fields | Action boundary term, fixed-coordinate Noether current, flux balance, scalar Hamiltonian | Boundary conditions, on-shell identities, broken shift symmetry |
| PH7.6 Quantum statistics | Occupation variance, Fermi-sphere counting and pressure scalings | Ideal equilibrium states, dispersion, dimensional dependence of condensation |
| PH16.1 Equivalence principle | Operational acceleration/tide distinction, Newtonian tidal Hessian, radial stretching and transverse compression | Weak field, small separation, vacuum trace condition |
| PH18.1 Reading research | Claim ledger, correlated residual statistic and synthetic two-measurement example | Positive-definite covariance, fitted parameters, no claimed observational replication |

Automated checks independently recompute the new Core numeric answers, compare partition-function finite differences with exact fluctuations, and verify both polar geodesic equations and invariant speed over several test points. These checks catch arithmetic/sign regressions; they do not validate all scientific claims or replace source review.

The content generator also now sets authored/downloadable lesson availability consistently with the curriculum. A regression checks all 354 generated lessons, avoiding a stale unavailable flag in otherwise playable lesson downloads.

Remaining editorial work covers the other lessons and exact source inspection for these six. No named independent reviewer, source certification, real laboratory run or capstone completion is claimed.

Validation for this revision: production build and content validation passed for 354 authored lessons; all 87 model/grading/example tests passed; Worker TypeScript and dry-run bundle checks passed; the one local Worker auth/origin/concurrent-counter test passed. The latter accepts exactly 50 calls under contention and is not a live-provider test.

The cloud environment currently has no injected server secrets or cloud admin identities. The Firestore emulator's official download host remains outside the enforced network allowlist, so its rules tests were not rerun. Live production rules, real-account synchronization, Cloudflare deployment and provider activation are not established by this revision.

All 82 browser cases passed against the final production build, including the full 354-lesson rendering sweep and offline/account-isolation workflows. An earlier intermediate sweep was interrupted for the final content rebuild; a port-conflict startup attempt was resolved by stopping that sweep before the successful full rerun.


## Field-theory and curvature follow-up

Three more draft lessons have expanded derivations and graded Core transfers:

| Lesson | Added material | Limits made explicit |
| --- | --- | --- |
| PH15.3 Scalar quantization | Periodic-box mode normalization, equal-time commutator, oscillator Hamiltonian and vacuum reference | Truncated delta kernels, boundary conventions, separate massless zero mode |
| MA11.5 Curvature | Explicit sphere connection/component calculation and scalar-zero product counterexample | Coordinate versus invariant quantities, chart domain, dimensional assumptions |
| PH15.6 Renormalization | Explicit regulated-integral matching subtraction, finite-cutoff correction and integrated toy beta law | Toy model versus physical amplitude, perturbative extrapolation, EFT coefficient assumptions |

The numeric regression checks each new Core answer, exact matching-point independence at several cutoffs, approach to the subtracted limit and the derivative of the integrated running coupling. All nine expanded lessons remain drafts; exact source inspection and independent scientific review are still pending.

Follow-up validation: production build/content validation passed for all 354 drafts; all 88 model/grading/example tests and all 82 browser cases passed against this build. Worker code/configuration was unchanged in this follow-up; the earlier local Worker results above are retained, not reported as a new live-provider check.
