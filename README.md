# Parallax

An astrophysics-focused science learning website: full maths and physics, supporting chemistry and computing, stored lessons, in-lesson simulations and rigorous theory.

Contributors and AI agents: read [AGENTS.md](AGENTS.md) first. It sets the branch, deployment, secrets and validation rules.

## Status

- **Content:** every curriculum entry has an authored **draft** MDX lesson with a question bank, recall cards and an embedded investigation. **No lesson has been independently verified.** Coverage is not certification; partial source inspections and automated checks do not establish scientific correctness.
- **Where the numbers are:** counts change with every release, so they are not repeated here. Read [docs/CURRENT-REVIEW-STATUS.md](docs/CURRENT-REVIEW-STATUS.md) and [docs/COURSE-STATUS.md](docs/COURSE-STATUS.md) (both generated; see Verification) for lessons, questions, source mappings and approvals.
- **App:** Google and email-link sign-in, an astrophysics-focused level map, automatic weekly planning, focused lessons with connected simulations, precise interaction resume, explicit reading-versus-mastery states, local-first progress, XP and streaks, FSRS recall interludes, projects, study settings, a guided Class 11–12 revision path and an optional [learner pilot](docs/LEARNER-PILOT.md).
- **What is still open:** independent scientific review, wider source checks, learner-pilot evidence and live end-to-end verification of Firebase and the Workers. See [pending review and live checks](docs/PENDING-REVIEW-AND-LIVE-CHECKS.md).

## Run locally

The repository pins Node.js 24.19.0 in `.node-version` for Cloudflare Pages and requires Node >=24.12.0. If Pages has a `NODE_VERSION` environment variable, remove the old override or set it to `24.19.0` for production and previews. Keep the build command `npm run build` and output directory `dist`.

Install Node.js 24 LTS from https://nodejs.org/ if Node/npm are unavailable. Open the repository folder in a terminal; it must be in the folder containing `package.json`.

```sh
npm ci
npm run dev
```

Open the address Vite prints. Ctrl+C stops the server. If npm cannot find `package.json`, change to the repository folder. If a port is in use, Vite prints the next available port.

## Verification

```sh
npm run build              # tsc --noEmit, content generation, vite build
npm test                   # unit, content, model and grading tests
npm run typecheck:worker && npm run test:worker              # tutor Worker
npm run typecheck:assessment && npm run test:assessment      # assessment Worker
npm run typecheck:reminders && npm run test:reminders        # reminders Worker
npm run test:browser       # Playwright against a production preview (mocked auth)
npm run verify:numeric      # independent recomputation of numeric answers and unit checks (also in npm test)
npm run eval:tutor -- --dry-run   # validate the tutor evaluation set; a live run needs a token (docs/TUTOR-EVALUATION.md)
npm run verify:services    # unauthenticated health probe of the deployed site and Workers
npm run content:report     # regenerates docs/COURSE-STATUS.md
npm run content:audit      # regenerates docs/COURSE-REVIEW-QUEUE.md
npm run review:audit       # content audit + scientific audit (docs/CURRENT-REVIEW-STATUS.md)
npm run verify:public -- https://parallax-science.pages.dev   # after a fresh local build
```

Browser tests (including a structural accessibility audit; it does not check colour contrast or keyboard use) serve the built `dist` through a production preview, so run `npm run build` first. Install Chromium with `npx playwright install chromium` when `/usr/bin/chromium` is unavailable. Real Firebase sign-in and cloud writes need separate deployed verification; automated browser sessions are mocked. `npm run test:rules` needs the Firestore emulator (see [the integrated release guide](docs/INTEGRATED-RELEASE.md)). Pull requests run most of these in GitHub Actions (`.github/workflows/ci.yml`).

## Services

Three Cloudflare Workers sit beside the Pages site. Each is configured in `workers/<name>/wrangler.jsonc`; the client finds them through `public/services.json` (overridable with `VITE_*` variables, see `src/lib/services.ts`).

| Worker | Purpose | State in this repository |
| --- | --- | --- |
| `workers/tutor` | Authenticated lesson tutor on Workers AI | Enabled (`ENABLE_TUTOR: "true"`). Per-learner limit of 10 requests a minute and 200 a day. The owner reports it working; this repository's tests use mocks. |
| `workers/reminders` | Opt-in background study reminders (Web Push, VAPID) | Enabled (`ENABLE_REMINDERS: "true"`), runs every five minutes, bounded pilot capacity. The owner reports it working. The VAPID private key is a Worker secret, never in the repository. |
| `workers/assessment` | Server-graded assessments for a subset of lessons | **Disabled** (`ENABLE_ASSESSMENTS: "false"`). It is not certification or proctoring. |

Pushing to `main` deploys the Pages site only. **Workers are deployed separately** (`wrangler deploy` with Cloudflare credentials), so a Worker change takes effect only after that deploy. Dry-run bundle checks: `npm run worker:check`, `assessment:check`, `reminders:check`. Token verification is shared in `workers/shared/auth.ts`. Health and monitoring: [docs/MONITORING.md](docs/MONITORING.md).

## Deployment

1. Merge the feature branch into GitHub `main` through a pull request.
2. Open https://dash.cloudflare.com/ → Workers & Pages → the `parallax-science` **Pages** project.
3. Framework **React (Vite)**, build `npm run build`, output `dist`, repository root unchanged, production branch `main`.
4. Wait for the deployment to succeed. Test sign-in at https://parallax-science.pages.dev/ and open a lesson from the dashboard.
5. Publish `firestore.rules` separately in https://console.firebase.google.com/project/parallax-73/firestore → Rules. A Pages build does not publish database rules.
6. If a Worker changed, deploy that Worker as described above.

An old "Workers Builds: parallax" connection may refer to a deleted Worker. Read the actual failing check before confusing it with the Pages deployment. Do not delete the GitHub integration needed by Pages.

## Configuration and privacy

`.env.example` lists optional public Firebase overrides. The supplied public Firebase project identifiers work as defaults; they are not secret database authorization. Never put an AI key or service-account credential in source or a `VITE_` variable: all such Vite variables enter the browser bundle. Private environment files are ignored; verify with `git check-ignore .env.local`.

`public/_headers` sets security headers. The Content-Security-Policy is currently **report-only**; the rollout steps to enforce it are in that file.

Preferences stay local per account because no concrete cloud profile path has been approved. Progress uses existing user-scoped Firestore collections with local pending writes. Export it in Settings. On a shared device, cached data remains in site storage after sign-out; clear site data in your browser when finished. Visited lesson JSON refreshes from the network online and falls back to its saved public copy offline; hashed build assets remain cache-first.

No billing account or card is required by the intended setup. Confirm current provider quotas and eligibility before activating optional services; do not enable paid upgrades or use shared accounts to bypass eligibility.

## Documentation

[docs/README.md](docs/README.md) indexes every document: current status, protocols, plans, source inspections and historical release reports. Counts inside older reports are snapshots from their own date.

- [Parallax AI build plan](docs/PARALLAX-AI-BUILD-PLAN.md) and [experimental teaching method](docs/EXPERIMENTAL-TEACHING.md)
- [Excluded subjects companion plan](docs/EXCLUDED-SUBJECTS-AI-BUILD-PLAN.md) and [separate engineering and technology plan](docs/ENGINEERING-TECH-AI-BUILD-PLAN.md): plans only, not implemented here

Physics and maths experiments motivate and test models; they never replace complete derivations or proofs.

## Licence

Code and documentation are released under the [MIT licence](LICENSE). Lesson and curriculum content under `content/` is released under [CC BY-SA 4.0](LICENSE-CONTENT.md). All lessons are drafts; the content licence does not imply independent verification.

## Dependency notes

React Router v6 retains its documented moderate advisories; the application uses safe internal destinations and no SSR hydration. Upgrading to v7 is a separate stack decision. A patched gRPC 1.x override resolves earlier Firebase transitive high-severity findings. Run `npm audit` for the current full report rather than assuming the dependency tree is advisory-free.
