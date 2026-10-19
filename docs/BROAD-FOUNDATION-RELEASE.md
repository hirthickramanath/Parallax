# Broader foundation and source-review follow-up

This release progresses the remaining course, simulation, review and service work. It does not complete textbook-level depth or bespoke models for all 354 lessons, independent scientific review, real learner trials or live service deployment.

## Content

Thirty lessons across foundation maths/physics, introductory astrophysics, chemistry and scientific computing now have rewritten warm-up/Core prompts, a distinct numerical transfer problem and a derivation/failure-case extension. Original theory and existing apparatus remain. This replaces 60 repeated prompts and adds 30 questions. Each affected bank now contains seven unique prompts. The full 354-lesson set has zero normalized repeated prompts, enforced by both content validation and regression tests. Uniqueness is a quality check, not proof of sufficient depth or calibrated difficulty.

Affected IDs: MB1.1–MB1.4, MB2.1, MB4.1–MB4.4, PB2.3, PB3.1–PB3.3, PB4.1, PB4.3–PB4.4, PB5.1–PB5.3, AS1.4–AS1.5, CB.3–CB.5 and CP1.1–CP1.6.

## Models

- MB4.3: Bayesian positive-result population model, including base rates and an explicitly undefined posterior when no positives exist.
- PB3.2: directly movable lens object with real/virtual ray construction, signed magnification and focal-plane infinity case. A small physical object keeps the rays near-axis; the diagram explicitly exaggerates its vertical scale rather than presenting drawn angles as physical ones.
- PB4.3: stationary-coil flux-linkage model with draggable normal, turns, area and signed field-change rate. Selecting another orientation is not modeled as a rotation transient.
- AS1.5: radial tidal probes comparing exact near/far gravity with its small-separation approximation. This is an instantaneous Newtonian field comparison, not an orbit/disruption simulation.

Every model has keyboard controls for its adjustable quantities, units/conventions and limitations. The review queue now finds 328 lessons without explicit widgets; inferred/player-mapped models remain outside that count. No claim of universal simulation coverage is made.

## Source and independent review

Actual AI-assisted source inspection covered selected claims in 13 physics lessons through 19 official OpenStax module mappings. [The report](PARTIAL-SOURCE-INSPECTION.md) and JSON ledger pin the source commit and lesson/source fingerprints and state the uninspected scope. This is a concrete source-inspection step, not independent verification of entire lessons. All 354 lessons remain drafts.

[Independent-review evidence](INDEPENDENT-REVIEW-HANDOFF.md) now has a build-enforced contract for complete sections/questions, exact sources, reviewer/date, author separation and a current lesson fingerprint. Metadata completeness does not authenticate reviewer identities or prove truthful entry; actual review is still required. No synthetic test record is added to the production evidence ledger.

## Assessments and live prerequisites

The draft randomized server bank grows from six to 11 supported lessons. Capability IDs are shared by client and Worker; answers stay on the server. Existing receipt/session authority and replay/account protections are retained. The five new banks are PB2.1, PB2.2, MB2.2, MB4.3 and AS1.5. This is not calibration, certification or proof of unassisted learning.

The running environment has no Cloudflare API token/account binding, Firebase admin identity, VAPID private secret or eligible AI-provider binding. Current network policy also excludes the production Pages host and official Firestore-emulator download host. Required Cloudflare token/account names were saved as a configuration draft; the API token destination api.cloudflare.com was added to that draft. Saving did not inject credentials or activate the services. Review/save the environment settings and publish the environment after entering authorized values securely. Firebase owner-session checks, VAPID configuration, actual browser push delivery and provider eligibility still require their own setup. No secrets should be pasted into chat or source files.

Real evaluation still needs willing participants to complete baseline, instruction, immediate and delayed forms from the existing pilot kit. Synthetic scorer tests are not participant results. Course-wide empirical difficulty calibration cannot be claimed without those observations.

Validation: production build/content validation passed for all 354 drafts; 144 content/model/evidence tests passed; four local assessment tests passed, including JWT, ledger/replay/account isolation and all 11 banks; assessment TypeScript and Worker dry-run bundle checks passed; all 93 browser cases passed. After the final lens scale clarification, the production build and affected model browser case passed again. The regenerated audit records zero duplicate prompts and 13 current partial source inspections. No live deployment or actual learner study is claimed.
