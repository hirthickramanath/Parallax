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

The app includes Google/email-link sign-in, a dashboard, a 354-entry expanded course map, 191 **draft** MDX lessons, a section-based player, ten virtual apparatus benches and ten foundation projects, local-first progress, attempts and notes, goal-based XP/streaks, FSRS review, multi-card concept revision, a visual prerequisite map, an exam-date revision schedule, mixed conceptual/numeric Bridge tests, balanced weekly planning, optional foreground reminders and settings. Unauthored lesson entries are clearly marked and cannot be played.

The tutor interface and authenticated Worker are implemented but disabled. This repository is not a complete authored or scientifically verified course. Current capability boundaries and remaining work are in [docs/CONTINUOUS-AUTHORING-RELEASE.md](docs/CONTINUOUS-AUTHORING-RELEASE.md) and the generated [course ledger](docs/COURSE-STATUS.md); the first integrated release and deployment instructions are recorded in [docs/INTEGRATED-RELEASE.md](docs/INTEGRATED-RELEASE.md).

## Verification

```sh
npm run build
npm run typecheck
npm run typecheck:worker
npm test
npm run test:worker
npm run test:browser
npm run content:report
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

Preferences stay local per account because no concrete cloud profile path has been approved. Progress uses existing user-scoped collections with local pending writes. Export it in Settings. On a shared device, cached data remains in site storage after sign-out; clear site data using your browser when finished. See the release guide for conflict-resolution and offline-cache limits.

No billing account or card is required by the intended setup. Confirm current provider quotas and eligibility before activating optional services; do not enable paid upgrades or use shared accounts to bypass eligibility.

## Teaching and future-site briefs

- [Parallax AI build plan](docs/PARALLAX-AI-BUILD-PLAN.md)
- [Experimental teaching method](docs/EXPERIMENTAL-TEACHING.md)
- [Excluded subjects companion plan](docs/EXCLUDED-SUBJECTS-AI-BUILD-PLAN.md)
- [Separate engineering and technology plan](docs/ENGINEERING-TECH-AI-BUILD-PLAN.md)

The companion websites are plans only, not additional projects implemented here. Physics/maths experiments motivate and test models; they never replace complete derivations or proofs.

## Dependency notes

React Router v6 retains its documented moderate advisories; the application uses safe internal destinations and no SSR hydration. Upgrading to v7 is a separate stack decision. A patched gRPC 1.x override resolves earlier Firebase transitive high-severity findings. Run `npm audit` for the current full report rather than assuming the dependency tree is advisory-free.
