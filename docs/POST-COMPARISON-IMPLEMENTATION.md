# Post-comparison implementation — 19 October 2026

This release implements shared learning-flow improvements and new backend services. It does not claim independent scientific review, activated cloud services, completed learner trials or a uniformly finished 354-lesson course.

## Learning flow and UI

- Answers, submitted feedback, the adaptive sequence, prediction drafts and theory reveal position persist per lesson/restart generation. Resume returns to the saved practice question rather than always the top of a long section.
- Identical unchanged answer submissions are disabled. Adaptive first attempts remain locked so the displayed response and tier decision agree. Repeating a check is labelled honestly and clears its old response state.
- Reading completion is explicit. It grants a smaller reading award; the full lesson award requires the configured local check score, Warm-up/Core work and Full depth. Existing historical awards are preserved. The map distinguishes reading from local demonstrated mastery; neither is a certified result.
- Practice bypass is explicitly labelled as continuing reading/skipping remaining practice. Complete theory remains accessible.
- The inactive tutor entry is labelled as saved conversations with live tutoring unavailable. It does not imply working AI assistance.
- Restart lesson selection is searchable. The weekly plan can collapse after being seen while appearing automatically in a new week.
- Removing duplicate section text from the entry metadata reduced the main JavaScript bundle from approximately 656 KB to 331 KB gzipped in the measured builds. Complete MDX lesson bodies and public JSON tutor text remain; a regression verifies their identities and text contract.

## Content and interactive work

PB1.1–PB1.4 gained 28 questions, including 24 independently recomputed numeric answers and four conceptual transfer checks, plus hints/misconception explanations and deeper theory. Collision and rolling models supplement existing free-fall and pendulum apparatus. The new models expose direct manipulation and conservation/energy checks, with idealization limits stated.

The optional end-of-lesson difficulty feedback is saved with existing study records. An export-analysis script and learner-evaluation protocol are included. These are instruments for future observation, not evidence that a trial has already occurred or difficulty is calibrated. See [MECHANICS-UNIT-EVALUATION.md](MECHANICS-UNIT-EVALUATION.md).

## Conditional backend work

A separate authenticated assessment Worker issues numerical instances and retains the grading specification and immutable results on the server. It rejects client-submitted score/identity fields, isolates accounts, limits issuance, pins bank versions and handles repeat submissions without score inflation. Its initial draft bank covers six lessons. Personal-study XP in Firestore remains untrusted for future rankings. The server result is not a proctored or independently certified assessment.

A separate opt-in background reminder Worker implements VAPID/Web Push encryption, authenticated subscription management, timezone scheduling, duplicate suppression, bounded retries, sign-out/unsubscribe behavior and a deliberately limited pilot. The implementation does not imply real-device delivery or activated services. See [SERVER-ASSESSMENTS-AND-REMINDERS.md](SERVER-ASSESSMENTS-AND-REMINDERS.md) for scope, limits, secure configuration and live acceptance checks.

## Work that remains

- Independently review every lesson and verify exact sources; all 354 lessons remain drafts, with zero independently verified/published lessons.
- Deepen the rest of the curriculum's questions, derivations, remediation and topic-specific simulations. Expanding this mechanics unit does not close those tasks across all lessons.
- Conduct real learner evaluation and delayed transfer/retention checks; review the results before claiming calibrated difficulty or effectiveness.
- Verify actual deployed Firebase rules and real-account cross-device/offline/restart behavior.
- Configure/deploy and live-test the new server services with an authorized free-capable account and securely supplied VAPID configuration. Both default to disabled.
- Configure and test an eligible tutor provider/account. No provider eligibility or credential bypass is implemented.
- Verify Cloudflare's production build and actual deployed behavior after the production branch update. Git history alone does not establish deployment success.

There are no injected cloud administration identities, server secrets or live learner sessions in this execution environment. Current enforced outbound policy also excludes the official Firestore emulator download host and the live Pages domain. These gaps prevent the corresponding live checks; local mocks are not substituted as proof.

## Validation evidence

- Production build/content validation: 354 authored drafts, zero missing bodies; 1,421 recall cards unchanged.
- Model/grading/example suite: 94 passed, including mechanics arithmetic, conservation/energy partition and full public-text versus lean-entry-metadata consistency.
- Full browser suite: 91 passed, including every lesson's theory rendering, existing account/offline workflows and the four new resume/progression/mechanics cases. After the final browser-unsubscribe fallback, the production build and four focused feature cases passed again.
- Assessment suite: 3 passed (JWT claim/signature rules, numeric bank checks, account-isolated immutable server grading and concurrent issuance limit).
- Reminder suite: 3 passed (endpoint/timezone boundaries, encrypted mock delivery including dispatch overlap/unsubscribe races, and protected matching VAPID key generation).
- Existing tutor Worker suite: 1 passed. All three Worker TypeScript targets and the two new Worker dry-run bundles passed. Dry runs did not deploy.
- Export reporting was checked with a deliberately synthetic fixture; no real learner trial was conducted.

Live Firebase, eligible tutor/provider activation, real push delivery, cloud administration and independent source/scientific review remain unrun. Local browser authentication and push transport are mocked; this distinction is not erased by the test counts.
