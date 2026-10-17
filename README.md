# Parallax

A science course website built around puzzles, discovery stories, and rigorous theory.

## Current stage

The foundation includes React 18, strict TypeScript, React Router v6, Tailwind, a shadcn-style Button, light/dark/system themes, an original orbit illustration, a landing page, a course placeholder, and a not-found page. Google and email-link authentication are implemented. Lesson content, the curriculum map, saved lesson progress, and the tutor are not implemented yet. No AI key is needed for this stage.

## Run the website

Node.js is the tool that runs the development commands. npm installs the libraries listed in `package.json`. Use Node.js 22 or 24 LTS.

1. Open the Parallax repository folder in VS Code.
2. Open **Terminal → New Terminal**. Confirm the terminal is in the folder containing `package.json`.
3. Run `npm ci` to install the exact versions in the lockfile.
4. Run `npm run dev`. Open the local address printed by Vite in your own machine's browser.
5. Press Ctrl+C to stop the server.

In the managed cloud workspace, use the existing `/workspace/Parallax` checkout. Each task is already isolated; do not create another worktree.

If `npm` is not found, install Node.js LTS from https://nodejs.org/ and restart the terminal. If npm reports a missing `package.json`, change to the Parallax folder. If a port is occupied, Vite prints the next available port.

## Verify

- `npm run typecheck`: checks TypeScript without producing files.
- `npm run build`: checks TypeScript and creates the production website in `dist`.
- `npm run preview`: serves the production build locally after building.
- Visit `/` and `/learn`, switch all three themes, reload to check persistence, and use keyboard navigation. Check a 390px phone viewport and a 1280px desktop viewport.

## Deploy to Cloudflare Pages

A deployment publishes the built website to an HTTPS address.

1. Ensure these files have been committed and pushed to the GitHub repository `hirthickramanath/Parallax`. Cloudflare cannot see changes that exist only in this workspace. Use the workspace's review/publish workflow if available; do not assume cloud changes automatically reach GitHub.
2. Open https://dash.cloudflare.com/ → **Workers & Pages** → your Pages project or **Create application → Pages → Import an existing Git repository**.
3. Select `hirthickramanath/Parallax`. Use `main` as the production branch after your changes are merged there.
4. Choose **React (Vite)**, build command `npm run build`, output directory `dist`, and leave the root directory at the repository root.
5. Choose the project name `parallax-science` if available. No environment variables are required for this initial foundation.
6. Click **Save and Deploy**. Wait for a successful build, then use the actual Pages address displayed by Cloudflare.
7. Check the home page, open **The course**, and reload `/learn` directly. Cloudflare Pages provides SPA fallback because this build has no top-level `404.html`.

If the build cannot find `package.json`, verify the selected branch contains these files and the root directory is unchanged. If it cannot find `dist`, check the output directory and build log.

## Configuration and secrets

An environment variable supplies configuration without embedding it in source files. `.env.example` lists the public Firebase web configuration needed in the authentication stage. Copy it to `.env.local` only when configuring that stage. Local environment files are ignored by Git; verify with `git check-ignore .env.local`.

Firebase web configuration is public identification, not database authorization. Firestore security rules will control access. Never add a Gemini key, service-account private key, or other credential to frontend source or any variable beginning with `VITE_`: Vite includes those values in the browser bundle. AI credentials belong only in server-side Worker secrets when the eligible integration is configured.

We are using free plans. Do not enable billing or enter card details. Current provider quotas and eligibility must be checked before connecting services.

## Dependency audit

The initial audit reports two moderate findings associated with the requested React Router v6. Its suggested fix upgrades to v7, so this foundation retains v6 pending a stack decision. The application uses fixed internal links and no server-side rendering; avoid adding untrusted navigation targets. Tailwind uses v4 and its supported PostCSS integration to avoid older build-dependency advisories.

## Authentication stage

Google and email-link authentication are implemented. `/learn` requires a session; the landing page and `/login` are public. The public Firebase project identifiers supplied for Parallax are defaults, so the deployed app works without additional build settings. `VITE_FIREBASE_*` variables can override them. Analytics is not enabled.

Before testing on the deployed website:

1. Open https://console.firebase.google.com/project/parallax-73/authentication/providers and enable Google and Email/Password → Email link.
2. Open Authentication → Settings → Authorized domains and add `parallax-science.pages.dev`. Add `localhost` separately only if testing locally. Preview deployment domains need separate authorization; use the production website for the first sign-in test.
3. Open https://console.firebase.google.com/project/parallax-73/firestore → Rules. Replace the rules editor contents with `firestore.rules` from this repository and click **Publish**. These rules allow a signed-in user to access only their own `/users/{uid}/...` documents and deny everything else. They are not published by a Pages deployment.
4. After merging and deploying, open `/learn` while signed out: it should redirect to `/login`. Try Google sign-in, confirm the header shows your name, reload, then sign out.
5. Try an email link. Check spam if it does not arrive. Open it in the same browser to finish automatically, or enter the same email address when opening it elsewhere. Used or expired links require a new request. Spark has limited sign-in email quotas; use Google if the allowance is exhausted.

The Firestore client enables persistent offline caching across tabs. This can retain user data on the device; prefer a personal device. A typed `DataStore` adapter for the specified lesson documents is present, but lesson progress UI and its local-first sync layer are not implemented yet. Profile document paths remain unresolved and no alternative schema has been silently introduced.

Production Google/email sign-in and deployed Firestore permissions need real-account verification after deployment; local browser checks alone do not establish these work.

## Dashboard and revised course direction

Signed-in visitors to `/` now go to `/dashboard` after session restoration. Normal sign-in opens the dashboard; deliberate `/learn` deep links retain their destination. Signed-out visitors see the landing page and protected routes lead to login. There is no subject selector.

The dashboard currently shows an honest no-lesson-history state. Real recaps, recommendations, resume links, and progress synchronization wait for stored lesson content and the lesson player. There is no fabricated study activity. The landing page now emphasizes astrophysics, full maths/physics, supporting chemistry, and scientific computing. Revised curriculum totals are not yet finalized.

AI implementation briefs are in `docs/PARALLAX-AI-BUILD-PLAN.md`, `docs/EXCLUDED-SUBJECTS-AI-BUILD-PLAN.md`, and `docs/ENGINEERING-TECH-AI-BUILD-PLAN.md`. The companion sites are plans only; no extra subjects, databases, or sites have been created.

## Experimental teaching preview

After signing in, open the dashboard → **Try the teaching lab**, or `/teaching-lab`. Predict first, then use the accessible controls and reveal the full derivation. Physics compares falling masses with/without linear drag; maths explores secant slopes and proves the derivative of x². These draft previews award no course credit or saved progress. `docs/EXPERIMENTAL-TEACHING.md` gives the authoring requirements, including full proofs, assumptions, counterexamples, and explicit model limits.

Run `npm run test:experiments` on Node 22.18+ or Node 24 to check vacuum trajectories, the drag model and its vacuum limit, secant algebra, and invalid inputs. The physics and maths examples have also been exercised in Chromium with a mocked restored session; this does not replace real sign-in verification.
