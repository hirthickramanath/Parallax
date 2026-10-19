import type { AstroInvestigation } from "./astro-investigations";
export const multivariableInvestigations: Record<string, AstroInvestigation> = {
  "MA2.1": {
    title: "Follow a path rather than one coordinate axis",
    x: ["Path time t (model units)", -2, 2, 1],
    parameter: ["Path coefficient b in y=b t²", 0.5, 2, 1],
    y: "Total derivative d(x²y)/dt",
    equation: "x=t, y=b t²; df/dt=4b t³",
    assumptions:
      "Smooth polynomial and a specified differentiable path. This total derivative differs from a coordinate partial derivative; no general differentiability test follows from sampling one path.",
    value: (t, b) => 4 * b * t ** 3,
  },
  "MA2.2": {
    title: "Turn a unit direction through a gradient field",
    x: ["Direction angle (degrees)", 0, 360, 0],
    parameter: ["Point y coordinate (x=1)", -2, 2, 1],
    y: "Directional derivative of x²+2y²",
    equation: "Duf=2cosθ+4y sinθ at x=1",
    assumptions:
      "Euclidean unit direction, fixed scalar field and x=1. This first-order value does not replace the Hessian at a stationary point.",
    value: (a, y) =>
      2 * Math.cos((a * Math.PI) / 180) + 4 * y * Math.sin((a * Math.PI) / 180),
  },
  "MA2.3": {
    title: "Move a linear objective along a regular circle constraint",
    x: ["Constraint radius R", 0.2, 3, 1],
    parameter: ["Objective coefficient c in x+c y", -2, 2, 1],
    y: "Maximum objective on x²+y²=R²",
    equation: "max(x+c y)=R sqrt(1+c²)",
    assumptions:
      "Positive radius gives a regular compact circle. Cauchy–Schwarz gives the attained maximum; singular constraints and inequality boundaries need their own analysis.",
    value: (R, c) => R * Math.sqrt(1 + c * c),
  },
  "MA2.4": {
    title: "Change annulus bounds with the polar Jacobian retained",
    x: ["Outer radius", 1, 4, 2],
    parameter: ["Inner/outer radius ratio", 0, 1, 0.5],
    y: "Annulus area",
    equation: "area=π R²(1−f²)=∫∫r dr dθ",
    assumptions:
      "One full polar coverage, nonnegative radii and unsigned area. The collapsed f=1 case has zero area; it is not an orientation reversal.",
    value: (R, f) => Math.PI * R * R * (1 - f * f),
  },
  "MA2.5": {
    title: "Compare circulation for different circle sizes and field signs",
    x: ["Circle radius R", 0.2, 3, 1],
    parameter: ["Field coefficient a", -2, 2, 1],
    y: "Counterclockwise work around the circle",
    equation: "F=a(−y,x); ∮F·dr=2πaR²",
    assumptions:
      "Smooth planar vector field and counterclockwise orientation. Changing a changes the field; reversing the path would separately reverse the integral sign.",
    value: (R, a) => 2 * Math.PI * a * R * R,
  },
  "MA2.6": {
    title: "Probe oriented flux through a sphere",
    x: ["Sphere radius R", 0.2, 3, 1],
    parameter: ["Radial field coefficient a", -2, 2, 1],
    y: "Outward flux for F=a(x,y,z)",
    equation: "flux=(aR)·4πR²=4πaR³",
    assumptions:
      "Outward orientation on a Euclidean sphere. Negative flux indicates inward-directed field, not negative surface area.",
    value: (R, a) => 4 * Math.PI * a * R ** 3,
  },
  "MA2.7": {
    title: "Match a volume integral to boundary flux",
    x: ["Sphere radius R", 0.2, 3, 1],
    parameter: ["Field exponent n", 1, 3, 1],
    y: "Outward flux for F=r^(n−1)(x,y,z)",
    equation: "div F=(n+2)r^(n−1); ∫div F dV=4πR^(n+2)",
    assumptions:
      "n≥1 ensures a continuously differentiable extension at the origin. This model excludes the singular inverse-square field that requires excision/distributional treatment.",
    value: (R, n) => 4 * Math.PI * R ** (n + 2),
  },
  "MA2.8": {
    title: "Compare cylindrical geometry with a radial component",
    x: ["Cylindrical radius r", 0.2, 3, 1],
    parameter: ["Radial-field exponent n", 1, 3, 1],
    y: "Cylindrical divergence for Ar=r^n",
    equation: "div A=(1/r)d(rAr)/dr=(n+1)r^(n−1)",
    assumptions:
      "Axisymmetric radial cylindrical field away from the coordinate axis; the spherical factor would instead be (n+2). A chart singularity needs a Cartesian extension check.",
    value: (r, n) => (n + 1) * r ** (n - 1),
  },
};
