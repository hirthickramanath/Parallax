# Parallax: AI implementation brief

## Authority and purpose

This file records the owner's revised direction, not a claim that every feature below exists. Build an astrophysics-focused personal learning website. Keep full mathematics and full physics, supported by chemistry and other necessary prerequisites. Do not add subject selection or deselection. Do not implement the separate websites described in the companion briefs in this repository.

Earlier v5 specifications remain useful for teaching style, dependency semantics, lesson format, and storage fields. This revised scope supersedes their seven-track product navigation. Do not silently claim the original 62-unit/351-lesson totals still describe the revised course. Preserve existing IDs for retained lessons; prepare a curriculum migration/inventory for owner review before deleting or renumbering content or publishing new totals.

## Included and excluded scope

| Area | Treatment in Parallax |
| --- | --- |
| Astrophysics | Main learning destination: orbits, radiation, stars, remnants, plasma, planets, galaxies, cosmology, research |
| Mathematics | Full original mathematics sequence, including rigorous proofs and research methods |
| Physics | Full original physics sequence, from bridge refresher to QFT, GR, and research |
| Physical chemistry | Expand to a full university core: thermodynamics, equilibria, kinetics, quantum chemistry, spectroscopy, statistical thermodynamics, electrochemistry, and transport |
| Inorganic chemistry | Substantial chemical bonding; selected periodicity, s/p/d/f-block chemistry, coordination chemistry, oxidation states, solids/minerals, and spectra relevant to planetary/stellar material |
| Organic chemistry | Foundations of structure, stereochemistry, resonance, mechanisms, functional groups, and spectroscopy; selected interstellar, prebiotic, and planetary organics. Propose breadth beyond prerequisites explicitly rather than calling a short survey a full degree course |
| Scientific computing | Keep numerical methods, reproducibility, Python, data analysis, inference, and astronomy tools needed for the main course |
| Earth science | Keep planetary geology, atmospheres, geophysics, and mineral prerequisites where needed; the broad discipline belongs on the companion site |
| Biology | Retain only specific astrobiology/habitability prerequisites; remove broad biology from primary product navigation |
| Psychology and neuroscience | General subject curricula belong on the companion site; evidence-based learning techniques may still inform pedagogy |
| Philosophy of science | Short methods/context notes may support scientific reasoning; full curriculum belongs on the companion site |
| Engineering and technology | Necessary instrument/computing explanations may appear as prerequisites; professional engineering and technology tracks belong on a separate site |

“Excluded” means excluded as a full subject track, not prohibited from a relevant prerequisite explanation. Do not discard a prerequisite because its discipline has no top-level navigation item.

## Non-negotiable learning behaviour

- Stored, versioned MDX lessons; no live AI lesson generation.
- Prediction before explanation, a checked discovery story, intuition, precise concept, misconception, derivation, interactive, worked example, problems, conceptual check, and cliffhanger.
- Full mode is the study default; Quick is review of the same lesson. Hide derivations and problem layers in Quick, not the conceptual check or prerequisite explanation.
- Full mode allocates about 70% of learning time to story, intuition, and theory. At least half of check questions are conceptual.
- Keep rigorous proofs and derivations. Explain assumptions, units, approximations, and uncertainty.
- Soft prerequisite warnings by default. Strict locking is a future setting. Helpful links never lock.
- Published claims, references, numerical examples, and historical details require verification. Keep unverified drafts labelled.

## Stack and boundaries

Use the existing React 18, strict TypeScript, Vite, React Router v6, Tailwind v4, and shadcn-style components. Motion, Mafs, MDX, KaTeX, and ts-fsrs are added when their stages require them. Firebase Auth and Firestore Spark provide identity and saved data. Cloudflare Pages hosts the static app. A separate Cloudflare Worker will provide an eligible free-tier tutor integration. Keep the AI provider swappable and all credentials server-side.

Do not enable billing or enter card details. Verify current provider limits, account eligibility, regional restrictions, and retention policies before using services. If a service cannot legally or practically support the user, keep a clear unavailable state and continue independent features; do not share accounts to bypass eligibility.

All remote data goes through DataStore. Keep credentials out of code, logs, and frontend environment variables. Public Firebase web identifiers are not secret credentials; Firestore rules enforce authorization.

## Navigation and dashboard

- An authenticated visitor to `/` goes to `/dashboard` after session restoration, without a flash of the landing page.
- An unauthenticated first visitor sees the public landing page. Signed-out return visits may also show it; no cross-device anonymous tracking is required.
- After ordinary sign-in/sign-up, open `/dashboard`. A deliberate protected deep link may return to its safe internal destination.
- Dashboard: continue-learning card, last lesson/section, a short stored-content recap, upcoming prerequisite-aware recommendation, and clear sync state.
- When there is no history, show “Your first chapter is ahead.” Never fabricate progress, streaks, lesson availability, recap facts, or recommendations.
- Before resuming, present a short recap of the actual last studied lesson: two or three stored key ideas and one optional retrieval question, then Continue. Do not require an AI call.
- A recap does not grant lesson mastery or block access if the answer is wrong.
- No subject picker, subject toggle settings, or selectedTracks field.

## Ordered execution stages

### 1. Dashboard foundation (current change)

Implement auth-aware root routing, a protected dashboard, safe post-login destinations, dashboard navigation, and a truthful no-content/no-history state. Update the landing page to describe the revised astrophysics focus. Keep the landing page available to signed-out visitors.

Validate signed-out access, restored signed-in sessions, login destinations, sign-out, responsive layout, and absence of landing-page flashes during session initialization. Use mocked identity only for automated routing tests; distinguish these from real production sign-in.

### 2. Curriculum reconciliation

Extract the full old unit/lesson inventory from v5. Tag each entry retained, prerequisite-only, transferred to companion scope, or newly proposed. Retain all physics and maths coverage and the complete astronomy sequence. Draft the physical/inorganic/organic chemistry expansion as units with outcomes and prerequisite edges. Preserve existing lesson IDs. Submit the revised manifest and counts for review before making content removals or restructuring IDs.

Graph validation must reject missing IDs, cycles, later-phase prerequisites, invalid unit placement, and duplicate IDs. Handle PH18's “any two Phase 6 units” as an explicit threshold rule rather than requiring every alternative. Recompute phases after the owner accepts new chemistry dependencies; do not force a new graph into old phase labels without validation.

### 3. Storage and local-first progress

Use existing lesson fields under `users/{uid}/lessons/{lessonId}`. Publish and verify owner-only Firestore rules. Save local progress before remote synchronization, namespace local state by UID, recover pending writes after reload, and show failures without losing work. Define conflict resolution using timestamps/versioning deliberately. Never allow one user's cached data into another user's UI.

The original spec's profile/stats/placement shorthand is not a concrete valid document path. Ask for approval of concrete paths before implementing those fields. This plan does not authorize a schema change or reuse of a new settings/learning document.

Test offline edit → reload → reconnect, denied writes, account switching, and multiple-tab behaviour. Use Firebase Emulator Suite for owner/cross-user/unauthenticated rule checks when available. Do not claim rules are verified from a text review alone.

### 4. Lesson player and AS1.3

Build reusable typed lesson layers, MDX/KaTeX, widget registration, prediction locking until submission, symbol glossary, stepwise theory reveal, question attempts, Quick/Full persistence, and section bookmarks. Add AS1.3 as a draft with an orbit explorer; validate known circular and escape-speed cases and sensible collision handling.

Make AS1.3 accessible through a soft-lock override while displaying missing prerequisites. Do not create completion credit to unlock the demo. No Paper Corner requirement for an undergraduate lesson unless editorially appropriate.

### 5. Real recap and resume

Once lesson content and progress exist, derive the dashboard from DataStore. Resume the latest accessible, incomplete lesson at its stored section. Recaps come from a curated stored recap field or the existing stored Concept layer, never a made-up summary. Validate missing/deleted lesson IDs, completed courses, no history, stale bookmarks, and Quick/Full section changes. Keep resume deterministic and independent of AI availability.

### 6. Tutor

Implement origin validation, Firebase ID-token verification, payload/length validation, trusted content lookup, depth filtering, bounded recent history, provider timeouts, cancellation, streaming, and safe errors. Requests must not accept arbitrary fetch URLs. Render Markdown safely without arbitrary HTML.

KV alone cannot guarantee an exact per-user counter under concurrency. Resolve an atomic free-tier design before claiming the 51st request is always blocked. A soft limit must be labelled as such. Verify current platform quotas and provider eligibility. Provide an honest unavailable state until integration is usable.

### 7. Learning systems

Implement mastery and readiness first; then XP/streaks with correct local-day accounting; then ts-fsrs reviews, concept revision, placement/skip tests, and a phase-aware weekly plan. Do not conflate lesson completion with mastery or award repeated XP for replayed events. Persist idempotent events and test timezone/day-boundary behaviour.

### 8. Content expansion

Verify the first lesson, then build the retained bridge and foundational physics/maths lessons. Bring AS1 and AS2 online early when prerequisites permit. Expand physical chemistry and selected bonding/inorganic/organic units according to the approved graph. Continue astronomy and modern physics through research methods and reproducible capstones.

## Validation and delivery contract for the implementing AI

1. Inspect AGENTS.md, existing code, Git status, lockfile, and current branch before edits. Preserve unrelated changes and use the existing checkout.
2. Deliver one coherent stage at a time; do not stop after a plan when implementation is authorized.
3. Run the production build and TypeScript check. Add meaningful tests for auth routing, dependencies, synchronization, scoring, and security. Test 390px/1280px, keyboard controls, reduced motion, and both themes.
4. Never call a mock-backed test a production service verification. Report passed, failed, skipped, and blocked checks accurately.
5. The owner has authorized branch pushes. Push a descriptive feature branch after validation; do not force-push or silently merge main. Give a PR comparison link if PR creation is unavailable.
6. Cloudflare Pages uses React (Vite), `npm run build`, output `dist`, production `main`. A separate stale Worker check is not proof the Pages build failed: inspect its actual error.
7. Give exact dashboard URLs and numbered steps for owner actions. Explain new terms briefly. Never request secret values in chat.
8. Finish each delivery with changes, checks, known limits, and the next external checkpoint. Do not fabricate a live deployment or publish state.

## Companion plans

- `EXCLUDED-SUBJECTS-AI-BUILD-PLAN.md`: broader science, mind, Earth, and philosophy curriculum on a separate future website.
- `ENGINEERING-TECH-AI-BUILD-PLAN.md`: separate engineering and technology curriculum, architecture, and project plan.

## Experimental teaching amendment

Apply `EXPERIMENTAL-TEACHING.md` to physics and maths: predict, investigate, conjecture, explain, derive/prove fully, stress-test, and transfer. This changes presentation, not the required theoretical depth or curriculum outcomes. Preserve the original layer order and Full/Quick semantics. The `/teaching-lab` previews are not completed curriculum lessons.

## Applied follow-up status

The chemistry expansion is now applied with retained IDs: 354 entries across 59 units. Fifteen lessons are authored drafts, not verified content. See FOLLOWUP-RELEASE.md for completed learning workflows, service blockers and the remaining 339 stubs. Do not mistake this implementation update for scientific review or a complete research-level course.


## Foundation release implementation update

The implemented course now has 49 authored drafts and 201 recall cards, including all 38 Phase 0 entries, all five AS1 entries and all six CP1 entries. Six apparatus benches and ten foundation projects are playable. There are still 305 missing lesson bodies and no independently verified lessons. Use `FOUNDATION-RELEASE.md` and the generated `COURSE-STATUS.md` as the current implementation status; older counts above are historical. The original retained scope is unchanged.


## Checked batch authoring update

Four further units (MA1, PH1, MA2 and MA3) now have all thirty lesson bodies as drafts. Current totals are 79 authored drafts, 321 recall cards and 275 missing bodies; no independent verification is implied. `BATCH-RELEASE.md` describes the current batch and exact-number grading correction. `COURSE-STATUS.md` remains the authoritative generated coverage list.


## Radiation and inference implementation update

Five further units (MA4, PH11, AS2, MA8 and MA9) add 27 drafts. Current totals: 106 authored drafts, 429 recall cards, 248 missing bodies and zero independently verified lessons. The seventh virtual bench covers emitting/extinguishing slabs and radial Doppler markers. `RADIATION-INFERENCE-RELEASE.md` describes model limits and checks; the generated `COURSE-STATUS.md` lists remaining IDs. All source and production-service verification boundaries remain explicit.


## Fields and organic-foundation implementation update

PH4 and CH6 now have sixteen original lesson drafts, bringing current totals to 122 authored drafts, 493 recall cards and 232 missing lesson bodies. No independent verification is implied. The eighth lab bench compares uniform solid-sphere and conducting-shell electrostatics, including the ideal charged-sheet discontinuity. Current status and model limits are in `FIELDS-ORGANIC-RELEASE.md`; the generated `COURSE-STATUS.md` preserves the exact missing IDs.


## Physical chemistry and analytical mechanics milestone

Authored CH1.1–CH1.13 and PH2.1–PH2.7 as drafts, bringing coverage to 142/354 lessons and 573 retrieval cards. Added a coupled-oscillator apparatus with normal-mode releases and an energy balance. See [release details](PHYSICAL-CHEMISTRY-MECHANICS-RELEASE.md) and the generated [course ledger](COURSE-STATUS.md). 212 lesson bodies and independent source/scientific review remain. Live tutor eligibility/provider setup and live rules verification remain external prerequisites.
