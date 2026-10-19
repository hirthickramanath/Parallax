# Pending review and live checks

All 354 curriculum entries have draft MDX bodies and 1421 retrieval cards. This completes body coverage, not independent verification or exhaustive textbook-level treatment. Advanced lessons are concise draft introductions; some need deeper derivations, harder exercises and additional investigations before a publication-quality claim is appropriate.

## Shared flow and conditional services implemented

The [post-comparison release](POST-COMPARISON-IMPLEMENTATION.md) implements precise interaction resume, honest reading/mastery semantics, retry safeguards, clearer unavailable help, searchable restart selection, startup payload reduction, a deeper four-lesson mechanics unit, server-owned assessment records and opt-in background-reminder infrastructure. The new services are disabled until securely configured and deployed; local validation is not live activation or independent educational review.

## Foundation expansion and evaluation follow-up

PB2.1, PB2.2, MB2.2 and MB2.3 now have expanded derivations, 24 new numeric transfer questions and four directly manipulable embedded models. See [internal scientific notes](FOUNDATION-SCIENTIFIC-REVIEW.md), the [354-lesson review queue](COURSE-REVIEW-QUEUE.md) and [learner pilot kit](FOUNDATION-LEARNER-PILOT.md). The kit provides baseline/immediate/delayed forms and descriptive scoring; no real learner trial or independent review has occurred. Breadth/depth work across the remaining lessons is still pending.

## Broader foundation follow-up

Thirty additional banks have distinct warm-up/Core prompts, a new numeric transfer question and a theory extension. All 354 banks now pass normalized prompt uniqueness checks. Bayesian inference, thin-lens, induction and tidal models are embedded in their connected lessons. [Partial source inspection](PARTIAL-SOURCE-INSPECTION.md) covers specific claims in 13 physics drafts; it does not verify complete lessons. Publication now also requires a complete evidence record tied to the current lesson fingerprint. The server assessment bank supports 11 lessons, but activation remains pending.

## Calculus and bonding follow-up

MB3.1–MB3.5, PB4.2, CB.1 and CB.2 now have 40 added problems/checks and theory extensions. Four models support limit bounds, signed/geometric area, ODE accuracy and ideal molecular geometry. [Additional source inspection](CALCULUS-CHEMISTRY-SOURCE-INSPECTION.md) extends current partial source mappings to 21 lessons; it is not independent verification. The pilot reporter also tracks optional second-marker agreement and matched immediate/delayed outcomes without equating forms or claiming a real trial.

## Real-analysis follow-up

MA1.1–MA1.8 have 32 added transfer/hypothesis questions, proof extensions and two embedded mathematical investigations. [Source inspection](REAL-ANALYSIS-SOURCE-INSPECTION.md) records eight scoped author-repository mappings, bringing the current total to 29 partially inspected drafts. Exact grading protects discrete counts and tail thresholds. This does not close independent review or advanced-course authoring.

## Scientific and editorial review

Internal expansion completed for nine advanced lessons, with additional derivations, counterexamples and graded Core transfers. See [ADVANCED-CONTENT-REVIEW.md](ADVANCED-CONTENT-REVIEW.md) for the exact scope and follow-up. This does not close independent scientific/source review.

- Review every draft’s hypotheses, proofs/derivations, units, limiting cases, worked answers and distractors. Automated answer arithmetic and error-free rendering are necessary checks, not a substitute for this review.
- Verify exact source editions/sections and inspect actual source material. Current book references are explicitly review leads; no quotations or precise source verification should be invented.
- Expand treatments where the existing draft is too brief for its stated goals, particularly advanced field theory, geometry, many-body theory and research methods. Include counterexamples and appropriately challenging Core work.
- Add named reviewer/date and verified sources using the existing publication contract before changing draft status. Currently zero lessons are independently verified/published.
- Real research reproductions, capstones and physical experiments have not been executed merely because a lesson describes their methods. Preserve that distinction and provide real data provenance when such work is performed.

## Lesson simulations and adaptive question depth

These remain explicit pending work after the [learning-flow redesign](LEARNING-FLOW-REDESIGN.md):

- Expand lesson-specific interactive simulations beyond the connected apparatus and new vector/black-hole models. The 354 authored lessons do not each have a bespoke simulation. Track coverage per lesson and develop suitable visual explorations, direct manipulation, predictions and theory connections, with accessible keyboard controls and clearly stated model assumptions.
- Deepen question banks across the curriculum with meaningful foundation, intermediate, Core and transfer problems, useful distractors, worked explanations and support after mistakes. Current adaptive sequencing uses a small authored bank; it does not establish equally rich or appropriately challenging practice in every lesson.
- Evaluate difficulty progression with learner feedback and assessment results. Check that stronger answers lead to substantively harder reasoning and repeated errors lead to useful scaffolding, while retaining complete theory. Do not treat sequencing alone as calibrated difficulty or completed content-depth work.

## Live Firebase verification

The browser suite uses synthetic authentication and blocked/mocked cloud requests. It does not prove production Firestore rules were published or that cross-device synchronization works under an owner session.

Verify the repository rules against the actual deployed database, then test sign-in, permitted owner reads/writes and denied cross-account access with separate real accounts/devices. Check offline changes reconnect without crossing account boundaries. Use the existing database paths; no new profile schema was introduced by the authoring batches.

The Firebase browser configuration is intentionally public and was previously restricted by the user. A GitHub alert closure is not independent proof of all live rules/API configuration.

## Tutor and reminders

The authenticated tutor interface/Worker remains disabled pending an eligible provider/account and securely configured server-side credentials, quotas and live verification. Do not bypass provider age/account restrictions or place secret provider keys in browser code, commits or chat.

Foreground reminders remain available. Background Web Push is now implemented as a bounded opt-in service but remains disabled pending secure VAPID configuration, deployment and real-browser delivery checks. See [SERVER-ASSESSMENTS-AND-REMINDERS.md](SERVER-ASSESSMENTS-AND-REMINDERS.md). Additional profile/cloud paths remain a separate design decision.

## Deployment and regression checks

Feature work is prepared on `codex/complete-foundation-course`. Production availability requires the production-branch update and a successful Cloudflare build; consult the current release report for the actual push/merge evidence. No production success follows from local tests alone.

At the completed draft checkpoint, the production build, all 83 model/grading/example tests and all 82 browser cases passed. Lesson content refreshes online with a saved-copy offline fallback; this is covered by a deployment-refresh regression.

After material edits, run content validation/production build, model/grading/example tests and the full browser suite. Retain passed, failed and unrun results distinctly. Worker/rules/live-provider checks should be rerun when those components or their configuration change; an unrun live check must not be reported as passed.

The excluded-subjects and separate engineering/technology plans remain in their existing Markdown documents. They were not silently added as new selectable domains to this astrophysics-focused app.
