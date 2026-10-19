# Parallax

An astrophysics-focused science learning website: full maths and physics, supporting chemistry and computing, stored lessons, virtual labs and rigorous theory.

## Run locally

The repository pins Node.js 24.19.0 in `.node-version` for Cloudflare Pages and requires Node >=24.12.0. If Pages has a `NODE_VERSION` environment variable, remove the old override or set it to `24.19.0` for production and previews. Keep the build command `npm run build` and output directory `dist`.

Install Node.js 24 LTS from https://nodejs.org/ if Node/npm are unavailable. Open the repository folder in VS Code → Terminal → New Terminal. The terminal must be in the folder containing `package.json`.

```sh
npm ci
npm run dev
```

Open the address Vite prints on your own machine. Ctrl+C stops the server. In the managed cloud workspace use the existing `/workspace/Parallax` checkout; tasks are isolated, so do not create another worktree.

If npm cannot find `package.json`, change to the repository folder. If a port is in use, Vite prints the next available port. If Node is not recognized, restart the terminal after installing it.

## Current release

The app includes Google/email-link sign-in, 354 **draft** MDX lessons, an astrophysics-focused level map, automatic weekly planning, focused lessons with connected simulations, precise interaction resume, explicit reading-versus-mastery states, local-first progress, XP/streaks, FSRS recall interludes, projects and study settings. Mechanics PB1.1–PB1.4 has an expanded question ladder and collision/rolling investigations. Fluids, thermodynamics, conics and spatial geometry now have 24 further transfer items and four connected models. A [course-wide review queue](docs/COURSE-REVIEW-QUEUE.md), [internal review notes](docs/FOUNDATION-SCIENTIFIC-REVIEW.md) and [voluntary learner pilot](docs/FOUNDATION-LEARNER-PILOT.md) distinguish implemented tools from independent review and real trials still to conduct.

The [broader foundation follow-up](docs/BROAD-FOUNDATION-RELEASE.md) removes remaining repeated prompts, expands 30 more lessons, adds four models and records partial source inspection for 13 lessons. All 354 banks now have unique prompts, which does not establish equal depth or calibrated difficulty.

The [calculus/bonding follow-up](docs/CALCULUS-BONDING-RELEASE.md) deepens eight more lessons, adds four interactive models and extends partial source mappings to 21 lessons. Learner-pilot reporting now supports optional second-marker agreement and matched immediate/delayed summaries.

The [real-analysis batch](docs/REAL-ANALYSIS-BATCH.md) expands all eight MA1 lessons, adds Darboux/uniform-convergence models and extends current partial source inspection to 29 lessons.

The tutor, new server-owned assessment Worker and background-reminder Worker are implemented but **disabled until configured and live-tested**. Server assessment currently covers 11 draft lesson banks; it is not independent certification or proctoring. Background reminders are a bounded opt-in pilot. No personal-study client XP is an authoritative ranking source.

Scientific/source review, broader pedagogical-depth/simulation work and live-service verification remain incomplete. See [post-comparison implementation](docs/POST-COMPARISON-IMPLEMENTATION.md), [service rollout](docs/SERVER-ASSESSMENTS-AND-REMINDERS.md), [pending checks](docs/PENDING-REVIEW-AND-LIVE-CHECKS.md) and the generated [course ledger](docs/COURSE-STATUS.md). Older release reports retain their historical milestones.

## Verification

```sh
npm run build
npm run typecheck
npm run typecheck:worker
npm test
npm run test:worker
npm run typecheck:assessment
npm run test:assessment
npm run typecheck:reminders
npm run test:reminders
npm run test:browser
npm run content:report
npm run content:audit
```

Browser tests launch a production preview server. Install Chromium with `npx playwright install chromium` when `/usr/bin/chromium` is unavailable. Real Firebase sign-in and cloud writes require separate deployed verification; automated browser sessions are mocked. See the release guide for the emulator rules test and Worker bundle check.

## Deployment

1. Merge the feature branch into GitHub `main` through a pull request.
2. Open https://dash.cloudflare.com/ → Workers & Pages → the `parallax-science` **Pages** project.
3. Framework **React (Vite)**, build `npm run build`, output `dist`, repository root unchanged, production branch `main`.
4. Wait for the deployment to succeed. Test sign-in at https://parallax-science.pages.dev/ and open a lesson from the dashboard.
5. Publish `firestore.rules` separately in https://console.firebase.google.com/project/parallax-73/firestore → Rules. A Pages build does not publish database rules.

An old “Workers Builds: parallax” connection may refer to a deleted Worker. Read the actual failing check before confusing it with the Pages deployment. Do not delete the GitHub integration needed by Pages.

## Configuration and privacy

`.env.example` lists optional public Firebase overrides. The supplied public Firebase project identifiers work as defaults; they are not secret database authorization. Never put an AI key or service-account credential in source or a `VITE_` variable. All such Vite variables enter the browser bundle. Private environment files are ignored; verify with `git check-ignore .env.local`.

Preferences stay local per account because no concrete cloud profile path has been approved. Progress uses existing user-scoped collections with local pending writes. Export it in Settings. On a shared device, cached data remains in site storage after sign-out; clear site data using your browser when finished. Visited lesson JSON refreshes from the network online and falls back to its saved public copy offline; hashed build assets remain cache-first. See the release guide for conflict-resolution and offline-cache limits.

No billing account or card is required by the intended setup. Confirm current provider quotas and eligibility before activating optional services; do not enable paid upgrades or use shared accounts to bypass eligibility.

## Teaching and future-site briefs

- [Parallax AI build plan](docs/PARALLAX-AI-BUILD-PLAN.md)
- [Experimental teaching method](docs/EXPERIMENTAL-TEACHING.md)
- [Excluded subjects companion plan](docs/EXCLUDED-SUBJECTS-AI-BUILD-PLAN.md)
- [Separate engineering and technology plan](docs/ENGINEERING-TECH-AI-BUILD-PLAN.md)

The companion websites are plans only, not additional projects implemented here. Physics/maths experiments motivate and test models; they never replace complete derivations or proofs.

## Dependency notes

React Router v6 retains its documented moderate advisories; the application uses safe internal destinations and no SSR hydration. Upgrading to v7 is a separate stack decision. A patched gRPC 1.x override resolves earlier Firebase transitive high-severity findings. Run `npm audit` for the current full report rather than assuming the dependency tree is advisory-free.

See the [advanced mechanics batch](docs/ADVANCED-MECHANICS-BATCH.md) for the latest content, models, checks and review limits.

The [batch progress report](docs/BATCH-PROGRESS.md) records the latest 21-lesson expansion, seven new models, source-review scope and remaining work.
