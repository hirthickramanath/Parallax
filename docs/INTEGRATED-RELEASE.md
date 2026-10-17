# Integrated learning release

**Historical first-release record.** Current counts, completed follow-up features and remaining blockers are in [FOLLOWUP-RELEASE.md](FOLLOWUP-RELEASE.md).

## What is implemented

- An original interactive-course UI inspired by focused learning apps: responsive sidebar/bottom navigation, rounded cards, visible goals, progress, answer feedback, light/dark/system themes and reduced-motion support.
- Auth-aware dashboard routing, real recap from the last studied authored lesson, resume bookmarks, prerequisite-aware recommendations, and honest empty states.
- A retained v5 inventory of 56 units and 327 lesson entries after moving the full biology/psychology tracks to the companion plan. Existing IDs are preserved. The chemistry expansion is explicitly proposed in `content/chemistry-expansion.json`, not silently mixed into these totals.
- A build-time validator for duplicate IDs, missing prerequisites, cycles, later-phase dependencies and unit placement. PH18 additionally requires any two Phase 6 units at runtime, not all of them.
- Four playable **draft** MDX lessons: PB1.1, PB1.4, MB3.2, AS1.3. Each includes story, intuition, theory, interactive, problems, checks and connections. Full theory uses staged blocks with an immediate full-view option. Selected orbital symbols have definitions.
- Numeric/multiple-choice checks, saved attempts, readiness checks, prediction before reveal, Full/Quick, local notes, notebook-to-review-card creation and a finish screen. Completion and mastery are distinct.
- Pendulum apparatus demonstration, repeated **synthetic** timing observations, small-angle vs nonlinear period comparison, and an analytic-classified/numerically plotted orbit explorer. Older falling-body/secant explorations remain available. These are model-based educational simulations, not real acquired experiment data.
- Local-first account-scoped progress, persistent pending writes, cross-tab merging, retry on reconnect, data export and explicit cloud status. Firestore transactions merge daily activities by event ID; completed lessons and Full depth are preserved across stale updates.
- Goal-day streaks, idempotent lesson/check/review/revision XP, freezes, milestone badges, 365-day activity calendar and scheduled review forecast. Goals default to 20 XP and use the learner's chosen timezone.
- ts-fsrs review cards, Again/Hard/Good/Easy, daily new-card cap and capped catch-up sessions that do not silently move overdue dates.
- Concept search and focused revision: recap, an actual rated retrieval, prerequisite reminder, why question, transfer problem and saved session. Recall estimates use FSRS; unreviewed concepts are labelled. Only explicit recall ratings update memory schedules.
- Forty-question draft Bridge diagnostic plus five-question skip tests for ten Bridge units. Diagnostic suggestions do not grant credit; a skip test grants credit at 80%. These are short screening tools, not a complete JEE-level assessment.
- A weekly plan using authored, unfinished, prerequisite-met lessons. The limited authored library currently constrains the plan's variety.
- A disabled-by-default tutor panel/Worker implementation with origin checks, Firebase JWT verification, trusted lesson lookup, Quick/Full filtering, bounded history, safe streamed Markdown/KaTeX and friendly failure states. No AI key is included and no live tutor integration has been activated.

## Data and synchronization

The implementation uses existing concrete collections from the original specification:

`users/{uid}/lessons`, `days`, `attempts`, `reviewCards`, `reviewLog`, `notes`, `units`, `concepts`, `revisionSessions`, and `plan/current`.

No cloud profile/stats/placement shorthand path was guessed. Preferences (including timezone, depth and daily goal) remain per-account on the device until concrete profile paths are approved. Streak/XP summaries are derived from day activities, not written to a new stats document. The placement diagnostic itself is not stored in an invented document; attempts and unit skip results use their existing paths.

Local storage is scoped by UID; Firebase's persistent cache and visited static site assets may remain on a shared device after sign-out. Clearing site data is a browser action. No API/Firebase response is cached by the service worker. The service worker caches visited site assets and navigation so **visited** lessons can reload offline; it does not claim every unauthored or unvisited lesson is offline-ready.

Daily activity entries are merged by stable event ID, so replaying a lesson does not award the same completion twice. Notes and bookmarks use client timestamps. Concurrent reviews of one card on separate offline devices use latest-review-time resolution; the append-only review logs retain both events. There is no claim of a complete conflict-free distributed scheduler. Device clock accuracy affects timestamp-based resolution.

## Tutor design and current boundary

The Worker uses a SQLite-backed Durable Object per user for the exact daily counter. This deliberately replaces the originally suggested KV counter: KV cannot guarantee an exact limit under concurrent requests. A local runtime test fires 75 concurrent counter requests and checks exactly 50 succeed. The counter day is UTC, independently of the learner's local streak day. Failed provider requests consume a request to prevent quota bypass.

The supplied provider adapter uses the Workers AI binding, not a shared friend's Gemini credentials. It is disabled (`ENABLE_TUTOR=false`). Before activation the owner must confirm current provider/account age and region eligibility, current free-plan availability for Workers AI and SQLite Durable Objects, and the selected model's availability. If any step requires a card, paid plan, or bypassing eligibility, leave tutoring disabled. Lessons still work. No current free-tier or deployment claim follows from a successful local bundle.

Remaining tutor validation: real Firebase token verification against Google's keys, live provider availability/streaming/quota behaviour, request cancellation and timeout hardening, and persisted cross-device chat history. Current browser chat is in memory and is lost on leaving the lesson. Do not call this integration production-ready until those checks pass.

## External steps after merge

### Publish the Firestore rules

1. Open https://console.firebase.google.com/project/parallax-73/firestore.
2. Click **Rules**.
3. Replace the editor text with the complete contents of the repository's `firestore.rules`.
4. Click **Publish**. Pages deployments do not publish Firebase rules.
5. On the deployed website, sign in, open a lesson, add a notebook entry and check Settings → cloud status. Reload on the same device and then verify on another signed-in device.
6. If permission is denied, confirm the rules target `parallax-73` and the account is signed in. Do not switch to publicly writable test rules.

### Deploy the website

Merge the feature branch through a pull request. Cloudflare Pages builds production `main`, framework React (Vite), command `npm run build`, output `dist`. The prebuild script generates content metadata and the trusted `/content/*.json` tutor sources. No tutor variable is required to deploy the learning app.

### Optional tutor deployment (leave disabled until eligible and reviewed)

1. In your local terminal, open the Parallax repository folder and run `npm ci`.
2. Run `npx wrangler login` and authorize your own eligible Cloudflare account in the browser.
3. Review `workers/tutor/wrangler.jsonc` and current free-tier terms. `SITE_ORIGIN` must exactly match the deployed website origin. Check model availability and the AI/Durable Object bindings.
4. Only after eligibility and no-card/free allocation are confirmed, set `ENABLE_TUTOR` to `true` in that file. This is an explicit activation decision, not a prerequisite for the rest of the app.
5. Run `npx wrangler deploy --config workers/tutor/wrangler.jsonc` from the repository root. This creates the Worker and counter migration; inspect its reported bindings and address.
6. In Cloudflare Pages → project → Settings → Variables and Secrets, add the **non-secret** variable `VITE_TUTOR_URL` containing the actual Worker HTTPS endpoint. Redeploy Pages.
7. Test valid/invalid sessions, foreign origins, Quick filtering, a live streamed answer, quota exhaustion, provider exhaustion and cancellation. Do not expose raw provider errors or secrets. Do not activate if platform eligibility is unresolved.

## Reproduce validation

Use Node 24 LTS (or Node 22.18+). From the repository root:

- `npm ci`
- `npm run build`
- `npm run typecheck`
- `npm run typecheck:worker`
- `npm test` (analytic models, graph failures, XP/streak/date rules, request validation)
- `npm run test:worker` (local Worker origin/auth checks and the concurrent atomic counter)
- `npm run worker:check` (bundle only; no deployment). In a restricted workspace use `WRANGLER_LOG_PATH=/tmp/parallax-wrangler.log XDG_CONFIG_HOME=/tmp/parallax-config npm run worker:check` so its logs/config stay writable.
- `npx playwright install chromium` on machines without a browser, then `npm run test:browser`. The config uses `/usr/bin/chromium` when present. Tests serve the production build themselves and use fake test sessions, never real credentials.

### Firestore emulator checks

The rules test is included but could not run here because the environment proxy denied the official emulator download host `storage.googleapis.com`. This is separate from Firebase project credentials and does not establish a problem with the rules.

On a machine where the official download is permitted, with Java 21 and a trusted current Firebase CLI:

`npx firebase-tools emulators:exec --project demo-parallax --only firestore "npm run test:rules"`

The demo project prevents contacting a production database. The command tests owner access, cross-user read/write denial, anonymous denial and top-level denial. Do not claim a passing rules test until it actually executes. To run it in this cloud environment, add `storage.googleapis.com` to the environment's existing allowed domains without removing other entries, then retry the official emulator setup.

## Remaining work, explicitly

- 323 retained curriculum entries are **stubs**, not completed lessons. All four authored lessons are drafts needing scientific/source review, including historical details and reference editions. The website is not a completed research-level course.
- Apply the reviewed physical/inorganic/organic chemistry expansion, reconcile overlaps and regenerate totals/phase edges. Its proposal file is not an implemented lesson library.
- Independently verify deployed Firestore rules, cloud sync and production account behaviour; local mocked/browser tests do not establish these.
- Verify and activate an eligible tutor provider if desired; persistent chats, stronger stream cancellation/timeouts and real-provider quota tests remain.
- Longer revision sessions, a richer visual concept graph, a before-exam revision planner, per-track weekly mixing and a stronger placement assessment depend on more authored content and further implementation.
- Full introductory discovery stories, real public datasets with provenance, broader lab apparatus, projects and paper corners beyond these drafts still need authoring.
- Reminders/Web Push, authoring UI and advanced retention/track analytics are not included in this release.
- Two previously documented moderate React Router v6 advisories remain; dependency updates must preserve the owner's stack decision or receive approval for a major change. Build-tool dependency advisories are reported separately by `npm audit`.

## Validation recorded for this branch

The production build and both app/Worker TypeScript checks passed. All 20 model/learning tests, the local Worker runtime test (including 75 concurrent quota requests), and nine browser flows passed. Browser coverage includes 390px/1280px layouts, all authored MDX theory, local question/notes persistence, idempotent completion XP, recap, FSRS, visited-lesson offline reload, separate accounts, same-account tabs, 80% Bridge skip credit and focused revision.

The Firestore emulator rules test did not execute because the official emulator download received a proxy denial. Production cloud synchronization, newly published rules and live tutoring remain unverified. The final dependency audit reports zero high/critical findings, two moderate React Router findings and four low maths-rendering/parser findings. Successful local tests do not establish a deployed production release.

Reusable cloud install/start instructions were updated in the environment draft. Saving those instructions does not publish a new environment snapshot or deploy the website.
