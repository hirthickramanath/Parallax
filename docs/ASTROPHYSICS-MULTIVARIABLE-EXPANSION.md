# Astrophysics and multivariable expansion

## Authored changes

All 61 astrophysics lessons (AS1–AS10) and eight multivariable lessons (MA2) have added derivations, 138 numeric transfer questions and 69 model-assumption checks: 207 questions total. Original theory is retained. A new directly manipulable investigation is embedded in each of these 69 lessons, with keyboard controls, units, equations and explicit limitations.

Investigations cover celestial geometry, spectra/transfer, stellar scalings, accretion, relativistic motion, plasma scales, planetary inference, galactic dynamics, cosmology, synthetic survey/likelihood analysis and multivariable geometry. These are controlled analytic relationships and local models, not 69 full numerical solvers or actual observed datasets. Existing orbit, radiation and Bayesian widgets remain where relevant. Plot axes explicitly rescale; numerical values, not pixel heights, must be compared across settings.

The common plot supports horizontal dragging. Count-valued parameters remain integer-valued. Decimal slider increments permit ordinary values without invalid-step errors. Mobile dragging and keyboard alternatives are tested. Two small numerical exercises were expressed in suitable units; the gravitational-wave arm response now has an explicit fractional-response definition rather than an ambiguous polarization convention.

## Source inspection and review

The ledger has 80 current partial mappings, up from 34. This is NOT 80 completely verified lessons. Introductory passages only corroborate their recorded claims; new advanced equations and model code are explicitly outside that scope unless separately inspected. Source files are pinned to commits and hashed; lessons remain drafts, and independent verification remains zero.

Official Astronomy source: `openstax/osbooks-astronomy`, commit `dff6acf8df597ceda73985308f838ed38417a606`. Exact module and paragraph IDs, scopes, source hashes and current lesson hashes are in `content/review/source-inspections.json`.

Official Calculus source: `openstax/osbooks-calculus-bundle`, commit `8dbc2ce19e804924b2517b89ac72ee45be949d15`. Additional MA2 mappings specify exactly which definitions/identities were read and what remains internally checked only.

Critical source notes:

- Astronomy `m59887`, paragraph `fs-id1170325151113`, misleadingly says solar convection is important in central regions and near the surface. Its qualitative circulation description is the mapped scope; the solar-center statement is not adopted. A reference snapshot can contain errors.
- Calculus `m53940`, paragraph `fs-id1167794334787`, uses shorthand linking partial derivatives to differentiability. That is not a valid unrestricted implication. The new MA2.1 counterexample distinguishes existence of partials from full differentiability, and MA2.2 assumes differentiability for the directional-gradient identity.
- Synthetic survey, statistical-tension and capstone models are demonstrations, not executed real survey analyses, current measured tension estimates or completed paper reproductions.

## Checks and remaining work

All 325 unit/content/model/evidence checks passed and the production build passed. The new mobile, probability/count and multivariable browser cases passed after correcting a decimal-slider step issue; all 100 browser cases then passed against the corrected final build, including all 354 lesson bodies. An intermediate sweep had 98 passes and one invalid-step failure, which was corrected before this complete passing run. Browser authentication is mocked, not a live Firebase check.

The review queue currently lists 248 lessons without an explicit widget (implicit vector/black-hole widgets excluded). Suitable investigations and question depth still need work elsewhere. All 354 draft lessons require independent scientific and pedagogical review before verification/publication claims. No live cloud configuration or optional service was activated by this authoring work.
