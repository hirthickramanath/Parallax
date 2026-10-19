import type { AstroInvestigation } from "./astro-investigations";
export const emInvestigations: Record<string, AstroInvestigation> = {
  "PH4.5": {
    title: "Keep the capacitor boundary condition explicit",
    x: ["Plate separation d", 0.2, 3, 1],
    parameter: ["Applied voltage V", 0.1, 4, 1],
    y: "Stored field energy for εA=1",
    equation: "C=1/d; U=V²/(2d)",
    assumptions:
      "Ideal parallel plates with voltage controlled by an external source. Fringing is omitted; battery energy must be included in a mechanical work calculation.",
    value: (d, V) => (V * V) / (2 * d),
  },
  "PH4.6": {
    title: "Vary a linear polarization response",
    x: ["Electric field E (model units)", -3, 3, 1],
    parameter: ["Electric susceptibility χ", 0, 5, 1],
    y: "Polarization P (ε₀=1 units)",
    equation: "P=χE",
    assumptions:
      "Homogeneous isotropic linear static dielectric with fixed real susceptibility. Frequency dispersion, anisotropy, saturation and loss are excluded.",
    value: (E, c) => c * E,
  },
  "PH4.8": {
    title: "Read a uniform-field vector potential in one gauge",
    x: ["Position x at y=0", -3, 3, 1],
    parameter: ["Uniform Bz", -2, 2, 1],
    y: "Ay in symmetric gauge",
    equation: "A=(−By/2,Bx/2,0); Ay=Bx/2",
    assumptions:
      "One gauge for a spatially uniform static field. Potential components are gauge-dependent; the plotted value alone is not a magnetic-field observable.",
    value: (x, B) => (B * x) / 2,
  },
  "PH5.1": {
    title: "Differentiate a changing flux with its sign retained",
    x: ["Elapsed time", 0, 3, 1],
    parameter: ["Flux coefficient a in Φ=a t²", -2, 2, 1],
    y: "Oriented stationary-loop emf",
    equation: "emf=−dΦ/dt=−2at",
    assumptions:
      "One fixed loop and a chosen positive flux orientation. Moving-loop motional terms require the appropriate full circuit formulation.",
    value: (t, a) => -2 * a * t,
  },
  "PH5.2": {
    title: "Compare peak field and time-averaged plane-wave intensity",
    x: ["Peak electric amplitude E₀", 0, 4, 1],
    parameter: ["Positive wave impedance Z", 0.2, 3, 1],
    y: "Time-averaged plane-wave intensity",
    equation: "⟨S⟩=E₀²/(2Z)",
    assumptions:
      "Monochromatic traveling plane wave in a lossless medium with real positive impedance. Standing-wave, near-field and complex-impedance cases need more care.",
    value: (E, Z) => (E * E) / (2 * Z),
  },
  "PH5.3": {
    title: "Change a lossless medium phase-speed scale",
    x: ["Relative permittivity εr", 1, 9, 4],
    parameter: ["Relative permeability μr", 1, 4, 1],
    y: "Phase speed v/c",
    equation: "v/c=1/sqrt(εr μr)",
    assumptions:
      "Simple isotropic lossless nondispersive positive constitutive coefficients. It is not a causal dispersive-response model or a group-speed calculation.",
    value: (e, m) => 1 / Math.sqrt(e * m),
  },
  "PH5.4": {
    title: "Inspect normal-incidence reflected power",
    x: ["Second refractive index n₂", 1, 3, 1.5],
    parameter: ["First refractive index n₁", 1, 3, 1],
    y: "Intensity reflectance",
    equation: "R=[(n₁−n₂)/(n₁+n₂)]²",
    assumptions:
      "Normal incidence between lossless nonmagnetic media with real positive indices. Oblique polarization, magnetic impedance and absorption are excluded.",
    value: (n2, n1) => ((n1 - n2) / (n1 + n2)) ** 2,
  },
  "PH5.5": {
    title: "Trace a retarded source clock",
    x: ["Source distance R (model length)", 0, 6, 3],
    parameter: ["Propagation speed c (length/time)", 0.5, 3, 1],
    y: "Delay from source to observer",
    equation: "Δt=R/c; tret=tobs−Δt",
    assumptions:
      "Flat-spacetime constant-speed propagation. This delay alone does not supply a full retarded-potential integral or incoming homogeneous radiation.",
    value: (R, c) => R / c,
  },
  "PH5.6": {
    title: "Separate charge and acceleration in Larmor power",
    x: ["Acceleration magnitude (model units)", 0, 3, 1],
    parameter: ["Charge magnitude (model units)", 0.2, 3, 1],
    y: "Power with Larmor coefficient normalized to one",
    equation: "P=q²a²",
    assumptions:
      "Nonrelativistic point-charge acceleration in vacuum with the fixed dimensional coefficient divided out. Angular spectra and radiation reaction are separate calculations.",
    value: (a, q) => q * q * a * a,
  },
  "PH5.7": {
    title: "Sweep an invariant for orthogonal fields",
    x: ["Electric magnitude E (c=1 units)", 0, 5, 3],
    parameter: ["Magnetic magnitude B", 0, 5, 5],
    y: "Lorentz invariant B²−E²",
    equation: "I=B²−E², with E·B=0 in this chosen family",
    assumptions:
      "Orthogonal uniform fields and an explicitly chosen c=1 convention. This scalar classification is not the full field-tensor Lorentz transformation.",
    value: (E, B) => B * B - E * E,
  },
  "PH5.8": {
    title: "Compare cold-plasma group and phase propagation",
    x: ["Wave number k (c=1 units)", 0.1, 5, 4],
    parameter: ["Plasma angular frequency ωp", 0.2, 4, 3],
    y: "Group speed / c",
    equation: "ω=sqrt(ωp²+k²); vg/c=k/sqrt(ωp²+k²)",
    assumptions:
      "Cold unmagnetized collisionless transverse electromagnetic branch above cutoff. Group speed is below one while phase speed is above one; absorption and other branches are omitted.",
    value: (k, w) => k / Math.hypot(k, w),
  },
};
