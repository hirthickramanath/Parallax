import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallDistance, secantSlope, GRAVITY, DROP_HEIGHT } from '../src/lib/experiments.ts';
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);
test('vacuum trajectories are mass-independent and start at rest', () => {
  near(fallDistance(0, 1, 0), 0);
  for (const mass of [1, 4, 8]) near(fallDistance(1, mass, 0), GRAVITY / 2);
});
test('vacuum ground-contact time matches the analytic result', () => {
  near(fallDistance(Math.sqrt(2 * DROP_HEIGHT / GRAVITY), 4, 0), DROP_HEIGHT);
});
test('linear drag matches a known analytic sample and slows the fall', () => {
  near(fallDistance(1, 1, 1), GRAVITY / Math.E);
  assert.ok(fallDistance(1, 1, .8) < fallDistance(1, 8, .8));
  assert.ok(fallDistance(1, 8, .8) < fallDistance(1, 8, 0));
});
test('drag solution has the correct initial position and vacuum limit', () => {
  near(fallDistance(0, 1, .8), 0);
  near(fallDistance(1, 4, 1e-7), GRAVITY / 2, 1e-6);
});
test('invalid physical parameters are rejected', () => {
  for (const values of [[-1, 1, 0], [1, 0, 0], [1, 1, -1]]) assert.throws(() => fallDistance(...values), RangeError);
});
test('secant slope agrees with the direct quotient for positive and negative h', () => {
  for (const a of [-2, 0, 1, 2]) for (const h of [-1, -.02, .02, 1]) {
    near(secantSlope(a, h), ((a + h) ** 2 - a ** 2) / h);
    near(Math.abs(secantSlope(a, h) - 2 * a), Math.abs(h));
  }
});
test('zero separation is not a secant', () => assert.throws(() => secantSlope(1, 0), RangeError));
