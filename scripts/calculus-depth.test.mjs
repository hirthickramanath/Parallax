import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import {
  quadraticLimit,
  signedQuadraticArea,
  exponentialSteps,
  domainDirections,
} from "../src/lib/calculus-models.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const answers = {
  "MB3.1": [0.1 / 5, 0.03 / 3, 2 + 2, 4],
  "MB3.2": [
    3 * 2 ** 2,
    (2.1 ** 3 - 2 ** 3) / 0.1,
    2 * (3 * 1 + 1) * 3,
    -1 / 2 ** 2,
  ],
  "MB3.3": [
    2 ** 3,
    Math.sqrt(3) ** 3 / 3 - Math.sqrt(3),
    4 / 3,
    (1 - 1) * Math.E - -1,
  ],
  "MB3.4": [
    2,
    (-2) ** 2 + 1,
    (3 * 2 ** 2) / 2 / (3 * 2),
    4 * Math.PI * 2 ** 2 * 0.25,
  ],
  "MB3.5": [
    -2 * 3,
    3 * Math.exp(-2 * Math.log(2)),
    12 / 3,
    3 + 0.25 * (-2 * 3),
  ],
  "PB4.2": [
    12 / 400,
    1 / (1 / 200 + 1 / 300),
    9 / (1 + 8),
    1 / (1 / 1000 + 1 / 1000),
  ],
  "CB.1": [13 - 3, 2 * 1 + 1, 2 * (2 * 2 + 1), 13.6 / 4],
  "CB.2": [4 + 2 * 6, 5 - 0 - 8 / 2, 2, (Math.acos(-1 / 3) * 180) / Math.PI],
};
for (const [id, values] of Object.entries(answers))
  test(`${id} four transfer answers match separate calculations`, () => {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    values.forEach((expected, i) => {
      const q = d.questions.find((q) => q.id === `depth-transfer-${i + 1}`);
      assert.ok(q?.hint);
      close(Number(q.answer), expected);
    });
    assert.equal(
      d.questions.length,
      ["MB3.1", "MB3.2", "MB3.3", "MB3.5"].includes(id) ? 12 : 11,
    );
  });
test("quadratic epsilon bound agrees with extrema and sufficient open-interval proof", () => {
  for (const eps of [0.02, 0.1, 1, 3, 4]) {
    const delta = Math.min(1, eps / 3);
    for (let i = 1; i < 100; i++) {
      for (const sign of [-1, 1])
        assert.ok(Math.abs((1 + (sign * delta * i) / 100) ** 2 - 1) < eps);
    }
    close(quadraticLimit(delta), (1 + delta) ** 2 - 1);
  }
});
test("signed and geometric area separate cancellation while Riemann sums converge", () => {
  const b = Math.sqrt(3);
  close(signedQuadraticArea(b, 100).signed, 0);
  close(signedQuadraticArea(b, 100).geometric, 4 / 3);
  for (const b of [0.2, 0.9, 1, 1.5, 2]) {
    const coarse = signedQuadraticArea(b, 5),
      fine = signedQuadraticArea(b, 500);
    assert.ok(
      Math.abs(fine.left - fine.signed) < Math.abs(coarse.left - coarse.signed),
    );
    assert.ok(fine.geometric >= Math.abs(fine.signed) - 1e-12);
  }
});
test("Euler exposes sign-changing unstable step and converges on fixed time interval", () => {
  const bad = exponentialSteps(-2, 3, 2, 1);
  close(bad.euler, -9);
  assert.ok(bad.exact > 0);
  const e10 = exponentialSteps(-2, 3, 2, 10),
    e100 = exponentialSteps(-2, 3, 2, 100);
  assert.ok(
    Math.abs(e100.euler - e100.exact) < Math.abs(e10.euler - e10.exact),
  );
  close(exponentialSteps(-2, 3, 0, 1).euler, 3);
});
test("ideal domain directions are unit vectors with the stated mutual dot products", () => {
  for (const n of [2, 3, 4]) {
    const dirs = domainDirections(n);
    assert.equal(dirs.length, n);
    for (let i = 0; i < n; i++) {
      close(Math.hypot(...dirs[i]), 1);
      for (let j = 0; j < i; j++)
        close(
          dirs[i].reduce((s, v, k) => s + v * dirs[j][k], 0),
          n === 2 ? -1 : n === 3 ? -0.5 : -1 / 3,
        );
    }
  }
});
