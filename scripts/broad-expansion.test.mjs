import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import {
  bayesPopulation,
  thinLens,
  induction,
  radialTide,
} from "../src/lib/transfer-models.ts";
const close = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const answers = {
  "MB1.1": [(5 - 11) / 2, [-2, 3].filter((x) => Math.sqrt(x + 6) === x).length],
  "MB1.2": [5 * 5 + 12 * 12, Math.log(32) / Math.log(2)],
  "MB1.3": [[3, 6, 12, 24].reduce((a, b) => a + b, 0), 3 / (1 - 0.5)],
  "MB1.4": [
    Array.from({ length: 30 }, (_, i) => i + 1).reduce((a, b) => a + b, 0),
    2 + 9 * 3,
  ],
  "MB2.1": [1.5 * 180, 2],
  "MB4.1": [3 * 4 - 2 * 1, 1 / 2],
  "MB4.2": [2 * 1 - 1 * 4 + 3 * 0, 1 * 3 - 0 * 0],
  "MB4.3": [0.12 / 0.3, (0.9 * 0.01) / (0.9 * 0.01 + 0.05 * 0.99)],
  "MB4.4": [12 * 0.25, 2 ** 2 * 12 * 0.25 * (1 - 0.25)],
  "PB2.3": [Math.sqrt(675 / 300), 3e25 * 1.38e-23 * 300],
  "PB3.1": [330 / 110, 120 / (2 * 1.2)],
  "PB3.2": [1 / (1 / 15 - 1 / 30), 1 / (1 / 10 - 1 / 5)],
  "PB3.3": [((600e-9 * 1.5) / 0.0003) * 1000, 500 / 2],
  "PB4.1": [30 / 0.02, 12],
  "PB4.3": [3 / 6, (5 * 0.08) / 0.02],
  "PB4.4": [12 ** 2 / 6, 1 / Math.sqrt(0.1 * 0.001)],
  "PB5.1": [6.5 - 2.5, 13.6 * (1 - 1 / 4)],
  "PB5.2": [100 * 0.5 ** 3, 100 * 0.2 + 5],
  "PB5.3": [1e21 * 1.6e-19 * 0.1, 2 * 0.5],
  "AS1.4": [Math.cbrt(24e-6 / 3), Math.sqrt(1 - 0.5 ** 2)],
  "AS1.5": [1 / 3 ** 3, (2 * 1e14 * 10) / 1e6 ** 3],
  "CB1.3": [(20 * 9) / (1 + 9), -8.314 * 300 * 2],
  "CB1.4": [0.693 / 0.1, 0.5 ** 2],
  "CB1.5": [(2 * 5 + 2 - 10) / 2, (2 * 4 + 2 - 7 - 1) / 2],
  "CP1.1": [4 * 5, 3],
  "CP1.2": [-2, 12 / Math.sqrt(36)],
  "CP1.3": [(2.1 ** 3 - 1.9 ** 3) / 0.2, 0.5 * (0 / 2 + 0.25 + 1 / 2)],
  "CP1.4": [1 - 4 * 0.1, (1 - 4 * 0.1) ** 4],
  "CP1.5": [1e-4 / 1e-8, 1 / 0.001],
  "CP1.6": [Math.abs(-5), 3 * 2 ** 2],
};
for (const [id, values] of Object.entries(answers))
  test(`${id} revised warmup and transfer agree with separate arithmetic`, () => {
    const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      data = parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
    for (const [i, qid] of ["warmup", "transfer-model-check"].entries()) {
      const q = data.questions.find((q) => q.id === qid);
      assert.ok(q?.hint);
      close(Number(q.answer), values[i]);
    }
    assert.ok(source.includes("Transfer derivation and failure case"));
    const core = data.questions.find((q) => q.id === "core");
    assert.ok(core.options.includes(core.answer));
    assert.ok(Object.keys(core.misconceptions).length);
  });
test("all 354 banks have unique normalized question prompts", () => {
  const files = fs
    .readdirSync("content/lessons")
    .filter((f) => f.endsWith(".mdx"));
  assert.equal(files.length, 354);
  for (const file of files) {
    const data = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${file}`, "utf8"),
      )[1],
    );
    assert.equal(
      new Set(data.questions.map((q) => q.prompt.trim().toLowerCase())).size,
      data.questions.length,
      file,
    );
  }
});
test("Bayes model preserves population partitions and handles no-positive outcomes", () => {
  const s = bayesPopulation(0.01, 0.9, 0.05);
  close(s.truePositives, 90);
  close(s.falsePositives, 495);
  close(s.posterior, 90 / 585);
  assert.equal(bayesPopulation(0, 0.9, 0).posterior, null);
  close(bayesPopulation(1, 0.9, 0.05).posterior, 1);
  for (const prior of [0, 0.01, 0.3, 1])
    for (const sensitivity of [0, 0.5, 1])
      for (const fp of [0, 0.1, 1]) {
        const v = bayesPopulation(prior, sensitivity, fp);
        assert.ok(v.truePositives + v.falsePositives <= 10000);
        if (v.posterior !== null)
          assert.ok(v.posterior >= 0 && v.posterior <= 1);
      }
});
test("lens equation covers real virtual and focal limiting cases", () => {
  close(thinLens(15, 30).image, 30);
  close(thinLens(15, 30).magnification, -1);
  close(thinLens(10, 5).image, -10);
  assert.equal(thinLens(10, 10).image, null);
  for (const f of [5, 10, 20])
    for (const u of [1, 8, 30, 60]) {
      const s = thinLens(f, u);
      if (s.image !== null) {
        close(1 / f, 1 / u + 1 / s.image);
        close(s.magnification, -s.image / u);
      }
    }
});
test("stationary-coil induction respects orientation rate sign and units", () => {
  close(induction(10, 0.1, 2, 0), -2);
  close(induction(10, 0.1, -2, 0), 2);
  close(induction(10, 0.1, 2, 90), 0);
  close(induction(10, 0.1, 0, 30), 0);
});
test("tidal linearization converges and exact field exposes large-separation error", () => {
  let last = Infinity;
  for (const l of [1, 0.5, 0.1, 0.01]) {
    const s = radialTide(4, l),
      error = Math.abs(s.exact / s.linear - 1);
    assert.ok(error < last);
    last = error;
    assert.ok(s.exact > s.linear);
  }
  const near = radialTide(2, 2);
  assert.ok(near.exact / near.linear > 1.5);
  close(radialTide(4, 0.1).linear / radialTide(8, 0.1).linear, 8);
});
