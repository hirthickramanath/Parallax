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

  // ---- Physics batch (units declared where the stored unit is a placeholder) ------------------
  // Each answer is derived from the givens in the prompt, never read from the stored value.
  ["PB1.2:q4", "63156e76", () => q(2, "kg").mul(q(3, "m/s")), { unit: "kg m/s" }],
  ["PB1.2:q5", "63dbf302", () => q(5, "N").mul(q(2, "m")), { unit: "J" }],
  ["PB1.2:q6", "6a5182fb", () => q(2, "kg").mul(q(3, "m/s")).div(q(3, "kg")), { unit: "m/s" }], // p conserved, m = 3 kg after sticking
  ["PB1.3:q4", "77ede05c", () => q(0.5).mul(q(2, "kg")).mul(q(1, "m").pow(2)), { unit: "kg m²" }], // I = MR²/2
  ["PB1.3:q5", "06a2d4dd", () => q(4, "rad/s").mul(q(0.5, "m")), { unit: "m/s" }], // v = ωR
  ["PB2.1:n1", "a5e60a70", () => q(1000, "kg/m³").mul(q(10, "m/s²")).mul(q(1, "m")), { unit: "Pa" }],
  ["PB2.1:warmup", "95d30508", () => q(1000, "kg/m³").mul(g(9.8)).mul(q(0.5, "m")), { unit: "Pa" }],
  ["PB2.1:floating-transfer", "0e55a54e", () => q(600 / 1000)], // submerged fraction = rho_block / rho_fluid
  ["PB2.2:n1", "452c512d", () => q(1 - 300 / 600)], // Carnot: 1 - Tc/Th
  ["PB2.2:warmup", "e53a2eee", () => q(150, "J").sub(q(40, "J")), { unit: "J" }], // ΔU = Q - W
  ["PB2.3:n1", "4c55c626", () => q(Math.sqrt(400 / 100))], // v_rms ∝ √T
  ["PB2.3:warmup", "13b16aa7", () => q(Math.sqrt(675 / 300))],
  ["PB2.3:transfer-model-check", "92e4e8da", () => q(3e25).div(q(1, "m").pow(3)).mul(q(1.38e-23, "J/K")).mul(q(300, "K")), { unit: "Pa" }], // P = n k T
  ["PB2.3:foundation_next-transfer-1", "df454d84", () => q(Math.sqrt((3 * 1 * 2) / 3))], // v_rms = √(3kT/m)
  ["PB2.3:foundation_next-transfer-2", "e8587999", () => q(Math.sqrt(4))],
  ["PB3.1:n1", "59f3e02b", () => q(340, "m/s").div(q(170, "Hz")), { unit: "m" }],
  ["PB3.1:warmup", "8554f51f", () => q(330, "m/s").div(q(110, "Hz")), { unit: "m" }],
  ["PB3.1:transfer-model-check", "7a63108b", () => q(120, "m/s").div(q(2 * 1.2, "m")), { unit: "Hz" }], // fixed-fixed string: f1 = v/2L
  ["PB3.1:foundation_next-transfer-1", "37d7e27a", () => q(5 * 2)], // v = f λ
  ["PB3.1:foundation_next-transfer-2", "971150c6", () => q((2 * PI) / PI)], // λ = 2π/k
  ["PB3.2:n1", "051bf7f1", () => q(1 / (1 / 10 - 1 / 20), "cm"), { unit: "cm" }], // 1/v = 1/f - 1/u
  ["PB3.2:warmup", "73cfcf2b", () => q(1 / (1 / 15 - 1 / 30), "cm"), { unit: "cm" }],
  ["PB3.2:transfer-model-check", "e336cbdf", () => q(1 / (1 / 10 - 1 / 5), "cm"), { unit: "cm" }], // object inside f: virtual image
  ["PB3.2:foundation_next-transfer-1", "e78cde67", () => q(1 / (1 / 2 - 1 / 6))],
  ["PB3.2:foundation_next-transfer-2", "8a7f535d", () => q(-(1 / (1 / 2 - 1 / 6)) / 6)], // m = -v/u
  ["PB3.3:n1", "396f654b", () => q(500e-9, "m").mul(q(2, "m")).div(q(0.5e-3, "m")), { unit: "mm" }], // Δy = λL/d
  ["PB3.3:warmup", "fc2d5ec6", () => q(600e-9, "m").mul(q(1.5, "m")).div(q(0.3e-3, "m")), { unit: "mm" }],
  ["PB3.3:transfer-model-check", "243d0971", () => q(500, "nm").mul(0.5), { unit: "nm" }], // first destructive: λ/2
  ["PB3.3:foundation_next-transfer-1", "8cdeb5f4", () => q((1 + 1) ** 2)], // amplitudes add: (√1 + √1)²
  ["PB3.3:foundation_next-transfer-2", "8da785be", () => q(2 * PI * 0.5)], // Δφ = 2π Δ/λ
  ["PB4.1:n1", "a806b6f9", () => q(20, "V").div(q(0.01, "m")), { unit: "V/m" }],
  ["PB4.1:warmup", "71d7baee", () => q(30, "V").div(q(0.02, "m")), { unit: "V/m" }],
  ["PB4.1:transfer-model-check", "e17c6b84", () => q(1.602176634e-19, "C").mul(q(12, "V")), { unit: "eV" }], // ΔKE = e ΔV
  ["PB4.1:foundation_next-transfer-1", "099da169", () => q(1 / 2 ** 2)], // E = kq/r²
  ["PB4.1:foundation_next-transfer-2", "25e6c7a5", () => q(1 / 2)], // V = kq/r
  ["PB4.2:q4", "bb99895c", () => q(6, "V").div(q(300, "ohm")), { unit: "A" }],
  ["PB4.2:q5", "22a9e2c4", () => q(1 / (1 / 100 + 1 / 100), "ohm"), { unit: "ohm" }],
  ["PB4.2:q6", "9023a9b5", () => q(1 / 2)], // P = V²/R
  ["PB4.2:depth-transfer-1", "86b9b0e2", () => q(12, "V").div(q(400, "ohm")), { unit: "A" }],
  ["PB4.2:depth-transfer-2", "c0a310f6", () => q(1 / (1 / 200 + 1 / 300), "ohm"), { unit: "ohm" }],
  ["PB4.2:depth-transfer-3", "0c6b3d9b", () => q(9, "V").div(q(1 + 8, "ohm")), { unit: "A" }],
  ["PB4.2:depth-transfer-4", "8c087583", () => q(1 / (1 / 1000 + 1 / 1000), "ohm"), { unit: "ohm" }],
  ["PB4.3:n1", "e399b64d", () => q(2, "H").div(q(4, "ohm")), { unit: "s" }], // τ = L/R
  ["PB4.3:warmup", "56f85ba2", () => q(3, "H").div(q(6, "ohm")), { unit: "s" }],
  ["PB4.3:transfer-model-check", "33689ae4", () => q(5 * 0.08 / 0.02, "V"), { unit: "V" }], // |emf| = N ΔΦ/Δt
  ["PB4.3:foundation_next-transfer-1", "b8926146", () => q((1 * 2) / 4)], // B = (μ0/2π) I / r
  ["PB4.3:foundation_next-transfer-2", "5ba6eb8e", () => q(-3)], // emf = -dΦ/dt
  ["PB4.4:n1", "78a6fc18", () => q(10, "V").pow(2).div(q(5, "ohm")), { unit: "W" }],
  ["PB4.4:warmup", "bff6058f", () => q(12, "V").pow(2).div(q(6, "ohm")), { unit: "W" }],
  ["PB4.4:transfer-model-check", "14d9c9ff", () => q(1 / Math.sqrt(0.1 * 0.001), "rad/s"), { unit: "rad/s" }], // ω0 = 1/√(LC)
  ["PB4.4:foundation_next-transfer-1", "7dad2ae7", () => q(10 / Math.SQRT2)],
  ["PB4.4:foundation_next-transfer-2", "512db658", () => q(6 ** 2 / 3)],
  ["PB5.1:n1", "67e1de02", () => q(5 - 2, "V"), { unit: "V" }], // eV_s = hf - φ
  ["PB5.1:warmup", "cc6024b3", () => q(6.5 - 2.5, "V"), { unit: "V" }],
  ["PB5.1:transfer-model-check", "ccd94013", () => q(13.6 * (1 - 1 / 4), "eV"), { unit: "eV" }],
  ["PB5.1:foundation_next-transfer-1", "9c6ad003", () => q(5 - 2)],
  ["PB5.1:foundation_next-transfer-2", "a2e207ce", () => q(3)],
  ["PB5.2:n1", "db33f651", () => q(100 * 0.5 ** 2)],
  ["PB5.2:warmup", "f0c608af", () => q(100 * 0.5 ** 3)],
  ["PB5.2:transfer-model-check", "6db5d8fd", () => q(100 * 0.2 + 5)],
  ["PB5.2:foundation_next-transfer-1", "319559b1", () => q(0.5 ** (6 / 2))],
  ["PB5.2:foundation_next-transfer-2", "5cdc1808", () => q(1 / 0.5)],
  ["PB5.3:n1", "75774d15", () => q(1 / 2)], // ρ = 1/σ
  ["PB5.3:warmup", "a44264ad", () => q(1e21).div(q(1, "m").pow(3)).mul(q(1.6e-19, "C")).mul(q(0.1, "m²/V s")), { unit: "S/m" }],
  ["PB5.3:transfer-model-check", "517863e0", () => q(2 * 0.5)], // σ = n e μ
  ["PB5.3:foundation_next-transfer-1", "38731752", () => q(Math.exp(Math.log(3)) - 1)], // I/Is = exp(V/VT) - 1
  ["PB5.3:foundation_next-transfer-2", "c23f28ab", () => q(Math.exp(0) - 1)],

  // ---- Mathematics basics batch ----------------------------------------------------------------
  ["MB1.1:n1", "9ea07914", () => q((8 - 2) / -3)], // 2 - 3x > 8  =>  x < -2
  ["MB1.1:warmup", "33c9aa61", () => q((11 - 5) / -2)], // 5 - 2x > 11  =>  x < -3
  ["MB1.1:transfer-model-check", "d3a1f7be", () => {
    // sqrt(x+6) = x needs x >= 0; squaring gives x² - x - 6 = 0, roots 3 and -2. Only 3 survives.
    const roots = [(1 + Math.sqrt(1 + 24)) / 2, (1 - Math.sqrt(1 + 24)) / 2];
    return q(roots.filter((x) => x >= 0 && Math.abs(Math.sqrt(x + 6) - x) < 1e-12).length);
  }],
  ["MB1.1:foundation_next-transfer-1", "9a2be201", () => q((5 + Math.sqrt(25 - 24)) / 2)],
  ["MB1.1:foundation_next-transfer-2", "ab7f9c8b", () => q((2 + 3) / 2)], // x²-5x+6 < 0 on (2,3)
  ["MB1.2:n1", "8382a649", () => q(3 * 3 + 4 * 4)],
  ["MB1.2:warmup", "38b709aa", () => q(5 * 5 + 12 * 12)],
  ["MB1.2:transfer-model-check", "0ad403d9", () => q(Math.log2(32))],
  ["MB1.2:foundation_next-transfer-1", "e4ba333a", () => q(Math.exp(2))],
  ["MB1.2:foundation_next-transfer-2", "99443a18", () => q(Math.hypot(3, 4))],
  ["MB1.3:n1", "16311d40", () => q(2 + 4 + 6 + 8 + 10)],
  ["MB1.3:warmup", "74285686", () => q(3 * (2 ** 4 - 1))], // geometric, ratio 2
  ["MB1.3:transfer-model-check", "39357c6a", () => q(3 / (1 - 0.5))],
  ["MB1.3:foundation_next-transfer-1", "ce51c7e7", () => q(1 / (1 - 0.5))],
  ["MB1.3:foundation_next-transfer-2", "de48695e", () => q((5 * 4) / 2)], // C(5,2)
  ["MB1.4:n1", "1b85a333", () => q((20 * 21) / 2)],
  ["MB1.4:warmup", "ff3a006b", () => q((30 * 31) / 2)],
  ["MB1.4:transfer-model-check", "a380c663", () => q(2 + 9 * 3)],
  ["MB1.4:foundation_next-transfer-1", "e65b9673", () => q((20 * 21) / 2)],
  ["MB1.4:foundation_next-transfer-2", "39ecab62", () => q((10 * 11) / 2 - (9 * 10) / 2)],
  ["MB2.1:n1", "b9cf7b85", () => q(PI, "radians"), { unit: "degrees" }],
  ["MB2.1:warmup", "d0b52b1c", () => q(1.5 * PI, "radians"), { unit: "degrees" }],
  ["MB2.1:transfer-model-check", "ef48d165", () => q([PI / 6, PI - PI / 6].length)],
  ["MB2.1:foundation_next-transfer-1", "8b29fd91", () => q([PI / 6, PI - PI / 6].length)],
  ["MB2.1:foundation_next-transfer-2", "9081b2d4", () => q(Math.sin(PI / 3) ** 2 + Math.cos(PI / 3) ** 2)],
  ["MB2.2:n1", "054d4858", () => q(Math.sqrt(5 * 5 - 3 * 3))],
  ["MB2.2:warmup", "f0f54e15", () => q(Math.sqrt(13 * 13 - 12 * 12))],
  ["MB2.2:ellipse-minor", "b62bc000", () => q(Math.sqrt(5 * 5 - 3 * 3))],
  ["MB2.2:ellipse-eccentricity", "00423d07", () => q(3 / 5)],
  ["MB2.2:hyperbola-transfer", "0585bbf3", () => q(Math.sqrt(3 * 3 + 4 * 4))],
  ["MB2.3:n1", "4bd48c77", () => q(Math.abs(7 - 2))],
  ["MB2.3:warmup", "4c8ae74b", () => q(Math.abs(1 - -2))],
  ["MB2.3:normal-length", "4b068b37", () => q(Math.hypot(2, -1, 2))],
  ["MB2.3:signed-distance", "390f3929", () => q((2 * 3 - 0 + 2 * 3 - 6) / Math.hypot(2, -1, 2))],
  ["MB2.3:normal-rescale", "33f75435", () => q(Math.abs(4 * 3 - 0 + 4 * 3 - 12) / Math.hypot(4, -2, 4))],
  ["MB2.3:projection-x", "d7cdc94c", () => {
    const n = [1, 2, 2], P = [3, 3, 3];
    const excess = n[0] * P[0] + n[1] * P[1] + n[2] * P[2] - 3;
    return q(P[0] - (excess / (n[0] ** 2 + n[1] ** 2 + n[2] ** 2)) * n[0]);
  }],
  ["MB2.3:line-plane", "18e4a25a", () => q((1 - -2) / 1)], // z = 1 - t = -2
  ["MB2.3:skew-distance", "db043d41", () => {
    // distance = |(p2 - p1) · (d1 × d2)| / |d1 × d2|
    const p1 = [0, 0, 0], d1 = [1, 0, 0], p2 = [0, 0, 2], d2 = [0, 1, 0];
    const cross = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]];
    const dot = cross.reduce((sum, c, i) => sum + c * (p2[i] - p1[i]), 0);
    return q(Math.abs(dot) / Math.hypot(...cross));
  }],
  ["MB3.1:q4", "9e99d6b9", () => q(1 + 1)], // (x²-1)/(x-1) = x+1
  ["MB3.1:q5", "642011d1", () => q(0.06 / 3)], // |3x - 3a| < ε  =>  δ = ε/3
  ["MB3.1:depth-transfer-1", "f8c5c623", () => q(0.1 / 5)],
  ["MB3.1:depth-transfer-2", "b5d432c5", () => q(Math.min(1, 0.03 / 3))],
  ["MB3.1:depth-transfer-3", "7f2f264f", () => q(2 + 2)],
  ["MB3.1:depth-transfer-4", "50d9fa79", () => q(2 + 2)],
  ["MB3.2:value", "dc1eee02", () => q(2 * 3)],
  ["MB3.2:depth-transfer-1", "e3b8595a", () => q(3 * 2 ** 2)],
  ["MB3.2:depth-transfer-2", "643575c4", () => q((2.1 ** 3 - 2 ** 3) / 0.1)],
  ["MB3.2:depth-transfer-3", "f9fbefce", () => q(2 * (3 * 1 + 1) * 3)], // chain rule
  ["MB3.2:depth-transfer-4", "fc63f196", () => q(-1 / 2 ** 2)],
  ["MB3.3:q4", "2a980937", () => q(1 / 3)],
  ["MB3.3:q5", "5429e10a", () => q(3 ** 2 - 1 ** 2)],
  ["MB3.3:depth-transfer-1", "ae145a38", () => q(2 ** 3)],
  ["MB3.3:depth-transfer-2", "8c35c105", () => q(Math.sqrt(3) * (3 / 3 - 1))], // [x³/3 - x] at √3, using (√3)² = 3
  ["MB3.3:depth-transfer-3", "3ca6fc8a", () => {
    // |x²-1| integrated numerically (midpoint) on [0,√3]; the sign change is at x = 1.
    const b = Math.sqrt(3), n = 400000;
    let sum = 0;
    for (let i = 0; i < n; i++) { const x = ((i + 0.5) * b) / n; sum += Math.abs(x * x - 1) * (b / n); }
    return q(sum);
  }, { rel: 1e-7 }],
  ["MB3.3:depth-transfer-4", "9e26f22a", () => {
    // ∫ x e^x dx on [0,1] by Simpson's rule with 2000 intervals.
    const f = (x) => x * Math.exp(x), n = 2000, h = 1 / n;
    let sum = f(0) + f(1);
    for (let i = 1; i < n; i++) sum += f(i * h) * (i % 2 ? 4 : 2);
    return q((sum * h) / 3);
  }, { rel: 1e-9 }],
  ["MB3.4:q4", "87294ac5", () => q(Math.max(...[-1, 0, 2].map((x) => x * x)))],
  ["MB3.4:q5", "6e57512a", () => q(4 * PI, "").mul(q(1, "m").pow(2)).mul(q(0.5, "m/s")), { unit: "m³/s" }],
  ["MB3.4:q6", "aea8c89d", () => {
    // f' = 3x² - 3 = 0 at x = 1; compare f there with the end points of [0,2].
    const f = (x) => x ** 3 - 3 * x;
    return q([0, 2, Math.sqrt(3 / 3)].reduce((best, x) => (f(x) < f(best) ? x : best)));
  }],
  ["MB3.4:depth-transfer-1", "ebc4c428", () => q([0, 3, 2].reduce((best, x) => ((x - 2) ** 2 < (best - 2) ** 2 ? x : best)))],
  ["MB3.4:depth-transfer-2", "de6e0ac7", () => q(Math.max(...[0, 3].map((x) => (x - 2) ** 2 + 1)))],
  ["MB3.4:depth-transfer-3", "4306dca8", () => q(3 * 2 ** 2 / 2, "kg").div(q(3 * 2, "kg")).mul(q(1, "m")), { unit: "m" }], // x_cm = ∫λx dx / ∫λ dx
  ["MB3.4:depth-transfer-4", "ba345dc8", () => q(4 * PI).mul(q(2, "m").pow(2)).mul(q(0.25, "m/s")), { unit: "m³/s" }],
  ["MB3.5:q4", "23a94794", () => q(2 * 3)],
  ["MB3.5:q5", "64adedad", () => q(6 / 2)],
  ["MB3.5:depth-transfer-1", "ab145e38", () => q(-2 * 3)],
  ["MB3.5:depth-transfer-2", "3de22583", () => q(3 * Math.exp(-2 * Math.log(2)))],
  ["MB3.5:depth-transfer-3", "14920798", () => q(12 / 3)],
  ["MB3.5:depth-transfer-4", "a42bd82f", () => q(3 + 0.25 * (-2 * 3))],
  ["MB4.1:n1", "f76ed036", () => q(2 * 3 - 1 * 1)],
  ["MB4.1:warmup", "b5b3a761", () => q(3 * 4 - 2 * 1)],
  ["MB4.1:transfer-model-check", "31818e07", () => q(1 / 2)],
  ["MB4.1:foundation_next-transfer-1", "9cac0520", () => q(2 * 4 - 1 * 3)],
  ["MB4.1:foundation_next-transfer-2", "d617ed46", () => q(Math.cos(0.7) ** 2 + Math.sin(0.7) ** 2)], // any angle
  ["MB4.2:n1", "99020d0d", () => q(1 * 4 + 2 * 0 + 3 * -1)],
  ["MB4.2:warmup", "8c597f36", () => q(2 * 1 + -1 * 4 + 3 * 0)],
  ["MB4.2:transfer-model-check", "1f849d65", () => q(1 * 3 - 0 * 0)],
  ["MB4.2:foundation_next-transfer-1", "a93c5149", () => q(1 * 2 + 2 * 0 + 3 * -1)],
  ["MB4.2:foundation_next-transfer-2", "dc825f55", () => q(2 * 3 * Math.sin(PI / 2))],
  ["MB4.3:n1", "100cbdeb", () => q(3 / 6)],
  ["MB4.3:warmup", "8396f521", () => q(0.12 / 0.3)],
  ["MB4.3:transfer-model-check", "a84f875b", () => q((0.9 * 0.01) / (0.9 * 0.01 + 0.05 * 0.99))],
  ["MB4.3:foundation_next-transfer-1", "889af476", () => q((1 * 0.01) / (0.01 + 0.01 * 0.99))],
  ["MB4.3:foundation_next-transfer-2", "3622f235", () => q(0.12 / 0.3)],
  ["MB4.4:n1", "6e8b196b", () => q(20 * 0.25)],
  ["MB4.4:warmup", "55a68f2c", () => q(12 * 0.25)],
  ["MB4.4:transfer-model-check", "551e21d6", () => q(4 * 12 * 0.25 * 0.75)],
  ["MB4.4:foundation_next-transfer-1", "cd2d1600", () => q(0.25 * 0.75)],
  ["MB4.4:foundation_next-transfer-2", "716ffb51", () => q(4 * 0.25 * 0.75)],

  // ---- Chemistry basics batch ------------------------------------------------------------------
  ["CB1.1:q4", "b1628bac", () => q(8 + 2)], // O²⁻ gains two electrons
  ["CB1.1:q5", "c0d65f58", () => q(2 * 3 ** 2)], // 2n²
  ["CB1.1:depth-transfer-1", "a0072263", () => q(13 - 3)],
  ["CB1.1:depth-transfer-2", "5b61acdf", () => q((2 * 1 + 1))], // orbitals in subshell l: 2l + 1
  ["CB1.1:depth-transfer-3", "cc2e1a62", () => q(2 * (2 * 2 + 1))],
  ["CB1.1:depth-transfer-4", "3bf176e3", () => q(13.6 / 2 ** 2, "eV"), { unit: "eV" }],
  ["CB1.2:q4", "2a414ebd", () => q(5 + 4 * 1 - 1)],
  ["CB1.2:q5", "84b67717", () => q(6 - (4 + 2))], // valence - (nonbonding + bonds): 6 - (4 + 2)
  ["CB1.2:depth-transfer-1", "65e02bef", () => q(4 + 2 * 6)],
  ["CB1.2:depth-transfer-2", "ca31b670", () => q(5 - (0 + 4))],
  ["CB1.2:depth-transfer-3", "6a2ce38a", () => q(2)], // two double bonds, no lone pairs on C
  ["CB1.2:depth-transfer-4", "15910e01", () => q(Math.acos(-1 / 3), "radians"), { unit: "degrees", rel: 1e-4 }],
  ["CB1.3:n1", "ee91c3c8", () => q((4 / (1 + 4)) * 10, "mol"), { unit: "mol" }], // B = K/(1+K) · total
  ["CB1.3:warmup", "4f36667f", () => q((9 / (1 + 9)) * 20, "mol"), { unit: "mol" }],
  ["CB1.3:transfer-model-check", "a73dd3b9", () => q(8.314, "J/K").div(q(1, "mol")).mul(q(300, "K")).mul(-2), { unit: "J/mol" }], // ΔG° = -RT ln K
  ["CB1.3:chemistry-transfer-1", "4d51f392", () => q((3 / (1 + 3)) * 8)],
  ["CB1.3:chemistry-transfer-2", "ee1fd658", () => q(-1 * Math.log(4))],
  ["CB1.4:n1", "02ec2483", () => q(0.693).div(q(0.2).div(q(1, "s"))), { unit: "s" }],
  ["CB1.4:warmup", "a00b985e", () => q(0.693).div(q(0.1).div(q(1, "s"))), { unit: "s" }],
  ["CB1.4:transfer-model-check", "ff121ae8", () => q(0.5 ** 2)],
  ["CB1.4:chemistry-transfer-1", "46e1941c", () => q(Math.exp(Math.log(2)))], // rate ∝ exp(-Ea/RT)
  ["CB1.4:chemistry-transfer-2", "e70d7dfb", () => q(-(-10) / (2 * 1))], // E = -ΔrG / (nF)
  ["CB1.5:n1", "15ac9598", () => q((2 * 6 + 2 - 6) / 2)],
  ["CB1.5:warmup", "059b6c98", () => q((2 * 5 + 2 - 10) / 2)],
  ["CB1.5:transfer-model-check", "5d6c5081", () => q((2 * 4 + 2 - (7 + 1)) / 2)], // Cl counts as H
  ["CB1.5:chemistry-transfer-1", "dc4d44be", () => q(1 / Math.sqrt(4))], // ν ∝ √(k/μ)
  ["CB1.5:chemistry-transfer-2", "884a8972", () => q(Math.sqrt(9))],

  // ---- Astrophysics batch 2 -----------------------------------------------------------------------
  ["AS1.1:q4", "fc84bb24", () => q((6 / 24) * 360, "degrees"), { unit: "degrees" }], // 24 h = 360°
  ["AS1.1:q5", "2c6888a8", () => q(90 - Math.abs(30 - 20), "degrees"), { unit: "degrees" }],
  ["AS1.1:astro-transfer-1", "7d36bbc3", () => q(90 - Math.abs(30 - -20), "degrees"), { unit: "degrees" }],
  ["AS1.1:astro-transfer-2", "0c8f6297", () => q((10 - 7) * 15, "degrees"), { unit: "degrees" }], // 15° per hour
  ["AS1.2:q4", "48e2de60", () => q(12, "hours"), { unit: "hours" }],
  ["AS1.2:q5", "57ef313b", () => q(1 / 2 ** 2)], // flux ∝ 1/d²
  ["AS1.2:astro-transfer-1", "f5a88b8f", () => q(90 - (40 - 23.44), "degrees"), { unit: "degrees" }],
  ["AS1.2:astro-transfer-2", "16d14c0e", () => q(90 - 30, "degrees"), { unit: "degrees" }],
  ["AS1.3:speed", "de48338a", () => q(Math.sqrt(1 / 1))],
  ["AS1.3:warmup", "ae5754a1", () => q(Math.sqrt((2 * 1) / 1)), { rel: 1e-8 }], // stored to 8 decimal places
  ["AS1.3:astro-transfer-1", "f17b34d9", () => q((2 + 6) / 2, "AU"), { unit: "AU" }],
  ["AS1.3:astro-transfer-2", "240b321a", () => q((6 - 2) / (6 + 2))],
  ["AS1.4:n1", "5085bc7e", () => q(1, "AU").mul(Math.cbrt(3e-6 / 3)), { unit: "AU" }], // r ≈ a (μ/3)^(1/3)
  ["AS1.4:warmup", "67e82306", () => q(1, "AU").mul(Math.cbrt(24e-6 / 3)), { unit: "AU" }],
  ["AS1.4:transfer-model-check", "922b2d88", () => q(Math.sqrt(1 - 0.5 ** 2))], // equilateral triangle of side 1
  ["AS1.4:astro-transfer-1", "964db140", () => q(3 * Math.cbrt(0.003 / 3))],
  ["AS1.4:astro-transfer-2", "51079ce2", () => q(Math.cbrt(8))],
  ["AS1.5:n1", "2b2f66a6", () => q(1 / 2 ** 3)],
  ["AS1.5:warmup", "4771c006", () => q(1 / 3 ** 3)],
  ["AS1.5:transfer-model-check", "fd7bedba", () => q(2, "").mul(q(1e14, "m³/s²")).mul(q(10, "m")).div(q(1e6, "m").pow(3)), { unit: "m/s²" }],
  ["AS1.5:astro-transfer-1", "0be8efb0", () => q(1 / 2 ** 3)],
  ["AS1.5:astro-transfer-2", "5ecc5d3e", () => q((2 * 1 * 1 * 0.2) / 4 ** 3)],
  ["AS2.1:numeric", "15d8a967", () => q(5 + 5 * Math.log10(100 / 10))],
  ["AS2.1:warmup", "29e48bcb", () => q(1 / 2 ** 2)],
  ["AS2.1:astro-transfer-1", "31b4e2d7", () => q(1 / 3 ** 2)],
  ["AS2.1:astro-transfer-2", "da577972", () => q(10 * 10 ** (5 / 5), "pc"), { unit: "pc" }], // m - M = 5 log10(d/10 pc)
  ["AS2.1:worked-inference-transfer", "0679ba5f", () => q(0.5 * 3 ** 2)], // L ∝ F d²
  ["AS2.2:numeric", "c857a961", () => q(2 ** 4)],
  ["AS2.2:warmup", "b8efba5a", () => q(2.9e-3, "m K").div(q(5800, "K")), { unit: "nm" }],
  ["AS2.2:astro-transfer-1", "97314c28", () => q(2898, "micrometres").mul(q(1, "K")).div(q(5796, "K")), { unit: "micrometres" }],
  ["AS2.2:astro-transfer-2", "5f56afd9", () => q(2 ** 4)],
  ["AS2.3:numeric", "9890e655", () => q(10 * Math.exp(-Math.log(2)) + 2 * (1 - Math.exp(-Math.log(2))))],
  ["AS2.3:warmup", "b0f6caef", () => q(10 * Math.exp(-Math.log(2)) + 20 * (1 - Math.exp(-Math.log(2))))],
  ["AS2.3:astro-transfer-1", "db7e01a2", () => q(Math.exp(-Math.log(4)))],
  ["AS2.3:astro-transfer-2", "ea716151", () => q(1 * Math.exp(-Math.log(2)) + 3 * (1 - Math.exp(-Math.log(2))))],
  ["AS2.4:numeric", "ebd1e5cd", () => q((600 - 500) / 500)],
  ["AS2.4:warmup", "7b640ea5", () => q(2)],
  ["AS2.4:astro-transfer-1", "1ae51abc", () => q(Math.sqrt((1 + 0.6) / (1 - 0.6)))],
  ["AS2.4:astro-transfer-2", "f60483a9", () => q((1.5 ** 2 - 1) / (1.5 ** 2 + 1))],
  ["AS2.5:numeric", "cb8937ac", () => q(Math.sqrt(100))],
  ["AS2.5:warmup", "a923fdbc", () => q(2 ** 2)],
  ["AS2.5:astro-transfer-1", "33eeeba7", () => q(1 / 4)], // θ ∝ λ/D
  ["AS2.5:astro-transfer-2", "58c2b57c", () => q(3 ** 2)],
  ["AS2.6:warmup", "a73b4f3b", () => q(500 / 0.1)], // R = λ/Δλ
  ["AS2.6:astro-transfer-1", "1055c6af", () => q(400 / Math.sqrt(400))],
  ["AS2.6:astro-transfer-2", "029e51a9", () => q(100 / Math.sqrt(100 + 300))],
  ["AS2.7:numeric", "16be0938", () => q(0.01 * 1000)],
  ["AS2.7:warmup", "4cb8dcc3", () => q(10 / (1 + 10))],
  ["AS2.7:astro-transfer-1", "eeeae02c", () => q(2 / 1e15 / 1e-15)],
  ["AS2.7:astro-transfer-2", "f9285e39", () => q(Math.hypot(3, 4))],
  ["AS3.1:numeric", "0cc020e3", () => q(-(-20) / 2)],
  ["AS3.1:warmup", "31e1f86d", () => q(-(-20) / 2 + -20)], // E = U + W
  ["AS3.1:astro-transfer-1", "7d6909cd", () => q((2 * PI) / 3)], // P_c = (2π/3) G ρ² R²
  ["AS3.1:astro-transfer-2", "cb5cdb8b", () => q(1 - 0.5 ** 2)], // P(r) = P_c (1 - r²/R²)
  ["AS3.2:numeric", "a881be51", () => q((6 * 4) / 2)],
  ["AS3.2:warmup", "2aa1f9e8", () => q((3 * 2 ** 4) / 3)], // P_rad = a T⁴/3
  ["AS3.2:astro-transfer-1", "3b6814d7", () => q(8 ** (5 / 3))],
  ["AS3.2:astro-transfer-2", "717d54a1", () => q(8 ** (4 / 3))],
  ["AS3.3:numeric", "792e84f0", () => q((4 * 4 * 2) / 2)], // identical particles: n² <σv> / 2
  ["AS3.3:warmup", "081909a6", () => q(2 ** 4)],
  ["AS3.3:astro-transfer-1", "8ef9f21e", () => q(1.1 ** 4)],
  ["AS3.3:astro-transfer-2", "872dc0bd", () => q(100 - 7)],
  ["AS3.4:numeric", "533370a7", () => q(1 / 4)],
  ["AS3.4:astro-transfer-1", "ab2177d1", () => q(1 / 3)],
  ["AS3.4:astro-transfer-2", "f5292bf4", () => q(2 ** 3)], // F ∝ T³ ∇T
  ["AS3.5:numeric", "17b4e1a0", () => q(0.5 - 0.4)],
  ["AS3.5:warmup", "6f0ceee2", () => q(2 * 3)],
  ["AS3.5:astro-transfer-1", "22878077", () => q(0.52 - 0.4)],
  ["AS3.5:astro-transfer-2", "7ed214b0", () => q(0.3 - 0.4)],
  ["AS3.6:numeric", "af406d05", () => q(1 / (2 - 1))], // P ∝ ρ^(1 + 1/n)
  ["AS3.6:warmup", "df3f0727", () => q(2 * 3 ** 2)],
  ["AS3.6:astro-transfer-1", "33c05907", () => q(Math.sin(PI / 2) / (PI / 2))],
  ["AS3.6:astro-transfer-2", "e42e7bd2", () => q(-(PI * Math.cos(PI) - Math.sin(PI)))], // -ξ²θ′ = -(ξ cos ξ - sin ξ)
  ["AS3.7:numeric", "46702996", () => q(2 ** 4)],
  ["AS3.7:warmup", "d0ed9ca2", () => q(2 ** 2)],
  ["AS3.7:astro-transfer-1", "9add1ecf", () => q(Math.pow(0.75 * (2 / 3 + 2 / 3), 0.25))], // T⁴ = (3/4) Teff⁴ (τ + 2/3)
  ["AS3.7:astro-transfer-2", "5505572a", () => q(0.75 * (0 + 2 / 3))],
  ["AS4.1:numeric", "ae4bf7ae", () => q(Math.sqrt(4))],
  ["AS4.1:warmup", "96b2a962", () => q(1 / Math.sqrt(4))], // M_J ∝ ρ^(-1/2) at fixed c_s
  ["AS4.1:astro-transfer-1", "c254ab45", () => q(4 ** 1.5)], // M_J ∝ T^(3/2) at fixed density
  ["AS4.1:astro-transfer-2", "90562b88", () => q(1 / Math.sqrt(9))],
  ["AS4.2:numeric", "691160c8", () => q(2 ** 2)],
  ["AS4.2:warmup", "9e92798f", () => q(2 / 2 ** 3)],
  ["AS4.2:astro-transfer-1", "7b02da03", () => q(2 ** 2 * 1.5 ** 4)],
  ["AS4.2:astro-transfer-2", "322953d5", () => q(2 / 2 ** 3)],
  ["AS4.3:numeric", "c233a169", () => q(8 * 3 * 2)],
  ["AS4.3:warmup", "ce61635d", () => q(10 / 2)],
  ["AS4.3:astro-transfer-1", "9608eb6e", () => q(Math.pow(1 / 16 ** 2, 0.25))], // L ∝ R² T⁴
  ["AS4.3:astro-transfer-2", "e12e167b", () => q(100 ** 2 * 0.5 ** 4)],
  ["AS4.4:numeric", "ca1b0085", () => q(1 / Math.sqrt(4))],
  ["AS4.4:astro-transfer-1", "e8d723df", () => q(2 ** 1.5)],
  ["AS4.4:astro-transfer-2", "9667b03f", () => q(1 / Math.sqrt(25))],
  ["AS4.5:numeric", "a11ba331", () => q(0.5 ** 3)],
  ["AS4.5:warmup", "fe78b3f2", () => q(80 * 0.5 ** 3)],
  ["AS4.5:astro-transfer-1", "1e2522ef", () => q(0.5 ** 3)],
  ["AS4.5:astro-transfer-2", "9aa30adf", () => q(Math.log(2), "").div(q(10, "days")), { unit: "1/days", rel: 1e-6 }],
  ["AS4.6:numeric", "8d97b93c", () => q(8 ** (-1 / 3))],
  ["AS4.6:warmup", "17d0d0ae", () => q(2 / (2 * 0.01))],
  ["AS4.6:astro-transfer-1", "fd952a1e", () => q(8 ** (-1 / 3))],
  ["AS4.6:astro-transfer-2", "b69919fb", () => q(1).div(q(0.02, "s")), { unit: "Hz" }],
  ["AS4.7:numeric", "1c2cfa88", () => q(1 / 0.5 ** 2)], // a ∝ 1/(M1 M2)² at fixed M and J
  ["AS4.7:warmup", "80c7d3ac", () => q((1 / 0.5 ** 2) ** 1.5)],
  ["AS4.7:astro-transfer-1", "8d79e2b2", () => q(1 / 2 ** 2)],
  ["AS4.7:astro-transfer-2", "1d4aded4", () => q(0.49 / (0.6 + Math.log(2)))],
  ["AS5.1:numeric", "e9499403", () => q((12 * 2) / (2 * 3))], // L = G M Mdot / (2 r_in)
  ["AS5.1:warmup", "068188e0", () => q(2)],
  ["AS5.1:astro-transfer-1", "e6b9e88f", () => q(0.1 * 3 * 1 ** 2)],
  ["AS5.1:astro-transfer-2", "4a4f84bc", () => q(1 / 2)],
  ["AS5.2:numeric", "fe687e29", () => q(1 / (1.25 * (1 - 0.6 * Math.cos(0))))],
  ["AS5.2:warmup", "93b3e269", () => q(3 * 2)],
  ["AS5.2:astro-transfer-1", "29d4693b", () => q(1 / (5 * (1 - Math.sqrt(24 / 25) * Math.cos(PI / 2))))],

  // ---- Physics (PH) batch 1: mechanics, relativistic and quantum-field toy models --------------------
  ["PH1.1:numeric", "2c4c8731", () => q(2, "kg").mul(q(10, "m/s²")).div(q(1, "kg/s")), { unit: "m/s" }], // v_t = m g / c
  ["PH1.1:warmup", "562a96c7", () => q(6, "kg").div(q(3, "kg/s")), { unit: "s" }],
  ["PH1.1:mechanics-transfer-1", "c9e9ca0f", () => q(3, "kg").div(q(2, "kg/s")), { unit: "s" }],
  ["PH1.1:mechanics-transfer-2", "4723c627", () => {
    // v(t) = (m g / b) (1 - exp(-b t / m)); t = 1.5 ln 2, b/m = 2/3
    const t = 1.5 * Math.LN2;
    return q((3 * 10) / 2 * (1 - Math.exp(-(2 / 3) * t)), "m/s");
  }, { unit: "m/s" }],
  ["PH1.1:mechanics-transfer-3", "9a39ac1c", () => q(500, "m/s").mul(Math.log(2)), { unit: "m/s", rel: 1e-4 }], // Tsiolkovsky
  ["PH1.2:numeric", "4960c39d", () => q(2 * 2 * 3, "m/s²"), { unit: "m/s²" }], // |2 Ω × v|
  ["PH1.2:warmup", "3f755062", () => q(3 ** 2 * 2, "m/s²"), { unit: "m/s²" }],
  ["PH1.2:mechanics-transfer-1", "38ce2565", () => {
    // F = -2 m Ω × v, Ω = (0,0,0.5), v = (4,0,0)
    const W = [0, 0, 0.5], v = [4, 0, 0];
    const cross = [W[1] * v[2] - W[2] * v[1], W[2] * v[0] - W[0] * v[2], W[0] * v[1] - W[1] * v[0]];
    return q(-2 * 3 * cross[1], "N");
  }, { unit: "N" }],
  ["PH1.2:mechanics-transfer-2", "16fd2f57", () => q(3 * 0.5 ** 2 * 8, "N"), { unit: "N" }],
  ["PH1.2:mechanics-transfer-3", "dffe64ef", () => {
    // F_Euler = -m (dΩ/dt × r)
    const a = [0, 0, 0.1], r = [5, 0, 0];
    const cross = [a[1] * r[2] - a[2] * r[1], a[2] * r[0] - a[0] * r[2], a[0] * r[1] - a[1] * r[0]];
    return q(-3 * cross[1], "N");
  }, { unit: "N" }],
  ["PH1.3:numeric", "4555558f", () => q(Math.sqrt(1 / 4))],
  ["PH1.3:warmup", "16f1b64c", () => q(4 * 0.5)],
  ["PH1.3:mechanics-transfer-1", "bd0edaa6", () => q(-8 / (2 * -0.5))], // ε = -μ / 2a
  ["PH1.3:mechanics-transfer-2", "4f591fd6", () => q(Math.sqrt(1 + (2 * -0.5 * 48) / 8 ** 2))], // e² = 1 + 2 ε h² / μ²
  ["PH1.3:mechanics-transfer-3", "2a675b32", () => q(8 * (1 - 0.5))],
  ["PH1.4:numeric", "22338239", () => q((2 / (2 * 1)) / Math.tan(PI / 4))],
  ["PH1.4:warmup", "02ce7fcb", () => q(6 / 3)], // E = κ / r_min
  ["PH1.4:mechanics-transfer-1", "cceff8af", () => q((4 / (2 * 2)) / Math.tan(PI / 4))],
  ["PH1.4:mechanics-transfer-2", "2154c8d6", () => q((4 / (2 * 2)) / Math.tan(PI / 6))],
  ["PH1.4:mechanics-transfer-3", "3c5fb825", () => q(Math.sin(PI / 4) ** 4 / Math.sin(PI / 6) ** 4)], // dσ/dΩ ∝ 1/sin⁴(θ/2)
  ["PH1.5:numeric", "8d315218", () => q(2 * 2, "m/s"), { unit: "m/s" }],
  ["PH1.5:warmup", "20a98f30", () => q(3, "m/s").div(q(0.5, "m")), { unit: "rad/s" }],
  ["PH1.5:mechanics-transfer-1", "edf4c65c", () => q((1 * 0 + 3 * 4) / (1 + 3), "m"), { unit: "m" }],
  ["PH1.5:mechanics-transfer-2", "ceb0b197", () => q(10, "kg m/s").div(q(5, "kg")), { unit: "m/s" }],
  ["PH1.5:mechanics-transfer-3", "5c1a9d69", () => q(2 * 3 ** 2 * 0.5, "kg m²/s"), { unit: "kg m²/s" }],
  ["PH1.6:numeric", "710d4d7f", () => q(0.5 * (2 * 1 ** 2 + 3 * 1 ** 2 + 4 * 0), "J"), { unit: "J" }],
  ["PH1.6:warmup", "b1135f87", () => q(4, "kg m²").mul(q(3, "rad/s")), { unit: "kg m²/s" }],
  ["PH1.6:mechanics-transfer-1", "a2e95d35", () => q(0.5 * (2 * 1 + 3 * 4 + 4 * 0), "J"), { unit: "J" }],
  ["PH1.6:mechanics-transfer-2", "6e622407", () => q(((3 - 4) * 2 * 3) / 2)], // I1 dω1 = (I2 - I3) ω2 ω3
  ["PH1.6:mechanics-transfer-3", "e78f1690", () => q(2 * Math.sqrt(((3 - 2) * (4 - 3)) / (2 * 4)))],
  ["PH10.1:numeric", "2d669b39", () => q(Math.hypot(4, 3))], // ω = √(k² + m²) with c = ħ = 1
  ["PH10.1:warmup", "f67b93e3", () => q(Math.hypot(4, 3) - 3)],
  ["PH10.1:quantum-transfer-1", "e812aed4", () => q(Math.hypot(4, 3))],
  ["PH10.1:quantum-transfer-2", "7b0d4279", () => q(4 / Math.hypot(4, 3))], // v_g = k / ω
  ["PH10.2:numeric", "b96a35e5", () => q(Math.hypot(4, 3))],
  ["PH10.2:warmup", "323617ff", () => q(2)],
  ["PH10.2:quantum-transfer-1", "8213871e", () => q(Math.hypot(4, 3))],
  ["PH10.2:quantum-transfer-2", "208dd378", () => q(Math.hypot(4, 3) - 3)],
  ["PH10.3:numeric", "c5982e11", () => q((3 * 2 ** 2) / (2 * 1))], // S = m Δx² / 2t
  ["PH10.3:warmup", "59a31722", () => q(6 / 2)],
  ["PH10.3:quantum-transfer-1", "c6a0c805", () => q(Math.cos(PI))],
  ["PH10.3:quantum-transfer-2", "4a2cfa3d", () => q(Math.cos(2 * PI))],
  ["PH10.4:numeric", "80e463ad", () => q(Math.sqrt(3 + 1))],
  ["PH10.4:warmup", "ae5c2076", () => q(2 ** 2)],
  ["PH10.4:quantum-transfer-1", "dda1e2d4", () => q(4 + 1)],
  ["PH10.4:quantum-transfer-2", "3b4fa231", () => q(1)],
  ["PH10.5:numeric", "ad73318d", () => q(-10 - -9)],
  ["PH10.5:warmup", "413c5813", () => q(-9 - -10)],
  ["PH10.5:quantum-transfer-1", "17ac00b1", () => q(8 ** (2 / 3))],
  ["PH10.5:quantum-transfer-2", "a34e70e5", () => q(1)], // det of orthonormal orbitals, normalised by 1/√N!
  ["PH10.6:numeric", "5298a302", () => q(0.8 * Math.exp(-Math.log(2)))],
  ["PH10.6:warmup", "8376dfc1", () => q(0.8 - 0.8 * Math.exp(-Math.log(2)))],
  ["PH10.6:quantum-transfer-1", "8b7ef6ca", () => q(1 * Math.exp(-Math.log(2)))],
  ["PH10.6:quantum-transfer-2", "231cd1ac", () => q(2 / 2)], // coherence decays at γ/2
  ["PH11.1:numeric", "c95f83de", () => q(1 / Math.sqrt(1 - 0.6 ** 2))],
  ["PH11.1:warmup", "de803a09", () => q(10 * Math.sqrt(1 - 0.6 ** 2), "m"), { unit: "m" }],
  ["PH11.1:matter-transfer-1", "3b488839", () => q(1 / Math.sqrt(1 - 0.6 ** 2))],
  ["PH11.1:matter-transfer-2", "48cee4ec", () => q((1 / Math.sqrt(1 - 0.6 ** 2)) * (5 - 0.6 * 3))],
  ["PH11.2:numeric", "ec8b6c1b", () => q(1 / Math.sqrt(1 - 0.6 ** 2) - 1)],
  ["PH11.2:warmup", "935c8932", () => q(0.6 / Math.sqrt(1 - 0.6 ** 2))],
  ["PH11.2:matter-transfer-1", "589fe6e6", () => q(Math.sqrt(5 ** 2 - 4 ** 2))],
  ["PH11.2:matter-transfer-2", "2a31b15b", () => q(3 * 2)],
  ["PH11.3:numeric", "1d0c3a86", () => q((4 ** 2 - 1 ** 2 - 1 ** 2) / (2 * 1))], // s = m1² + m2² + 2 E m2
  ["PH11.3:warmup", "21c2121d", () => q((4 ** 2 - 1 ** 2 - 1 ** 2) / (2 * 1) - 1)],
  ["PH11.3:matter-transfer-1", "35da7ef8", () => q(2 * Math.hypot(3, 4))],
  ["PH11.3:matter-transfer-2", "fcdd9728", () => q(Math.sqrt((2 + 2) ** 2 - (2 - 2) ** 2))],
  ["PH11.4:numeric", "e0382543", () => q(Math.sqrt((1 - 0.6) / (1 + 0.6)))],
  ["PH11.4:warmup", "2f122ccb", () => q(1.25 - 1)],
  ["PH11.4:matter-transfer-1", "ae23a73a", () => q(-0.6)],
  ["PH11.4:matter-transfer-2", "cf41153d", () => q(1 / Math.sqrt(1 - 0.6 ** 2))],

  // ---- Physics (PH) batch 2: fields, relativity, computing and data analysis ------------------------
  ["PH15.1:numeric", "36a56f5e", () => q(2 * 3 * 1 ** 2)],
  ["PH15.1:warmup", "1c0f6c2d", () => q(3 * 1 ** 2)],
  ["PH15.1:fields-transfer-1", "5aa6203a", () => q(2 ** 3)],
  ["PH15.1:fields-transfer-2", "6ccdca40", () => q(0.5 * 1 * 1)], // E0 = ħω/2
  ["PH15.3:numeric", "4e8ef5ae", () => q(Math.hypot(4, 3))],
  ["PH15.3:warmup", "4526e2a4", () => q(2 * Math.hypot(4, 3))],
  ["PH15.3:review-core-transfer", "adbad028", () => q((3 + 0.5) * 5)], // (n + ½) ħω with ħ = 1
  ["PH15.3:fields-transfer-1", "5af0b391", () => q((4 + 0.5) * 2)],
  ["PH15.3:fields-transfer-2", "1a4fe899", () => q(4 * 2)],
  ["PH15.4:numeric", "690da6ae", () => q(Math.abs(1 + -1) ** 2)],
  ["PH15.4:warmup", "86c82a29", () => q(Math.hypot(1, 1) ** 2)], // |1 + i|²
  ["PH15.4:fields-transfer-1", "5f8a7731", () => q((2 ** 2) ** 2)], // amplitude ∝ g², squared magnitude ∝ g⁴
  ["PH15.4:fields-transfer-2", "48b10c0a", () => q(Math.abs(1 + -1) ** 2)],
  ["PH15.5:warmup", "d0d33416", () => q(2 ** 2)],
  ["PH15.5:fields-transfer-1", "88587aa5", () => q(3 ** 2)],
  ["PH15.6:warmup", "5b1ad9af", () => q(0.1 ** 2)],
  ["PH15.7:fields-transfer-1", "878d1c45", () => q(1)], // [σ1/2, σ2/2] = i σ3/2
  ["PH15.7:fields-transfer-2", "3d1d6391", () => q(2 * 3 * 1)],
  ["PH15.8:fields-transfer-1", "1c341698", () => q(Math.sqrt(2 * 2) * 3)],
  ["PH16.1:fields-transfer-1", "e39073a5", () => q(0.001)],
  ["PH16.1:fields-transfer-2", "41e3d4ce", () => q(2)],
  ["PH16.2:fields-transfer-1", "f49892dc", () => q(4 * 0.5)], // trace of R_μν = Λ g_μν in 4D
  ["PH16.2:fields-transfer-2", "54bf7bfe", () => q(4 * 0)],
  ["PH16.3:numeric", "4645efef", () => q((2 * 3) / 2)], // r_s = 2GM/c²
  ["PH16.3:warmup", "05303441", () => q(Math.sqrt(1 - 1 / 4))],
  ["PH16.3:fields-transfer-1", "8207580f", () => q(Math.sqrt(1 - 2 / 8))],
  ["PH16.3:fields-transfer-2", "e02926f1", () => q(2 * 3)],
  ["PH16.4:numeric", "880c9bc9", () => q(5 + Math.sqrt(5 ** 2 - 3 ** 2))],
  ["PH16.4:warmup", "a90cccac", () => q(1 / 2)], // T_H ∝ 1/M
  ["PH16.4:fields-transfer-1", "5fddd54f", () => q(2 + Math.sqrt(2 ** 2 - 0))],
  ["PH16.4:fields-transfer-2", "1956994d", () => q(1 + Math.sqrt(1 - 0.6 ** 2))],
  ["PH16.5:numeric", "6c9b6a3e", () => q(1 / 2)],
  ["PH16.5:warmup", "fe0e35d5", () => q(1 / 2 ** 2)],
  ["PH16.5:fields-transfer-1", "e4b8b4cb", () => q(0.002 / 2)],
  ["PH16.5:fields-transfer-2", "04ef4af9", () => q(1 / 2)],
  ["PH16.6:numeric", "736b1c02", () => q(8 ** (2 / 3))],
  ["PH16.6:warmup", "a6ddb7aa", () => q(4 ** 0.5)],
  ["PH16.6:fields-transfer-1", "680e4dc6", () => q(1 * 4 ** -1.5)],
  ["PH16.6:fields-transfer-2", "2046fceb", () => q(8 ** (2 / 3))],
  ["PH16.7:numeric", "8358244c", () => q((1 / 2) ** 2)],
  ["PH16.7:warmup", "9fc59e59", () => q(0.04 * (1 / 2) ** 2)],
  ["PH16.7:fields-transfer-1", "399a84d9", () => q((1 / 2) ** 2)],
  ["PH16.7:fields-transfer-2", "4fa6fd7a", () => q(Math.log2(0.04 / 0.01))],
  ["PH16.8:numeric", "db38c890", () => q(Math.sqrt((4 * 9) / 1 ** 3))],
  ["PH16.8:warmup", "bb0350bb", () => q(2 ** -1.5)], // l_P ∝ c^(-3/2)
  ["PH16.8:fields-transfer-1", "2f6c2eeb", () => q(Math.sqrt(4))],
  ["PH16.8:fields-transfer-2", "240e4710", () => q(2 ** -1.5)],
  ["PH17.1:numeric", "c279a580", () => q(2 / Math.sqrt(16))],
  ["PH17.1:warmup", "abf2f51e", () => q(Math.hypot(0.5, 0.3))],
  ["PH17.1:fields-transfer-1", "5fd9e04b", () => q(Math.hypot(3, 4))],
  ["PH17.1:fields-transfer-2", "6c8c5a4b", () => q(Math.sqrt(1 + 1 + 2 * 1 * 1 * 1))], // ρ = 1
  ["PH17.2:numeric", "c31e5e2d", () => q(4.096 / 2 ** 12, "V"), { unit: "V" }],
  ["PH17.2:warmup", "f1e31c15", () => q(2 * 100)],
  ["PH17.2:fields-transfer-1", "15c8fe12", () => q(100 / 2)],
  ["PH17.2:fields-transfer-2", "668909bf", () => q(Math.abs(70 - 100))],
  ["PH17.3:numeric", "82e297c5", () => q((4 * 785) / 1000)],
  ["PH17.3:warmup", "52f1e8a6", () => q(1 / Math.sqrt(4))],
  ["PH17.3:fields-transfer-1", "02e7b86c", () => q(Math.sqrt((0.2 * 0.8) / 100))],
  ["PH17.3:fields-transfer-2", "dcce70fb", () => q(0.6 / 0.2)],
  ["PH17.4:numeric", "05fdc254", () => q(2 / 4)],
  ["PH17.4:warmup", "bb92e0b5", () => q(1 + 0.5 * (0.5 + 0.5) * 2)],
  ["PH17.4:fields-transfer-1", "90fd6f60", () => q(4 * (12 * 1 - 6 * 1))], // F = -dV/dr, V = 4ε[(σ/r)¹² - (σ/r)⁶]
  ["PH17.4:fields-transfer-2", "ba81a079", () => q(2 ** (1 / 6))],
  ["PH17.5:numeric", "301dd6a8", () => q((4 * PI * PI) / 4)], // T² = 4π² L / g
  ["PH17.5:warmup", "c42ea46e", () => q(0.02)],
  ["PH17.5:fields-transfer-1", "e148d03e", () => q((2 / 0.2) ** 2)],
  ["PH17.5:fields-transfer-2", "fd48c9fe", () => q(1 / Math.sqrt(4))],
  ["PH18.1:numeric", "5e8867cc", () => q((12 - 10) / 2)],
  ["PH18.1:warmup", "7499e195", () => q(12 - 10)],
  ["PH18.1:fields-transfer-1", "23631cba", () => q(3 * 4)],
  ["PH18.1:fields-transfer-2", "e5bd9c24", () => q(((1 / 9) * 9) / (1 + (1 / 9) * 9))],
  ["PH18.2:numeric", "94ef0787", () => q(0.5 * 2 * 3 ** 2)],
  ["PH18.2:warmup", "f9a3b3b0", () => q(2 ** 2)],
  ["PH18.2:fields-transfer-1", "8ac081a5", () => q(2 / 0.5)],
  ["PH18.2:fields-transfer-2", "4b06d8e3", () => q(0.003 * 1000)],
  ["PH18.3:numeric", "0fadce14", () => q(1 ** 2 + 2 ** 2)],
  ["PH18.3:warmup", "230910ee", () => q(2)],
  ["PH18.3:fields-transfer-1", "e43470a6", () => q(Math.hypot(0.3, 0.4))],
  ["PH18.3:fields-transfer-2", "4c4b4c70", () => q(0.2)],
  ["PH18.4:numeric", "91a9bab1", () => q(12 / 3)],
  ["PH18.4:warmup", "fb68bbbb", () => q(2)],
  ["PH18.4:fields-transfer-1", "c144a452", () => q(0.6 / 0.2)],
  ["PH18.4:fields-transfer-2", "03decfa9", () => q(1 / 2)],

  // ---- Physical chemistry (CH) batch 1 ---------------------------------------------------------------
  ["CH1.1:numeric", "12ee5c9a", () => q(Math.log(2) - Math.log(1))], // μ = μ° + RT ln a
  ["CH1.1:warmup", "43b31798", () => q(0.8 / 0.2)],
  ["CH1.1:physical-chemistry-transfer-1", "bdee2117", () => q(-2 + 1 * Math.log(Math.E))],
  ["CH1.1:physical-chemistry-transfer-2", "5e390104", () => q(2 * Math.log(3) - 2 * Math.log(1))],
  ["CH1.10:numeric", "77b93ffc", () => q((3 * 4) / 2)], // κ = G ℓ / A
  ["CH1.10:warmup", "bb73a6a7", () => q(6 / 2)],
  ["CH1.10:physical-chemistry-transfer-1", "1d9385b0", () => q(0.5 * (0.1 * 1 ** 2 + 0.1 * 1 ** 2))],
  ["CH1.10:physical-chemistry-transfer-2", "47705168", () => q(-0.509 * 2 ** 2 * Math.sqrt(0.01))],
  ["CH1.11:numeric", "722f9a0d", () => q(2 * 2 * 3)], // <x²> = 2Dt
  ["CH1.11:warmup", "e5db47e5", () => q(-2 * -4)], // J = -D dc/dx
  ["CH1.11:physical-chemistry-transfer-1", "c7eeed15", () => q(-2 * -3)],
  ["CH1.11:physical-chemistry-transfer-2", "b4545d19", () => q(2 * 0.5 * 4)],
  ["CH1.12:numeric", "69e8636d", () => q(1 * (2 - 0.5))],
  ["CH1.12:warmup", "28a5e22f", () => q(1 / 2)],
  ["CH1.12:physical-chemistry-transfer-1", "8ee15bfc", () => q(Math.exp(0.5 * 2 * Math.log(2)) - Math.exp(-0.5 * 2 * Math.log(2)))],
  ["CH1.12:physical-chemistry-transfer-2", "20a7d16c", () => q(0.1)],
  ["CH1.13:numeric", "03df574c", () => q(1 / (3 + 1))],
  ["CH1.13:warmup", "f2280c71", () => q(3 / (3 + 1))],
  ["CH1.13:physical-chemistry-transfer-1", "e072ba09", () => q(200 * 0.25)],
  ["CH1.13:physical-chemistry-transfer-2", "190110c4", () => q(1240 / 620, "eV"), { unit: "eV" }],
  ["CH1.2:numeric", "efdd9234", () => q(0.25 * 80 + 0.75 * 20)],
  ["CH1.2:warmup", "f0b45525", () => q((0.25 * 80) / (0.25 * 80 + 0.75 * 20))],
  ["CH1.2:physical-chemistry-transfer-1", "4054d4ae", () => q(0.25 * 4 + 0.75 * 1)],
  ["CH1.2:physical-chemistry-transfer-2", "d96a1280", () => q(-1 * (0.5 * Math.log(0.5) + 0.5 * Math.log(0.5)))],
  ["CH1.3:numeric", "0fa9e1c4", () => q((0.1 * 2) / 10)], // steady state: k1[A] = k2[I]
  ["CH1.3:warmup", "ad3bf5c2", () => q(0.69314718056 / 0.2)],
  ["CH1.3:physical-chemistry-transfer-1", "ae00ad32", () => q(Math.log(2) / 2)],
  ["CH1.3:physical-chemistry-transfer-2", "034a4706", () => q(2 * Math.exp(-1 * Math.log(2)))],
  ["CH1.4:numeric", "ee703adb", () => q(Math.exp(-Math.log(10)))],
  ["CH1.4:warmup", "5e910a45", () => q(0.5 / 1)],
  ["CH1.4:physical-chemistry-transfer-1", "30f93ec6", () => q(Math.exp(-Math.log(2)))],
  ["CH1.4:physical-chemistry-transfer-2", "6bea6d31", () => q(2)], // Eyring prefactor kB T / h ∝ T
  ["CH1.5:numeric", "c4ef0b1a", () => { const w = Math.exp(-Math.log(3)); return q(w / (1 + w)); }],
  ["CH1.5:warmup", "ba63661a", () => { const w = 3 * Math.exp(-Math.log(3)); return q(w / (1 + w)); }],
  ["CH1.5:physical-chemistry-transfer-1", "cec5eebd", () => q(1 / (1 - 0.5))],
  ["CH1.5:physical-chemistry-transfer-2", "08c12071", () => q(10 / 2)],
  ["CH1.6:numeric", "fabe20b0", () => q(3 / (1 + 3))],
  ["CH1.6:warmup", "0e5f03f5", () => q(1 / (1 + 1))],
  ["CH1.6:physical-chemistry-transfer-1", "6a283952", () => q(3 / (1 + 3))],
  ["CH1.6:physical-chemistry-transfer-2", "97c2e674", () => q((2 * 0.5) / (1 + 2 * 0.5))],
  ["CH1.7:numeric", "f2538dcc", () => q(1.5 * 0.2)],
  ["CH1.7:warmup", "07e10088", () => q(0.8 * 5)],
  ["CH1.7:physical-chemistry-transfer-1", "f5c7b923", () => q(2 * 0.25)],
  ["CH1.7:physical-chemistry-transfer-2", "a6538025", () => q(1 * Math.log(2))],
  ["CH1.8:numeric", "29c63e80", () => q(1 * 5 * 0.2)],
  ["CH1.8:warmup", "107efe07", () => q(2 * 5 * 0.2)],
  ["CH1.8:physical-chemistry-transfer-1", "0b83a4d8", () => q(1.86 * 0.1 * 2, "K"), { unit: "K" }],
  ["CH1.8:physical-chemistry-transfer-2", "522bec86", () => q(1 * 0.1 * 10)],
  ["CH1.9:numeric", "336e31a6", () => q(1 - 0.025 * 2)],
  ["CH1.9:warmup", "4e39fd35", () => q(1 - (0.025 / 2) * (2 * 2))], // n and ln Q both double
  ["CH1.9:physical-chemistry-transfer-1", "0345415a", () => q(1 - (1 / 2) * Math.log(Math.E))],
  ["CH1.9:physical-chemistry-transfer-2", "ed7895c8", () => q(-(-6) / (2 * 1))],
  ["CH2.2:numeric", "ee8184d6", () => q(Math.sqrt(8 / 2))],
  ["CH2.2:warmup", "aacc2526", () => q(0.5 * 8 * 0.5 ** 2)],
  ["CH2.2:physical-chemistry-transfer-1", "1d3368e8", () => q(2 * Math.sqrt(0 + 0.3 ** 2))],
  ["CH2.2:physical-chemistry-transfer-2", "32087258", () => q(Math.sqrt(1 / 1600))],
  ["CH2.3:numeric", "447a8ef4", () => q(-10 - -12)],
  ["CH2.3:warmup", "ef9888cb", () => q(-11 - -12)],
  ["CH2.3:physical-chemistry-transfer-1", "9949ee88", () => q(0.5 / 2 + 1 / (8 * 0.5))],
  ["CH2.3:physical-chemistry-transfer-2", "9ac8586c", () => q(1 / 2 + 1 / 8)],
  ["CH2.4:numeric", "413944a8", () => q(2 * (2 * 3) - 2 * (1 * 2))], // E = B J(J+1)
  ["CH2.4:warmup", "0056cb64", () => q(Math.sqrt(1 / 4))],
  ["CH2.4:physical-chemistry-transfer-1", "239a11bb", () => q(2 * 1 * 2)],
  ["CH2.4:physical-chemistry-transfer-2", "0a998bb6", () => q(2 * 3 * 4 - 2 * 2 * 3)],
  ["CH2.5:numeric", "5bec7fe4", () => q(0.3 ** 2)],
  ["CH2.5:warmup", "9c8905ba", () => q(3 / (3 + 1))],
  ["CH2.5:physical-chemistry-transfer-1", "702e974d", () => q(1240 / 620, "eV"), { unit: "eV" }],
  ["CH2.5:physical-chemistry-transfer-2", "c2c9cfbc", () => q(2 ** 2)],
  ["CH2.6:numeric", "bc2d8988", () => q(3 * 2)],
  ["CH2.6:warmup", "ddd71140", () => q((2 / 1e6) * 1e6)],
  ["CH2.6:physical-chemistry-transfer-1", "612a3432", () => q(2 * 3)],
  ["CH2.6:physical-chemistry-transfer-2", "e1244648", () => q((1000 / 400e6) * 1e6)],
  ["CH3.1:numeric", "21d955ea", () => q(6 / 2)],
  ["CH3.1:warmup", "3f692668", () => q(1 / 2)],
  ["CH3.1:chemistry-transfer-1", "39880f3c", () => q(Math.exp(-Math.log(2)))],
  ["CH3.1:chemistry-transfer-2", "42d59973", () => q(4 * 0.5)],
  ["CH3.2:numeric", "926b374e", () => q(0.5 * 2 * 3)],
  ["CH3.2:warmup", "74e3687f", () => q(10 - 9)],
  ["CH3.2:chemistry-transfer-1", "90e36080", () => q(2 ** 2)], // area ∝ R²
  ["CH3.2:chemistry-transfer-2", "85d30801", () => q(0.5 * 2 * 3)],
  ["CH3.3:warmup", "5e72f2ba", () => q(Math.abs(-0.01) / 100)],
  ["CH3.3:chemistry-transfer-1", "86f72f6a", () => q(2 * (4 * 5) - 2 * (3 * 4))],
  ["CH3.3:chemistry-transfer-2", "b565a648", () => q(100 / (1 + 1))],
  ["CH3.4:numeric", "75084e28", () => q(Math.exp(-Math.log(10)))],
  ["CH3.4:warmup", "a64bdc4d", () => q(5)],
  ["CH3.4:chemistry-transfer-1", "04f0acb6", () => { const o = (0.01 / 0.99) * 10; return q(o / (1 + o)); }],
  ["CH3.4:chemistry-transfer-2", "9db901c0", () => { const o = (0.25 / 0.75) * 3; return q(o / (1 + o)); }],
  ["CH3.5:numeric", "089aabed", () => q(-6 - -8)],
  ["CH3.5:warmup", "1a36876e", () => q(Math.hypot(0.3, 0.4))],
  ["CH3.5:chemistry-transfer-1", "7e2789f0", () => q((2.1 ** 2 - 1.9 ** 2) / 0.2)],
  ["CH3.5:chemistry-transfer-2", "cb72ac40", () => q((1 / 2) ** 2)],
  ["CH4.1:numeric", "0afcfec9", () => q(5 - 0 - 8 / 2)],
  ["CH4.1:warmup", "c4e44f26", () => q(6 - 6 - 2 / 2)],
  ["CH4.1:chemistry-transfer-1", "3ab642e7", () => q(5 - 2 - 3)],
  ["CH4.1:chemistry-transfer-2", "bb095ca8", () => q(5 - 0 - 4)],
  ["CH4.2:numeric", "a00d3ceb", () => q(1 + 3)],
  ["CH4.2:warmup", "3f4f6107", () => q(-1 / 3)],
  ["CH4.2:chemistry-transfer-1", "bbf14438", () => q(Math.acos(-1 / 3), "radians"), { unit: "degrees", rel: 1e-6 }],
  ["CH4.2:chemistry-transfer-2", "389466ee", () => q(3 - 1)], // sp²: three hybrids from s + two p
  ["CH4.3:numeric", "f67c4ffe", () => q((8 - 4) / 2)],
  ["CH4.3:warmup", "d1481b7f", () => q((8 - 3) / 2)],
  ["CH4.3:chemistry-transfer-1", "76560f75", () => q((8 - 4) / 2)],
  ["CH4.3:chemistry-transfer-2", "cfbc4299", () => q(-2 / 2)],
  ["CH4.4:numeric", "96ec0f56", () => q(2 * Math.abs(1))],
  ["CH4.4:warmup", "a8bc6a05", () => q(3 + 1)],
  ["CH4.4:chemistry-transfer-1", "563b9a1f", () => q(Math.abs(2 - 2))],
  ["CH4.4:chemistry-transfer-2", "240b7999", () => q(Math.hypot(1, 1))],
  ["CH4.5:numeric", "668ee479", () => q(1 / 2 ** 6)],
  ["CH4.5:warmup", "ab792187", () => q(4 * ((1 / 1) ** 12 - (1 / 1) ** 6))],
  ["CH4.5:chemistry-transfer-1", "358231f7", () => q(2 ** (1 / 6))],
  ["CH4.5:chemistry-transfer-2", "0553cef3", () => q(-3)],
  ["CH4.6:numeric", "674cd6f1", () => q(1 / (2 * 2))], // m* = ħ² / (d²E/dk²), E = 2k²
  ["CH4.6:warmup", "c5e8360e", () => q(3 * 1 * 2)],
  ["CH4.6:chemistry-transfer-1", "478a8f37", () => q(4 * 2)],
  ["CH4.6:chemistry-transfer-2", "44b379b7", () => q(0 - 2 * 1 * Math.cos(0))],

  // ---- Mathematics for the sciences (MA) batch 1: analysis, algebra, geometry, norms ----------------
  ["MA1.1:numeric", "5e0e6e24", () => q([-2, 2].length)], // x² = 4
  ["MA1.1:warmup", "bb0f478c", () => q(2)],
  ["MA1.1:analysis-transfer-1", "acab37a3", () => q([[0, 0], [0, 1], [1, 0], [1, 1]].filter(([P, Q]) => !P || Q).length)],
  ["MA1.1:analysis-transfer-2", "fc92c203", () => q(2 ** 3)],
  ["MA1.1:analysis-transfer-3", "716185c6", () => q([-2, -1, 0, 1, 2].filter((x) => !(x * x > x)).length)],
  ["MA1.2:numeric", "c2fe2218", () => q(5)],
  ["MA1.2:warmup", "9e6f712f", () => q(1 / 2 ** 4)],
  ["MA1.2:analysis-transfer-1", "501b9fd6", () => q(1 / 2 ** 10)],
  ["MA1.2:analysis-transfer-2", "e1736615", () => { let n = 0; while (!(2 ** -n < 0.002)) n++; return q(n); }],
  ["MA1.2:analysis-transfer-3", "f0c6efcf", () => q(1)],
  ["MA1.3:numeric", "06797d93", () => q(0)],
  ["MA1.3:warmup", "c7209294", () => q(Math.floor(1 / 0.01) + 1)],
  ["MA1.3:analysis-transfer-1", "b1f7dc27", () => q(Math.floor(1 / 0.03) + 1)],
  ["MA1.3:analysis-transfer-2", "c0af10e2", () => q(3 / 2)],
  ["MA1.3:analysis-transfer-3", "c3c88c1c", () => q(1 / 20)],
  ["MA1.4:numeric", "d09cfed1", () => q(99 + 1)], // first omitted term is 1/(N+1)
  ["MA1.4:warmup", "b5ef8711", () => q(1 / (1 - 1 / 3))],
  ["MA1.4:analysis-transfer-1", "f97fc656", () => { let t = 0; for (let n = 1; n <= 9; n++) t += 1 / (n * (n + 1)); return q(t); }],
  ["MA1.4:analysis-transfer-2", "de5711b7", () => q(1 / 21)],
  ["MA1.4:analysis-transfer-3", "29db27c8", () => q(1 / 3)],
  ["MA1.5:numeric", "82de1223", () => q(Math.max((-2) ** 2, 3 ** 2))],
  ["MA1.5:warmup", "e9e9a5b8", () => q(0)],
  ["MA1.5:analysis-transfer-1", "dbe49fb1", () => q(0 ** 2 + 1)],
  ["MA1.5:analysis-transfer-2", "6b26c803", () => q(0)],
  ["MA1.5:analysis-transfer-3", "573fa33e", () => q(0.12 / 3)],
  ["MA1.6:numeric", "5bf721b7", () => q((3 ** 2 - 1 ** 2) / (3 - 1) / 2)], // f'(c) = 2c = slope
  ["MA1.6:warmup", "c6c2f2a4", () => q(3 * 0.2)],
  ["MA1.6:analysis-transfer-1", "5a700469", () => q((4 ** 2 - 1 ** 2) / (4 - 1) / 2)],
  ["MA1.6:analysis-transfer-2", "c5361379", () => q(2 * 3)],
  ["MA1.6:analysis-transfer-3", "d36d605b", () => q((4 * 0.25 ** 2) / 2)],
  ["MA1.7:numeric", "9b523acf", () => q((1 / 20) * (1 - 0))], // U - L = Δx (f(b) - f(a)) for monotone f
  ["MA1.7:warmup", "23fa263b", () => q(1 / 2)],
  ["MA1.7:analysis-transfer-1", "59f3fba4", () => q((1 / 10) * (1 ** 2 - 0 ** 2))],
  ["MA1.7:analysis-transfer-2", "de754c21", () => q(1 / 3)],
  ["MA1.7:analysis-transfer-3", "219fd7a3", () => { let t = 0; for (let i = 1; i <= 100; i++) t += (i / 100) ** 2 / 100; return q(t - 1 / 3); }, { rel: 1e-6 }],
  ["MA1.8:numeric", "49a9b212", () => q(0.5 ** 10)],
  ["MA1.8:warmup", "7f9718a9", () => q(Math.cos(0))],
  ["MA1.8:analysis-transfer-1", "4b40b0fa", () => q(1)],
  ["MA1.8:analysis-transfer-2", "a99a9699", () => q(0.5 ** 8)],
  ["MA1.8:analysis-transfer-3", "3ec46f23", () => { let n = 0; while (!(0.5 ** n < 0.001)) n++; return q(n); }],
  ["MA10.1:numeric", "9df90e12", () => q(6 / 3)], // |ker| = |Z6| / |Z3| for the surjection
  ["MA10.1:warmup", "24ad964b", () => q(3)],
  ["MA10.1:structure-transfer-1", "aaa3beea", () => q(24 / 6)],
  ["MA10.1:structure-transfer-2", "43c60cff", () => q(17 % 5)],
  ["MA10.2:numeric", "9ad252bf", () => q(3)],
  ["MA10.2:warmup", "ed5efbf1", () => q(3 * 2 * 1)],
  ["MA10.2:structure-transfer-1", "b6195b86", () => q(12)], // lcm(3,4)
  ["MA10.2:structure-transfer-2", "281b9da5", () => q((-1) ** (4 - 1))],
  ["MA10.3:numeric", "27497b58", () => { const gcd = (a, b) => (b ? gcd(b, a % b) : a); return q([1, 2, 3, 4, 5].filter((k) => gcd(k, 6) === 1).length); }],
  ["MA10.3:warmup", "72aa5ed2", () => q(4)],
  ["MA10.3:structure-transfer-1", "22737ec1", () => q((2 * 3) % 6)],
  ["MA10.3:structure-transfer-2", "d106820c", () => q([...Array(7).keys()].find((k) => (3 * k) % 7 === 1))],
  ["MA10.4:numeric", "62b78d4f", () => q(1 + -1)],
  ["MA10.4:warmup", "c296bced", () => q(1)],
  ["MA10.4:structure-transfer-1", "4f83deb3", () => q(2 * Math.cos(PI))],
  ["MA10.4:structure-transfer-2", "493b9174", () => q(Math.cos(PI / 3) ** 2 + Math.sin(PI / 3) ** 2)],
  ["MA10.5:numeric", "3c631c92", () => q(2 * Math.cos(2 * PI / 2))], // diag(e^{-iθ/2}, e^{iθ/2})
  ["MA10.5:warmup", "0be10df6", () => q(2 * Math.cos(4 * PI / 2))],
  ["MA10.5:structure-transfer-1", "bf3ce037", () => q(Math.cos(2 * PI / 2))],
  ["MA10.5:structure-transfer-2", "395ef3d6", () => q((3 * 2) / 2)], // n(n-1)/2
  ["MA10.6:numeric", "f5f6357f", () => q(5 ** 2 - 3 ** 2)],
  ["MA10.6:warmup", "a0942386", () => q(Math.sqrt(5 ** 2 - 3 ** 2))],
  ["MA10.6:structure-transfer-1", "61432b33", () => q((0.5 + 0.5) / (1 + 0.5 * 0.5))],
  ["MA10.6:structure-transfer-2", "31f8d492", () => q(1 / Math.sqrt(1 - 0.6 ** 2))],
  ["MA11.1:numeric", "4864334b", () => q(2 * 1)],
  ["MA11.1:warmup", "a041f1ff", () => q(1 / 2)],
  ["MA11.1:structure-transfer-1", "c1e6bc93", () => q(4 * 3 * 3)],
  ["MA11.1:structure-transfer-2", "070ee1d0", () => q(4 * 3)],
  ["MA11.2:numeric", "b41eb805", () => q(3)],
  ["MA11.2:warmup", "e785272b", () => q(1 / 3)],
  ["MA11.2:structure-transfer-1", "7c3dca6b", () => q(3)],
  ["MA11.2:structure-transfer-2", "9e2dcdfa", () => q(2 * Math.cos(PI / 3))],
  ["MA11.3:numeric", "d3d2dc11", () => q(-2)],
  ["MA11.3:warmup", "cb12975a", () => q(1 / 2)],
  ["MA11.3:structure-transfer-1", "883a41e2", () => q(-2)],
  ["MA11.3:structure-transfer-2", "ca834086", () => q(1 / 2)],
  ["MA11.4:numeric", "481d13e9", () => q(Math.hypot(3, 4))],
  ["MA11.4:warmup", "abcf18e3", () => q(3 ** 2 + 4 ** 2)],
  ["MA11.4:review-core-transfer", "72d9f30d", () => { const h = 1e-3, r = (t) => Math.sqrt(t * t + 1); return q((r(h) - 2 * r(0) + r(-h)) / (h * h)); }, { rel: 1e-5 }],
  ["MA11.4:structure-transfer-1", "fc47094d", () => q(2 * 3 ** 2)],
  ["MA11.4:structure-transfer-2", "db813eff", () => q(0)],
  ["MA11.5:numeric", "bb9be41d", () => q(1 / 2 ** 2)],
  ["MA11.5:warmup", "76eb48f3", () => q(2 / 2 ** 2)],
  ["MA11.5:structure-transfer-1", "dce2c1f1", () => q(1 / 2 ** 2)],
  ["MA11.5:structure-transfer-2", "3815577d", () => q(2 / 2 ** 2)],
  ["MA11.6:numeric", "ab5e9e94", () => q(1 * 1)], // ∮ x dy = area
  ["MA11.6:warmup", "6a639338", () => q(-1 * 1)],
  ["MA11.6:structure-transfer-1", "724ffe5e", () => q(1)],
  ["MA11.6:structure-transfer-2", "ae58d37a", () => q(2 * 3)],
  ["MA11.7:numeric", "fa8d972a", () => q(1)],
  ["MA11.7:warmup", "4d2d14ac", () => q(0)],
  ["MA11.7:structure-transfer-1", "98c2b245", () => q(Math.cos(PI))],
  ["MA11.7:structure-transfer-2", "8fc00228", () => q(2 * PI)],
  ["MA12.1:numeric", "8f8e1c67", () => q(Math.abs(1 / 10 - 1 / 20))],
  ["MA12.1:warmup", "52ab247b", () => q(0)],
  ["MA12.1:structure-transfer-1", "3ec4fb95", () => q(3 + 4)],
  ["MA12.1:structure-transfer-2", "7192c0bc", () => q(Math.hypot(3, 4))],
  ["MA12.2:numeric", "8b60a058", () => q(4)],
  ["MA12.2:warmup", "aebf7c73", () => q(3 ** 2 + 4 ** 2)],
  ["MA12.2:structure-transfer-1", "7089f637", () => q(4 ** 2)],
  ["MA12.2:structure-transfer-2", "0fb5b118", () => q(3 ** 2 + 4 ** 2)],
  ["MA12.3:numeric", "c476de1c", () => q(10 / 2)],
  ["MA12.3:warmup", "5aab2e13", () => q(10)],
  ["MA12.3:structure-transfer-1", "bafb610c", () => q(7)],
  ["MA12.3:structure-transfer-2", "7901f6a4", () => q(Math.max(2, 5))],
  ["MA12.4:numeric", "ac386b68", () => q(3 / 2)], // δ(2x) = δ(x)/2
  ["MA12.4:warmup", "60732297", () => q(2)], // |x|'' = 2δ
  ["MA12.4:structure-transfer-1", "0965c612", () => q(Math.exp(-0))],
  ["MA12.4:structure-transfer-2", "6b3da4cd", () => q(-(Math.exp(0) * (1 - 2 * 0 ** 2)))], // -φ'(0), φ' = e^{-x²}(1 - 2x²)

  // --- MA2–MA5: multivariable calculus, linear algebra, ODEs, Fourier/PDE (batch 3) ---
  ["MA2.1:numeric", "16f52056", () => q(4 * 2 ** 3)], // d/dt t^4 at t=2
  ["MA2.1:warmup", "c2bbb378", () => q(2 * 2 * 3)], // fx = 2xy
  ["MA2.1:multivariable-transfer-1", "2e11daf8", () => q(2 * 2 * 3)],
  ["MA2.1:multivariable-transfer-2", "7f5caf6c", () => q(4 * 2 ** 3)],
  ["MA2.2:numeric", "7ffb08d7", () => q((2 * 1) ** 2 + (6 * 1) ** 2)], // |grad f|^2, f=x^2+3y^2
  ["MA2.2:warmup", "329cca1a", () => q(6)],
  ["MA2.2:multivariable-transfer-1", "84048826", () => q(2 * 1 * 0.6 + 4 * 1 * 0.8)], // grad (2,4) . (3/5,4/5)
  ["MA2.2:multivariable-transfer-2", "776a5eda", () => q(1 ** 2 + 2 * 2 ** 2)], // x^2+2y^2 at (1,2), f(0)=0
  ["MA2.3:numeric", "43a0470a", () => q(5 * 5)],
  ["MA2.3:warmup", "78e57af4", () => q(10 / 2)],
  ["MA2.3:multivariable-transfer-1", "caeb2ebf", () => q(Math.SQRT2)],
  ["MA2.3:multivariable-transfer-2", "2a9bbc1d", () => q(2 * 2 ** 2)], // x=y=2
  ["MA2.4:numeric", "512ebeec", () => q(3)],
  ["MA2.4:warmup", "35946fe8", () => q(2 * 3)],
  ["MA2.4:multivariable-transfer-1", "c6e5556e", () => q(PI * (3 ** 2 - 1 ** 2))],
  ["MA2.4:multivariable-transfer-2", "7ebcd580", () => q(2 * 3)],
  ["MA2.5:numeric", "222200ac", () => q(1 ** 2 + 2 ** 2)], // phi(1,2)-phi(0,0)
  ["MA2.5:warmup", "b60a955e", () => q(2 ** 2 - 1 ** 2)],
  ["MA2.5:multivariable-transfer-1", "1c99a293", () => q(2 * PI)], // curl 2 times area pi
  ["MA2.5:multivariable-transfer-2", "8ed54f6a", () => q(1 ** 2 + 2 ** 2)],
  ["MA2.6:numeric", "c8b7c926", () => q(3 * 1)],
  ["MA2.6:warmup", "d2ae7eb0", () => q(-3 * 1)],
  ["MA2.6:multivariable-transfer-1", "2d3ead4d", () => q(3 * ((4 / 3) * PI))], // divergence 3 times ball volume
  ["MA2.6:multivariable-transfer-2", "d3cba117", () => q(Math.hypot(1, 2, 2))], // area factor sqrt(1+zx^2+zy^2)
  ["MA2.7:numeric", "1f5583c7", () => q(3 * 1)],
  ["MA2.7:warmup", "dcf49002", () => q(1 - -1)], // dFy/dx - dFx/dy
  ["MA2.7:multivariable-transfer-1", "bde92b2c", () => q(3 * ((4 / 3) * PI))],
  ["MA2.7:multivariable-transfer-2", "bf623aa3", () => q(1 - -1)],
  ["MA2.8:numeric", "bcc71daa", () => q((3 * 2 ** 2) / 2 ** 2)], // (1/r^2) d(r^3)/dr = 3
  ["MA2.8:warmup", "ab708ad1", () => q(4)], // h = (1, s, 1)
  ["MA2.8:multivariable-transfer-1", "04753be5", () => q((2 * 1.5) / 1.5)], // (1/s) d(s*s)/ds = 2
  ["MA2.8:multivariable-transfer-2", "284b678b", () => q((3 * 1.5 ** 2) / 1.5 ** 2)],
  ["MA3.1:numeric", "431bfd33", () => q(3 + 1)],
  ["MA3.1:warmup", "cca750d6", () => q(3 - 1)],
  ["MA3.1:linear-ode-transfer-1", "29dc56e6", () => q(3 - 1)],
  ["MA3.1:linear-ode-transfer-2", "c93948c3", () => q(5 - 3)],
  ["MA3.2:numeric", "d0a29b5a", () => q(3 - 2)], // rank 2, nullity 3-2
  ["MA3.2:warmup", "55140f20", () => q(2)],
  ["MA3.2:linear-ode-transfer-1", "8766d3a6", () => q(1 * 3 + 2 * 4)],
  ["MA3.2:linear-ode-transfer-2", "9e4018fd", () => q(2 * 4)],
  ["MA3.3:numeric", "f76ed036", () => q(2 * 3 - 1 * 1)],
  ["MA3.3:warmup", "ad9d9377", () => q(-(2 * 3 - 1 * 1))],
  ["MA3.3:linear-ode-transfer-1", "0fff1b6a", () => q(2 * 4 - 1 * 3)],
  ["MA3.3:linear-ode-transfer-2", "b70bf428", () => q(Math.abs(-3))],
  ["MA3.4:numeric", "9c29a0bb", () => q(4)], // [[1,n],[0,1]]
  ["MA3.4:warmup", "3eaebfc3", () => q(2 ** 4)],
  ["MA3.4:linear-ode-transfer-1", "7e1a767d", () => q(2 + 5)],
  ["MA3.4:linear-ode-transfer-2", "0cf1c6c5", () => q(2 - 1)], // nullity of A - I = [[0,1],[0,0]]
  ["MA3.5:numeric", "9c60d06d", () => q(4)],
  ["MA3.5:warmup", "591f0e57", () => q(3)],
  ["MA3.5:linear-ode-transfer-1", "f060ea03", () => q((3 * 1 + 1 * 1) / (1 * 1 + 1 * 1))],
  ["MA3.5:linear-ode-transfer-2", "eb680515", () => q(4)],
  ["MA3.6:numeric", "2c2d57df", () => q(2 + 1)], // eigenvalues 2 +/- 1
  ["MA3.6:warmup", "76aad0e3", () => q(2 - 1)],
  ["MA3.6:linear-ode-transfer-1", "5846f29d", () => q(2 + 1)],
  ["MA3.6:linear-ode-transfer-2", "56e070cf", () => q(1 * 0.5 + 4 * 0.5)],
  ["MA3.7:numeric", "b1011242", () => q(Math.min(3, 1))],
  ["MA3.7:warmup", "58f24e9c", () => q(5)], // component of b outside the image of diag(3,1,0)
  ["MA3.7:linear-ode-transfer-1", "8c034d3d", () => q((1 + 2 + 6) / 3)],
  ["MA3.7:linear-ode-transfer-2", "fd42d250", () => q(10 / 0.5)],
  ["MA3.8:numeric", "fd2070b7", () => q(0 + 3 * 1)], // x1(t) = x1(0) + t x2(0)
  ["MA3.8:warmup", "f2d75c3c", () => q(2)],
  ["MA3.8:linear-ode-transfer-1", "aab7ccaf", () => q(3)],
  ["MA3.8:linear-ode-transfer-2", "99f4536b", () => q(Math.exp(-1))], // exp(-I) exp(N)
  ["MA4.1:numeric", "c08002bc", () => q(4 / 2)],
  ["MA4.1:warmup", "d46d86dd", () => q(1 / (1 * 1))], // y = 1/(1-t)
  ["MA4.1:linear-ode-transfer-1", "54d535b2", () => q(3 * Math.exp(2 * Math.log(2)))],
  ["MA4.1:linear-ode-transfer-2", "856cd672", () => q(4 * Math.exp(-Math.log(2)))],
  ["MA4.2:numeric", "495ff52f", () => q(1 / 4)],
  ["MA4.2:warmup", "1dc22d10", () => q(Math.sqrt(9))],
  ["MA4.2:linear-ode-transfer-1", "d4c82756", () => q(2 * (1 - Math.exp(-2 * Math.log(2))))],
  ["MA4.2:linear-ode-transfer-2", "2d46ea71", () => q(6 / 3)],
  ["MA4.3:numeric", "271f97c1", () => q(2 * 1)], // y = cos 2t, |y'| max = 2
  ["MA4.3:warmup", "ef1de3de", () => q(2)],
  ["MA4.3:linear-ode-transfer-1", "9bf7fa7b", () => q(3 * Math.exp(-2 * Math.log(2)))],
  ["MA4.3:linear-ode-transfer-2", "a98cbd36", () => q(2 * Math.exp(Math.log(3)))],
  ["MA4.4:numeric", "492794d0", () => q(1 / Math.sqrt(1 + 2 * 4))],
  ["MA4.4:warmup", "6a50532d", () => q(Math.sqrt(4))], // f' = -2x < 0 at +2
  ["MA4.4:linear-ode-transfer-1", "e6ed1826", () => q(2 * -(2 ** 3))], // dV/dt = x x'
  ["MA4.4:linear-ode-transfer-2", "74bcc7cc", () => q(1 / Math.sqrt(1 + 2 * 1.5))],
  ["MA4.5:numeric", "1c1fd966", () => q((1 + Math.sqrt(1 + 8)) / 2)], // r(r-1)=2
  ["MA4.5:warmup", "12a08bc9", () => q((1 - Math.sqrt(1 + 8)) / 2)],
  ["MA4.5:linear-ode-transfer-1", "234acca8", () => q((1 + Math.sqrt(9)) / 2)],
  ["MA4.5:linear-ode-transfer-2", "5fe3d52a", () => q((1 - Math.sqrt(9)) / 2)],
  ["MA4.6:numeric", "fd3194e3", () => q(2 ** 2)],
  ["MA4.6:warmup", "8992b3a3", () => q(1 ** 2)],
  ["MA4.6:linear-ode-transfer-1", "3823d4a3", () => q(2 ** 2)],
  ["MA4.6:linear-ode-transfer-2", "1a75b531", () => q(PI / 2)],
  ["MA5.1:numeric", "350ba3f8", () => q(3 ** 2 + 2 ** 2 / 2 + 4 ** 2 / 2)], // Parseval
  ["MA5.1:linear-ode-transfer-1", "fd0f9b2a", () => q(2)],
  ["MA5.1:linear-ode-transfer-2", "41e50c9e", () => q((-2 + 4) / 2)],
  ["MA5.2:numeric", "44d7ef59", () => q(2 - -2)],
  ["MA5.2:warmup", "e558e47f", () => q(3)],
  ["MA5.2:linear-ode-transfer-1", "9a154a67", () => q(Math.exp(-(2 ** 2 * 1 ** 2) / 2))],
  ["MA5.2:linear-ode-transfer-2", "d89e4635", () => q(Math.abs(3))],
  ["MA5.3:numeric", "6681750d", () => q(3 / (1 + 2))],
  ["MA5.3:warmup", "954dcb26", () => q(3 * 2 - 4)],
  ["MA5.3:linear-ode-transfer-1", "8a56c768", () => q(1 / (5 - 2))],
  ["MA5.3:linear-ode-transfer-2", "a1979cdd", () => q(2 * 5 - 3)],
  ["MA5.4:numeric", "e75be9d0", () => q(2 * (2 * PI / PI) ** 2)],
  ["MA5.4:warmup", "3756c7d5", () => q((1 * 0.1) / 0.5 ** 2)],
  ["MA5.4:linear-ode-transfer-1", "51e74927", () => q(1 * (2 * PI / PI) ** 2)],
  ["MA5.4:linear-ode-transfer-2", "9dc705c8", () => q(3 * Math.exp(-2 * Math.log(2)))],
  ["MA5.5:numeric", "5a97d3e1", () => q((2 * 3 * PI) / PI)],
  ["MA5.5:warmup", "26346521", () => q(4 / 2)],
  ["MA5.5:linear-ode-transfer-1", "65622259", () => q((2 * 3 * PI) / PI)],
  ["MA5.5:linear-ode-transfer-2", "8bd24c09", () => q(PI / 2 / 2)],
  ["MA5.6:numeric", "1bb89c00", () => q(0.5 * (1 - 0.5))],
  ["MA5.6:warmup", "057a4071", () => q((1 - 2 * 1) - (1 - 2 * 0))],
  ["MA5.6:linear-ode-transfer-1", "fb8e0458", () => q(2 + -2)],
  ["MA5.6:linear-ode-transfer-2", "1b13b729", () => q(2 + 2)],
  ["MA5.7:numeric", "151a0e92", () => q(0.5 * (1 - 0.5))],
  ["MA5.7:warmup", "85280bbc", () => q(-0.5 - 0.5)], // values listed in the order right, left,
  ["MA5.7:linear-ode-transfer-1", "0af8aa3c", () => q(0.25 * (1 - 0.5))],
  ["MA5.7:linear-ode-transfer-2", "7f6fe6c2", () => q((0.5 * (1 - 0.5)) / 2)],

  // --- MA6–MA9, MA13: complex analysis, special functions, probability, variational methods, dynamics (batch 4) ---
  ["MA6.1:numeric", "ed4aff56", () => q(2 * 1)], // Re(2z) at 1+2i
  ["MA6.1:warmup", "1d4e3966", () => q(2 * 3)],
  ["MA6.1:advanced-math-transfer-1", "6d5db0ee", () => q(2 * 2)],
  ["MA6.1:advanced-math-transfer-2", "0a3223e3", () => q(2 ** 2 - 3 ** 2)],
  ["MA6.2:numeric", "a322bbcc", () => q(1)], // z^2/z^3 = 1/z
  ["MA6.2:warmup", "c6de4b97", () => q(-1)],
  ["MA6.2:advanced-math-transfer-1", "275856ec", () => q(2 * PI)],
  ["MA6.2:advanced-math-transfer-2", "897e9e45", () => q(-2 * PI)],
  ["MA6.3:numeric", "2b42063b", () => q(PI / 2 / PI)], // ∫dx/(x²+a²) = π/a
  ["MA6.3:warmup", "c51a8e04", () => q(3)],
  ["MA6.3:advanced-math-transfer-1", "b7fbfd5f", () => q(Math.exp(Math.log(2)))],
  ["MA6.3:advanced-math-transfer-2", "13f5378f", () => q(PI / 2)],
  ["MA6.4:numeric", "dc4ddcb7", () => q(1 / (1 - 2 * 0) + 1 / (1 - 2 * 1))], // residues 1 and -1
  ["MA6.4:warmup", "12f71e4b", () => q(3)],
  ["MA6.4:advanced-math-transfer-1", "62d72809", () => q(1 / (0 - 1))],
  ["MA6.4:advanced-math-transfer-2", "37e951e2", () => q(-1)], // -(1/z)(1 + z + z^2 + z^3 ...)
  ["MA6.5:numeric", "b84a2caf", () => q((2 - 1) / (2 + 1))], // (i)/(3i)
  ["MA6.5:warmup", "5169a562", () => q(Math.hypot(2, 2) ** 2)], // |2(1+i)|^2
  ["MA6.5:advanced-math-transfer-1", "c20c4898", () => q(2 * 3)],
  ["MA6.5:advanced-math-transfer-2", "680ca801", () => q((2 * 2) ** 2)],
  ["MA6.6:numeric", "c7bc690a", () => q(Math.cos(PI))], // sqrt turns by half the angle: e^{i pi}
  ["MA6.6:warmup", "8aeab502", () => q((2 * PI) / PI)],
  ["MA6.6:advanced-math-transfer-1", "e460c796", () => q(2 * 2 * PI)],
  ["MA6.6:advanced-math-transfer-2", "0728b8e6", () => q(Math.log(Math.exp(3)))],
  ["MA7.1:numeric", "a529e134", () => q(4 * 3 * 2 * 1)],
  ["MA7.1:warmup", "21dcb5dc", () => q((1 * 2) / (4 * 3 * 2 * 1))], // Γ(2)Γ(3)/Γ(5)
  ["MA7.1:advanced-math-transfer-1", "2067e3ac", () => q(5 * 4 * 3 * 2 * 1)],
  ["MA7.1:advanced-math-transfer-2", "f52aeea0", () => q((1 * 2) / 24)],
  ["MA7.2:numeric", "de4f5707", () => q((3 * 0 ** 2 - 1) / 2)],
  ["MA7.2:warmup", "02dad7d3", () => q(2 * 2 + 1)],
  ["MA7.2:advanced-math-transfer-1", "ea23f5f2", () => q((3 * 0 ** 2 - 1) / 2)],
  ["MA7.2:advanced-math-transfer-2", "49f6981a", () => q((2 * 1 ** 3 - 2 * 1) / 2)], // ∫(3x²-1)/2 = [x³/2 - x/2]
  ["MA7.3:numeric", "c4bf5df7", () => q((3 * 2.4) / 2)], // ω = c x / a
  ["MA7.3:warmup", "8d9736d4", () => q(1)],
  ["MA7.3:advanced-math-transfer-1", "5345e1b8", () => q(1)],
  ["MA7.3:advanced-math-transfer-2", "067ba2c2", () => q(-1 / 4)], // J0 = 1 - x²/4 + ...
  ["MA7.4:numeric", "d5800bc4", () => q(4 * 0 ** 2 - 2)],
  ["MA7.4:warmup", "82d3276e", () => q(1 + 2 - 1)], // L_1^(α)(x) = 1 + α - x
  ["MA7.4:advanced-math-transfer-1", "7fceb784", () => q(4 * 1 ** 2 - 2)],
  ["MA7.4:advanced-math-transfer-2", "b05b0f8b", () => q(Math.sqrt(2 / 4))],
  ["MA7.5:numeric", "8bd0385b", () => q(Math.sqrt(PI / 4) / Math.sqrt(PI))],
  ["MA7.5:warmup", "a0ffc726", () => q(16 ** -0.25)],
  ["MA7.5:advanced-math-transfer-1", "1e1e9f0c", () => q(Math.sqrt((2 * PI) / 2))],
  ["MA7.5:advanced-math-transfer-2", "23bc3718", () => q(Math.sqrt(1 / 4))],
  ["MA8.1:numeric", "3594960d", () => q(1 / 0.2)],
  ["MA8.1:warmup", "95e7bf03", () => q((0.1 - 0.05) / 0.2)],
  ["MA8.1:advanced-math-transfer-1", "dfcc14a1", () => q(0.4 * 0.5)],
  ["MA8.1:advanced-math-transfer-2", "c5dde2cb", () => q(0.1 / 0.25)],
  ["MA8.2:numeric", "7d795172", () => q(2 / Math.sqrt(100))],
  ["MA8.2:warmup", "10f7b70b", () => q(4 / 100 / 1 ** 2)], // Var(mean)/ε²
  ["MA8.2:advanced-math-transfer-1", "f28bb0a8", () => q(3 / Math.sqrt(36))],
  ["MA8.2:advanced-math-transfer-2", "910d0cad", () => q(2 ** 2)],
  ["MA8.3:numeric", "5995b2ee", () => q(3 * 2)],
  ["MA8.3:warmup", "872f0b2a", () => q(1 / 4)],
  ["MA8.3:advanced-math-transfer-1", "a5c42baf", () => q(Math.exp(-2))],
  ["MA8.3:advanced-math-transfer-2", "a03f35fa", () => q(3 * 2)],
  ["MA8.4:numeric", "32b05ab3", () => q(4 + 3 ** 2)],
  ["MA8.4:warmup", "20759e24", () => q((1.96 * 2) / Math.sqrt(100))],
  ["MA8.4:advanced-math-transfer-1", "3a5928c9", () => q((12 - 10) / (4 / Math.sqrt(16)))],
  ["MA8.4:advanced-math-transfer-2", "f3b562d8", () => q(1.96 * 0.5)],
  ["MA8.5:numeric", "a6757a77", () => q(1 + 3)],
  ["MA8.5:warmup", "4d443fd7", () => q((1 + 3) / (1 + 3 + 1 + 1))],
  ["MA8.5:advanced-math-transfer-1", "a5695ffb", () => q((1 + 3) / (1 + 3 + 1 + 1))],
  ["MA8.5:advanced-math-transfer-2", "3758d0d4", () => q(3 + 2)],
  ["MA8.6:numeric", "6115e145", () => q(Math.min(1, 0.25))],
  ["MA8.6:warmup", "197f2c86", () => q(1000 / 5)],
  ["MA8.6:advanced-math-transfer-1", "ad05c5f2", () => q(Math.min(1, 0.25))],
  ["MA8.6:advanced-math-transfer-2", "1241d131", () => q(Math.min(1, 4))],
  ["MA8.7:numeric", "019c73d3", () => q(2 * 3 * Math.hypot(0.1 / 2, 0.2 / 3))],
  ["MA8.7:warmup", "53d6718c", () => q(2 * 3)],
  ["MA8.7:advanced-math-transfer-1", "71d34f91", () => q(2 / Math.sqrt(2))],
  ["MA8.7:advanced-math-transfer-2", "85254e79", () => q(1 / 1 / (1 / 1 + 1 / 4))],
  ["MA9.1:numeric", "e8a0bcae", () => q((2 * 2) / 2)],
  ["MA9.1:warmup", "bf0f9275", () => q((3 - 0) / (1 - 0))],
  ["MA9.1:advanced-math-transfer-1", "69d7f5ef", () => q(-4 * 3)], // q'' = -4q
  ["MA9.1:advanced-math-transfer-2", "70572a41", () => q(0)],
  ["MA9.2:warmup", "9f75b340", () => q(6 * 0.5 * (1 - 0.5))],
  ["MA9.2:advanced-math-transfer-1", "dfb43187", () => q(4 / 2)],
  ["MA9.2:advanced-math-transfer-2", "abac0b36", () => q(2 ** 2 + 2 ** 2)],
  ["MA9.3:numeric", "de066a4d", () => q(2 * (3 * 4 - 0 * 0))],
  ["MA9.3:warmup", "79157d11", () => q(3 * 2)],
  ["MA9.3:advanced-math-transfer-1", "c2a575e4", () => q(0.5 * 3 ** 2 * 2 ** 2)], // ω²A²/2 at t=0
  ["MA9.3:advanced-math-transfer-2", "df897383", () => q(2 * 3)],
  ["MA13.1:numeric", "ba4b883f", () => q(3)],
  ["MA13.1:warmup", "3787c688", () => q(1)],
  ["MA13.1:structure-transfer-1", "c3a19e46", () => q(1 - 1 / 2)],
  ["MA13.1:structure-transfer-2", "54c0fef5", () => q(2 - 2)], // f' = 2 - r
  ["MA13.2:numeric", "305b7022", () => q(3 - 2 ** 2 / 2)],
  ["MA13.2:warmup", "896b6c96", () => q(2 ** 2 / 2)],
  ["MA13.2:structure-transfer-1", "e2f77950", () => q(3 / 2)], // D/κ
  ["MA13.2:structure-transfer-2", "a92bc2db", () => q(Math.sqrt(0.25))],
  ["MA13.3:numeric", "3628478b", () => q(2 ** 3)],
  ["MA13.3:warmup", "4c570429", () => q(1 / 2)],
  ["MA13.3:structure-transfer-1", "7572d8a6", () => q(Math.exp(2 * Math.log(2)))],
  ["MA13.3:structure-transfer-2", "7b7d7cbb", () => q(Math.exp(-1 * Math.log(3)))],
  ["MA13.4:numeric", "49dfeb07", () => q((-PI / 2) / PI)],
  ["MA13.4:warmup", "4307588f", () => q((4 * PI) / (2 * PI))],
  ["MA13.4:structure-transfer-1", "7ae4bdc8", () => q(-PI / 2)],
  ["MA13.4:structure-transfer-2", "15c8f2c4", () => q(2 * PI)],

  // --- CP: computing track (batch 5) ---
  ["CP1.1:n1", "5e08e82c", () => q(3 * 3)],
  ["CP1.1:warmup", "cb8f0800", () => q(4 * 5)],
  ["CP1.1:transfer-model-check", "93d6fbbf", () => q(3)],
  ["CP1.1:computing-transfer-1", "049642f5", () => q(1 * 4 + 2 * 5 + 3 * 6)],
  ["CP1.1:computing-transfer-2", "abd28af1", () => q(3)],
  ["CP1.2:n1", "be5673bc", () => q(3)],
  ["CP1.2:warmup", "eea11c0a", () => q(-2)],
  ["CP1.2:transfer-model-check", "79180536", () => q(12 / Math.sqrt(36))],
  ["CP1.2:computing-transfer-1", "e2fa5240", () => q(0.2 / 0.5)],
  ["CP1.2:computing-transfer-2", "09444772", () => q(2 * 0.3)],
  ["CP1.3:n1", "95771596", () => q(((0 + 1) / 2) * 1)],
  ["CP1.3:warmup", "61c40c33", () => q((2.1 ** 3 - 1.9 ** 3) / 0.2)],
  ["CP1.3:transfer-model-check", "2bce63b6", () => q(0.5 * (0 / 2 + 0.5 ** 2 + 1 / 2))],
  ["CP1.3:computing-transfer-1", "0b4098fe", () => q((1.1 ** 3 - 0.9 ** 3) / 0.2)],
  ["CP1.3:computing-transfer-2", "6ff3c335", () => q(0.5 ** 2)], // error ∝ h²
  ["CP1.4:n1", "2debf8b7", () => q(1 - 10 * 0.05)],
  ["CP1.4:warmup", "0305224e", () => q(1 - 4 * 0.1)],
  ["CP1.4:transfer-model-check", "6510614f", () => q((1 - 4 * 0.1) ** 4)],
  ["CP1.4:computing-transfer-1", "928fbd9b", () => q(1 - 2 * 0.25)],
  ["CP1.4:computing-transfer-2", "7b18deb2", () => q(1 - 1 + 1 / 2 - 1 / 6 + 1 / 24)],
  ["CP1.5:n1", "3bf4f091", () => q(1e-6 / 1e-6)],
  ["CP1.5:warmup", "64bd2372", () => q(1e-4 / 1e-8)],
  ["CP1.5:transfer-model-check", "34c3b8a5", () => q(1 / 0.001)],
  ["CP1.5:computing-transfer-1", "d9444c69", () => q(1 / 0.01)],
  ["CP1.5:computing-transfer-2", "a56c60af", () => q(0.001 / 0.01)],
  ["CP1.6:n1", "4da002dd", () => q(Math.sqrt((-3) ** 2))],
  ["CP1.6:warmup", "9c30a059", () => q(Math.sqrt((-5) ** 2))],
  ["CP1.6:transfer-model-check", "4b145b18", () => q(3 * 2 ** 2)],
  ["CP1.6:computing-transfer-1", "bc03e673", () => q(Math.sqrt((-3) ** 2))],
  ["CP1.6:computing-transfer-2", "cc3d4c34", () => q(1 + 1)], // (x-1)(x+1)/(x-1)
  ["CP2.1:numeric", "2bfba132", () => q((1 * 0.01) / 0.2 ** 2)],
  ["CP2.1:warmup", "c72f0633", () => q((1 * 0.01) / 0.1 ** 2)],
  ["CP2.1:computing-transfer-1", "c573df45", () => q((1 * 0.1) / 0.5 ** 2)],
  ["CP2.1:computing-transfer-2", "e35cba87", () => q(1 - 4 * 0.5 * 1 ** 2)], // 1 - 4 r sin²(kΔx/2), sin² = 1
  ["CP2.2:numeric", "87df0486", () => q(1000 / 5)],
  ["CP2.2:warmup", "83e04147", () => q(Math.min(1, 0.2))],
  ["CP2.2:computing-transfer-1", "c3cc65f9", () => q(Math.sqrt((0.5 * 0.5) / 100))],
  ["CP2.2:computing-transfer-2", "197539fa", () => q(1000 / 5)],
  ["CP2.3:numeric", "fa601c90", () => q(0.2 * 10)],
  ["CP2.3:warmup", "d93ca56f", () => q(1 / 0.05)],
  ["CP2.3:computing-transfer-1", "9b5f7dd2", () => q(1 / (20 / 1000))],
  ["CP2.3:computing-transfer-2", "41365820", () => q(0.5 * 3600)],
  ["CP2.4:numeric", "9ba20030", () => q(((1 - 2) ** 2 + (3 - 1) ** 2) / 2)],
  ["CP2.4:warmup", "5b6e06ba", () => q(95 / 100)],
  ["CP2.4:computing-transfer-1", "258b0f6f", () => q(((1 - 2) ** 2 + (3 - 1) ** 2) / 2)],
  ["CP2.4:computing-transfer-2", "651f2116", () => q(20 / 100)],
  ["CP2.5:numeric", "75e22467", () => q(1 / (1 - 0.8 + 0.8 / 4))],
  ["CP2.5:warmup", "3cc35b3b", () => q(1 / (1 - 0.8))],
  ["CP2.5:computing-transfer-1", "5d0bca94", () => q(1 / (1 - 0.8 + 0.8 / 4))],
  ["CP2.5:computing-transfer-2", "be2a24c7", () => q(1 / (1 - 0.9))],

  // --- CH leftovers whose prompts are self-contained (batch 5) ---
  ["CH2.1:physical-chemistry-transfer-1", "3d99dcde", () => q(-1 - 0.5)],
  ["CH2.1:physical-chemistry-transfer-2", "a6797a80", () => q((2 - 0) / 2)],
  ["CH4.7:numeric", "a0501575", () => q(6 * -0.4)],
  ["CH4.7:warmup", "3d9d36e6", () => q(4 * -0.4 + 2 * 0.6)],
  ["CH4.7:chemistry-transfer-1", "0ef6df91", () => q(3 * -0.4)],
  ["CH4.7:chemistry-transfer-2", "46cf5241", () => q(6 * -0.4)],
  ["CH4.8:numeric", "4f77394a", () => q(Math.sqrt(8 / 2))],
  ["CH4.8:warmup", "e4346dfd", () => q(1 / Math.sqrt(4))],
  ["CH4.8:chemistry-transfer-1", "340980e7", () => q(1 / Math.sqrt(2))],
  ["CH4.8:chemistry-transfer-2", "5b3b2f46", () => q(2 ** 2)],
  ["CH5.1:numeric", "b77eb6c8", () => q(-7 - -10)],
  ["CH5.1:warmup", "a48f1c3b", () => q(8 - 1)],
  ["CH5.1:chemistry-transfer-1", "c6efe3e3", () => q(1 / 2)],
  ["CH5.1:chemistry-transfer-2", "7f6d501f", () => q((13.6 * 2 ** 2) / 1 ** 2)],
  ["CH5.2:numeric", "02c278cd", () => q(8 - 2)],
  ["CH5.2:warmup", "08e59e84", () => q(8 - 3)],
  ["CH5.2:chemistry-transfer-1", "b6a23a0e", () => q(1 - 3 * -1)],
  ["CH5.2:chemistry-transfer-2", "77375b63", () => q(8 - 2)],
  ["CH5.3:numeric", "eaf48a1e", () => q(2 * 3 + 1)],
  ["CH5.3:warmup", "2194146a", () => q(2 * (2 * 3 + 1))],
  ["CH5.3:chemistry-transfer-1", "28606f4d", () => { const J = 0.5, S = 0.5, L = 0; return q(1 + (J * (J + 1) + S * (S + 1) - L * (L + 1)) / (2 * J * (J + 1))); }],
  ["CH5.3:chemistry-transfer-2", "1040d535", () => { const J = 1.5, S = 0.5, L = 1; return q(1 + (J * (J + 1) + S * (S + 1) - L * (L + 1)) / (2 * J * (J + 1))); }],
  ["CH5.4:numeric", "cbfa97f2", () => q(4 + 2 * -2)],
  ["CH5.4:warmup", "b7e3063f", () => q(4 + 4 * -2)],
  ["CH5.4:chemistry-transfer-1", "22d6e121", () => q(4 / 1)],
  ["CH5.4:chemistry-transfer-2", "5ed3615c", () => q((4 * 1) / 2)],
  ["CH6.1:numeric", "7abd3d3b", () => q(10 ** (10 - 5))],
  ["CH6.1:warmup", "b543401d", () => q(1 / 100000)],
  ["CH6.1:chemistry-transfer-1", "ede47ede", () => q(5 + Math.log10(10))],
  ["CH6.1:chemistry-transfer-2", "43ee8cee", () => q(10 ** (5 - 5))],
  ["CH6.2:numeric", "f73d549f", () => q(2 ** 2)],
  ["CH6.2:warmup", "65d290fc", () => q(3)], // (R,R), (S,S) and meso
  ["CH6.3:numeric", "42423c3f", () => q(-1 + 0)],
  ["CH6.3:warmup", "580d0330", () => q(2)],
  ["CH6.3:chemistry-transfer-1", "4f4d023f", () => q(-1 + 0)],
  ["CH6.3:chemistry-transfer-2", "0b1ffe3d", () => q(2)],
  ["CH6.4:numeric", "add5a881", () => q(2 * 0.1 * 0.2)],
  ["CH6.4:warmup", "59ff4205", () => q((2 * 2) / 1)],
  ["CH6.4:chemistry-transfer-1", "f5f8462b", () => q(2)],
  ["CH6.4:chemistry-transfer-2", "9fddd7b3", () => q(1)],
  ["CH6.5:numeric", "14a8a161", () => q((2 * 3 + 2 - 6) / 2)],
  ["CH6.5:warmup", "e7fb017b", () => q(2)],
  ["CH6.5:chemistry-transfer-1", "31394511", () => q(2 / (1 + 2))],
  ["CH6.5:chemistry-transfer-2", "edcb9a36", () => q(-1 * Math.log(4))],
  ["CH6.6:numeric", "629af6cd", () => q(6)],
  ["CH6.6:warmup", "0761cd2c", () => q((6 - 2) / 4)],
  ["CH6.6:chemistry-transfer-1", "3479132b", () => q(0 + 2 * -1 * Math.cos((2 * PI * 0) / 6))],
  ["CH6.6:chemistry-transfer-2", "bc406d1e", () => q(0 + 2 * -1 * Math.cos((2 * PI * 1) / 6))],
  ["CH6.7:numeric", "aa6c5960", () => q(-Math.log10(0.1))],
  ["CH6.7:warmup", "beb8d271", () => q(1 / 2)],
  ["CH6.7:chemistry-transfer-1", "254d22e2", () => q(2 * 0.5 * 3)],
  ["CH6.7:chemistry-transfer-2", "4e5f5d05", () => q(10 ** -2)],
  ["CH6.8:numeric", "bce75659", () => q(6 / 2)],
  ["CH6.8:warmup", "1d61f37f", () => q(1 / 2)],
  ["CH6.8:chemistry-transfer-2", "daea8a0a", () => q(Math.exp(-1 * 2 * Math.log(2)))],

  // --- AS leftovers: later astronomy tracks (batch 6) ---
  ["AS10.1:numeric", "65c8f7e8", () => q((3 / 2) ** 2)],
  ["AS10.1:warmup", "fd6fea67", () => q(3)],
  ["AS10.1:astro-transfer-1", "62bbfd79", () => q(1 - 0.95 ** 2)],
  ["AS10.1:astro-transfer-2", "ecfe4d23", () => q(10)],
  ["AS10.2:numeric", "123c2b05", () => q((2 / 1 ** 2 + 4 / 2 ** 2) / (1 / 1 ** 2 + 1 / 2 ** 2))],
  ["AS10.2:warmup", "4de12451", () => q(1 / 1 ** 2 / (1 / 2 ** 2))],
  ["AS10.2:astro-transfer-1", "a0bbe7ab", () => q(1 / (1 + Math.exp(0)))],
  ["AS10.2:astro-transfer-2", "1aed5cef", () => q(1000 * 0.2)],
  ["AS10.3:numeric", "2eb5d388", () => q((0.5 * 0.8) / (0.5 * 0.8 + 0.5 * 0.2))],
  ["AS10.3:warmup", "6ebaaea7", () => q((0.2 * 0.8) / (0.2 * 0.8 + 0.8 * 0.2))],
  ["AS10.3:astro-transfer-1", "6cb9d8f7", () => q((0.2 * 4) / (0.2 * 4 + 0.8))],
  ["AS10.3:astro-transfer-2", "0bf13891", () => q((0.5 * 9) / (0.5 * 9 + 0.5))],
  ["AS10.4:numeric", "9346846e", () => q((12 - 10) / 2)],
  ["AS10.4:warmup", "7264776b", () => q((12 - 10) / 10)],
  ["AS10.4:astro-transfer-1", "75cec72f", () => q((12 - 10) / 0.5)],
  ["AS10.4:astro-transfer-2", "246822bc", () => q(1 ** 2 + 2 ** 2)],
  ["AS2.6:numeric", "367aa9ac", () => q(1000 - 10 * 20)],
  ["AS3.4:warmup", "131168e5", () => q(2 ** 2 / (1 * 0.25))],
  ["AS4.4:warmup", "ea8ffeb2", () => q(1 / 0.5)],
  ["AS5.2:astro-transfer-2", "beab0098", () => q(2 ** (3 + 1))],
  ["AS5.3:numeric", "c5801a34", () => q(0.1 * 2 * 10)],
  ["AS5.3:warmup", "5a9d1936", () => q(100 * 0.02)],
  ["AS5.3:astro-transfer-1", "20aeeb71", () => q((10 * 2) / (1 + 1))],
  ["AS5.3:astro-transfer-2", "6b97ba51", () => q(1 / 2)],
  ["AS5.4:numeric", "43a8f28b", () => q(2 ** 3)],
  ["AS5.4:warmup", "56f2b3ca", () => q(0.5 ** 3)],
  ["AS5.4:astro-transfer-1", "671d265b", () => q(6 / (1 * 3))],
  ["AS5.4:astro-transfer-2", "4323b711", () => q(2)],
  ["AS5.5:warmup", "e03384fa", () => q(2)],
  ["AS5.5:astro-transfer-1", "0ca31243", () => q(2 ** (11 / 3))],
  ["AS5.5:astro-transfer-2", "d62850c2", () => q(8 ** (5 / 3))],
  ["AS5.6:numeric", "6c4601ac", () => q(2 * 3 * 4)],
  ["AS5.6:warmup", "96372c23", () => q(0.1 * 2)],
  ["AS5.6:astro-transfer-1", "496cfcb9", () => q(1 - Math.exp(-Math.log(2)))],
  ["AS5.6:astro-transfer-2", "6bcbfdc2", () => q(3 + 1)],
  ["AS6.1:numeric", "6ad278c5", () => q(10 * 100)],
  ["AS6.1:warmup", "1081e80b", () => q(10 / 1)],
  ["AS6.1:astro-transfer-1", "65fb4000", () => q(3000 / 100)],
  ["AS6.1:astro-transfer-2", "5d19c593", () => q(1 / 100)],
  ["AS6.2:numeric", "dcb7acf5", () => q(8 ** (1 / 3))],
  ["AS6.2:warmup", "3607a0aa", () => q(1 / 0.2)],
  ["AS6.2:astro-transfer-1", "3e057165", () => q(8 ** (1 / 3))],
  ["AS6.2:astro-transfer-2", "521dbdca", () => q(2 ** (-2 / 3))],
  ["AS6.3:numeric", "dc4fa892", () => q(6 / Math.sqrt(1 * 4))],
  ["AS6.3:warmup", "fb011386", () => q((2 * 5) / 1)],
  ["AS6.3:astro-transfer-1", "e61b6858", () => q(3)],
  ["AS6.3:astro-transfer-2", "5ce97ed9", () => q(1 / Math.sqrt(16))],
  ["AS6.4:numeric", "538161a8", () => q(2 * 4)],
  ["AS6.4:warmup", "73dbcbbd", () => q(32 ** (2 / 5))],
  ["AS6.4:astro-transfer-1", "d6458b57", () => q((5 / 3 + 1) / (5 / 3 - 1))],
  ["AS6.4:astro-transfer-2", "ecc545cd", () => { const g = 5 / 3, M = 3; return q(((g + 1) * M ** 2) / ((g - 1) * M ** 2 + 2)); }],
  ["AS6.5:numeric", "1ad0c1b3", () => q(Math.exp(Math.log(2) * 1))],
  ["AS6.5:warmup", "f1f61b4f", () => q(2 ** 2)],
  ["AS6.5:astro-transfer-1", "6ba90e46", () => q(2 ** 2)],
  ["AS6.5:astro-transfer-2", "b62f5ef6", () => q(1 / 5)],
  ["AS7.1:numeric", "b18ab913", () => q(4 ** 1.5)],
  ["AS7.1:warmup", "af4846ef", () => q(Math.sqrt(2))],
  ["AS7.1:astro-transfer-1", "0fd4e160", () => q(Math.sqrt(4))],
  ["AS7.1:astro-transfer-2", "aa2d0a0a", () => q(Math.sqrt(2))],
  ["AS7.2:numeric", "e3e5b714", () => q(6 / (2 * 3))],
  ["AS7.2:warmup", "ca32bf50", () => q(1 / 0.5)],
  ["AS7.2:astro-transfer-1", "e6759898", () => q(2 / 2)],
  ["AS7.2:astro-transfer-2", "b6c5d659", () => q(Math.exp(-2))],
  ["AS7.3:numeric", "8881d3ae", () => q(6 * Math.cbrt(1 / (3 * 72)))],
  ["AS7.3:warmup", "1c40a277", () => q(Math.cbrt(8))],
  ["AS7.3:astro-transfer-1", "d96fc65d", () => q(2 / 8)],
  ["AS7.3:astro-transfer-2", "4721b78f", () => q(2 ** 3)],
  ["AS7.4:numeric", "00d2a1e1", () => q(0.1 ** 2)],
  ["AS7.4:warmup", "a83f5c0f", () => q(0.2)],
  ["AS7.4:astro-transfer-1", "3c3a9915", () => q(0.1 ** 2)],
  ["AS7.4:astro-transfer-2", "73e8433d", () => q(0.02 / 2)],
  ["AS7.5:numeric", "79eace64", () => q(400 * 0.5 * (1 - 0) ** 0.25)],
  ["AS7.5:warmup", "13372031", () => q((1 / 16) ** 0.25)],
  ["AS7.5:astro-transfer-1", "134c4169", () => q(16 ** 0.25)],
  ["AS7.5:astro-transfer-2", "47744f4d", () => q((1 / 16) ** 0.25)],
  ["AS8.1:numeric", "d73f1113", () => q(200 / 10)],
  ["AS8.1:warmup", "a53a51b3", () => q(200 / 20)],
  ["AS8.1:astro-transfer-1", "70e5294b", () => q(Math.exp(-2))],
  ["AS8.2:numeric", "25534890", () => q((2 ** 2 * 3) / 1)],
  ["AS8.2:warmup", "94b64848", () => q(2 ** 2)],
  ["AS8.2:astro-transfer-1", "1b237572", () => q((0.1 * 1000) / Math.log(1000))],
  ["AS8.2:astro-transfer-2", "a7ec3d70", () => q(12 / 3)],
  ["AS8.3:numeric", "f787f966", () => q((4 ** 2 * 3) / 2)],
  ["AS8.3:warmup", "3e8270ca", () => q(2)],
  ["AS8.3:astro-transfer-1", "4dc9044a", () => q((2 ** 2 * 3) / 1)],
  ["AS8.3:astro-transfer-2", "913b3945", () => q(9 ** -0.5)],
  ["AS8.4:numeric", "8855eed7", () => q(2 ** 4)],
  ["AS8.4:warmup", "89b0bb0c", () => q(1 / 2)],
  ["AS8.4:astro-transfer-1", "60bd2e9b", () => q(2 ** 4)],
  ["AS8.4:astro-transfer-2", "5ef591a0", () => q(4 * Math.log10(10))],
  ["AS8.5:numeric", "7d25d871", () => q(12 / 3)],
  ["AS8.5:warmup", "81084147", () => q(3 - 3)],
  ["AS8.5:astro-transfer-1", "d8efc144", () => q(0.02 * Math.log(1 / Math.exp(-1)))],
  ["AS8.5:astro-transfer-2", "b4cda402", () => q(2)],
  ["AS8.6:numeric", "2dfffc54", () => q(Math.sqrt(4 * 9))],
  ["AS8.6:warmup", "89873b98", () => q(Math.sqrt(4))],
  ["AS8.6:astro-transfer-1", "c1c1563f", () => q(Math.sqrt(9))],
  ["AS8.6:astro-transfer-2", "3f77a622", () => q(Math.sqrt(4))],
  ["AS8.7:numeric", "d8259a86", () => q(6 / (0.2 * 3))],
  ["AS8.7:warmup", "915709df", () => q(0.8 * 10)],
  ["AS8.7:astro-transfer-1", "7c8fb44c", () => q(3)],
  ["AS8.7:astro-transfer-2", "1424c840", () => q(0.2 * 5)],
  ["AS9.1:numeric", "3945528a", () => q(600 / 60)],
  ["AS9.1:warmup", "cd2d4904", () => q((1 + 1) ** 2)],
  ["AS9.1:astro-transfer-1", "01a5b5ae", () => q(70 * 20)],
  ["AS9.1:astro-transfer-2", "16126f21", () => q((1400 + 280 - 1400) / 1400)],
  ["AS9.2:numeric", "ee7236e0", () => q(2 ** -3)],
  ["AS9.2:warmup", "7a6d3a4c", () => q(2 ** -4)],
  ["AS9.2:astro-transfer-1", "90975bde", () => q(0.3 * 0.5 ** -3 + 0.7)],
  ["AS9.2:astro-transfer-2", "e2b20f4f", () => q(2 ** -3)],
  ["AS9.3:numeric", "19fa9d22", () => q((2 * (1 / 7)) / (1 + 1 / 7))],
  ["AS9.3:warmup", "4a980496", () => q(1 / 2)],
  ["AS9.3:astro-transfer-1", "52ac3c43", () => q(1 / 2)],
  ["AS9.3:astro-transfer-2", "49c6c201", () => q(2 ** -4)],
  ["AS9.4:numeric", "afac79d4", () => q(2 / 100)],
  ["AS9.4:warmup", "c5c0ecd3", () => q(0.5)],
  ["AS9.4:astro-transfer-1", "22b8d888", () => q(140 / 14000)],
  ["AS9.4:astro-transfer-2", "dca62294", () => q(PI / 0.01)],
  ["AS9.5:numeric", "300ac401", () => q(6 / 2)],
  ["AS9.5:warmup", "910ddb6b", () => q((6 / 2) ** 2)],
  ["AS9.5:astro-transfer-1", "38e37054", () => q(5)],
  ["AS9.5:astro-transfer-2", "fc0c2217", () => q(0.01 * 8)],
  ["AS9.6:numeric", "5716709b", () => q(Math.log(Math.exp(3)))],
  ["AS9.6:warmup", "7e26a6f9", () => q(2 + 4)],
  ["AS9.6:astro-transfer-1", "8d8188e9", () => q(Math.exp(Math.log(100)))],
  ["AS9.6:astro-transfer-2", "145123e2", () => q(3 + 3)],
  ["AS9.7:numeric", "5fd4cd91", () => q(2 ** 3)],
  ["AS9.7:warmup", "6dd4b21a", () => q(3 * 2 ** 3)],
  ["AS9.7:astro-transfer-1", "87d575fd", () => q(2 ** -3)],
  ["AS9.7:astro-transfer-2", "15c4e006", () => q(3 * (1 + 1 / 3))],
  ["AS9.8:numeric", "2c36e0c9", () => q((74 - 70) / Math.hypot(2, 2))],
  ["AS9.8:warmup", "3fac7f6f", () => q(0.8 * Math.sqrt(0.3 / 0.3))],
  ["AS9.8:astro-transfer-1", "9af5c181", () => q(Math.hypot(2, 2))],
  ["AS9.8:astro-transfer-2", "3662334b", () => q(Math.sqrt(2 ** 2 + 2 ** 2 - 2 * 0.5 * 2 * 2))],

  // --- PH2–PH4: analytical mechanics, continuum, electromagnetism (batch 7) ---
  ["PH2.1:numeric", "58d50441", () => q(10 / 2)],
  ["PH2.1:warmup", "6401b44d", () => q(2 * 3 ** 2 * 4)],
  ["PH2.1:analytical-transfer-1", "5b941517", () => q((-8 * 0.3) / 2)],
  ["PH2.1:analytical-transfer-2", "82948274", () => q(3 * 2 ** 2 * 0.5)],
  ["PH2.1:analytical-transfer-3", "d67dabbc", () => q(6 * 2)], // dF/dt = F'(q) qdot, so Δp = F'(q)
  ["PH2.2:numeric", "9ba5e32e", () => q(2 * 3)],
  ["PH2.2:warmup", "73b0ad50", () => q(2)],
  ["PH2.2:analytical-transfer-1", "8fad18b6", () => q((-3 * 2) / 4)],
  ["PH2.2:analytical-transfer-2", "22e3f41c", () => q((1 * 3 ** 2) / 2)],
  ["PH2.2:analytical-transfer-3", "e6a7551d", () => q(2 * 3 - 1)],
  ["PH2.3:numeric", "7c9b5e62", () => q(2 * 3 ** 2 * 4)],
  ["PH2.3:warmup", "cb09033c", () => q(72 / (2 * 6 ** 2))],
  ["PH2.3:analytical-transfer-1", "eeb53459", () => q(2 * 3 ** 2 * 0.5)],
  ["PH2.3:analytical-transfer-2", "d24530c3", () => q(14 - 4 * 2)],
  ["PH2.3:analytical-transfer-3", "9dae6e7d", () => q(2 * 4 - 1 * 3)],
  ["PH2.4:numeric", "61ac64f2", () => q(4 ** 2 / (2 * 2) + 3 ** 2 / 2)],
  ["PH2.4:warmup", "37947475", () => q(4 / 2)],
  ["PH2.4:analytical-transfer-1", "0be0558a", () => q(2 / 2)],
  ["PH2.4:analytical-transfer-2", "a337b32a", () => q(-8 * 0.5)],
  ["PH2.4:analytical-transfer-3", "ba44d526", () => q((2 * PI * 3) / 2)],
  ["PH2.5:numeric", "455adc52", () => q(2 * 0.5)],
  ["PH2.5:warmup", "fa7c0c9c", () => q(2 * 2)],
  ["PH2.5:analytical-transfer-1", "7a6894ed", () => q(3 * (1 / 3))],
  ["PH2.5:analytical-transfer-2", "f84a83b4", () => q(10 - 2 * 3)], // p = ∂F2/∂q = P + 2q
  ["PH2.5:analytical-transfer-3", "209cbf32", () => q(2 * 3)],
  ["PH2.6:numeric", "4cf7b20e", () => q(6 / 3)],
  ["PH2.6:warmup", "2aa00dff", () => q(3)],
  ["PH2.6:analytical-transfer-1", "c073e004", () => q(10 / 4)],
  ["PH2.6:analytical-transfer-2", "10f9710e", () => q(Math.sqrt(2 * 2 * 9))],
  ["PH2.6:analytical-transfer-3", "cc0cc6c1", () => q(3 + 0.5 * 2 * 2)], // dH/dJ
  ["PH2.7:numeric", "cd7b9bc2", () => q((1 + 2 * 1) / 1)],
  ["PH2.7:warmup", "7080dbcc", () => q(0.5 * 1 * (0.2 ** 2 + 0.2 ** 2))],
  ["PH2.7:analytical-transfer-1", "9e9975b1", () => q(Math.sqrt((16 - 8) / 2))],
  ["PH2.7:analytical-transfer-2", "a4bae160", () => q(Math.sqrt((16 + 8) / 2))],
  ["PH2.7:analytical-transfer-3", "a5fc1e51", () => q(Math.sqrt(1 / (2 * 2)))],
  ["PH3.1:numeric", "cead86b3", () => q(Math.log(0.04 / 0.01) / 2)],
  ["PH3.1:warmup", "5b5a2eb5", () => q(0.04 / 0.01)],
  ["PH3.1:thermal-optics-transfer-1", "99745bc7", () => q(1 - 1 / 4)],
  ["PH3.1:thermal-optics-transfer-2", "b8ba277c", () => q(4 * (1 - 2 * 0.75))],
  ["PH3.2:numeric", "3337fabd", () => q(0.5 * 0.2)],
  ["PH3.2:warmup", "5950af23", () => q(2 * 3 * 0.1)],
  ["PH3.2:thermal-optics-transfer-1", "91c3218e", () => q(200 * 0.01)],
  ["PH3.2:thermal-optics-transfer-2", "d9ba2bf3", () => q(0.5 * 200 * 0.01 ** 2)],
  ["PH3.3:numeric", "6ebb4f97", () => q((2 * 3 * 4) / 6)],
  ["PH3.3:warmup", "5374ef63", () => q((2 * 3 * 8) / 6)],
  ["PH3.3:thermal-optics-transfer-1", "0075aa75", () => q(2 ** 4)],
  ["PH3.3:thermal-optics-transfer-2", "cf03e1b5", () => q((4 * 1 ** 2) / (4 * 1))],
  ["PH3.4:numeric", "f3554102", () => q(Math.sqrt(4 * 9))],
  ["PH3.4:warmup", "3eb2ee93", () => q(8 ** (-5 / 3))],
  ["PH3.4:thermal-optics-transfer-1", "af7cdf25", () => q(Math.sqrt(4))],
  ["PH3.4:thermal-optics-transfer-2", "fde4bac3", () => q(Math.sqrt(10 * 1))],
  ["PH4.1:numeric", "e7920968", () => q((1 * 1) / 2 ** 3)],
  ["PH4.1:warmup", "21bc10a6", () => q(1 / 4 ** 2)],
  ["PH4.1:em-transfer-1", "7af79cad", () => q(3 / 1)],
  ["PH4.1:em-transfer-2", "74ab36f5", () => q((1 * 2) / 2 ** 2)],
  ["PH4.2:numeric", "1e397cb9", () => q(-3)],
  ["PH4.2:warmup", "a5a50eb4", () => q(3 * 1)],
  ["PH4.2:em-transfer-1", "3c46e1d3", () => q(2 / 2 - 2 / 1)],
  ["PH4.2:em-transfer-2", "baeacc8f", () => q(3 * (5 - 2))],
  ["PH4.3:numeric", "7aeb485c", () => q(-((1 * 2 * 2) / (2 * 1) ** 2))], // signed vertical component: attraction points toward the plane,
  ["PH4.3:warmup", "6869d2dc", () => q(-(1 * 2 * 2) / (4 * 1))],
  ["PH4.3:em-transfer-1", "16ebee70", () => q((1 * 1 * 1) / (2 * 2) ** 2)],
  ["PH4.3:em-transfer-2", "fe76d79f", () => q(0)],
  ["PH4.4:numeric", "842f0817", () => q((2 * 1 * 3) / 2 ** 3)],
  ["PH4.4:warmup", "81d0c7e5", () => q(1 / 2 ** 3)],
  ["PH4.4:em-transfer-1", "22b1d1df", () => q(1 / 2 ** 3)],
  ["PH4.4:em-transfer-2", "d928709e", () => q(1 * 2 * 1)],
  ["PH4.5:numeric", "ece09bd6", () => q((1 * 6) / 2)],
  ["PH4.5:warmup", "14c936b4", () => q(0.5 * 6 * 3)],
  ["PH4.5:em-transfer-1", "7d76f6df", () => q((1 * 1) / 0.5)],
  ["PH4.5:em-transfer-2", "a05b9839", () => q(0.5 * 2 * 3 ** 2)],
  ["PH4.6:numeric", "f5265583", () => q(6 / 6)],
  ["PH4.6:warmup", "cb86d22e", () => q(3)],
  ["PH4.6:em-transfer-1", "954e93b5", () => q(1 * 3 * 2)],
  ["PH4.6:em-transfer-2", "ac06c00f", () => q(1 + 3)],
  ["PH4.7:numeric", "83e07efa", () => q((1 * 3) / 2)],
  ["PH4.7:warmup", "f7cab6d7", () => q(1 / 2)],
  ["PH4.7:em-transfer-1", "795a0606", () => q((1 * 3) / 2)],
  ["PH4.7:em-transfer-2", "5a3613d3", () => q(0)],
  ["PH4.8:numeric", "63695cb5", () => q(2 - -2)],
  ["PH4.8:warmup", "020729a4", () => q(3 - 1)],
  ["PH4.8:em-transfer-1", "aacf9cb0", () => q(2 - -2)],
  ["PH4.8:em-transfer-2", "de67e02c", () => q(0)],

  // --- PH5–PH7: radiation, optics, thermodynamics and statistical mechanics (batch 8) ---
  ["PH5.1:numeric", "5b1dcac5", () => q(-3)], // emf = -dΦ/dt
  ["PH5.1:warmup", "a493be21", () => q(1 * 4)],
  ["PH5.1:em-transfer-1", "bdaa053b", () => q(-(6 * 2))],
  ["PH5.1:em-transfer-2", "49e0173e", () => q(1 * 5)],
  ["PH5.2:numeric", "49bde041", () => q(6 / 2)],
  ["PH5.2:warmup", "7e37f5af", () => q((2 * 6) / 2)],
  ["PH5.2:em-transfer-1", "46a12783", () => q((3 * 2) / 1)],
  ["PH5.2:em-transfer-2", "18f86260", () => q(4 ** 2 / 2)],
  ["PH5.3:numeric", "f1514bcd", () => q(1 / Math.sqrt(4 * 1))],
  ["PH5.3:warmup", "3af7ff47", () => q(Math.sqrt(1 / 4))],
  ["PH5.3:em-transfer-1", "9d18bb6f", () => q(1 / Math.sqrt(4 * 1))],
  ["PH5.3:em-transfer-2", "8ef34437", () => q(1 / 2)],
  ["PH5.4:numeric", "66cece49", () => q(((3 - 1) / (3 + 1)) ** 2)],
  ["PH5.4:warmup", "f11f870f", () => q(1 - ((3 - 1) / (3 + 1)) ** 2)],
  ["PH5.4:em-transfer-1", "e499d2e6", () => q(((1.5 - 1) / (1.5 + 1)) ** 2)],
  ["PH5.4:em-transfer-2", "0380f7b7", () => q(1 / 2)],
  ["PH5.5:numeric", "a06f020a", () => q(10 - 6 / 2)],
  ["PH5.5:warmup", "4748ab7d", () => q(6 / 2)],
  ["PH5.5:em-transfer-1", "ad91bea5", () => q(6 / 3)],
  ["PH5.5:em-transfer-2", "1680a26f", () => q(-(2 * 2 * 3))], // -∂(x t²)/∂t
  ["PH5.6:numeric", "939cfd6a", () => q(2 ** 2)],
  ["PH5.6:warmup", "1763ab9c", () => q(2 ** 4)],
  ["PH5.6:em-transfer-1", "3d4843bd", () => q(3 ** 2)],
  ["PH5.6:em-transfer-2", "b5bfa45d", () => q(2 ** 2)],
  ["PH5.7:numeric", "71d759d0", () => q(3 ** 2 - 2 ** 2 * 1 ** 2)],
  ["PH5.7:warmup", "3f67c8b7", () => q(0)],
  ["PH5.7:em-transfer-1", "623ef9a3", () => q(5 ** 2 - 3 ** 2)],
  ["PH5.7:em-transfer-2", "3dfe3a67", () => q(0)],
  ["PH5.8:numeric", "9320a3ba", () => q(Math.sqrt(5 ** 2 - 3 ** 2) / 2)],
  ["PH5.8:warmup", "3904ed56", () => q((2 ** 2 * 2) / 5)],
  ["PH5.8:em-transfer-1", "bef1b47e", () => q(Math.sqrt(3 ** 2 + 1 * 4 ** 2))],
  ["PH5.8:em-transfer-2", "d7899da7", () => q((1 * 4) / 5)],
  ["PH6.1:numeric", "f0f07bbc", () => q((2 * 1 + 1 ** 2) / 1)],
  ["PH6.1:warmup", "cb59e49b", () => q(2 + 2 * 1)],
  ["PH6.1:thermal-optics-transfer-1", "4e98997c", () => q((2 * 1 + 1 ** 3) / 1)],
  ["PH6.1:thermal-optics-transfer-2", "df4e4f3d", () => q(2 + 3 * 1 ** 2)],
  ["PH6.2:numeric", "523111b0", () => q((1 + 1) ** 2)],
  ["PH6.2:warmup", "666a22fe", () => q(0.01 / 1)],
  ["PH6.2:thermal-optics-transfer-1", "83f8ea3e", () => q((1 + 1) ** 2)],
  ["PH6.2:thermal-optics-transfer-2", "75a519c3", () => q(Math.round(((1 + Math.cos(PI)) ** 2 + Math.sin(PI) ** 2) * 1e9) / 1e9)], // |1 + e^{iπ}|²
  ["PH6.3:numeric", "3e7048f1", () => q((8 - 2) / (8 + 2))],
  ["PH6.3:warmup", "ed4320b5", () => q(0.6)],
  ["PH6.3:thermal-optics-transfer-1", "5eec41b1", () => q((9 - 1) / (9 + 1))],
  ["PH6.3:thermal-optics-transfer-2", "f7dd70ad", () => q(2 * 1 * (1 + 0.5))],
  ["PH6.4:numeric", "96710b6c", () => q(Math.cos((60 * PI) / 180) ** 2)],
  ["PH6.4:warmup", "f84282cf", () => q(1 / (4 * 0.1))],
  ["PH6.4:thermal-optics-transfer-1", "5cf92657", () => q(8 * Math.cos((60 * PI) / 180) ** 2)],
  ["PH6.4:thermal-optics-transfer-2", "89580705", () => q(500 / (4 * 0.01))],
  ["PH6.5:numeric", "d71709ab", () => q(Math.log(1 / 0.25) / (2 * 1))],
  ["PH6.5:warmup", "a19bfa93", () => q(2)],
  ["PH6.5:thermal-optics-transfer-2", "f9534f24", () => q(1 / 2)],
  ["PH7.1:numeric", "2c09e67e", () => q(100 - 60)],
  ["PH7.1:warmup", "4c5d9516", () => q(1 - 300 / 500)],
  ["PH7.1:thermal-optics-transfer-1", "4ce81abe", () => q(2 * Math.log(2))],
  ["PH7.1:thermal-optics-transfer-2", "5171a377", () => q(2 / 4)],
  ["PH7.10:numeric", "1181dca3", () => q(2 * 3)],
  ["PH7.10:warmup", "e7a68dce", () => q(2 * 6 * 2)],
  ["PH7.10:thermal-optics-transfer-1", "9253cb4b", () => q(1 - Math.exp(-2 * 1 * Math.log(2)))],
  ["PH7.10:thermal-optics-transfer-2", "46f09c45", () => q(1)],
  ["PH7.2:numeric", "cbcd81e9", () => q(3 * 4)],
  ["PH7.2:warmup", "c51c5651", () => q(2 * 4)],
  ["PH7.2:thermal-optics-transfer-1", "e2cd61d9", () => q(Math.sqrt(3))],
  ["PH7.2:thermal-optics-transfer-2", "218c8223", () => q(Math.sqrt(3 / 2))],
  ["PH7.3:numeric", "2fe92eac", () => q((4 * 3) / 2)],
  ["PH7.3:warmup", "1ef9998a", () => q(((4 * 3) / 2) / 4)],
  ["PH7.3:thermal-optics-transfer-1", "1bec966d", () => q(Math.log(4))],
  ["PH7.3:thermal-optics-transfer-2", "7810360d", () => q(3 * 5)],
  ["PH7.4:numeric", "32f2a223", () => q((1 / 3) / (1 + 1 / 3))],
  ["PH7.4:warmup", "f97f988a", () => q(1 ** 2 * 0.25 * (1 - 0.25))],
  ["PH7.4:review-core-transfer", "77bf5e12", () => q((3 * (1 / 3)) / (1 + 3 * (1 / 3)))],
  ["PH7.4:thermal-optics-transfer-1", "eb3f82ff", () => q((1 / 3) / (1 + 1 / 3))],
  ["PH7.4:thermal-optics-transfer-2", "776a04e5", () => q(1 ** 2 * 0.25 * 0.75)],
  ["PH7.5:numeric", "bfa55749", () => q(3 / (1 + 3))],
  ["PH7.5:warmup", "97fdbba9", () => q((3 / 4) * (1 - 3 / 4))],
  ["PH7.5:thermal-optics-transfer-1", "85ef6085", () => q(1 / (Math.exp(0) + 1))],
  ["PH7.5:thermal-optics-transfer-2", "585bcc61", () => q(Math.exp(1 * Math.log(2)))],
  ["PH7.6:numeric", "d1afcb6d", () => q(1 / (3 + 1))],
  ["PH7.6:warmup", "cd266eb7", () => q(1 / (3 - 1))],
  ["PH7.6:review-core-transfer", "5b174df1", () => q(0.5 * (0.5 + 1))],
  ["PH7.6:thermal-optics-transfer-1", "fb39a289", () => q(1 / (Math.exp(Math.log(3)) + 1))],
  ["PH7.6:thermal-optics-transfer-2", "aff46cbe", () => q(1 / (Math.exp(Math.log(3)) - 1))],
  ["PH7.7:numeric", "59d9d354", () => q(2 ** 4)],
  ["PH7.7:warmup", "ec14fc4d", () => q(2 ** 3)],
  ["PH7.7:thermal-optics-transfer-1", "520de7ac", () => q(3 ** 3)],
  ["PH7.7:thermal-optics-transfer-2", "53587cd0", () => q(2 ** 4)],
  ["PH7.8:numeric", "8a50a27f", () => q(Math.sqrt(4 / 1))],
  ["PH7.8:warmup", "62e5170b", () => q(-4 + 3 * 1 * 2 ** 2)],
  ["PH7.8:thermal-optics-transfer-1", "ced48e19", () => q(Math.sqrt((-1 * -2) / (2 * 1)))],
  ["PH7.8:thermal-optics-transfer-2", "5b203b32", () => q(1 / (2 * 1))],
  ["PH7.9:numeric", "e2adc673", () => q(2 * 1)],
  ["PH7.9:warmup", "9c3beede", () => q(2)],
  ["PH7.9:thermal-optics-transfer-1", "9c535abb", () => q(-1 / Math.log(Math.exp(-1)))],
  ["PH7.9:thermal-optics-transfer-2", "1f28b2b9", () => q(Math.exp(-4 / 2))],

  // --- PH8–PH9: quantum mechanics (batch 9) ---
  ["PH8.1:numeric", "8398672d", () => q((1 + 1) ** 2)],
  ["PH8.1:warmup", "4885d8c9", () => q(6 / 3)],
  ["PH8.1:quantum-transfer-1", "e814392f", () => q(1 / 4)],
  ["PH8.1:quantum-transfer-2", "6e24ed57", () => q(1 * 3)],
  ["PH8.2:numeric", "f910d01a", () => q(2 ** 2 - 1 ** 2)],
  ["PH8.2:warmup", "7a91b7bc", () => q(1 / 2 ** 2)],
  ["PH8.2:quantum-transfer-1", "c58b05ec", () => q(3 ** 2 / 2 ** 2)],
  ["PH8.2:quantum-transfer-2", "07ca1124", () => q((2 / 2) * Math.sin((PI * 1) / 2) ** 2)],
  ["PH8.3:numeric", "b1213d08", () => q(0 * 0.75 + 2 * 0.25)],
  ["PH8.3:warmup", "73133e68", () => q(0.25 * 2 ** 2 - (0.25 * 2) ** 2)],
  ["PH8.3:quantum-transfer-1", "f3ddac48", () => q((Math.sqrt(3) / 2) ** 2)],
  ["PH8.3:quantum-transfer-2", "01e482f1", () => q(1 * 0.25 + -1 * 0.75)], // P1 belongs to the eigenvalue -1 state
  ["PH8.4:numeric", "978390b8", () => q((3 + 0.5) * 2)],
  ["PH8.4:warmup", "31737817", () => q(Math.sqrt(3 + 1))],
  ["PH8.4:quantum-transfer-1", "65690452", () => q((3 + 0.5) * 2)],
  ["PH8.4:quantum-transfer-2", "28bcab5d", () => q(3 + 1)],
  ["PH8.5:numeric", "cdb61651", () => q(1 * (1 + 1))],
  ["PH8.5:warmup", "028ea715", () => q(2 * 2)],
  ["PH8.5:quantum-transfer-1", "040894f3", () => q(1 * (1 + 1))],
  ["PH8.5:quantum-transfer-2", "f7d36aaf", () => q(2 * 1.5 + 1)],
  ["PH8.6:numeric", "0eb05056", () => q(1 - 1 / 4)],
  ["PH8.6:warmup", "0dc3b03b", () => q(3 ** 2)],
  ["PH8.6:quantum-transfer-1", "8fdd7c46", () => q((-1 * 2 ** 2) / 2 ** 2)],
  ["PH8.6:quantum-transfer-2", "c1fe49f2", () => q(1 * (1 - 1 / 4))],
  ["PH8.7:numeric", "fc502f9c", () => q(Math.cos((60 * PI) / 360) ** 2)],
  ["PH8.7:warmup", "1a44fd83", () => q(1 - Math.cos((60 * PI) / 360) ** 2)],
  ["PH8.7:quantum-transfer-1", "2e993d6f", () => q(Math.cos((90 * PI) / 360) ** 2)],
  ["PH8.7:quantum-transfer-2", "c06934de", () => q(Math.round(Math.cos((180 * PI) / 360) ** 2 * 1e12) / 1e12)],
  ["PH8.8:numeric", "7ac062fb", () => q(Math.cos(PI))],
  ["PH8.8:warmup", "57e53bac", () => q(Math.round(Math.cos(PI / 2) * 1e12) / 1e12)],
  ["PH8.8:quantum-transfer-1", "689102f8", () => q(Math.round(Math.cos((1 * PI) / 2) ** 2 * 1e12) / 1e12)],
  ["PH8.8:quantum-transfer-2", "8032eb9c", () => q(Math.cos(0) ** 2)],
  ["PH9.1:numeric", "5ad6aaf7", () => q(-(1 ** 2) / (5 - 2))],
  ["PH9.1:warmup", "126536ad", () => q(1 ** 2 / (5 - 2))],
  ["PH9.1:quantum-transfer-1", "53979d93", () => q(-(0.1 ** 2) / 2)],
  ["PH9.1:quantum-transfer-2", "abab9fae", () => q(0.2 * 3)],
  ["PH9.2:numeric", "7766176e", () => q(2 - 1)],
  ["PH9.2:warmup", "0aa42d92", () => q(2 + 1)],
  ["PH9.2:quantum-transfer-1", "de80b8ec", () => q(2 + 0.5)],
  ["PH9.2:quantum-transfer-2", "4d9956ec", () => q((2 + 0.5) - (2 - 0.5))], // the two shifts of the previous matrix
  ["PH9.3:numeric", "12d9ce80", () => q(1 * 2 * 3)], // Γ = 2π|V|²ρ/ħ
  ["PH9.3:warmup", "a302131f", () => q(2 ** 2)],
  ["PH9.3:quantum-transfer-1", "84806d4c", () => q(Math.sin((2 * (PI / 2)) / 2) ** 2)],
  ["PH9.3:quantum-transfer-2", "ee365b2d", () => q(PI / 3)],
  ["PH9.4:numeric", "5abc525b", () => q(0.4 * 1 + 0.6 * 3)],
  ["PH9.4:warmup", "adab3c8e", () => q((2 * PI * (0 + 1 / 2)) / PI)], // closed-orbit action ∮p dq = 2πħ(n+1/2)
  ["PH9.4:quantum-transfer-1", "9907d656", () => q((2 + 1 / 2) / 4)],
  ["PH9.4:quantum-transfer-2", "895bf69a", () => q((1 + 1 / 1) / 4)],
  ["PH9.5:numeric", "763627e9", () => q(2 * 2)],
  ["PH9.5:warmup", "10ee9957", () => q(2 * 1 + 1)],
  ["PH9.5:quantum-transfer-1", "8e1f245f", () => q((4 * 3) / 2)],
  ["PH9.5:quantum-transfer-2", "0e88f0ed", () => q(2)],
  ["PH9.6:numeric", "c69f2386", () => q((4 * PI * 2 ** 2) / PI)],
  ["PH9.6:warmup", "31ed2a0a", () => q(2 ** 2)],
  ["PH9.6:quantum-transfer-1", "895c723f", () => q(4 * PI * 2 ** 2)],
  ["PH9.6:quantum-transfer-2", "a7a13ab7", () => q((4 * PI * 1 ** 2) / (1 + 1 ** 2 * 1 ** 2))],
  ["PH9.7:numeric", "42b0148e", () => q(0.75 ** 2 + 0.25 ** 2)],
  ["PH9.7:warmup", "5efe088f", () => q(0.5 ** 2 + 0.5 ** 2)],
  ["PH9.7:quantum-transfer-1", "3f007d67", () => q(0.5 ** 2 + 0.5 ** 2)],
  ["PH9.7:quantum-transfer-2", "1cc1c4c7", () => q(0.8 ** 2 + 0.2 ** 2)],
  ["PH9.8:numeric", "28448fc0", () => q(2 * Math.SQRT2)],
  ["PH9.8:warmup", "a68cbea4", () => q((2 * Math.SQRT2) / 2)],
  ["PH9.8:quantum-transfer-1", "b6ae6243", () => q(2 * Math.SQRT2)],
  ["PH9.8:quantum-transfer-2", "e1125f0b", () => q(-Math.cos(0))],
];
