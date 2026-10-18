# Electromagnetism and organic-foundation batches

This is the current authoring release. `COURSE-STATUS.md` is generated from the actual curriculum and MDX files; older release documents preserve historical counts.

## Added lessons

| Unit | New drafts | Content |
| --- | --- | --- |
| PH4 | PH4.1–PH4.8 | Coulomb/Gauss laws, Poisson/Laplace equations, uniqueness and images, multipoles, conductors/capacitance, polarization, steady magnetic fields, vector potential and magnetic materials |
| CH6 | CH6.1–CH6.8 | Structure/resonance/acidity, stereochemistry, electron-pair mechanisms, substitution/elimination, carbonyl and functional-group reasoning, aromaticity, spectroscopy and interstellar-organic inference |

The **16 new drafts** bring the course to **122 playable drafts and 493 retrieval cards** within the unchanged 354-entry / 59-unit inventory. **232 lesson bodies remain missing**. No lesson has been upgraded to independently verified status.

Every draft retains definitions and assumptions, theoretical arguments, examples, conceptual questions, separate warm-up/core checks, investigations and four retrieval prompts. Selected discrete count/charge questions use the existing exact-grading option. References are honest review leads with exact edition/section verification pending, rather than claims that a source has been checked when it has not.

Organic chemistry remains a supporting prerequisite for the astrophysics course. The material distinguishes electronic contributors from separate molecules, equilibrium from kinetics, configuration from conformation, identification from mechanism and organic detection from biological origin. No separate broad biology or engineering course was added.

## New spherical-field apparatus

The eighth Labs bench, **Spherical field**, compares a uniformly charged solid sphere and an ideal conducting spherical shell in vacuum. It also appears within PH4.1, PH4.2 and PH4.5.

Controls specify signed total charge, sphere radius and probe radius. Apparatus and field diagrams accompany readouts for potential, signed radial field and enclosed charge. The model uses k=1 and zero potential at infinity; values are computed in normalized units, not hardware voltmeter readings. Up to twenty observations retain their model and every control value, so changing settings does not erase the provenance of a recorded row.

For a uniform solid sphere, the interior field is Qr/R³ and potential is Q(3R²−r²)/(2R³). For a conducting shell, the interior field is zero and potential Q/R. Both give exterior field Q/r² and potential Q/r. The origin is handled without dividing by zero.

At a nonzero ideal shell surface charge, the field jumps from zero to Q/R². The bench reports both one-sided limits, leaves the sheet field unassigned and disables an ordinary reading exactly on it. It does not draw a fictitious continuous transition. Potential remains continuous. The uniform-solid boundary instead has one continuous field value. A zero-charge shell has no nonzero jump.

The field axis adapts to the charge/radius scale, and the interface states that numeric values, not pixel heights across settings, should be compared. The model assumes spherical symmetry, electrostatics, vacuum and a nonperturbing probe. It does not model a dielectric, finite-conductivity transient or a real measurement instrument.

## Checks

Model tests compare interior/exterior limits, signed charge reversal, zero charge, centre behaviour, the potential gradient and Gauss field away from the sheet. Authored-answer tests compute selected image-charge, dipole, capacitance, dielectric, magnetic, acid-base, kinetic and spectroscopic answers independently of their answer strings.

Browser checks open every authored lesson through the production player, reveal its theory, reject runtime/KaTeX errors and open its investigation. The new lab case checks both charge models, the undefined sheet readout, disabled recording, exterior values, charge reversal, traceable rows, phone layout and its PH4.1 lesson link.

These tests check implementation, arithmetic and presentation. They do not constitute independent scientific review or a real experiment. Existing Firebase synchronization, provider setup and other live-service verification boundaries remain recorded in earlier release documents. No cloud schema, credential, API key or production-service configuration was changed by this batch.

## Next authoring work

Use the exact missing-ID ledger and retain all established IDs. Physical-chemistry, remaining mathematical methods, analytical mechanics and subsequent physics/astronomy units still need their own authored content and review. Keep every approximation and environment explicit, and never label simulated data as external observations.

## Recorded validation

- Production build, strict app TypeScript, all content/answer-key checks and prerequisite graph: passed.
- Model, example-arithmetic, learning, grading, planning and stream suite: **47 passed**.
- Full browser suite on the corrected content: **41 passed**, including every one of the **122 authored lessons**.
- After making the solid-sphere helper’s reported interior surface limit consistent with its continuous field, model tests were rerun, the production bundle rebuilt, and the affected PH4/spherical-apparatus browser flows repeated: **2 passed**.
- Formatting and Git whitespace checks: passed.
- Scientific/source verification and production-service checks remain outside these local test results. No independent-verification badge or cloud-deployment success is claimed.
