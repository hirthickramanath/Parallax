import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fallDistance,
  secantSlope,
  GRAVITY,
  DROP_HEIGHT,
} from "../src/lib/experiments.ts";
const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} differs from ${expected}`,
  );
test("vacuum trajectories are mass-independent and start at rest", () => {
  near(fallDistance(0, 1, 0), 0);
  for (const mass of [1, 4, 8]) near(fallDistance(1, mass, 0), GRAVITY / 2);
});
test("vacuum ground-contact time matches the analytic result", () => {
  near(fallDistance(Math.sqrt((2 * DROP_HEIGHT) / GRAVITY), 4, 0), DROP_HEIGHT);
});
test("linear drag matches a known analytic sample and slows the fall", () => {
  near(fallDistance(1, 1, 1), GRAVITY / Math.E);
  assert.ok(fallDistance(1, 1, 0.8) < fallDistance(1, 8, 0.8));
  assert.ok(fallDistance(1, 8, 0.8) < fallDistance(1, 8, 0));
});
test("drag solution has the correct initial position and vacuum limit", () => {
  near(fallDistance(0, 1, 0.8), 0);
  near(fallDistance(1, 4, 1e-7), GRAVITY / 2, 1e-6);
});
test("invalid physical parameters are rejected", () => {
  for (const values of [
    [-1, 1, 0],
    [1, 0, 0],
    [1, 1, -1],
  ])
    assert.throws(() => fallDistance(...values), RangeError);
});
test("secant slope agrees with the direct quotient for positive and negative h", () => {
  for (const a of [-2, 0, 1, 2])
    for (const h of [-1, -0.02, 0.02, 1]) {
      near(secantSlope(a, h), ((a + h) ** 2 - a ** 2) / h);
      near(Math.abs(secantSlope(a, h) - 2 * a), Math.abs(h));
    }
});
test("zero separation is not a secant", () =>
  assert.throws(() => secantSlope(1, 0), RangeError));

import {
  gasPath,
  GAS_R,
  standingString,
  doubleSlit,
} from "../src/lib/foundation-labs.ts";
test("gas paths conserve energy with known expansion and compression limits", () => {
  const iso = gasPath(1, 300, 0.025, 2, "isothermal");
  near(iso.finalK, 300);
  near(iso.deltaU, 0);
  near(iso.work, GAS_R * 300 * Math.log(2));
  near(iso.heat, iso.work);
  for (const mode of ["isothermal", "adiabatic", "isobaric"])
    for (const ratio of [0.5, 1, 2, 3]) {
      const s = gasPath(1, 300, 0.025, ratio, mode);
      near(s.heat - s.work, s.deltaU);
      near(s.pressurePa * s.finalM3, GAS_R * s.finalK);
      if (mode === "adiabatic") {
        near(s.heat, 0);
        near(s.finalK * s.finalM3 ** (2 / 3), 300 * 0.025 ** (2 / 3));
      }
      if (mode === "isobaric") near(s.pressurePa, (GAS_R * 300) / 0.025);
    }
  assert.ok(gasPath(1, 300, 0.025, 0.5, "isothermal").work < 0);
  assert.throws(() => gasPath(1, 0, 0.025, 1, "isothermal"), RangeError);
});
test("fixed string modes satisfy boundary nodes and tension scaling", () => {
  for (const n of [1, 2, 3, 6]) {
    const a = standingString(1, 10, 0.01, n),
      b = standingString(1, 40, 0.01, n);
    near(a.frequency, (Math.sqrt(1000) * n) / 2);
    near(b.frequency, 2 * a.frequency);
    near(a.frequency * a.wavelength, a.speed);
    assert.equal(a.nodes.length, n + 1);
    near(a.nodes[0], 0);
    near(a.nodes.at(-1), 1);
    for (const x of a.nodes) near(Math.sin(n * Math.PI * x), 0);
  }
  assert.throws(() => standingString(1, 10, 0.01, 1.5), RangeError);
});
test("double slit has symmetric fringes, unit central maximum and analytic first minimum", () => {
  const wavelength = 500e-9,
    d = 0.5e-3,
    L = 2;
  near(doubleSlit(wavelength, d, L, 0).intensity, 1);
  near(doubleSlit(wavelength, d, L, 0).fringeM, 0.002);
  const sinTheta = wavelength / (2 * d),
    y = (L * sinTheta) / Math.sqrt(1 - sinTheta * sinTheta);
  near(doubleSlit(wavelength, d, L, y).intensity, 0);
  for (const y of [-0.005, 0.001, 0.01])
    near(
      doubleSlit(wavelength, d, L, y).intensity,
      doubleSlit(wavelength, d, L, -y).intensity,
    );
  near(doubleSlit(wavelength, 2 * d, L, 0).fringeM, 0.001);
  assert.throws(() => doubleSlit(0, d, L, 0), RangeError);
});

import { slabTransfer, radialShift } from "../src/lib/radiation.ts";
test("radiation slab matches half-transmission, thin and thick limits with separate source contribution", () => {
  const r = slabTransfer(10, 2, Math.log(2));
  near(r.transmission, 0.5);
  near(r.transmitted, 5);
  near(r.emitted, 1);
  near(r.output, 6);
  near(slabTransfer(10, 20, Math.log(2)).output, 15);
  near(slabTransfer(10, 2, 0).output, 10);
  near(slabTransfer(10, 2, 100).output, 2);
  for (const tau of [0, 1e-12, 0.1, 1, 10])
    near(slabTransfer(7, 7, tau).output, 7);
  near(slabTransfer(0, 2, 1e-12).emitted, 2e-12, 1e-15);
  for (const args of [
    [-1, 2, 1],
    [1, -2, 1],
    [1, 2, -1],
    [1, 2, Infinity],
  ])
    assert.throws(() => slabTransfer(...args), RangeError);
});
test("radial Doppler shifts preserve reciprocal approach/recession factors and the zero-speed limit", () => {
  near(radialShift(500, 0.6).observedNm, 1000);
  near(radialShift(500, 0.6).redshift, 1);
  near(radialShift(500, 0).observedNm, 500);
  for (const beta of [0.1, 0.4, 0.8])
    near(radialShift(500, beta).factor * radialShift(500, -beta).factor, 1);
  for (const args of [
    [0, 0],
    [500, 1],
    [500, -1],
    [500, NaN],
  ])
    assert.throws(() => radialShift(...args), RangeError);
});

import { sphericalField } from "../src/lib/spherical-field.ts";
test("solid sphere and conducting shell share exterior fields but retain different interiors and surface limits", () => {
  const solid = sphericalField(1, 2, 1, "solid"),
    shell = sphericalField(1, 2, 1, "shell");
  near(solid.field, 0.125);
  near(solid.potential, 11 / 16);
  near(solid.enclosed, 1 / 8);
  near(shell.field, 0);
  near(shell.potential, 0.5);
  near(shell.enclosed, 0);
  for (const model of ["solid", "shell"]) {
    const out = sphericalField(4, 2, 1, model);
    near(out.field, 1 / 16);
    near(out.potential, 1 / 4);
    const zero = sphericalField(0, 2, 1, model);
    near(zero.field, 0);
    assert.ok(Number.isFinite(zero.potential));
  }
  const boundary = sphericalField(2, 2, 1, "shell");
  assert.equal(boundary.field, null);
  assert.equal(boundary.enclosed, null);
  near(boundary.innerField, 0);
  near(boundary.outerField, 0.25);
  near(boundary.potential, 0.5);
  near(sphericalField(2, 2, 1, "solid").field, 0.25);
  near(sphericalField(2, 2, 1, "solid").innerField, 0.25);
  near(sphericalField(2, 2, 0, "shell").field, 0);
});
test("sphere potential gradients, signed charge and Gauss fields are consistent away from the sheet", () => {
  for (const model of ["solid", "shell"])
    for (const r of [0.4, 1, 3, 5])
      for (const q of [-2, 0, 3]) {
        const s = sphericalField(r, 2, q, model),
          h = 1e-5;
        const gradient =
          (sphericalField(r + h, 2, q, model).potential -
            sphericalField(r - h, 2, q, model).potential) /
          (2 * h);
        near(s.field, -gradient, 1e-8);
        near(s.field, s.enclosed / (r * r));
      }
  for (const args of [
    [-1, 2, 1, "solid"],
    [1, 0, 1, "solid"],
    [1, 2, NaN, "shell"],
    [1, 2, 1, "unknown"],
  ])
    assert.throws(() => sphericalField(...args), RangeError);
});

import { coupledOscillator } from "../src/lib/coupled-oscillator.ts";
test("coupled normal modes conserve energy and reproduce independent and pure-mode releases", () => {
  for (const m of [0.5, 1, 3])
    for (const k of [1, 4])
      for (const c of [0, 1, 4])
        for (const b of [-0.2, 0, 0.2]) {
          const initial = coupledOscillator(m, k, c, 0, 0.2, b);
          near(initial.x1, 0.2);
          near(initial.x2, b);
          near(initial.v1, 0);
          near(initial.plus ** 2, k / m);
          near(initial.minus ** 2, (k + 2 * c) / m);
          for (const t of [0.1, 2, 9, 20]) {
            const s = coupledOscillator(m, k, c, t, 0.2, b);
            near(s.energy, initial.energy);
            if (b === 0.2) near(s.x1, s.x2);
            if (b === -0.2) near(s.x1, -s.x2);
            if (c === 0 && b === 0) near(s.x2, 0);
          }
        }
});
test("coupled oscillator rejects nonphysical or nonfinite inputs", () => {
  for (const args of [
    [0, 1, 1, 0, 0.2, 0],
    [1, 0, 1, 0, 0.2, 0],
    [1, 1, -1, 0, 0.2, 0],
    [1, 1, 1, -1, 0.2, 0],
    [1, 1, 1, 0, NaN, 0],
  ])
    assert.throws(() => coupledOscillator(...args), RangeError);
});

import { pdeModes } from "../src/lib/pde-modes.ts";
test("PDE mode solutions satisfy initial data, fixed endpoints and heat/wave rate laws", () => {
  for (const kind of ["heat", "wave"])
    for (const c of [0.25, 1, 2]) {
      const start = pdeModes(kind, c, 0, [1, 0.5, 0.25]);
      near(
        start.at(0.7),
        Math.sin(0.7) + 0.5 * Math.sin(1.4) + 0.25 * Math.sin(2.1),
      );
      for (const t of [0, 0.1, 1, 5]) {
        const model = pdeModes(kind, c, t, [1, 0.5, 0.25]);
        near(model.at(0), 0);
        near(model.at(Math.PI), 0);
        for (const mode of model.modes)
          near(mode.rate, c * (kind === "heat" ? mode.n ** 2 : mode.n));
        if (kind === "heat") {
          assert.ok(model.squaredNorm <= start.squaredNorm);
          assert.equal(model.waveEnergy, null);
        } else near(model.waveEnergy, start.waveEnergy);
      }
    }
});
test("finite-mode solutions satisfy their PDEs independently through numerical derivatives", () => {
  const h = 1e-4,
    x = 0.8,
    t = 0.6,
    c = 0.75,
    a = [1, 0.5, 0.25];
  for (const kind of ["heat", "wave"]) {
    const mid = pdeModes(kind, c, t, a);
    const xx = (mid.at(x + h) - 2 * mid.at(x) + mid.at(x - h)) / (h * h);
    const before = pdeModes(kind, c, t - h, a).at(x),
      after = pdeModes(kind, c, t + h, a).at(x);
    if (kind === "heat") near((after - before) / (2 * h), c * xx, 1e-6);
    else near((after - 2 * mid.at(x) + before) / (h * h), c * c * xx, 1e-6);
  }
});
test("modal norm matches spatial quadrature and high heat modes decay faster", () => {
  const state = pdeModes("wave", 1, 0.7, [1, 0.5, 0.25]);
  const intervals = 1000,
    dx = Math.PI / intervals;
  let norm = 0;
  for (let i = 1; i < intervals; i++) norm += state.at(i * dx) ** 2 * dx;
  near(norm, state.squaredNorm);
  const heat = pdeModes("heat", 1, Math.log(2), [1, 0, 1]);
  near(heat.modes[0].value, 0.5);
  near(heat.modes[2].value, 1 / 512);
  const wave = pdeModes("wave", 1, Math.PI / 2, [1, 0, 0]);
  near(wave.squaredNorm, 0);
  near(wave.waveEnergy, Math.PI / 4);
});
test("PDE modes reject invalid controls and probes", () => {
  for (const args of [
    ["other", 1, 0, [1, 0, 0]],
    ["heat", 0, 0, [1, 0, 0]],
    ["heat", 1, -1, [1, 0, 0]],
    ["wave", 1, 0, [1, 0]],
    ["wave", 1, 0, [1, NaN, 0]],
  ])
    assert.throws(() => pdeModes(...args), RangeError);
  const state = pdeModes("heat", 1, 0, [1, 0, 0]);
  for (const x of [-1, Math.PI + 0.01, NaN])
    assert.throws(() => state.at(x), RangeError);
});

import { branchCircle } from "../src/lib/complex-branch.ts";
test("continued and principal square roots square to the source but retain distinct path information", () => {
  for (const degrees of [0, 45, 179, 180, 181, 270, 360, 450, 540, 630, 720]) {
    const s = branchCircle(degrees);
    for (const root of [s.continued, s.principal].filter(Boolean)) {
      near(root.real ** 2 - root.imaginary ** 2, s.source.real);
      near(2 * root.real * root.imaginary, s.source.imaginary);
      near(root.real ** 2 + root.imaginary ** 2, 1);
    }
  }
  near(branchCircle(360).continued.real, -1);
  near(branchCircle(360).principal.real, 1);
  near(branchCircle(720).continued.real, 1);
  near(branchCircle(720).continuedAngle, 4 * Math.PI);
});
test("principal cut is excluded while the path continuation stays continuous across it", () => {
  for (const cut of [180, 540]) {
    const s = branchCircle(cut);
    assert.equal(s.principal, null);
    assert.equal(s.principalAngle, null);
    assert.equal(s.onCut, true);
    const before = branchCircle(cut - 0.001),
      after = branchCircle(cut + 0.001);
    assert.ok(
      Math.hypot(
        before.continued.real - after.continued.real,
        before.continued.imaginary - after.continued.imaginary,
      ) < 0.0001,
    );
    assert.ok(before.principal.imaginary > 0.99);
    assert.ok(after.principal.imaginary < -0.99);
  }
});
test("branch explorer rejects invalid path inputs", () => {
  for (const angle of [-1, 721, NaN, Infinity])
    assert.throws(() => branchCircle(angle), RangeError);
});
