# Fourier methods and PDE batch

This is a historical authoring release. See [the current release](COMPLEX-ANALYSIS-RELEASE.md). The generated [course ledger](COURSE-STATUS.md) records actual coverage.

## New content

Seven drafts, MA5.1–MA5.7, cover Fourier series, Fourier transforms, unilateral Laplace transforms, heat diffusion, the wave equation, separated Laplace/Poisson boundary problems and Green functions. Coverage is now **149 of 354 lesson bodies**, with **601 retrieval cards and 205 missing bodies**. All authored lessons remain drafts awaiting independent scientific and source review.

The lessons state transform normalizations, convergence hypotheses and boundary conventions. They distinguish L² from pointwise convergence, finite windowing from sampling, analytic continuation from integral convergence, diffusion from finite-speed wave propagation, and a free-space Green function from a boundary-adapted inverse. Dirichlet and Neumann uniqueness/compatibility are treated separately, including nullspaces and the sign convention −Δu=f.

Every draft includes theory, worked examples, conceptual and numeric checks, an investigation and four recall prompts. Strauss and Stein/Shakarchi references are review leads; exact source mapping has not been independently verified.

## Fourier evolution apparatus

The tenth Labs bench, **Heat flow and waves**, also appears in MA5.1, MA5.4 and MA5.5. On the dimensionless interval [0,π] with homogeneous Dirichlet endpoints, it compares:

- Heat: uₜ=D uₓₓ, each sine amplitude decaying as exp(−Dn²t).
- Wave: uₜₜ=c²uₓₓ, with zero initial velocity and each amplitude evolving as cos(cnt).

First-mode, third-mode and mixed-mode releases provide three explicit initial shapes. Controls set diffusivity or wave speed and scrub time. A dashed initial trace and solid evolved trace share one fixed amplitude scale. The table reports the exact retained modal amplitudes and their decay rates or angular frequencies. These are finite-mode analytic solutions, not finite-difference approximations and not measured data.

Readouts distinguish ∫u²dx from wave energy. For the heat model, the squared norm decays but does not represent total heat. Fixed-temperature boundaries allow heat exchange. For the wave model with density one and tension c², kinetic plus elastic energy stays constant even when the field norm approaches zero. The field may represent a signed temperature deviation, so a negative value is not a claim of negative absolute temperature.

Up to twenty readings retain model, coefficient, initial amplitudes, time and diagnostics. Readings are local to the mounted bench and clear on leaving it. No new database paths or cloud services were introduced.

## Validation and limits

Model checks cover exact initial conditions, fixed endpoints, modal rate scaling, heat norm decay, wave-energy conservation, comparison against numerical PDE derivatives and spatial quadrature, and invalid inputs. Authored-answer checks independently calculate selected transform normalizations, mode rates and Green-function values. Browser checks render every authored theory section and exercise the new bench on a phone-sized viewport.

Validation passed: production build, all 55 model/grading/example tests, all 46 browser cases and staged whitespace checks.

Production Firebase configuration, Firestore rule publication and deployment are outside these fixture-based browser checks. The live tutor remains disabled pending an eligible provider/account setup. The feature branch requires merging into the configured production branch before Cloudflare production updates.
