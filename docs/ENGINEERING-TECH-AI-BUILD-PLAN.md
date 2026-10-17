# Separate Engineering & Technology learning stack: AI build brief

## Boundary and goal

Create a separate future learning website for engineering and technology when the owner explicitly starts it. This Markdown file is a plan, not authorization to build it within Parallax. Use a separate repository, cloud projects, database, and domain. No deployment or provider availability is implied.

“Stack” here covers both the learning track and the website's technical architecture. Working name: “Workbench”, subject to the owner's choice and name availability.

Develop from mathematical/scientific foundations to designing, implementing, measuring, and documenting working systems. Teach why an engineering choice works, the assumptions behind it, and how it fails. Do not claim that a website alone supplies professional accreditation or safe access to specialist labs.

## Curriculum map

| Track | Foundations | Advanced direction | Representative capstone |
| --- | --- | --- | --- |
| Software engineering | Programming, data structures, algorithms, Git, testing, debugging | Architecture, distributed systems, reliability, performance, secure development | Build and measure a resilient application |
| Web and backend systems | HTML/CSS, TypeScript, HTTP, accessibility, APIs, SQL | Auth, caching, queues, observability, migrations, deployment | Accessible app with tested API and data model |
| Computer systems | Digital logic, architecture, C, memory, operating systems | Concurrency, compilers, networking, systems performance | Small interpreter or OS component simulation |
| Electrical/electronics | Circuit laws, components, measurement, digital logic | Analogue design, signals, communications, power fundamentals | Simulated sensor acquisition and filtering chain |
| Embedded systems/IoT | Microcontrollers, timing, buses, state machines | RTOS concepts, low power, robust firmware, device security | Simulated environmental monitor; optional real hardware |
| Mechanical engineering | Statics, dynamics, materials, CAD | Mechanisms, manufacturing, solid mechanics, thermal design | Dimensioned mechanism with documented load analysis |
| Robotics and control | Kinematics, feedback, linear systems, sensors | State estimation, planning, nonlinear control basics | Simulated mobile robot with measured tracking error |
| Data engineering and AI | Python, probability, linear algebra, data cleaning | ML evaluation, data pipelines, model deployment, responsible AI | Reproducible model with leakage checks and error analysis |
| Infrastructure and security | Linux, networking, threat models, permissions | Containers, CI/CD, monitoring, defensive security | Reproducible deployment plus a documented defensive audit |
| Engineering practice | Requirements, uncertainty, experiment design, trade-offs | Verification/validation, design reviews, maintainability, ethics | Design dossier including tests and failure analysis |

Include focused civil/structural/environmental engineering electives later if requested; do not imply the first release covers every engineering discipline. The full physics/maths curriculum stays in Parallax; provide explicit local bridge lessons so this site can be used independently.

## Dependency spine

1. Programming, mathematical bridge, measurement, Git and basic design reasoning.
2. Data structures, digital logic, mechanics/circuits fundamentals, probability and linear algebra.
3. Software testing/web foundations, architecture/OS, signals, CAD, dynamical systems.
4. Networks/databases, embedded systems, control, numerical methods, ML foundations.
5. Reliability/security, distributed systems, robotics, deeper electronic/mechanical design.
6. Integrated projects with specified requirements, measured performance, evidence, and peer/self-review.

Represent the final course as a validated prerequisite DAG. Do not flatten all branches into one mandatory career path. Topic organization can be flexible in this future product; it must not add subject toggles back to Parallax.

## Lesson and project template

Each stored lesson contains:

1. A concrete design problem or surprising failure.
2. A prediction and a short account of the relevant idea's development.
3. Theory and explicit assumptions, with derivations when needed.
4. A visual experiment or simulation.
5. A worked design example including units, tolerances, and trade-offs.
6. A small implementation task and meaningful acceptance tests.
7. Failure cases, troubleshooting, and an explanation-back check.
8. A design notebook entry and next project connection.

Projects specify inputs/outputs, constraints, success criteria, test data, reproducibility steps, and an honest list of limitations. Reward demonstrated understanding, not copying the reference solution.

## Website technical stack

| Layer | Initial choice | Reason/limit |
| --- | --- | --- |
| App | React + TypeScript + Vite | Static frontend and reusable interactive lessons |
| UI | Tailwind, shadcn/ui, Motion when needed | Accessible controls and consistent themes |
| Content | Versioned MDX, KaTeX, structured JSON exercises | Reviewable and available without AI |
| Diagrams | SVG/canvas; Three.js only for lessons that need 3D | Keep initial payload small |
| Code demonstrations | CodeMirror editor plus browser Web Worker | Main UI remains responsive; not a secure general sandbox |
| Limited execution | Curated JavaScript demos initially; optional Pyodide for trusted bounded examples | Heavy runtime loaded only when needed; restrict capabilities and terminate timeouts |
| Identity/data | Firebase Auth and Firestore Spark through DataStore | Separate project; local-first progress and project metadata |
| Hosting | Cloudflare Pages | No backend server required for lesson delivery |
| Optional tutor | Authenticated Cloudflare Worker with a swappable eligible free provider | Keys never in frontend; quota exhaustion is handled |
| CI | Repository checks and browser tests within available free quotas | Verify current account quotas before enabling |
| Project artifacts | Source files in the learner's own repository or local download | No required paid blob storage or arbitrary uploaded executable service |

Do not build a free public arbitrary-code-execution backend. Cloudflare Worker code must not execute learner-submitted programs. Web Workers do not isolate malicious code from the site's origin; isolate demonstrations on a separate sandboxed origin/iframe with a restrictive policy before allowing arbitrary HTML/JS. No learner code receives auth tokens, secrets, or privileged network access. Validate the isolation model before shipping execution.

Hardware is optional. Provide simulations and downloadable exercises so course access remains free. Clearly distinguish free website services from optional equipment costs. Do not require credit-card cloud trials for systems exercises; use local tooling and bounded simulations.

## Initial vertical slice

Choose a low-risk control problem: “Why does a thermostat overshoot?”

- Bridge: units, rates, feedback, and a simple first-order thermal model.
- Predict behaviour, simulate bang-bang control, vary parameters, then introduce proportional control.
- Display target/measured temperature, response time, overshoot, and model limitations.
- A conceptual check distinguishes stability, speed, and steady-state error.
- Save the learner's answers and resume position.
- Capstone: compare two controller settings against explicit performance criteria.

Use synthetic model data with labelled assumptions; do not suggest physically wiring mains equipment. Verify the numerical solver against an analytic first-order response.

## AI execution plan

### Stage 0: prerequisites and design

Inspect the new repository and define the first course manifest, data model, sandbox boundary, free-service requirements, and acceptance tests. Explain external actions with URLs and numbered beginner steps. Do not copy Parallax credentials or reuse its production database.

### Stage 1: foundation

Build public intro, auth, responsive dashboard, theme, typed content index, and offline-aware progress. First login may ask about project goals only if the owner wants that feature; do not assume any personalization schema is approved.

### Stage 2: content and dependency engine

Add schema validation, prerequisite graph checks, MDX rendering, code/diagram blocks, glossary, recap/resume, conceptual and numeric checks. Publish one complete draft learning slice before generating more content.

### Stage 3: simulations and bounded demonstrations

Implement the thermostat slice. Keep numerical logic independent of UI. Test solver accuracy, limits, keyboard controls, reduced motion, reset/replay, and memory/time bounds. Add an editor only after defining execution isolation; a non-executable code listing is a valid first milestone.

### Stage 4: project workflow

Add requirements, test results, design notes, versioned deliverables, reproducibility checklists, and local export. Do not store source repositories or large binaries in Firestore. Define concrete document paths and request schema approval before implementing them.

### Stage 5: review and optional tutor

Add stored review cards and ts-fsrs scheduling, then eligible tutoring grounded in lesson/project instructions. Prevent prompt text from acting as backend instructions. Protect auth, quotas, provider timeouts, and Markdown rendering.

### Stage 6: expand by coherent branch

Software/web → systems/electronics → control/embedded → mechanical/robotics → infrastructure/ML specializations. Follow verified dependencies rather than treating the order as a universal career ladder. Use separate capstones for independent branches.

## Definition of done for the first release

- Deployed free website, no card required, real-account sign-in verified.
- One complete thermostat/control learning slice with correct numerical behaviour.
- Authenticated dashboard with truthful empty states, local-first progress, recap and resume.
- Owner-only rules tested with unauthenticated and cross-user cases.
- No arbitrary code execution with access to the site's credentials or network privileges.
- Responsive 390px/1280px layouts, keyboard access, reduced motion, light/dark themes.
- Production build, TypeScript, solver tests, dependency checks, and browser flow pass.
- README contains exact installation/deployment instructions and any unrun or blocked checks.
- Changes pushed to a reviewable feature branch; do not silently merge or publish.

## Later lab safety boundaries

Teach high-voltage, batteries, power electronics, lasers, machining, pressure systems, and structural loads through simulations or professionally supervised lab references. Keep hands-on beginner exercises low-energy and clearly bounded. Cybersecurity exercises use owned/local lab targets with defensive learning goals. Engineering output needs appropriate real-world review before use in safety-critical systems.
