# Control-by-control learning UX audit

19 October 2026 · Parallax code baseline: `7359d39` (application changes through `e4bbdb0`). Analysis only; these recommendations are not implemented by this document.

## Evidence and comparison boundary

Parallax behavior below is inspected directly in its React components and progress store. This is a source-level interaction audit, not a fresh usability study or verification of the deployed website.

Current authenticated screens, exact button labels, paywalls and experiments in Duolingo, Brilliant and Matiks were not accessible in this session. No current competitor button inventory is claimed. Their platform, version, course, subscription, account state and onboarding stage can change the interface. A precise competitor-side audit still needs current screenshots or recordings of equivalent journeys.

The comparison references used below are design lenses, not claims that a competitor currently has an identically named control:

- **Duolingo lens:** make the next practice action obvious, give immediate feedback, and support a recurring habit.
- **Brilliant lens:** have the learner predict, manipulate, reason and explain; interaction should carry the explanation.
- **Matiks lens:** build mathematical fluency through focused challenges and useful performance feedback. Timing should be optional in Parallax, especially for unfamiliar physics and derivations.

## Entry and sign-in

| Parallax control | Current action/state | Assessment and recommended decision | Design lens |
| --- | --- | --- | --- |
| Explore the course | Landing-page link opens protected `/learn`; an unauthenticated visitor is sent to sign-in | Label the actual immediate destination clearly. Prefer a short sample lesson or explicit sign-in wording instead of implying unrestricted browsing | Brilliant: demonstrate the learning before asking for commitment |
| Continue with Google | Starts Firebase popup authentication; disabled while busy | Keep; preserve a clear recovery path when a popup is blocked. Measure success separately from popup launch | All: remove entry friction |
| Email address | Required email input for passwordless sign-in | Keep. Show where the link was sent and what to do next | All: clear system state |
| Send sign-in link | Sends a sign-in email; busy state changes the primary label | Keep; provide a deliberate resend state and useful recovery rather than inviting repeated clicks | All: predictable recovery |
| Finish signing in | Completes a received email link | Keep; make cross-device email confirmation understandable | All: continuity |
| Request a new link instead | Returns the login form to link-request mode | Keep as secondary action; distinguish an expired link from a different account | All: recovery |
| Appearance / Color theme | Selects system/light/dark and four palettes | Keep customization, but consider a compact appearance menu rather than two persistent selectors on every non-lesson screen | Duolingo lens: keep the primary task visually dominant |

## Dashboard, navigation and path

| Parallax control or indicator | Current action/state | Assessment and recommended decision | Design lens |
| --- | --- | --- | --- |
| Brand | Returns to dashboard | Keep as a secondary navigation affordance | All |
| Dashboard / Learn / Activity / Settings | Four main destinations; desktop sidebar and mobile navigation | The smaller navigation is appropriate. Keep terminology consistent between desktop and mobile | Duolingo: obvious primary journey |
| Start this lesson / Recap & resume | Opens the recommended or most recently active lesson | Make this the dominant action. Resume currently identifies a lesson/section, not the precise unfinished interaction | Duolingo: one clear next action |
| Weekly lesson links | Open lessons in the automatically generated weekly plan | Useful, but several links compete with the hero, map and daily question. Present the plan at the start of the week, then allow it to collapse to a small progress summary | Duolingo: habit support without choice overload |
| Journey chapter | Selects a phase of the level map | Keep for browsing; default to the same next/current lesson as the dashboard | Duolingo: stable orientation |
| Available level node | Opens a lesson | Use a brief preview with purpose, expected effort and current state if direct opening feels abrupt | Duolingo + Brilliant |
| Prerequisite-recommended node | Still opens the lesson under soft locking; strict locking is enforced by the player | A grey/diamond appearance should not imply a hard lock if it is actually a preview. Say “Preview” or explain the prerequisite recommendation | All: match appearance to behavior |
| Completed level node | Reopens the lesson | Offer a distinction between revisiting an explanation and practising a weak concept. Reopening alone is not a new mastery assessment | Brilliant: purposeful revisiting |
| Current-level marker | Highlights the active/recommended lesson | Keep; use consistent meaning across the map, continue card and weekly plan | Duolingo: orientation |
| Problem-of-the-day choices/input | Accepts an answer in the right-hand panel | Keep as an optional challenge. Consider a collapsed teaser so the full question does not distract from resuming the main lesson | Matiks: optional short challenge |
| Problem-of-the-day Check answer | Grades the daily question; a correct answer awards the day's one-time XP | Add a useful post-answer next action: explain the misconception or open the related idea. Speed need not be mandatory | Matiks + Brilliant |
| Flame / XP / date | Primarily passive indicators | Do not count them as buttons. If made clickable, define a clear destination such as streak detail or activity history | Duolingo: meaningful habit feedback |
| Your activity | Opens the activity page | Keep secondary; distinguish completion, XP and demonstrated mastery | All: useful feedback |
| Avatar | Opens settings | Keep, with an accessible name. A profile menu could house appearance and account actions | All |
| Sign out | Ends the session; surfaces a failure if it cannot complete | Keep away from primary study actions. Explain device-cached records on shared devices | All |

## Inside a lesson

| Parallax control | Current action/state | Assessment and recommended decision | Design lens |
| --- | --- | --- | --- |
| Exit lesson | Returns to dashboard; section progress is saved | Keep accessible. Exact question state, adaptive sequence and revealed theory-block count are not fully restored, so avoid promising exact-step resume until that exists | Duolingo: continuity |
| Depth: Full study / Quick review | Filters Full-only sections; changing depth resets section index | Keep complete theory available, but move this choice to lesson setup or a compact menu. Mid-lesson switching can disrupt orientation | Brilliant: preserve reasoning continuity |
| Lesson section selector | Jumps among sections, subject to the initial prediction gate | Useful for reference/revision; too prominent for a first pass. A contextual forward action should guide first-time learning | Duolingo: clear sequence |
| Prediction textarea | Captures an ungraded prediction | Keep; make the later explanation explicitly revisit that prediction | Brilliant: commit before reveal |
| Commit and investigate | Saves the prediction and opens the explanation | Keep. Follow it with an observation or consequence, not only permission to read another block | Brilliant |
| Adaptive answer choice / numeric input | Answers one selected readiness question | Keep, but the current bank supports only a small tier-based sequence, not a validated ability estimate | All: substantive adaptation |
| Adaptive Check answer | Grades, saves an attempt and fixes the first response's direction for the next tier | Clarify first-attempt behavior. Editing an answer can change displayed feedback while the next-tier decision still reflects the first result | All: understandable feedback |
| Next challenge | Selects an unused question near the adjusted level; saves a provisional track level | Useful. Show a short reason for the change, use genuinely harder reasoning, and pause after sufficient evidence | Matiks: progression; Brilliant: reasoning depth |
| Try a fresh check | Clears the local seen list and reuses the same authored bank | **Misleading label:** this does not guarantee fresh questions. Rename to “Try the check again” or supply alternate equivalent items | All: honest interaction labels |
| Reveal next theory step | Reveals the next React content block | This is progressive disclosure, not proof of active learning. Insert selected predictions or reasoning questions between meaningful derivation steps | Brilliant: interaction teaches |
| Show full theory | Reveals all blocks in the current theory section | Keep as an escape hatch for experienced learners and reference use. Reading/revealing should not itself imply understanding | Brilliant: full explanation |
| Symbol definition | Toggles an inline definition where authored | Keep; expand coverage deliberately and support keyboard/focus behavior | Brilliant: local support |
| Practice answer controls | All authored check/problem questions remain accessible; practice order responds to provisional level | Keep availability, but use a coherent problem ladder and targeted hints rather than only sorting a small list | Brilliant + Matiks |
| Check answer | Grades numeric/MCQ input, stores a new attempt and displays explanation | After success, a contextual “Next” action would be clearer. Repeated submission of an unchanged answer currently records another attempt; avoid inflating analytics with duplicate clicks | Duolingo: decisive feedback; Matiks: reliable attempts |
| Incorrect-answer feedback | Displays the supplied explanation | Add misconception-specific hints, a smaller related problem and a later independent retry. Showing the answer alone is insufficient remediation | Brilliant |
| Previous | Moves back one lesson section | Keep, but preserve local interaction/reveal state when moving between sections | All: reversible navigation |
| Continue | Moves to the next section; disabled for an uncommitted prediction | It can bypass the adaptive check and ordinary unanswered questions. Define whether it means “skip”, “continue reading” or “next assessed step”; do not silently equate these | Duolingo: coherent sequence |
| Finish lesson | Marks done, awards completion XP and creates recall cards | **High-priority semantic gap:** completion is allowed without passing checks. Keep reading-completion and demonstrated mastery clearly distinct in the result and map, or define a lightweight assessment requirement | All: progress means something |
| Continue the journey | Opens the next recommended lesson from the finish screen | Keep as the primary finish action. A short scheduled retrieval can bridge into it | Duolingo: momentum |
| Back to dashboard | Exits the finish screen | Keep as secondary | All |

## Recall, notebook and tutor

| Parallax control | Current action/state | Assessment and recommended decision | Design lens |
| --- | --- | --- | --- |
| Recall, then reveal | Reveals a due card inside a lesson interlude | Keep; prompt retrieval before revealing, without forcing a separate study destination | Duolingo: integrated repetition |
| Again / Hard / Good / Easy | Self-ratings update FSRS scheduling and review logs | Appropriate for explicit self-rating, but these are not independently graded answers. Briefly explain the rating meanings, and consider occasional objective retrieval checks | All: honest mastery signals |
| Continue with this lesson | Dismisses the short recall interlude | Keep as a non-punitive skip. Review remains due unless actually rated | Duolingo: low-friction return |
| Notebook textarea | Saves account-scoped notes | Keep available, but consider collapsing it until requested so it does not dominate each lesson screen | Brilliant: reasoning support |
| Make a review card from this note | Creates a recall card from the note; disabled when empty/after one creation in the mounted player | Useful optional action. Let learners preview/edit the prompt so cards test a specific idea | Brilliant: meaningful retrieval |
| Ask about this section | Opens a tutor panel even when the tutor endpoint is not activated | Show availability before the click. Opening a mostly disabled panel is a dead end during learning | All: avoid nonfunctional primary affordances |
| Explain differently / I’m stuck on this step / Why does this work? | Send predefined prompts when the tutor is configured; otherwise disabled | Do not count disabled integrations as completed teaching support. Authored hints should remain usable without live AI | Brilliant: reliable local support |
| Give me a practice problem / Check my answer | Tutor prompts, currently dependent on activation | Keep separate from deterministic grading. Future AI feedback needs clear uncertainty and verification boundaries | All |
| Ask tutor | Sends a contextual streamed request when configured | Keep only with clear connected/error/quota states; do not imply current live availability | All |
| Stop reply | Cancels an in-progress reply and preserves received text | Keep when the service is activated | All: user control |

## Simulation controls

| Control family | What is actually available | Recommended next step | Design lens |
| --- | --- | --- | --- |
| Vector A/B tips | Drag or use arrow keys; components, sum and dot product update | Build a small task sequence: construct perpendicular vectors, predict the dot product, then explain the result. Free dragging alone is not a complete lesson | Brilliant |
| Photon impact slider / launch handle | Changes a finite-step Schwarzschild null trajectory; capture/scattering updates | Ask learners to locate the transition and explain why the photon sphere is unstable. Keep coordinate/model limits visible | Brilliant |
| Existing apparatus sliders/selectors | Update model parameters and visual/numeric output in connected lessons | Replace passive parameter inspection with prediction → manipulation → observation → explanation tasks; add direct apparatus manipulation where it improves understanding | Brilliant |
| Record synthetic reading | Adds explicitly synthetic observations to apparatus tables | Keep data provenance visible. Ask learners to interpret trends/errors rather than merely accumulate rows | Brilliant |
| Simulation presets | Set interpretable states such as circular launch or normal modes | Keep, but make each preset answer a learning question. Distinguish a preset from a measured result | Brilliant |
| Simulation Run-style actions | Where present, start or record a model operation | A working button is not evidence of a rich simulation. Evaluate the resulting learning task and available manipulation, not the number of controls | Brilliant |

## Course discovery and settings

| Parallax control | Current action/state | Recommended decision |
| --- | --- | --- |
| Search curriculum | Filters course text/lesson titles | Keep as secondary discovery; support conceptual synonyms later |
| Phase tabs | Switch curriculum phase | Keep for browsing; preserve search/phase when returning from a lesson |
| Check your starting point | Opens Bridge placement | Promote for experienced learners rather than making them traverse every easy introduction |
| Unit skip test | Evaluates a short authored test and can grant unit credit | Broaden and validate items before treating this as strong placement evidence |
| Project unit selector / lesson links | Opens a project rubric or its connected lesson | Keep a clear distinction between reading a rubric and completing a project |
| Revert lesson progress | Opens restart configuration | Prefer the clearer label “Restart learning progress” |
| Beginning / particular point | Chooses reset scope | Keep; show an understandable preview and exact affected count |
| Restart lesson / section | Chooses the restart position | Replace the 354-option lesson selector with searchable chapter/unit selection as the library grows |
| Confirm restart | Resets selected onward progress and schedules, retaining notes/history | Keep explicit confirmation; say what stays saved and when syncing is pending |
| Cancel | Leaves restart unapplied | Keep clearly visible beside confirmation |
| Default depth / goal / strict prerequisites | Changes study preferences | Keep in settings, with a plain-language explanation of consequences |
| Save timezone | Validates and saves an IANA timezone | Keep; a searchable city/timezone picker would be easier than a raw identifier |
| Reminder toggle / time | Configures opt-in foreground reminders | Keep honest about foreground-only operation |
| Enable browser notifications | Requests browser permission after explicit action | Keep permission requests deliberate; explain the benefit before the browser prompt |
| Retention / new-card limit | Changes FSRS study settings | Put advanced memory parameters under an expandable area with useful defaults |
| Retry cloud sync | Retries pending existing-path writes | Keep; show the result, not just an action button |
| Export my progress | Downloads records/preferences as JSON | Keep under data controls |
| Sign out of Parallax | Ends the session | Keep account actions visually distinct from learning configuration |

## What to change first

1. **Define completion versus mastery.** Decide what the finish button certifies and make the map/results use the same distinction.
2. **Unify the primary lesson action.** Avoid competing Check answer, Next challenge and Continue actions with different bypass rules.
3. **Make resume exact.** Persist current question, relevant response, adaptive sequence and meaningful theory reveal position.
4. **Improve the actual question ladder.** Add alternative items, misconception-specific hints and independent transfer retries before claiming calibrated adaptive difficulty.
5. **Turn simulations into teaching sequences.** Each should include a prediction, a manipulation that tests it, an interpretable result and a connection to the derivation.
6. **Reduce dashboard competition.** Resume is primary; weekly plan, path and daily challenge support it.
7. **Remove misleading affordances.** Rename repeated checks honestly and expose tutor availability before entry.
8. **Test with learners.** Observe hesitation, accidental skips, repeated clicks, successful transfer and return behavior; avoid arbitrary competitor scorecards.

## What is still needed for an exact competitor-side audit

For each app, inspect the same sequence on a specified platform/account: first entry → onboarding/placement → dashboard/path → start/resume lesson → correct answer → wrong answer → hint/explanation → review → finish/exit → profile/settings. Record exact labels, button hierarchy, disabled/loading/error states, back/exit behavior, paywall boundaries and the outcome after each press. Use screenshots or recordings actually observed; do not fill missing screens from memory.

Only after that evidence is available should a matrix claim an exact current Duolingo/Brilliant/Matiks control, click count or missing feature.

## Parallax source basis

- `src/pages/Home.tsx`, `Login.tsx`, `Dashboard.tsx`, `Learn.tsx`, `LessonPlayer.tsx`, `Settings.tsx`, `Placement.tsx`, `Projects.tsx`.
- `src/components/learning/AppLayout.tsx`, `AdaptiveCheck.tsx`, `QuestionCard.tsx`, `StoredSection.tsx`, `LessonRecap.tsx`, `RestartJourney.tsx`, `JourneyMap.tsx`, `WeekOverview.tsx`, `TutorPanel.tsx`.
- `src/components/widgets/VectorExplorer.tsx`, `BlackHoleExplorer.tsx`, and the connected apparatus implementations.
- `src/hooks/useLearning.tsx` for persistence, completion awards and restart behavior.
