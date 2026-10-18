# Complex analysis batch

This is the current authoring release. The generated [course ledger](COURSE-STATUS.md) records actual coverage.

## Added lessons

Six drafts, MA6.1–MA6.6, cover complex differentiability and Cauchy–Riemann equations, contour integration and Cauchy theory, residues and real integrals, Laurent expansions and singularities, conformal maps, and branch cuts/analytic continuation. Coverage is now **155 of 354 lesson bodies**, with **625 retrieval cards and 199 missing bodies**. All authored lessons remain drafts awaiting independent scientific and source review.

Theory distinguishes pointwise differentiability from holomorphicity, local angle preservation from global injectivity, a Laurent series from its annulus, principal values from ordinary improper integrals, and a branch convention from continuation along a path. Domain topology, contour orientation, arc estimates, pole cancellation and boundary scaling are explicit. The elementary examples do not imply exhaustive treatment of complex analysis or all its applications.

Each draft includes definitions/hypotheses, theory, a worked example, an investigation, conceptual checks, separate warm-up/core checks and four recall prompts. Selected discrete orientation, pole-order and loop answers use the existing exact numeric-grading option. Stein/Shakarchi and Ahlfors are source-review leads; exact edition/section mapping and independent verification remain pending.

## Branch-tracking visual

MA6.6 contains a mathematical explorer of the unit-circle path z=exp(iθ), starting at z=1 and following zero to two counterclockwise loops. A slider and angle presets compare the continuously tracked square root exp(iθ/2) with a separately evaluated principal root. The principal logarithm uses argument in (−π,π), excluding the nonpositive real axis. At 180° and 540°, the principal readout is explicitly undefined; the continued value remains available.

The source point and root occupy separate complex-plane diagrams. Filled and open markers distinguish continuation from the principal endpoint value. Text readouts expose both roots and logarithm arguments. After one loop the continued root changes sign; after two it returns, while the logarithm has accumulated 4πi. The tracked path is not a global single-valued branch on the punctured plane.

This is an exact mathematical illustration, not a hardware apparatus or measured experiment. The Labs catalogue remains at ten apparatus benches. No new database schema, cloud service or billing dependency was added.

## Validation and remaining work

Model tests verify that both available roots square to the same source, unit modulus, one- and two-loop behaviour, continuity of the tracked root across the chosen cut, the principal jump, and invalid-input handling. Authored-answer tests independently calculate selected derivatives, residues, orientation signs, conformal area scales and loop values. Browser checks render all authored theory and exercise the explorer at a phone-sized viewport.

Validation passed: production build, all 59 model/grading/example tests, and staged whitespace checks. The full browser run passed 47 cases and exposed one ambiguous substring selector in the new explorer test. After making its readout selector exact, the affected case passed its targeted rerun. All 48 browser cases have therefore been verified; the full suite was not repeated after this test-only selector correction.

Independent scientific/source review and the 199 missing lesson bodies remain. Live Firebase/rules publication is not verified by the fixture-based browser suite. The tutor stays disabled pending an eligible provider/account setup. A feature-branch push does not deploy production until the configured production branch is updated.
