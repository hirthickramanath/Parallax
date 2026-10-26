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
];
