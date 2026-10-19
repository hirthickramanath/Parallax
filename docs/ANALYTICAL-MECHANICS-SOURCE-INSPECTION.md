# Analytical mechanics partial source inspection

Read the official SymPy mechanics documentation, `doc/src/explanation/modules/physics/mechanics/lagrange.rst`, at commit `bcd3a171919e08f940d5e97b165b5191f37ed901`. Inspected Structure of Equations (lines 11–95), the multiplier example (139–198), and explicit nonconservative loads (200–215). Source and lesson fingerprints are recorded in `content/review/source-inspections.json`.

PH2.1: corroborates coordinate-based Lagrange formulation and explicit external loads. The source explicitly says it does not derive Lagrange's equations. It therefore does not substantiate the action or total-derivative proof.

PH2.2: corroborates differentiated position constraints, Jacobian multiplier reactions and augmented equations. Sign conventions depend on which side contains the reaction. The new virtual-work argument, moving-support power and constraint independence analysis were internally derived; they need further theoretical-source inspection.

PH2.3–PH2.7: No new external-source verification claimed. Noether boundary charges, Legendre regularity, symplectic conditions, Hamilton–Jacobi branches and normal-mode proofs were internally checked. All require independent subject review. This software reference neither verifies entire lessons nor establishes the pedagogical quality of these exercises. All seven remain drafts.
