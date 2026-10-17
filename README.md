# Parallax

A science course website built around puzzles, discovery stories, and rigorous theory.

## Current stage

The foundation includes React 18, strict TypeScript, React Router v6, Tailwind, a shadcn-style Button, light/dark/system themes, an original orbit illustration, a landing page, a course placeholder, and a not-found page. Authentication, lesson content, the curriculum map, saved progress, and the tutor are not implemented yet. No AI key is needed for this stage.

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
