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
