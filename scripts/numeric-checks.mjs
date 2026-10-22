// Independent recomputations of numeric lesson answers.
//
// Each entry re-derives the answer from the GIVENS IN THE QUESTION TEXT, using unit-carrying
// arithmetic (scripts/numeric-lib.mjs). It never reads the stored answer. The runner then checks
// that the result (a) has the dimensions of the stored `unit` and (b) equals the stored answer.
//
// `fp` is a fingerprint of the question prompt and stored answer at the time the check was written.
// If either is edited, the check is reported as STALE until a person re-reads the question and
// refreshes the fingerprint (`node scripts/verify-numeric.mjs --refresh KEY`), so an edited
// question can never silently keep an old tick.
//
// This is automated arithmetic, not scientific review: it shows that stored answers follow from
// the stated givens and formulas. It does not check that the physics model is appropriate.
import { q } from "./numeric-lib.mjs";

const PI = Math.PI;
const g = (value) => q(value, "m/s²");

/** [key, fingerprint, () => Quantity | number, options?] */
export const CHECKS = [
  // ---- Astrophysics -------------------------------------------------------------------------
  ["AS1.1:worked-inference-transfer", "be568c6c", () => q(90 - Math.abs(-25 - 10), "degrees")], // altitude = 90 - |lat - dec|
  ["AS1.2:worked-inference-transfer", "5b15063b", () => q(90 - Math.abs(35 - -23.44), "degrees")],
  ["AS1.3:worked-inference-transfer", "370940d1", () => q(9 ** 1.5, "years")], // P² = a³
  ["AS2.2:worked-inference-transfer", "a62384d7", () => q(2.9e-3, "m K").div(q(7250, "K"))], // Wien
  ["AS2.4:worked-inference-transfer", "8f5eb0ea", () => q(300000, "km/s").mul((603 - 600) / 600)], // v = c z
  ["AS3.1:depth-transfer-20261020", "59fc7a20", () => {
    // Virial: E = W/2. Halving R at fixed M doubles |W|. Energy radiated = E_initial - E_final.
    const W0 = -120, W1 = 2 * W0;
    return q(W0 / 2 - W1 / 2, "J");
  }],
  ["AS3.3:depth-transfer-20261020", "b56ae6e3", () => q(6.3e26, "W").div(q(3.0e8, "m/s").pow(2).mul(0.007))], // mdot = L/(eps c²)
  ["AS4.5:depth-transfer-20261020", "27388763", () => q(2e30, "kg").mul(q(1e7, "m/s").pow(2)).mul(0.5)],
  ["AS4.6:depth-transfer-20261020", "39face8e", () => q(6.67e-11, "m³/kg s²").mul(q(2e30, "kg")).div(q(1e7, "m").pow(2))],
  ["AS5.1:depth-transfer-20261020", "b7d2c2aa", () => q(1.2e20, "m³/s²").mul(q(2e12, "kg/s")).div(q(1e7, "m").mul(2))],
  ["AS5.5:numeric", "8b1704a2", () => q(4, "m").mul(1e-6)],
  ["AS7.4:worked-inference-transfer", "4478855c", () => q(0.0009).sqrt().mul(q(1.5, "solar radii"))],
  ["AS9.1:worked-inference-transfer", "4b895d21", () => q(6000, "km/s").div(q(75, "km/s").div(q(1, "Mpc")))],
  ["AS4.1:depth-transfer-20261020", "24c3b0e2", () => q(4 ** 1.5 / Math.sqrt(16))],
  ["AS8.3:depth-transfer-20261020", "2f12b4d5", () => q((2 * 1) / 1)], // v flat => M(<r) = v² r / G, so M ∝ r
  ["AS9.2:depth-transfer-20261020", "18fa6f24", () => q(2 ** 2)], // ρ_crit ∝ H²
  ["AS4.2:depth-transfer-20261020", "f5cba1a3", () => q(Math.sqrt(100) / 0.5 ** 2)], // L ∝ R² T⁴
  ["AS3.4:depth-transfer-20261020", "72f9d233", () => q(0.2, "m²/kg").mul(q(15, "kg/m²"))],
  ["AS3.2:depth-transfer-20261020", "e38b41d6", () => q(0.1 * (2 ** 3) / 2)], // P_rad/P_gas ∝ T³/ρ
  ["AS5.2:depth-transfer-20261020", "f2468208", () => q(1 / (1.25 * (1 - 0.6)))],

  // ---- Mathematics for the sciences ---------------------------------------------------------
  ["MB2.2:periapsis-transfer", "0ba7fce1", () => q(10 * (1 - 0.4), "AU")],
  ["MB2.2:apoapsis-transfer", "7c3ff25e", () => q(10 * (1 + 0.4), "AU")],
  ["MB2.2:polar-transfer", "30214594", () => q(6 / (1 + 0.5 * Math.cos(PI / 2)), "AU")],
  ["MB3.2:depth-transfer-20261020", "39c2835e", () => {
    // V = 4πR³/3, R = 2 + t². dV/dt = 4πR² dR/dt with dR/dt = 2t; report (dV/dt)/π.
    const t = 1, R = 2 + t * t;
    return q((4 * R * R * 2 * t), "m³/s");
  }],
  ["MB3.3:depth-transfer-20261020", "d0b0567f", () => {
    // Total distance = ∫|2t-2| dt on [0,2], midpoint rule with fine steps.
    const n = 200000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.abs(2 * ((i + 0.5) * 2 / n) - 2) * (2 / n);
    return q(sum, "m");
  }, { rel: 1e-6 }],
  ["MB3.1:depth-transfer-20261020", "01629168", () => {
    // (x²-4)/(x-2) = x+2 for x≠2; evaluate just either side of 2.
    const f = (x) => (x * x - 4) / (x - 2);
    return q((f(2 - 1e-7) + f(2 + 1e-7)) / 2);
  }, { rel: 1e-6 }],

  // ---- Classical mechanics ------------------------------------------------------------------
  ["PB1.1:distance", "3b533651", () => g(9.81).mul(q(1, "s").pow(2)).mul(0.5)],
  ["PB1.1:warmup-net-force", "1fd9ad45", () => q(6, "N").div(q(3, "kg"))],
  ["PB1.1:warmup-velocity", "2ea0615b", () => g(3).mul(q(4, "s"))],
  ["PB1.1:warmup-displacement", "27710ce1", () => g(10).mul(q(2, "s").pow(2)).mul(0.5)],
  ["PB1.1:transfer-stopping", "ff9455ac", () => q(10, "m/s").pow(2).div(g(2).mul(2))], // v² = 2 |a| d
  ["PB1.1:transfer-terminal", "b780948d", () => q(2, "kg").mul(g(10)).div(q(5, "kg/s"))], // mg = b v
  ["PB1.1:transfer-height", "fa84cd42", () => q(1 / (1 + 1) ** 2)], // g ∝ 1/r², r = 2R
  ["PB1.2:warmup-work", "9aad6c26", () => q(10, "N").mul(q(2, "m")).mul(Math.cos((60 * PI) / 180))],
  ["PB1.2:warmup-kinetic", "01315a3f", () => q(2, "kg").mul(q(3, "m/s").pow(2)).mul(0.5)],
  ["PB1.2:warmup-impulse", "975116e3", () => q(6, "N").mul(q(0.5, "s"))],
  ["PB1.2:transfer-inelastic", "9e79db50", () => {
    const m = q(1, "kg"), v0 = q(4, "m/s");
    const before = m.mul(v0.pow(2)).mul(0.5);
    const vf = m.mul(v0).div(m.mul(2)); // momentum conserved
    const after = m.mul(2).mul(vf.pow(2)).mul(0.5);
    return before.sub(after);
  }],
  ["PB1.2:transfer-spring", "58d1bb9e", () => q(100, "N/m").mul(q(0.2, "m").pow(2)).mul(0.5)],
  ["PB1.2:transfer-friction", "a81c61f2", () => q(0.2).mul(q(2, "kg")).mul(g(10)).mul(q(3, "m")).neg()], // W = -μ m g d
  ["PB1.3:warmup-rolling", "d6737707", () => q(4, "rad/s").mul(q(0.5, "m"))],
  ["PB1.3:warmup-torque", "dc9373c7", () => q(2, "kg m m").mul(q(3, "rad/s²"))],
  ["PB1.3:warmup-rotation-energy", "752c796d", () => q(0.5, "kg m m").mul(q(2, "rad/s").pow(2)).mul(0.5)],
  ["PB1.3:transfer-cylinder", "37ae9fc0", () => g(10).mul(q(0.3, "m")).mul(2).div(1 + 0.5).sqrt()], // v² = 2gh/(1+k)
  ["PB1.3:transfer-hoop", "15eeab56", () => g(10).mul(q(1, "m")).mul(2).div(1 + 1).sqrt()],
  ["PB1.3:transfer-top-speed", "fc5ef64b", () => q(3, "m/s").mul(2)], // v_top = v_cm + ωR = 2 v_cm
  ["PB1.3:depth-transfer-20261020", "769af5bf", () => g(10).mul(q(1.4, "m")).mul(2).div(1 + 2 / 5)],
  ["PB1.4:period", "b95e942c", () => q(1, "m").div(g(9.81)).sqrt().mul(2 * PI), { rel: 5e-4 }], // stored to 4 s.f.
  ["PB1.4:core", "71fb75c4", () => q(4 * PI * PI).mul(q(1, "m")).div(q(20 / 10, "s").pow(2)), { rel: 1e-5 }], // stored to 5 s.f.
  ["PB1.4:warmup-period", "37565142", () => q(1, "m").div(g(PI * PI)).sqrt().mul(2 * PI)],
  ["PB1.4:warmup-frequency", "a2e1b74c", () => q(1).div(q(0.5, "s"))],
  ["PB1.4:transfer-infer-gravity", "7b979c78", () => q(4 * PI * PI).mul(q(1, "m")).div(q(PI, "s").pow(2))],
  ["PB1.4:warmup-length-ratio", "5ff44192", () => q(Math.sqrt(4))],
  ["PB1.4:transfer-amplitude", "4dcbb10c", () => q(0.4 ** 2 / 16)],
  ["PB1.4:transfer-planet", "90af08cb", () => q(1 / Math.sqrt(4))],

  // ---- Fluids and thermal physics -----------------------------------------------------------
  ["PB2.1:depth-transfer", "83d57ce8", () => q(1000, "kg/m³").mul(g(9.8)).mul(q(3, "m"))],
  ["PB2.1:absolute-transfer", "88c5b44b", () => q(101300, "Pa").add(q(29400, "Pa"))],
  ["PB2.1:buoyancy-transfer", "9562efa4", () => q(1000, "kg/m³").mul(q(0.003, "m³")).mul(g(9.8))],
  ["PB2.1:continuity-transfer", "8dfc963b", () => q(6, "cm").mul(q(1, "cm")).mul(q(2, "m/s")).div(q(3, "cm").mul(q(1, "cm")))],
  ["PB2.1:bernoulli-transfer", "1dbadaf2", () => q(1000, "kg/m³").mul(q(2, "m/s").pow(2).sub(q(4, "m/s").pow(2))).mul(0.5)],
  ["PB2.2:isochoric-transfer", "a55f6dd7", () => q(1.5).mul(q(8.314, "J/K")).mul(q(20, "K"))], // Q = (3/2) n R ΔT, n = 1 mol
  ["PB2.2:isobaric-work", "64368bd5", () => q(8.314, "J/K").mul(q(20, "K"))],
  ["PB2.2:isobaric-heat", "8d2b1152", () => q(2.5).mul(q(8.314, "J/K")).mul(q(20, "K"))],
  ["PB2.2:first-law-transfer", "d03ee2ea", () => q(500, "J").sub(q(180, "J"))],
  ["PB2.2:cycle-transfer", "942dc0b4", () => q(80, "J")], // ΔU = 0 over a cycle, so W = Q_net
  ["PB2.2:entropy-transfer", "513fd0dd", () => q(600, "J").div(q(300, "K"))],

  // ---- Optics, electromagnetism, fields -----------------------------------------------------
  ["PB3.2:depth-transfer-20261020", "d71b64a9", () => q(1 / (1 / 10 + 1 / -5), "cm")], // 1/v = 1/f + 1/u
  ["PB4.1:depth-transfer-20261020", "fe23178f", () => {
    // +q at x=-3 pushes the origin toward +x; -q at x=+3 pulls the origin toward +x.
    const kq = q(9, "N m m").div(q(1, "C")), r = q(3, "m");
    const each = kq.div(r.pow(2));
    return each.add(each); // (N·m²/C) / m² = N/C
  }],
  ["PB4.3:depth-transfer-20261020", "7c2c106b", () => {
    // |emf| = A dB/dt = 0.020 * 3 V; an inward field growing induces an outward field (Lenz),
    // i.e. counterclockwise seen from the outward-normal side, which is the positive direction.
    const emfVolts = 0.02 * 3;
    return q(emfVolts / 2, "A");
  }],
  ["PH16.1:review-core-transfer", "4b3e413a", () => q(2).div(q(1, "s s")).mul(q(0.1, "m")).mul(2)], // tidal: 2 GM/r³ Δr
  ["PH18.1:review-core-transfer", "0b8a01ab", () => {
    // chi² = rᵀ C⁻¹ r with r = (1,1), C = [[1,.5],[.5,1]]; 2x2 inverse by hand.
    const a = 1, b = 0.5, det = a * a - b * b;
    const inv = [[a / det, -b / det], [-b / det, a / det]];
    const r = [1, 1];
    let chi = 0;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) chi += r[i] * inv[i][j] * r[j];
    return q(chi);
  }],
];
