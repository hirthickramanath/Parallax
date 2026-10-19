import type { AstroInvestigation } from "./astro-investigations";
export const coverageInvestigations: Record<string, AstroInvestigation> = {
  "MA1.1": {
    title: "Search for a finite counterexample before writing a proof",
    x: ["Integer n", 0, 20, 2],
    xStep: 1,
    parameter: ["Integer coefficient a", 1, 6, 2],
    parameterStep: 1,
    y: "Difference between two sides",
    equation: "n²−an",
    assumptions:
      "Finite counterexample search for n²≥an. A negative value disproves the claim at that n; a finite run of positive values does not prove a universal statement.",
    value: (n, a) => n * n - a * n,
  },
  "MA1.2": {
    title: "Narrow a dyadic lower approximation",
    x: ["Integer dyadic depth N", 0, 12, 3],
    xStep: 1,
    parameter: ["Integer radicand k", 2, 5, 2],
    parameterStep: 1,
    y: "Distance above the dyadic lower bound",
    equation: "sqrt(k)−floor(2^N sqrt(k))/2^N",
    assumptions:
      "Small finite depths in browser arithmetic. Nested intervals motivate completeness but finite numerical approximations do not prove that a rational limit exists in the rationals.",
    value: (N, k) => Math.sqrt(k) - Math.floor(2 ** N * Math.sqrt(k)) / 2 ** N,
  },
  "MA1.3": {
    title: "Test a sequence against an explicit tolerance",
    x: ["Integer sequence index n", 1, 100, 10],
    xStep: 1,
    parameter: ["Positive tolerance ε", 0.01, 0.5, 0.1],
    y: "Error relative to tolerance",
    equation: "|1/n−0|/ε",
    assumptions:
      "Sequence 1/n with limit zero. A ratio below one checks the selected index; a proof also controls every index after a derived threshold.",
    value: (n, e) => 1 / (n * e),
  },
  "MA1.4": {
    title: "Compare finite partial sums without declaring convergence",
    x: ["Integer partial-sum count N", 1, 1000, 20],
    xStep: 1,
    parameter: ["Positive series exponent p", 0.5, 2, 1],
    y: "Finite p-series sum",
    equation: "Σ(n=1..N) n^(−p)",
    assumptions:
      "Finite sums only. Slow growth can look flat; convergence of the infinite p-series requires an analytic test and holds precisely for p>1.",
    value: (N, p) => {
      let sum = 0;
      for (let n = 1; n <= N; n++) sum += n ** -p;
      return sum;
    },
  },
  "MA1.5": {
    title: "Expose a missing compactness hypothesis",
    x: ["Positive point x in (0,1)", 0.01, 0.99, 0.5],
    parameter: ["Positive amplitude a", 0.2, 3, 1],
    y: "Continuous reciprocal value",
    equation: "a/x on the open interval (0,1)",
    assumptions:
      "Continuous on an open noncompact domain, hence not a counterexample to the extreme-value theorem on compact domains. The display truncates before zero and does not show the entire unbounded range.",
    value: (x, a) => a / x,
  },
  "MA1.6": {
    title: "Locate a mean-value point by matching slopes",
    x: ["Candidate point as fraction c/b", 0, 1, 0.5],
    parameter: ["Positive interval endpoint b", 0.2, 4, 2],
    y: "Derivative minus secant slope",
    equation: "2c−b for f(x)=x² on [0,b]",
    assumptions:
      "Polynomial with continuity on the closed interval and differentiability inside. Its zero is c=b/2; this example does not remove the theorem hypotheses for other functions.",
    value: (r, b) => 2 * r * b - b,
  },
  "PH1.1": {
    title: "Drag through the approach to terminal speed",
    x: ["Elapsed time", 0, 6, 1],
    parameter: ["Linear drag coefficient b with m=g=1", 0.2, 3, 1],
    y: "Downward speed from rest",
    equation: "v(t)=[1−exp(−bt)]/b",
    assumptions:
      "Constant mass, uniform g and linear speed-dependent drag. This is an analytic solution, not variable-mass propulsion or quadratic-drag integration.",
    value: (t, b) => (1 - Math.exp(-b * t)) / b,
  },
};
