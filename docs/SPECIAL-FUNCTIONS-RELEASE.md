# Special functions and asymptotic methods batch

This is a historical authoring release. See [the current release](CONTINUOUS-AUTHORING-RELEASE.md). The generated [course ledger](COURSE-STATUS.md) records actual coverage.

## Added content

Five drafts, MA7.1–MA7.5, cover gamma/beta integrals, Legendre polynomials and spherical harmonics, Bessel functions, Hermite/Laguerre polynomials, and asymptotic methods including Laplace localization, stationary phase, steepest descent and leading WKB. Coverage is now **160 of 354 lesson bodies**, with **645 retrieval cards and 194 missing bodies**. All authored lessons remain drafts awaiting independent scientific/source review.

The theory states integral domains, normalization and phase conventions, radial measures and endpoint conditions. It distinguishes analytic continuation from integral convergence, fixed-edge Bessel zeros from derivative-zero spectra, physicists’ from probabilists’ Hermite conventions, polynomial factors from normalized physical states, and asymptotic usefulness from infinite-series convergence. WKB turning-point failure and the need for matching are explicit. These drafts do not claim exhaustive textbook coverage of every special function or asymptotic technique.

Every new lesson includes hypotheses, theoretical arguments, a worked calculation, an investigation, conceptual/numerical checks, separate warm-up/core checks and four recall prompts. NIST DLMF and Bender/Orszag references are review leads with exact section/source verification pending. The membrane worked example explicitly uses a supplied rounded Bessel zero, not a purported exact value.

## Angular-mode explorer

MA7.2 includes an interactive Legendre profile. The degree control selects ℓ=0–6, and a probe chooses x=cosθ on [−1,1]. The graph compares Pℓ with Pℓ₊₁ on a fixed vertical scale; numeric outputs distinguish Pℓ from the normalized zonal harmonic Yℓ⁰. A comparison table exposes polynomial values and sphere-Laplacian eigenvalues.

The squared-norm and cross-degree integral readouts are labelled analytic identities, not simulated measurements or numerical quadrature. The explanation gives the spherical measure sinθ dθ dφ and the normalization factor √((2ℓ+1)/(4π)). The diagram is a one-dimensional m=0 angular profile, not a complete sphere or an observational sky map. Nonzero-order azimuthal patterns and measurement masks require the fuller harmonic description.

This mathematical explorer adds no apparatus tab; the Labs catalogue remains at ten benches. No new database paths, cloud services or billing dependencies were introduced.

## Checks and limits

Model tests compare the recurrence against explicit low-degree polynomials, endpoint normalization, parity, finite-difference differential-equation residuals, independently computed interval inner products and spherical zonal normalization. Invalid degrees/probes are rejected. Authored-example tests check factorial indexing, beta normalization, Legendre values, a supplied-zero membrane calculation, polynomial conventions and Gaussian/WKB scale factors. Browser checks render every authored theory section and exercise the explorer at phone width.

The browser authentication fixture also unregisters any existing service worker through an open same-origin tab before entering its intercepted inert setup page and verifies that page’s title before seeding a synthetic Firebase session. This prevents a worker-handled navigation from loading the app during session seeding. The app registers its worker normally afterward; production authentication and service-worker code are unchanged. Both the account-switch and two-tab note-merge checks passed five consecutive runs each after this correction.

Validation passed: production build, all 64 model/grading/example tests, all 50 browser cases in the final full run, and staged whitespace checks. The full rerun includes offline reload, account isolation, two-tab merging and the new mobile explorer.

Independent scientific/source review and 194 missing lesson bodies remain. Live Firebase configuration and Firestore rules publication are not verified by fixture-based browser checks. The tutor remains disabled pending an eligible provider/account setup. A feature-branch push updates production only after the configured production branch is updated.
