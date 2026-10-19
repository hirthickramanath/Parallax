import type { AstroInvestigation } from "./astro-investigations";
export const linearOdeInvestigations: Record<string, AstroInvestigation> = {
  "MA3.1": {
    title: "Move inside a homogeneous plane",
    x: ["First coordinate x", -3, 3, 1],
    parameter: ["Second coordinate y", -3, 3, 1],
    y: "Required third coordinate z",
    equation: "x+y+z=0 ⇒ z=−x−y",
    assumptions:
      "Exact slice of a linear kernel. A graph sample illustrates closure but does not prove it; the proof uses linearity for arbitrary vectors and scalars.",
    value: (x, y) => -x - y,
  },
  "MA3.2": {
    title: "Follow the first component of a shear",
    x: ["Input first coordinate", -3, 3, 1],
    parameter: ["Input second coordinate", -3, 3, 1],
    y: "Output first coordinate",
    equation: "A=[[1,2],[0,1]]; A(x,y)=(x+2y,y)",
    assumptions:
      "Fixed map in one specified column-vector basis. This displays one output component, not a change-of-basis operation or a full vector-field integration.",
    value: (x, y) => x + 2 * y,
  },
  "MA3.3": {
    title: "Pass through a singular signed-area map",
    x: ["Matrix entry a", -3, 3, 1],
    parameter: ["Matrix entry d", -3, 3, 1],
    y: "Signed determinant",
    equation: "A=[[a,1],[2,d]]; det A=ad−2",
    assumptions:
      "Two-dimensional column-vector convention. Zero means area collapse; unsigned geometric area is the absolute value of this signed quantity.",
    value: (a, d) => a * d - 2,
  },
  "MA3.4": {
    title: "Split the eigenvalues of a symmetric matrix",
    x: ["Off-diagonal coupling b", -3, 3, 1],
    parameter: ["Common diagonal entry d", 0, 3, 1],
    y: "Larger eigenvalue",
    equation: "A=[[d,b],[b,d]]; λmax=d+|b|",
    assumptions:
      "Real symmetric family; at b=0 the eigenvalue is degenerate with a full eigenspace. This family does not demonstrate a defective nonsymmetric matrix.",
    value: (b, d) => d + Math.abs(b),
  },
  "MA3.5": {
    title: "Rotate a vector past a projection axis",
    x: ["Vector angle (degrees)", 0, 360, 0],
    parameter: ["Vector length", 0.2, 3, 1],
    y: "Signed projection onto x axis",
    equation: "projection coefficient=R cos θ",
    assumptions:
      "Euclidean real inner product and a unit x-axis basis vector. The plotted scalar is signed; residual norm is a different quantity.",
    value: (a, R) => R * Math.cos((a * Math.PI) / 180),
  },
  "MA3.6": {
    title: "Sweep a Rayleigh quotient between spectral bounds",
    x: ["Unit-vector angle (degrees)", 0, 180, 0],
    parameter: ["Second eigenvalue", 2, 5, 4],
    y: "Rayleigh quotient",
    equation: "A=diag(1,λ); R(v)=cos²θ+λsin²θ",
    assumptions:
      "Real symmetric matrix and a unit vector. The quotient stays between the two eigenvalues; no infinite-dimensional operator-domain claim follows.",
    value: (a, l) =>
      Math.cos((a * Math.PI) / 180) ** 2 +
      l * Math.sin((a * Math.PI) / 180) ** 2,
  },
  "MA3.7": {
    title: "See inverse sensitivity in a small singular direction",
    x: ["Small singular value", 0.01, 1, 0.1],
    parameter: ["Measured component in that direction", 0.1, 3, 1],
    y: "Unregularized solution component",
    equation: "x_component=b_component/σ",
    assumptions:
      "One diagonalized singular direction with nonzero σ. This is a sensitivity illustration, not a noisy-data fit or a choice of regularization strength.",
    value: (s, b) => b / s,
  },
  "MA3.8": {
    title: "Retain the Jordan polynomial during exponential decay",
    x: ["Elapsed time", 0, 5, 1],
    parameter: ["Nilpotent coupling", -2, 2, 1],
    y: "Upper-right entry of exp(tJ)",
    equation: "J=[[-1,b],[0,-1]]; entry=b t exp(−t)",
    assumptions:
      "Exact two-by-two Jordan-family exponential with a squared-zero nilpotent part. This is a matrix-entry curve rather than a general nonlinear trajectory.",
    value: (t, b) => b * t * Math.exp(-t),
  },
  "MA4.1": {
    title: "Follow exact first-order growth and decay",
    x: ["Elapsed time", 0, 3, 1],
    parameter: ["Growth coefficient a", -2, 2, -1],
    y: "Solution with initial value one",
    equation: "y′=ay, y(0)=1 ⇒ y=exp(at)",
    assumptions:
      "Exact smooth autonomous scalar linear initial-value problem. It does not establish existence/uniqueness for arbitrary nonsmooth right sides.",
    value: (t, a) => Math.exp(a * t),
  },
  "MA4.2": {
    title: "Turn on a constant causal forcing",
    x: ["Elapsed time", 0, 4, 1],
    parameter: ["Decay coefficient a", 0.2, 3, 1],
    y: "Response to unit constant forcing",
    equation: "y′+ay=1, y(0)=0 ⇒ y=(1−exp(−at))/a",
    assumptions:
      "Causal initial-value problem and positive a. A different boundary condition or a zero mode changes the inverse operator.",
    value: (t, a) => -Math.expm1(-a * t) / a,
  },
  "MA4.3": {
    title: "Read one exact component of a planar diagonal flow",
    x: ["Elapsed time", 0, 3, 1],
    parameter: ["First eigenvalue", -2, 2, -1],
    y: "First coordinate from x(0)=1",
    equation: "(x′,y′)=(λx,−y); x=exp(λt)",
    assumptions:
      "Exact diagonal two-dimensional linear system. The second eigenvalue remains −1, so λ>0 creates a saddle despite contraction in y.",
    value: (t, l) => Math.exp(l * t),
  },
  "MA4.4": {
    title: "Contrast algebraic attraction with linear exponential intuition",
    x: ["Elapsed time", 0, 5, 1],
    parameter: ["Positive initial value", 0.2, 3, 1],
    y: "Solution of x′=−x³",
    equation: "x(t)=x₀/sqrt(1+2x₀²t)",
    assumptions:
      "Exact scalar nonlinear decay for positive initial data and t≥0. Its zero linearization does not capture the algebraic rate; this is not exponential attraction.",
    value: (t, x) => x / Math.sqrt(1 + 2 * x * x * t),
  },
  "MA4.5": {
    title: "Move along one Euler-equation power branch",
    x: ["Positive coordinate x", 0.2, 3, 1],
    parameter: ["Chosen exponent r", -2, 3, 2],
    y: "Power solution y",
    equation: "y=x^r solves x²y″−r(r−1)y=0",
    assumptions:
      "Positive-x branch with its coefficient chosen consistently from r. This is an Euler family, not a proof that arbitrary regular-singular equations have two simple power branches.",
    value: (x, r) => x ** r,
  },
  "MA4.6": {
    parameterStep: 1,
    title: "Change interval length in a Dirichlet spectrum",
    x: ["Interval length L", 0.5, 4, Math.PI],
    parameter: ["Mode number n", 1, 5, 1],
    xStep: undefined,
    y: "Eigenvalue of −d²/dx²",
    equation: "λn=(nπ/L)²",
    assumptions:
      "Regular unit-weight interval problem with zero endpoint values; the mode number must be a positive integer. The spectrum changes with different boundary conditions.",
    value: (L, n) => ((Math.round(n) * Math.PI) / L) ** 2,
  },
  "MA5.1": {
    parameterStep: 1,
    title: "Inspect an odd-harmonic square-wave partial sum",
    x: ["Position x (radians)", -Math.PI, Math.PI, 1],
    parameter: ["Number of odd sine modes", 1, 10, 3],
    y: "Partial sum",
    equation: "SN=(4/π)Σ[j=0..N−1] sin((2j+1)x)/(2j+1)",
    assumptions:
      "Periodic square-wave partial sum with integer mode count, and midpoint zero at jumps. Overshoot and a finite sum do not establish uniform convergence.",
    value: (x, N) =>
      (4 / Math.PI) *
      Array.from(
        { length: Math.round(N) },
        (_, j) => Math.sin((2 * j + 1) * x) / (2 * j + 1),
      ).reduce((a, b) => a + b, 0),
  },
  "MA5.2": {
    title: "Trade Gaussian width against Fourier width",
    x: ["Wavenumber k", -4, 4, 0],
    parameter: ["Spatial Gaussian width σ", 0.2, 3, 1],
    y: "Transform divided by its zero-frequency value",
    equation: "F(k)/F(0)=exp(−σ²k²/2)",
    assumptions:
      "Continuous Gaussian transform under the e^(−ikx) convention; normalization is divided out. Finite sampling, aliasing and measurement noise are not modeled.",
    value: (k, s) => Math.exp((-s * s * k * k) / 2),
  },
  "MA5.3": {
    title: "Approach a Laplace convergence boundary from the valid side",
    x: ["Real transform variable s", 3, 8, 5],
    parameter: ["Exponential growth a", -1, 2, 1],
    y: "Laplace transform of exp(at)",
    equation: "F(s)=1/(s−a), valid for s>a",
    assumptions:
      "One-sided transform, real s, and controls restricted to the convergent domain. The rational expression is not an unrestricted integral outside that domain.",
    value: (s, a) => 1 / (s - a),
  },
  "MA5.4": {
    title: "Damp a selected heat-equation mode",
    x: ["Elapsed time", 0, 3, 1],
    parameter: ["Diffusivity κ", 0.1, 2, 1],
    y: "First Dirichlet-mode amplitude on [0,π]",
    equation: "A(t)=exp(−κt)",
    assumptions:
      "Exact one-dimensional heat mode with zero endpoints, initial sine amplitude one. It is not a time-discrete solver, so no numerical stability claim follows.",
    value: (t, k) => Math.exp(-k * t),
  },
  "MA5.5": {
    title: "Change a standing wave clock",
    x: ["Elapsed time", 0, 6, 1],
    parameter: ["Wave speed c", 0.2, 3, 1],
    y: "First-mode displacement amplitude on [0,π]",
    equation: "A(t)=cos(ct), A(0)=1, A′(0)=0",
    assumptions:
      "Undamped fixed-endpoint ideal wave mode with both initial conditions stated. This amplitude curve is not a general traveling packet or a damped numerical simulation.",
    value: (t, c) => Math.cos(c * t),
  },
  "MA5.6": {
    title: "Inspect a separated harmonic function",
    x: ["Horizontal coordinate x", 0, Math.PI, Math.PI / 2],
    parameter: ["Vertical coordinate y", 0, 2, 1],
    y: "Harmonic function sin(x)sinh(y)",
    equation: "uxx=−u, uyy=u ⇒ ∇²u=0",
    assumptions:
      "One exact smooth two-dimensional harmonic function; its own boundary values are fixed by the formula. It does not solve every arbitrary rectangle boundary condition.",
    value: (x, y) => Math.sin(x) * Math.sinh(y),
  },
  "MA5.7": {
    title: "Move a Dirichlet point source along an interval",
    x: ["Observation point x", 0, 1, 0.25],
    parameter: ["Source position s", 0.1, 0.9, 0.5],
    y: "Green function G(x,s)",
    equation: "G=min(x,s)[1−max(x,s)] for −d²/dx² on [0,1]",
    assumptions:
      "Zero endpoint Dirichlet Green kernel. It is continuous with a derivative jump at x=s; the source is distributional and is not a finite-height arbitrary spike.",
    value: (x, s) => Math.min(x, s) * (1 - Math.max(x, s)),
  },
};
