# Parallax compared with Duolingo, Brilliant and Matiks

19 October 2026. Analysis only; no product changes are implemented by this report.

## Evidence boundary

Parallax's implementation is checked against the repository. Competitor descriptions below summarize their established product focus, not a live audit of the latest screens, subscription tiers or experiments. Their private backend code, database schemas, grading services and recommendation algorithms are not available here. “Unknown” means not verified, rather than missing or poorly implemented.

There are three separate questions: whether a control exists, whether its end-to-end behavior works reliably, and whether that behavior teaches effectively. A feature count or a passing browser test does not answer all three.

## Frontend: appearance and behavior

| Dimension | Parallax now | Duolingo reference | Brilliant reference | Matiks reference |
| --- | --- | --- | --- | --- |
| Product emphasis | Astrophysics learning workspace with supporting sciences | Recurring short practice and a visible learning journey | Interactive conceptual learning in maths, science and computing | Mathematical fluency and short problem-solving challenges |
| Main journey | Dashboard resume card, weekly plan and chapter-selectable level map | A clear next practice action is a useful reference | Course progression organized around understanding is a useful reference | Fast entry into an appropriate challenge is a useful reference |
| Visual feedback | Selected answers, correct/incorrect panels, XP, streaks and progress indicators | Frequent feedback and habit reinforcement | Visual explanation and interaction-driven feedback | Performance-oriented feedback during problem solving |
| Lesson layout | Focused route hides sidebar/header; theory and supported simulation sit side by side or stack on mobile | Reduce decisions while practising | Let the learner act on a representation while reasoning | Keep problem interaction quick and readable |
| Button behavior | Check answer, Next challenge and Continue are separate actions with different bypass rules | Learn from a consistent answer/feedback/next loop | Learn from purposeful interactions between explanations | Learn from decisive question-to-question transitions |
| Hints and mistakes | Authored explanations; adaptive tier can step down | Integrate correction into continuing practice | Supply a smaller reasoning step or an instructive visual consequence | Match follow-up practice to the mistake rather than merely display failure |
| Personalization UI | Full/Quick, provisional per-track challenge level, goals, themes | Make personalization understandable without excessive configuration | Preserve optional explanation depth | Keep challenge selection appropriate; exact competitor mechanics unverified |
| Simulations | Connected apparatus plus vector/black-hole exploration; not 354 bespoke models | Not the main reference for scientific simulation design | Strongest reference for making interaction teach a concept | Useful reference for problem fluency, not a replacement for physical models |
| Recall | Up to two due cards inside a lesson interlude, with explicit self-rating | Weave repetition into the normal journey | Revisit concepts through reasoning tasks | Repeated solving can develop fluency; exact scheduling unverified |
| Polish and accessibility | Responsive layouts, keyboard controls in new models, themes and reduced-motion support; no comprehensive accessibility certification | Current accessibility and screen-by-screen behavior need direct inspection | Same evidence requirement | Same evidence requirement |

### Concrete control findings from Parallax

- **Resume** restores the section, not every unfinished question, response and theory reveal state. Make the promise more precise or persist those states.
- **Try a fresh check** reuses the authored bank. Rename it or supply alternative equivalent items.
- **Reveal next theory step** expands content. Add selected prediction/reasoning interactions so revealing is not the only action.
- **Check answer** remains usable after submission, creating further attempts even for unchanged input. Distinguish an intentional retry from duplicate clicks.
- **Continue** can bypass ordinary unanswered questions and the adaptive sequence. Define its reading/skip/assessment meaning.
- **Finish lesson** can mark completion without passed checks. Reading completion and demonstrated mastery must be visually distinct.
- **Ask about this section** can open a disabled tutor panel. State availability before entry and provide authored help independently of AI.
- **Restart** works through confirmation, but a searchable chapter/unit picker would be easier than a 354-option dropdown.
- **Dashboard choices** compete: resume, plan, map and daily problem. Make resume primary and disclose the others progressively.

These are observed code behaviors. They are not assertions that a competitor handles every corresponding case correctly.

## Backend: architecture, reliability and trust

| Dimension | Parallax implementation | What is known about the comparison products | Parallax's next requirement |
| --- | --- | --- | --- |
| Frontend delivery | React/TypeScript/Vite SPA; Cloudflare Pages workflow | Exact current web/native frameworks are not verified here | Keep the present stack unless measured needs justify a change; verify the production release |
| Identity | Firebase Auth with Google popup and email-link sign-in | Account and subscription implementations are private; visible login behavior alone cannot establish architecture | Exercise sign-in, recovery, popup failure and cross-device email-link behavior under real accounts |
| Persistence | Account-scoped local records, pending-write queue and Firestore transaction merges | Private schemas, offline strategies and conflict policies are unknown | Verify real two-device/offline reconnect behavior, including deliberate restart markers |
| Authorization | Repository rules permit only the owner under their user subtree, deny other paths | Actual competitor policies and deployment details unknown | Verify live published rules and cross-account denials; local mocked tests are insufficient |
| Progress integrity | Browser computes answers, XP and mastery, and can write its own owner records | Competitor grading/anti-abuse placement is not verified | Sufficient for personal study if described honestly. Any future competitive ranking or certified assessment needs trusted server-side validation |
| Adaptive engine | Client-side three-tier selection over authored questions; provisional level saved per track | Exact recommendation models, question-selection rules and calibration methods unknown | Separate learner skill, item difficulty and misconception evidence; collect consented outcome data before claiming calibration |
| Memory scheduling | ts-fsrs on the client; explicit recall ratings saved in existing records | Competitor algorithms and their current parameters unknown | Distinguish self-rated recall from objectively graded mastery; evaluate learning outcomes |
| Tutor service | Cloudflare Worker implementation validates Firebase JWT, origin and quotas; Durable Object counter; tutor disabled | Availability and implementation of competitor AI features vary; private services unknown | Eligible provider activation and real streaming, timeout, quota and authorization tests; preserve non-AI support |
| Content delivery | Build-time validated MDX, KaTeX and generated lesson JSON; visited-content service-worker caching | Competitor authoring/release systems are private | Add editorial review, source mapping, per-lesson version history and assessment migration rules |
| Notifications | Opt-in foreground reminders | Current delivery channels and scheduling policies need direct inspection | Background delivery remains pending; do not describe foreground reminders as server push |
| Observability | Automated build/model/browser/Worker checks; no demonstrated production learning-analytics or incident-monitoring program | Internal analytics and reliability targets unknown | Add proportionate error monitoring and privacy-conscious learning-event instrumentation |
| Readiness | Latest app validation: build, 91 model tests and 87 browser cases; live Firebase/provider checks remain unresolved | No comparable internal test evidence available | Keep local validation, live verification, deployment and educational validation separate |

### Backend assessment

Parallax's managed-service architecture is a reasonable prototype foundation. The gap is not proven to be Firebase versus a competitor's database, or React versus a competitor's framework. The concrete gaps are live verification, stronger progress integrity where needed, operational visibility, precise state restoration and evidence-based learning decisions.

A locally working transaction merge does not prove production synchronization. Likewise, visible personalization in another app does not reveal its model, training data or backend topology. Do not copy speculative architecture.

## Course content and pedagogy

| Dimension | Parallax now | Duolingo reference | Brilliant reference | Matiks reference |
| --- | --- | --- | --- | --- |
| Scope | Astrophysics with mathematics, physics, selected chemistry and computing prerequisites | Useful for the habit/practice model, not a substitute astrophysics syllabus | Closest reference for interactive STEM concepts | Useful for numerical/algebraic fluency; not a substitute for a full physics course |
| Coverage versus depth | 354 draft lesson bodies and 1,421 recall cards; many advanced treatments remain concise | Short units demonstrate how to keep repeated practice approachable | A smaller concept can be developed through several purposeful interactions | A focused problem can train a specific skill repeatedly |
| Scientific review | Zero independently verified/published lessons; exact source review remains pending | Established product, but no claim here that every item is error-free or every outcome proven | Same distinction between professional content and independent evidence | Same distinction; current editorial process not verified |
| Theory | Full derivations are an explicit goal; completeness varies by lesson | Practice does not supply the formal depth needed for this syllabus | Learn conceptual pacing while retaining more formal derivation where Parallax requires it | Fluency practice supplements rather than replaces proof and derivation |
| Question diversity | Primarily authored MCQ/numeric checks, warm-ups and Core prompts; banks remain small | Borrow repeated retrieval and varied correction opportunities | Borrow conceptual prediction, visual reasoning and transfer tasks | Borrow multiple equivalent problems and optional fluency challenges |
| Difficulty | Initial adaptive sequence selects nearby tiers; item tiers are not psychometrically calibrated | Exact current personalization unverified | Carefully designed conceptual progression is the relevant reference | Appropriately graded challenge is the relevant reference; do not assume its algorithm |
| Mistake remediation | Static explanations plus a lower-tier next item | Retry and revisit rather than treat a single mistake as final | Diagnose the wrong model and rebuild a missing reasoning step | Drill the underlying skill with a different example |
| Experiments | Synthetic apparatus data and simulations with assumptions; no claim of real lab execution | Not the primary reference | Tie manipulation to the concept being taught | Timed arithmetic cannot substitute for experimental reasoning |
| Transfer and research | Projects/rubrics and research drafts exist; no executed capstone or reproduction is certified | Completion/gamification alone does not establish transfer | Challenge learners to use concepts in a new representation | Speed/accuracy on familiar items does not establish astrophysics transfer |
| Effectiveness evidence | No learner study or calibrated outcome measurement demonstrated | Published research exists, but claims must match the population, task and study | No specific effectiveness claim made without an inspected source | No specific effectiveness claim made without an inspected source |

### Content assessment

A 354-lesson inventory is breadth, not evidence that the course matches the instructional maturity of an established product. Nine advanced lessons have expanded treatments, but that is not independent verification and does not resolve the rest of the curriculum's depth.

Parallax should combine a consistent habit loop, interaction-led conceptual discovery, optional fluency practice and complete astrophysics-relevant theory. Timing should be optional; unfamiliar derivations should not be optimized for speed.

## Recommended order of work

1. Make one representative unit excellent end to end: assess prerequisites, introduce a question, let the learner manipulate a model, derive the result, diagnose mistakes, test transfer, and revisit it later.
2. Fix the control semantics around completion/mastery, exact resume, retries and inactive help. Keep one clear primary forward action.
3. Expand item banks and simulations by learning objective, not just by lesson count. Every interaction needs a reason to exist.
4. Verify live identity, rules, sync, reset behavior and deployment. Decide whether any future competitive claims require trusted server grading.
5. Add source/editorial review and measure learner success before making strong difficulty or effectiveness claims.
6. Apply the proven unit design across the course. Avoid adding social pressure, monetization or complex infrastructure solely to imitate another app.

## Further evidence for a precise competitor audit

Observe equivalent journeys in all three apps on specified platforms and account tiers. Record exact controls, hierarchy, response to correct/wrong answers, hints, resume, settings and subscription boundaries. Current recordings can establish UI behavior; they still cannot establish private backend architecture or educational effectiveness.

For exact current framework/database/model claims or specific effectiveness comparisons, use inspected authoritative technical publications or studies and retain source/date/scope. Neither screenshots nor feature lists justify inventing these details.

Parallax source basis: `package.json`, `src/main.tsx`, `src/hooks/useLearning.tsx`, `src/lib/datastore.ts`, `src/lib/learning-core.ts`, the learning components/pages, `scripts/content.mjs`, `firestore.rules`, `workers/tutor`, and the existing course/release reports.
