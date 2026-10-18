# Checked chapter batches

This is the current authoring-release record. `COURSE-STATUS.md` is the generated coverage ledger. Older foundation/follow-up documents describe earlier milestones and service setup.

## New content

Thirty original lesson drafts were added in four prerequisite-oriented batches:

| Unit | Lessons | Main checks and distinctions |
| --- | --- | --- |
| MA1: Real analysis | MA1.1–MA1.8 | Quantifier order, completeness, limit proofs, convergence hypotheses, compactness, mean value theorem, Darboux integration and uniform versus pointwise convergence |
| PH1: Classical mechanics | PH1.1–PH1.6 | Open-system momentum balance, rotating-frame signs, effective potentials, scattering geometry, rigid kinematics and inertia-tensor dynamics |
| MA2: Multivariable/vector calculus | MA2.1–MA2.8 | Total differentiability versus partials, Taylor assumptions, regular constraints, Jacobians, oriented integrals, topology and singularities in integral theorems |
| MA3: Linear algebra | MA3.1–MA3.8 | Basis versus map, rank–nullity, determinant versus conditioning, diagonalizability, complex inner products, Hermitian spectral theorem, SVD and Jordan dynamics |

The course now has **79 authored drafts** and **321 recall cards**. All retained 354 lesson IDs and 59 units are unchanged. There are **275 missing lesson bodies** and **zero independently verified lessons**. A compiled lesson is not a scientific certification.

Each new lesson includes a prediction, motivation, intuition, explicit definitions, theory with hypotheses and limitations, an investigation, a worked argument, separate warm-up/core questions, a majority-conceptual check and four genuine retrieval cards. Investigations in these chapters are proof, coordinate, model or numerical exercises; they are not falsely represented as new physical apparatus or externally measured datasets. The existing six apparatus remain available.

The prose is original. Reference names are review leads, explicitly marked as awaiting exact edition/section and independent verification. Proof sketches and calculations have been checked internally; they do not replace a complete reference text or independent review.

## Grading correction

The previous blanket 2% numerical tolerance could accept 100 for an integer-threshold exercise whose specified exact result is 101. Numeric questions can now declare `exact: true`. The player labels those as requiring an exact numeric value and compares numeric values without the approximate tolerance. Equivalent numeric formatting such as `101.0` is accepted; blank and nonfinite input is rejected.

Approximate numerical questions retain the existing 2% relative / 10⁻⁶ absolute default. Attempts use the same existing storage records. No cloud schema or user preference migration was introduced. Content validation rejects an exact flag of the wrong type or attached to a nonnumeric question.

## Validation approach

- Content build checks every MDX source, template, answer key and prerequisite graph.
- New example tests independently compute selected bound, sum, coordinate, matrix and mechanics answers and compare them with the authored answer keys. They check arithmetic consistency, not universal theorem validity.
- The numerical-grade regression checks the adjacent integer that the old approximate mode accepted. A browser regression submits both the incorrect adjacent answer and the correct exact one.
- Every authored lesson is rendered through the production lesson player, commits a prediction, reveals full theory, checks KaTeX/runtime errors and opens its investigation. The sweep is grouped by unit, so corpus growth does not create one increasingly large timeout-prone test. No authored lesson is omitted.
- Existing mobile/desktop layout, account isolation, notes, revision, projects, apparatus and planning flows remain included.

## Continue authoring

Follow the missing-ID ledger rather than inventing replacement course IDs. Keep source status honest. Do not upgrade draft status solely because compilation or arithmetic tests pass. For the next batches, prefer the earliest available prerequisites and supply derivations, counterexamples, assumptions and meaningful problems before adding downstream applications.

Firebase production rule publication and cross-device verification, eligible live tutor setup, background push, and an agreed cloud preference profile remain separate outstanding work. Their details and owner-session requirements are in `FOUNDATION-RELEASE.md`. This branch neither deploys those services nor claims that mock browser sessions verify them.

## Recorded results

- Production build/app TypeScript, content compilation and graph validation: passed.
- Arithmetic, learning, model, planning, grading and stream suite: **40 passed**.
- Browser sweep: **31 checks passed initially**; the MA3 sweep identified one SVD section with plain-text equations instead of rendered math. After correcting that section, **the MA3 unit check passed**, completing successful coverage of all **79 authored lessons** and the existing application flows. Assertions were retained; no lesson was skipped.
- The exact-answer browser regression rejects 100 and accepts 101 for the specified index expression.
- Source/scientific review and real production-service verification remain incomplete. No verified badge or live-provider success is claimed.
