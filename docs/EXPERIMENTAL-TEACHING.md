# Parallax teaching method: experiment-led, theory-complete

## Instruction to the implementing AI

Apply this method to physics and mathematics lessons without reducing the original theory/proof outcomes or changing curriculum dependencies. This is a teaching structure within the existing lesson template, not a new subject-selection mode. Preserve the original order of Before you start, Puzzle, Story, Intuition, Concept, Theory, Interactive, Worked problem, Problem ladder, Check, Connections, and applicable Paper Corner.

A small exploratory manipulation can appear in the Puzzle/Intuition layers; the fuller Interactive still follows Theory. Do not reorder the core template merely because exploration is useful.

## The cycle

1. **Predict:** commit to an outcome and optionally a reason before revealing the answer. Wrong predictions carry no penalty.
2. **Experiment:** manipulate one variable at a time. Show units, controlled variables, and what is calculated versus measured. A physical thought experiment or a mathematical construction also qualifies.
3. **Notice and conjecture:** ask which pattern survived, what could falsify the proposed explanation, and what the experiment did not establish.
4. **Explain:** develop the mechanism or geometric picture, name the misconception, and state the formal claim precisely.
5. **Derive/prove:** supply the full chain of reasoning, assumptions, definitions, intermediate steps, boundary/initial conditions, and a reason for each step. Numerical evidence does not replace a proof.
6. **Stress-test:** change one assumption, construct a counterexample, examine a limiting case, or compare a competing model. Distinguish a counterexample to a universal claim from a simulation artefact.
7. **Transfer:** apply the result in a worked problem and a new conceptual setting, preferably linked to astrophysics. A beautiful demonstration alone is not lesson completion.
8. **Retrieve:** check the conceptual explanation and a key step of the derivation before offering a short stored recap for the next session.

## Uncompromised theory means

- Full mode retains every required proof and derivation at undergraduate level and above, including the hard parts. “Clearly” or an animation is not a substitute for a missing argument.
- A staged reveal controls pace, not scope. Include “Show full argument” for readers who want the entire proof. Do not force guessing at each algebraic step.
- Define symbols, domains, hypotheses, approximation regimes, and units. State which results are assumed prerequisites and link exact lesson IDs when available.
- In physics, distinguish an empirical law, an idealized model, and a consequence derived within that model. Explain observational tests and limitations without claiming the model proves its assumptions.
- In maths, state the proposition, provide a general argument, and use counterexamples to test necessity of hypotheses. Explain existence, uniqueness, convergence, or regularity conditions when relevant.
- Experimental checks cannot mark a theorem “proved”. A finite graph or simulation samples a model; it does not cover all real values or all physical situations.
- Quick mode remains review and may hide full derivations. Full is the study default and must not lose content because Quick exists.
- Keep about 70% of Full lesson time for story, intuition, concept, derivation, and exploration. Keep problems about 30%; at least half of Checks are conceptual.

## Subject-specific applications

| Area | Experiment or construction | Theory that remains mandatory |
| --- | --- | --- |
| Mechanics | Compare falling masses and perturb drag assumptions | Newton's law, initial conditions, integration, model limits |
| Oscillations | Vary damping and drive frequency | Solve the ODE, distinguish transient/steady-state, derive resonance conditions |
| Electromagnetism | Compare field/flux maps | Definitions, symmetry assumptions, integral/differential law connections |
| Thermodynamics | Compare reversible/irreversible paths | State functions, first/second laws, entropy derivations and approximation limits |
| Quantum physics | Change a simple potential or initial state | State space, operators, boundary conditions, normalization, solution method |
| Calculus/analysis | Secants, sequences, approximation error | Definitions, quantified limit/convergence arguments, counterexamples |
| Linear algebra | Transform vectors and compare candidate eigen-directions | Linear-map definitions, eigenspace reasoning, theorem hypotheses and proofs |
| ODEs | Compare phase portraits and initial conditions | Existence/uniqueness hypotheses, analytic/numerical method, error/stability |
| Probability | Repeat a sampling model | Model assumptions, exact probability or convergence statement, uncertainty |

These are examples, not permission to omit other topics from full maths or physics.

## Content author checklist

- What is the student's prediction, and which misconception does it expose?
- What is varied, held fixed, observed, and inferred?
- Is this real data, synthetic data, a thought experiment, or a mathematical construction?
- Is every numerical method validated against an analytic result or controlled reference case?
- Are the complete argument, its assumptions, units, and limitations present?
- Is there a counterexample or an assumption-change task?
- Are controls accessible by keyboard and touch? Is there a textual readout independent of animation or colour?
- Does the conceptual Check test why the result holds rather than merely recognition of the visual?
- Is the recap authored from this lesson and independent of AI availability?
- Are source references and historical/scientific claims verified before publication?

## Current implementation

The protected `/teaching-lab` route contains two authored draft previews:

- Falling bodies, with optional equal linear-drag coefficients. The analytic trajectory is labelled as a model, stops at ground contact, and includes the vacuum and drag derivations.
- Secant/tangent exploration for x², including the exact error formula, an epsilon–delta proof, and |x| at zero as a counterexample to “continuous implies differentiable”.

They illustrate the method; they are not full curriculum lessons and do not award credit or save attempts. Real-data labs, complete discovery stories, lesson metadata, and integration with the player remain future work. Drafts need editorial/source verification before publication.
