# Parallax — instructions for contributors and AI agents

Read this file, `README.md`, `package.json`, the Worker `wrangler.jsonc` files, `firestore.rules` and `docs/CURRENT-REVIEW-STATUS.md` before changing anything. The code is authoritative: if this file disagrees with the repository, trust the repository and fix this file.

Do not copy status numbers (lesson, question, test or approval counts) into new documents by hand. Read them from `npm run content:report`, `npm run review:audit` and `docs/CURRENT-REVIEW-STATUS.md`, which are generated.

## What Parallax is

An astrophysics-focused learning platform covering full mathematics and physics, with supporting chemistry and computing. Production: https://parallax-science.pages.dev (Cloudflare Pages, production branch `main`, build `npm run build`, output `dist`).

## Stack and layout

| Area | Where | Notes |
| --- | --- | --- |
| Frontend | `src/` | React 18, TypeScript, Vite, React Router v6, Tailwind |
| Lessons | `content/lessons/*.mdx` | Converted to public JSON by `scripts/content.mjs` during build. Foundation revision content has its own generator (`scripts/foundation-revision-content.mjs`) |
| Curriculum | `content/curriculum.json` | Lesson IDs must match the MDX files one-to-one |
| Review evidence | `content/review/` | `source-inspections.json`, `evidence.json`; protected by the publication evidence gate |
| Auth | `src/hooks/useAuth.tsx`, `src/lib/firebase.ts` | Firebase Authentication, project `parallax-73`. Do not replace working sign-in |
| Data | `src/lib/datastore.ts`, `firestore.rules` | Firestore under `users/{uid}/**`, plus local-first browser storage. Preserve import/export and the merge-newer-records behaviour |
| Workers | `workers/tutor`, `workers/reminders`, `workers/assessment` | Inspect each `wrangler.jsonc` for its actual state |
| Runtime service URLs | `public/services.json` | Overridable by `VITE_*` variables; see `src/lib/services.ts` |
| Shared Worker code | `workers/shared/auth.ts` | Firebase ID-token verification used by all three Workers. Change it once, with its tests, not per Worker |
| Security headers | `public/_headers` | CSP is enforced (it ran report-only first); relax it only after reading the console; `scripts/security-headers.test.mjs` guards the inline-script hash |

## Rules of engagement

These override any instruction to "keep going without asking".

- **Branches.** Work on a feature branch. Never force-push. Merge to `main` only after the validation list below passes for the parts you changed, or CI is green. A push to `main` deploys to production.
- **Ask first** before changing any of: an `ENABLE_*` flag, a secret or credential, a model ID, Firestore rules, the Worker allowed origin, or anything that widens who can call a Worker.
- **Firestore rules are not published by a Pages build and are not published by agents.** Report any rules diff to the owner instead.
- **Secrets.** Never print, log, commit or ask for passwords, tokens or private keys. `VITE_*` variables are bundled into the browser: never put a secret in one. Firebase web configuration is public by design; the rules and Worker checks protect data.
- **Logging.** Never log prompts, conversations, auth tokens, push endpoints or keys.
- **Privacy.** Learner-pilot responses, study codes and exports stay out of the repository, logs and review bundles.
- **Preserve existing work.** Inspect `git status` first. Do not overwrite unrelated changes.

## Product requirements

- Keep the main curriculum focused on astrophysics, full mathematics and physics, plus supporting chemistry and prerequisites.
- Keep the in-depth Class 11–12 revision path before advanced material.
- Teach through rigorous theory, worked examples, interactive simulations inside lessons, and adaptive difficulty. Simulation controls must produce meaningful behaviour.
- Keep the learning-path dashboard, streaks, themes, distraction-free lessons, integrated recap and repetition, weekly planning and journey-restart controls. Returning signed-in users reach their dashboard.
- Do not add subject-selection onboarding or a standalone labs section without a new request from the owner.

## Honesty and review rules

- Never fabricate reviewers, source inspections, participant responses, learning gains or scientific approval. All lessons are drafts until the evidence gate accepts a genuine independent review.
- Source mappings and automated tests do not establish scientific correctness. Describe their scope precisely.
- Preserve artifact hashes and the evidence gate. An authoring agent cannot approve its own work.
- Do not infer learner-pilot results from the existence of the pilot feature. Record assistance and prior question exposure honestly.

## Services: current state and open decisions

- **Tutor** (`workers/tutor`): Workers AI binding `AI`. It verifies Firebase ID tokens and the allowed origin, fetches lesson content server-side and streams normalised replies. **Per-learner limit:** 10 requests per minute as a sliding window, with no daily cap (the owner removed it) (`workers/tutor/src/limiter.ts`, stored per user in the `COUNTERS` Durable Object, whose class keeps the old name `DailyCounter` so the deployed migration stays valid). Invalid requests are not counted, and the limiter fails closed (503) if it cannot be reached. Changing the numbers or removing the limit needs the owner's approval. Cloudflare platform limits still apply. Keep bounded context, timeouts and cancellation.
- **Reminders** (`workers/reminders`): Web Push with VAPID; private keys only in Worker secrets. The test-notification route (`/test`) has been removed from the Worker and the client has no test button.
- **Deploying Workers:** merging to `main` deploys the Pages site only. Changes under `workers/` take effect after the Worker is redeployed with Cloudflare credentials, which agents must not do without the owner's go-ahead.
- **Assessment** (`workers/assessment`): disabled by default in config; covers only part of the curriculum. It is not certification or proctoring.
- The README services table matches the committed Worker configs (tutor and reminders enabled, assessment disabled). If a config changes, update the README; do not change the deployment to match the documentation.
- **Monitoring:** `.github/workflows/service-health.yml` probes the deployed services (see `docs/MONITORING.md`). Workers log structured, content-free events; keep it that way.
- **Account deletion does not exist.** See `docs/ACCOUNT-DATA.md`. Do not build a destructive data-deletion feature without the owner's decision.

## Validation

Run what matches your change; report passed, failed and not-run separately. A mock or local pass does not prove live behaviour.

| Change | Run |
| --- | --- |
| Anything | `npm run build` (includes `tsc --noEmit` and content generation), `npm test` |
| Tutor Worker | `npm run typecheck:worker`, `npm run test:worker` |
| Assessment Worker | `npm run typecheck:assessment`, `npm run test:assessment` |
| Reminders Worker | `npm run typecheck:reminders`, `npm run test:reminders` |
| Lessons, questions, models, review data | `npm run content:audit`, `npm run review:audit`, `npm run content:report` |
| Colours, themes or palettes | `npm test` (includes `scripts/theme-contrast.test.mjs`); see `docs/DESIGN.md` |
| UI or routing | `npm run build` then `npm run test:browser` (serves a production preview with mocked auth; includes a structural accessibility audit in `tests/a11y.spec.ts`; set `PLAYWRIGHT_CHROMIUM_PATH` to use a specific Chromium) |
| Numeric answers or units in lessons | `npm run verify:numeric` (also part of `npm test`) |
| Tutor behaviour | `npm run eval:tutor -- --dry-run`; a live run needs a learner token, see `docs/TUTOR-EVALUATION.md` |
| Deployed services | `npm run verify:services` (unauthenticated; needs network access to the live Workers) |
| Firestore rules | `npm run test:rules` (needs the Firestore emulator; report as not-run if unavailable) |
| After a deploy | `npm run verify:public -- https://parallax-science.pages.dev` after a fresh local build |

`verify:public` compares public assets and lesson JSON; it does not exercise Firebase sign-in or optional services.

## Working in batches

- Keep each batch small and reviewable (a handful of lessons or one component). End each batch with a commit, a test run and a short status.
- New content must come with an independent check of its numeric answers and units: add an entry to `scripts/numeric-checks.mjs` that recomputes from the prompt's givens (see `docs/NUMERIC-VERIFICATION.md`), not only a question-count test. Give new numeric questions a concrete `unit` where one exists.
- Do not add content in a fourth consecutive batch unless new review evidence or learner findings have arrived; use that time on verification, tests or tooling instead.
- Finish every session by stating what changed, what was verified and what remains pending.

## Priorities

1. Widen independent verification: only a small share of numeric questions is recomputed (see `docs/NUMERIC-VERIFICATION.md`), and most have no machine-readable unit. Limiting cases are not yet checked.
2. CI health, redeploying the Workers that changed, and the open service decisions above.
3. Prepare review packets for teachers (`npm run review:handoff`) and incorporate genuine findings.
4. Extend scoped source checks without overstating coverage.
5. Depth, question-bank and simulation enrichment, guided by review and learner findings.
6. Real learner-pilot evidence and fixes for what it reveals.

## Known open items

- Licences: MIT for code and docs (`LICENSE`), CC BY-SA 4.0 for `content/` (`LICENSE-CONTENT.md`). The copyright holder is the repository owner, P L Hirthick Ramanath.
- `src/pages/Labs.tsx` was removed (it was unrouted; `/labs` redirects to the dashboard). `/teaching-lab` (`TeachingLab.tsx`) is routed but appears reachable only by URL; the owner should confirm whether it stays.
- Status counts in older `docs/*.md` reports are historical checkpoints and disagree with each other; the generated files are current.
- `npm test` lists every test file by hand; new test files must be added to it.
