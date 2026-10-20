import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampSliderValue,
  formatControlValue,
} from "../src/lib/simulation-controls.ts";
test("numeric simulation controls reject invalid values and clamp/snap relative to the range minimum", () => {
  assert.equal(clampSliderValue("", 0, 10, 1), null);
  assert.equal(clampSliderValue("NaN", 0, 10, 1), null);
  assert.equal(clampSliderValue("9", 1, 3, 0.25), 3);
  assert.equal(clampSliderValue("-3", 1, 3, 0.25), 1);
  assert.equal(clampSliderValue("0.34", 0.1, 2, 0.1), 0.3);
  assert.equal(clampSliderValue("2.9", 0, 6, 1), 3);
  assert.equal(clampSliderValue("1", 0, 1, 0.6), 0.6);
  assert.equal(clampSliderValue("4e-7", 0, 1e-6, 1e-8), 4e-7);
});
test("tiny physical quantities and fine parameter steps remain distinguishable in readouts", () => {
  assert.notEqual(
    formatControlValue(1e-8, 1e-9),
    formatControlValue(2e-8, 1e-9),
  );
  assert.equal(formatControlValue(0.00123, 0.00001), "0.00123");
  assert.equal(formatControlValue(3, 1), "3");
});
