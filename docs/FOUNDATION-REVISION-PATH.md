# Guided foundation revision inside Parallax

## Purpose and entry

For a learner returning to Class 11–12 ideas after a long gap, remembering terminology and reconstructing the reasoning should precede harder course work. Open the dashboard and choose **Start in-depth revision**, then **Begin guided revision**. Direct chapter links also activate revision priority. Settings → **Prioritize foundation revision** can pause or resume that priority without deleting history.

The route covers all 38 existing foundation/bridge chapters: 16 maths, 17 physics and 5 supporting chemistry. Its sequence introduces vectors before plane normalization, conics before gravitation, and differentiation/integration before differential equations. Periapsis and apoapsis are defined explicitly, including the focus reference; fluids derive the cancellation of vessel area, and thermodynamics states its work sign convention.

## Chapter experience

Each chapter offers four saved steps:

1. Plain-language vocabulary, a stepwise reconstruction and a common misconception.
2. Two worked examples with individually expandable reasoning steps.
3. The original complete theory, including mathematical derivations and assumptions, with no quick-depth truncation.
4. Three chapter-specific practice checks: a starter calculation, a conceptual distinction and a changed situation. Feedback and smaller-step hints are available without a timer or penalty.

Existing interactive investigations stay beside the explanation. This release reuses the connected chapter models; it does not introduce 38 new apparatus simulations. The player hides the dashboard/sidebar and retains appearance controls and exit links. All 38 chapter theory/model views were checked in a 390 px browser viewport.

The collection adds 76 worked examples and 114 practice checks. Every chapter can be revisited. Practice completion requires acknowledging all three reading steps and correctly checking all three answers. Completion earns five XP once per chapter/version; it does not mark an original lesson read, award ordinary course mastery or reset notes/streaks. After all 38 chapters, a readiness-check link leads back to the existing placement flow. Small revision sets do not certify independent mastery or prove long-term retention.

## Dashboard and persistence

While revision priority is active, the main continuation card, level map and automatically generated weekly plan direct the learner to foundation revision before advanced work. Seven next chapters are suggestions, not a deadline. The original course continuation returns when revision priority is paused. The optional problem of the day uses a foundation chapter during this mode.

Account-owned revision records use the existing `plan` collection under keys `foundation-rebuild-<lessonId>`, versioned `foundation-rebuild-v1`. They record current step, reading acknowledgements, practice responses/feedback and completion time. The revision-priority preference `foundationRevision` is saved per account on this device. Revision records use the existing local persistence and authenticated cloud synchronization mechanisms; no new Firestore collection or access rule is introduced. Real production cross-device synchronization still needs an authenticated user check.

## Evidence and limits

- Production build/type check and 652 unit/content/model/evidence tests pass.
- Three new browser tests pass: progressive completion and refresh, preservation/pause/account isolation, and all 38 full-theory/model views on mobile. The full regression suite also passed all 113 browser tests. The Firestore emulator owner/cross-account rule test passed.
- The authoring validator requires exact foundation coverage, defined terms, derivation steps, two worked examples, distinct graded checks and valid answer formats. These structural checks do not establish scientific correctness.
- All revision guides remain explicitly **draft**, alongside the original draft course. Foundation review packets now include the separate guide, worked examples, checks, source hashes and UI/grading source files. Original MDX approval cannot silently approve these additional materials. No independent approval is fabricated.
- The earlier volunteer response was chat-only qualitative feedback. This release is not evidence of an app-based learner trial, learning gain or retention. Those measurements and qualified scientific review remain pending.
