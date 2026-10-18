# ODE, relativity, radiation and inference batches

This is the current implementation release. The generated `COURSE-STATUS.md` lists exact coverage and every missing lesson ID; previous release documents retain historical counts.

## Added in this release

| Unit | New drafts | Covered methods |
| --- | --- | --- |
| MA4 | 6 | First-order existence/uniqueness, integrating factors, Green functions, phase planes, nonlinear stability, Frobenius solutions and regular Sturm–Liouville problems |
| PH11 | 4 | Lorentz transformations, four-momentum, collision thresholds, proper acceleration, Thomas precession, aberration and frame-specific Doppler formulas |
| AS2 | 7 | Flux/magnitudes, blackbody and line spectra, radiative transfer, redshift models, instruments, photometry/spectroscopy and multi-messenger inference |
| MA8 | 7 | Probability, limit theorems, Markov/Poisson models, testing, Bayesian inference, MCMC and covariance-aware fitting |
| MA9 | 3 | Euler–Lagrange variation, integral/pointwise constraints and finite-coordinate Noether theorem |

**27 new drafts** bring the library to **106 authored lessons and 429 recall cards**. The retained curriculum remains 354 entries in 59 units, with **248 bodies missing**. All 106 lessons remain drafts pending independent scientific review and exact reference verification.

The new drafts preserve the layered lesson template and include definitions, hypotheses, derivations/proof arguments, limiting cases, counterexamples, worked examples, investigations, conceptual checks, separate warm-up/core questions and genuine retrieval cards. References are explicitly unverified review leads. Internal checks do not certify every theorem, approximation or bibliographic mapping.

## New radiation apparatus

Labs now includes a seventh bench, **Radiation bench**, with two experiments. Both are explicitly synthetic and also appear within AS2.3 and AS2.4.

### Emitting slab

Incident intensity passes through a uniform slab with nonnegative extinction and constant source function at one frequency. Controls set incident intensity, source function and optical depth. The bench displays transmission, transmitted contribution, emitted contribution and total outgoing intensity separately, with an apparatus schematic and up to twenty parameter-labelled observations.

The model is Iout=Iin exp(−τ)+S[1−exp(−τ)]. It uses `expm1` for the small-depth emitted contribution to avoid subtracting nearly equal numbers. Invalid/empty depth inputs show a message rather than a nonfinite result. Optical depth zero, equal incident/source brightness, half transmission and the thick limit have explicit checks.

This is not a complete atmosphere model: it does not solve angular scattering, changing opacity/temperature, maser gain or a global energy budget. One ray intensity is not total luminosity.

### Doppler markers

A known rest-line marker is compared with its exact radial-special-relativistic shifted wavelength. Controls set rest wavelength and subluminal radial speed, with positive speed defined as recession. Numerical wavelength, z and wavelength factor accompany the diagram. Approach and recession factors at equal speed magnitude are reciprocal.

Markers do not represent predicted line widths, colours, detector spectra or continuum radiation. The axis range adapts to the two markers, and this is stated in the interface. The model must not be used to turn cosmological redshift into a global special-relativistic velocity. The bench links to the relevant redshift lesson; the Labs connected-lesson link leads to radiative transfer.

## Meaningful boundaries retained

- Continuity of an ODE rule is not automatically uniqueness, and local uniqueness is not global existence.
- Linearization with zero-real-part eigenvalues is inconclusive without further analysis.
- Sturm–Liouville boundary conditions belong to the operator domain.
- Rod contraction requires a rod parallel to the motion and simultaneous measuring-frame endpoint events.
- A source's apparent brightness is not its luminosity; spectral-density peaks depend on the plotted variable.
- Optical thickness can produce emission instead of darkness.
- Redshift, line width, instrumental resolution and absolute wavelength accuracy are distinct observables.
- A p-value is not a posterior null probability. MCMC stationarity is not proof of exploration. A small fit residual is not proof of reliable parameters.
- An action extremum is not automatically a minimum; nonholonomic constraints cannot always be inserted as ordinary holonomic variational multipliers.

## Validation and next work

The production build validates all MDX, metadata, answer keys and prerequisite graph and runs strict app TypeScript. Pure model tests check slab limits and Doppler invariants; authored-example tests compare selected arithmetic, normalization, thresholds and uncertainty calculations with answer keys. The per-unit browser sweep covers every authored lesson's theory and investigation. The radiation browser case checks both experiment modes, invalid input, synthetic reading records, phone layout and lesson links.

These are local development checks. They do not deploy the branch or verify production Firebase, a real AI provider or independent scientific review. The existing service limitations in `FOUNDATION-RELEASE.md` remain in force; no cloud schema or credential configuration was changed.

Continue with the missing-ID ledger, preferring remaining early prerequisites such as PH4 and the approved chemistry foundations before downstream applications. Keep synthetic experiments distinct from sourced observations and preserve the fixed astrophysics-focused scope. No separate engineering/technology curriculum was added to this app.

## Recorded validation

- Production build/app TypeScript and complete content/graph validation: passed.
- Model, arithmetic, grading, learning, planning and streaming suite: **44 passed**.
- Full browser suite: **38 passed**, including all **106 authored lessons**, both radiation modes and existing app workflows.
- After two final prose clarifications and an additional slab phone-width assertion, the affected MA8, PH11 and radiation cases were repeated: **3 passed**.
- Formatting and Git whitespace checks: passed.
- Independent source/science review, live Firebase cross-device checks and real AI-provider deployment: not completed; no success is implied by local tests.
