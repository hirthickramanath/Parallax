import { gradeNumeric } from "../src/lib/learning-core.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { quadraticDarboux, powerSupremum } from "../src/lib/analysis-models.ts";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
const answers = {
  "MA1.1": [
    [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ].filter(([p, q]) => !p || q).length,
    2 ** 3,
    [-2, -1, 0, 1, 2].filter((x) => !(x * x > x)).length,
  ],
  "MA1.2": [0.5 ** 10, 9, 1],
  "MA1.3": [Math.floor(1 / 0.03) + 1, 3 / 2, 1 / 20],
  "MA1.4": [
    Array.from({ length: 9 }, (_, i) => 1 / ((i + 1) * (i + 2))).reduce(
      (a, b) => a + b,
      0,
    ),
    1 / 21,
    1 / 3,
  ],
  "MA1.5": [1, 0, 0.12 / 3],
  "MA1.6": [(16 - 1) / (4 - 1) / 2, 2 * 3, (4 * 0.25 ** 2) / 2],
  "MA1.7": [1 / 10, 1 / 3, 1 / 200 + 1 / 60000],
  "MA1.8": [1, 0.5 ** 8, 10],
};
for (const [id, values] of Object.entries(answers))
  test(`${id} proof transfers agree with separate calculations`, () => {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    values.forEach((value, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `analysis-transfer-${i + 1}`).answer,
        ),
        value,
      ),
    );
    assert.equal(d.questions.length, 10);
  });
test("Darboux envelopes contain all chosen samples and shrink by the proven gap", () => {
  for (const n of [1, 3, 10, 40])
    for (const f of [0, 0.17, 0.5, 1]) {
      const s = quadraticDarboux(n, f);
      assert.ok(s.lower <= s.sampled + 1e-12 && s.sampled <= s.upper + 1e-12);
      close(s.gap, 1 / n);
      assert.ok(s.lower <= 1 / 3 && s.upper >= 1 / 3);
    }
});
test("uniform power supremum distinguishes full and fixed shortened domains", () => {
  for (const n of [1, 8, 80]) close(powerSupremum(n, 1), 1);
  assert.ok(powerSupremum(80, 0.9) < powerSupremum(8, 0.9));
  close(powerSupremum(8, 0.5), 1 / 256);
});

test("new discrete indices reject fractional answers within approximate tolerance", () => {
  for (const [id, qid] of [
    ["MA1.2", "analysis-transfer-2"],
    ["MA1.3", "analysis-transfer-1"],
    ["MA1.8", "analysis-transfer-3"],
  ]) {
    const d = parse(
      /^---\n([\s\S]*?)\n---/.exec(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      )[1],
    );
    const q = d.questions.find((q) => q.id === qid);
    assert.equal(q.exact, true);
    assert.equal(
      gradeNumeric(String(Number(q.answer) + 0.1), Number(q.answer), q.exact),
      false,
    );
  }
});
