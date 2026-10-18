# Foundation course and laboratory release

**Historical milestone:** current authoring counts are in [BATCH-RELEASE.md](BATCH-RELEASE.md) and [COURSE-STATUS.md](COURSE-STATUS.md).

This is the current release status. Earlier integrated/follow-up release documents retain historical counts. The machine-generated [course ledger](COURSE-STATUS.md) is the current inventory, including every remaining missing ID.

## Implemented

- **49 playable draft lessons**, up from 15, within the unchanged 354-entry / 59-unit curriculum.
- All **38 Phase 0 foundation lessons** now have original authored bodies: algebra, trigonometry, geometry, calculus, matrices/vectors/probability, mechanics, fluids/heat, waves/optics, electricity/magnetism, modern physics and supporting chemistry.
- Completed the five AS1 introductory astronomy drafts with the circular restricted three-body problem, Lagrange-point stability, differential tidal gravity and the assumptions behind Roche-limit estimates.
- Added all six CP1 scientific-computing drafts: Python/NumPy, plotting, numerical calculus, ODE solvers, numerical linear algebra and symbolic mathematics. Python examples are instructional code for a separate Python installation; the website does not execute arbitrary Python.
- **201 authored retrieval cards**. Each new lesson includes prediction, motivation, intuition, model definition, theory with assumptions, an investigation, a worked example, warm-up/core questions and a majority-conceptual check.
- Six virtual apparatus tabs now connect to relevant lessons: pendulum, orbits, circuits, gas piston, standing string and double slit. The earlier falling-body/secant intuition demonstrations remain available separately.
- Ten foundation projects at `/projects`, linked from Learn and Labs. Each has methods, expected evidence, a review rubric, a concealed consistency checkpoint and links to existing lesson notebooks. Opening a checkpoint does not award XP or mastery. No new cloud collection or profile schema was introduced.
- `npm run content:report` produces `docs/COURSE-STATUS.md` from the real curriculum and MDX files, listing authored counts, retrieval-card totals and every missing lesson ID by unit.
- Content compilation errors now identify the source lesson filename.

## What the new apparatus actually computes

### Gas piston

A mole of monatomic ideal gas starts at 300 K and 25 L. A volume ratio selects a final equilibrium state on an isothermal, reversible-adiabatic or isobaric path. The pressure-volume graph shows the chosen process; it is not a time trace. Readouts include temperature, pressure, volume, heat, work and internal-energy change. Work done by the gas is positive, so ΔU=Q−W. Recording stores up to twenty synthetic rows for the current path. Changing path clears incompatible observations.

The model assumes a quasistatic frictionless piston, constant monatomic heat capacity, no leakage and ideal-gas behaviour. A real rapid compression, molecular vibration or phase transition needs a different model.

### Standing string

A 1 m string has mass per length 0.010 kg/m and fixed ends. Tension, harmonic number and phase determine the displayed mode, node positions, speed, wavelength and required driver frequency. Phase can be scrubbed without an animation or motion requirement. The displacement amplitude is illustrative, not a computed driven-response amplitude; damping and resonance width are omitted. A moment when the whole string crosses equilibrium is not a new set of permanent nodes.

### Double slit

A monochromatic coherent source illuminates equal negligibly narrow slits. Wavelength, separation and screen distance control a normalized brightness profile. Geometric phase uses sin θ=y/√(L²+y²); the displayed fringe-spacing formula is the near-axis approximation λL/d. Up to twenty rows preserve the parameter values attached to each synthetic observation. The screen colour is illustrative. Finite slit width, coherence loss, polarization mismatch, noise and real photon statistics are not modeled.

## Validation and its limits

The production build includes strict app TypeScript, all authored MDX compilation, template/answer-key checks and prerequisite-graph validation. Model tests compare gas paths with analytic conservation laws, string nodes/frequency with boundary conditions and tension scaling, and interference with analytic maxima/minima, symmetry and fringe spacing. A separate completeness check fails if a Phase 0 lesson body is missing.

Browser checks render every authored lesson's full theory, reject KaTeX/runtime failures, check the projects page at phone/desktop widths, exercise the three new apparatus and their readings, and confirm project browsing awards no credit. Existing offline notes, account/tab isolation, fixed revision queues, planning, reminders and saved tutor-chat checks remain included. Fake browser sign-in data is now seeded on an inert same-origin fixture page, avoiding a running Firebase session overwriting the test record during account changes. This fixture is not an application login bypass or a live Firebase test.

The test results recorded with this release apply to local development and the production bundle. They do not certify a cloud deployment, cross-device synchronization or real AI-provider availability.

## Still unfinished

- **305 planned lessons lack authored bodies**. The exact list is in the course ledger. Foundation content is not the complete retained undergraduate-through-research curriculum.
- Every authored lesson remains a **draft**. Independent scientific review, exact source editions/sections and bibliography checks remain outstanding. Internal arithmetic checks and successful rendering do not replace them.
- The owner must publish the existing Firestore rules and verify real cross-device progress/chat synchronization and account isolation in production. This workspace has no Firebase or Cloudflare administrative identity.
- The Firestore emulator test remains unrun: the current network policy still lacks the official `storage.googleapis.com` artifact destination. The earlier environment draft requested that domain; a saved draft did not activate it in this runtime. No network bypass was attempted.
- Live tutoring remains off until an eligible provider and the owner's Worker deployment are configured and tested. Do not share a friend's account to bypass age or region eligibility.
- Background Web Push is not implemented. Existing reminders work while the app is open. Subscription storage, VAPID configuration and background delivery need a concrete approved design.
- Cross-device preferences have no approved cloud profile paths; preferences stay local per account.
- Further real-data investigations need dataset provenance and source verification. The app does not label synthetic apparatus values as real observations.

## Deploy and check

Merge this feature branch into `main`; Cloudflare Pages should deploy the new merge commit with Node 24.19.0, build command `npm run build`, output `dist`. Retrying an old deployment rebuilds its old commit.

After success, check `/learn` reports 49 drafts. Open `/lesson/MB1.1`, `/lesson/AS1.4`, `/lesson/CP1.1`, all three new Labs tabs, and `/projects`. Check a returning authenticated visit to `/` reaches `/dashboard`. Refresh the production website after deployment; do not count a successful local build as a successful production deployment.

For Firebase production checks and the disabled Worker, follow the separate service instructions in `FOLLOWUP-RELEASE.md` and `INTEGRATED-RELEASE.md`.

## Recorded checks

- Production build and app TypeScript: passed.
- Model, learning, planning, content and stream suite: **36 passed**.
- Worker TypeScript and runtime/concurrent-quota check: passed (**1 runtime test**, including 75 concurrent requests with exactly 50 accepted).
- Full browser suite: **16 passed**, including all 49 authored lessons. Final apparatus-diagram changes are also covered by a repeat of the four affected workspace/content/lab/project flows.
- All six stored CP1 Python code examples executed successfully against the workspace's installed NumPy, Matplotlib and SymPy. The plotting example saved its artifact outside the repository. This does not establish compatibility with every package version or a Python execution capability on the website.
- Firestore emulator, real provider, production cross-device service checks and independent scientific review: **not run / not completed**, for the reasons above.
