# Spot check: rewritten conceptual questions against their mapped sources

Date: 8 November 2026. Done by Claude (AI), who also wrote the questions. **Not independent, not a review, and
not an approval.** It records no evidence in the evidence gate and changes no lesson status.

## Method

For 10 of the 212 source-mapped lessons, I fetched the mapped source files at their pinned commits
(`content/review/source-inspections.json`), stripped the markup, and read each conceptual question, its key and
its explanation against what the mapped sections say, using keyword searches to locate the passage. Where the
sources do not cover a claim, I checked it against standard textbook physics, chemistry or mathematics and said so.
Source text is not reproduced here.

Sample: PB2.1, PB3.3, PB4.3, PB5.1, AS1.5, AS4.1, PH4.1, PH5.2, MA2.1, CH4.1 (about 50 conceptual questions). It was
chosen to cover each track, not at random, so it does not estimate an error rate for the other 344 lessons.

## Result

**No factual error found in the sample.** Keys, distractors (each checked as wrong) and explanations are consistent
with the mapped passages where those exist and with standard results elsewhere (for example the tidal term
2GMR/d³, the 2.44 fluid Roche coefficient, the free-fall time for a pressureless uniform sphere, the virial
parameter 5σ²R/GM, and the non-continuous function xy/(x²+y²) that still has both partial derivatives).

## What the mappings actually cover

The important finding is how little of each lesson's question set the mappings reach. The inspected scopes are narrow
(a single paragraph or element, in several cases with "not source-verified" or "does not approve every new question"
written into the scope). In this sample, roughly a third of the conceptual questions rest on a claim inside a mapped
scope. The rest are standard results that the mapped sections do not state or do not cover, for example:

| Lesson | Questions resting on claims outside the mapped scope |
| --- | --- |
| PB5.1 | Bohr model and E_n = −13.6 eV/n² (the mapping says Bohr was not inspected) |
| AS1.5 | 1/d³ scaling, Roche coefficient, tidal-tensor trace (internally derived, not source-verified) |
| AS4.1 | Jeans mass, free-fall time, virial parameter (the mapping says it is not a Jeans reference) |
| PH5.2 | Poynting theorem with −J·E, near-field versus radiated flux, energy density in matter |
| PB4.3 | Magnetic force doing no work, flux change by rotation, non-conservative induced field |
| PB3.3 | Single-slit width scaling and magnification of a diffraction pattern |
| PH4.1, MA2.1, CH4.1, PB2.1 | Symmetry requirement for Gauss's law, Jacobian composition order, BF₃ and benzene, gauge versus absolute pressure |

Minor notes, none an error:

- PB2.1's pump question says viscosity dissipates energy; the mapped Bernoulli section only states the frictionless
  case. The statement is standard but is an extension of the source.
- AS4.1 says cooling lowers the effective polytropic index; correct as a rule of thumb, and not in the mapped passage.

## What this does and does not show

- It shows the sampled questions are not obviously wrong to the writer or to a second read by the same AI. That is
  weak evidence: the writer and the checker share blind spots.
- It does **not** show the 142 lessons with no mapping, the other 202 mapped lessons, the numeric explanations, or any
  distractor "arguably correct" problem were checked.
- Because the mappings are narrow, extending them to cover every question would be a large job for a human reviewer
  with the books. The review bundle (`npm run review:handoff`) already packages each lesson with its mapping for that
  purpose.

Next step for a human reviewer: take 5 to 10 lessons, check every conceptual key and explanation against the cited
book sections, and record the result through the evidence gate.
