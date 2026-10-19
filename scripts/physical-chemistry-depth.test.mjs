import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { physicalChemistryInvestigations as m } from "../src/lib/physical-chemistry-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const values = {
  "CH1.1": [-1, 2 * Math.log(3)],
  "CH1.2": [1.75, Math.log(2)],
  "CH1.3": [Math.log(2) / 2, 1],
  "CH1.4": [0.5, 2],
  "CH1.5": [2, 5],
  "CH1.6": [0.75, 0.5],
  "CH1.7": [0.5, Math.log(2)],
  "CH1.8": [0.372, 1],
  "CH1.9": [0.5, 3],
  "CH1.10": [0.1, -0.2036],
  "CH1.11": [6, 4],
  "CH1.12": [1.5, 0.1],
  "CH1.13": [50, 2],
  "CH2.1": [-1.5, 1],
  "CH2.2": [0.6, 0.025],
  "CH2.3": [0.5, 0.625],
  "CH2.4": [4, 12],
  "CH2.5": [2, 4],
  "CH2.6": [6, 2.5],
};
for (const [id, v] of Object.entries(values))
  test(`${id} transfer answers and bounded control domain`, () => {
    const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
    v.forEach((x, i) =>
      close(
        Number(
          d.questions.find(
            (q) => q.id === `physical-chemistry-transfer-${i + 1}`,
          ).answer,
        ),
        x,
      ),
    );
    assert.ok(source.includes(`name="physical_chemistry_${id}"`));
    assert.equal(d.status, "draft");
    const q = m[id];
    for (let i = 0; i <= 10; i++)
      for (let j = 0; j <= 10; j++)
        assert.ok(
          Number.isFinite(
            q.value(
              q.x[1] + (i / 10) * (q.x[2] - q.x[1]),
              q.parameter[1] + (j / 10) * (q.parameter[2] - q.parameter[1]),
            ),
          ),
        );
  });
test("activity and reaction-quotient conventions have the correct logarithmic shifts", () => {
  close(m["CH1.1"].value(1, 2), 0);
  close(m["CH1.1"].value(Math.E, 2), 2);
  close(m["CH1.9"].value(Math.E, 2), -0.5);
  close(m["CH1.7"].value(0.25, 2), Math.log(0.5));
});
test("Langmuir coverage saturates and Butler–Volmer has zero current at equilibrium", () => {
  for (const K of [0.1, 1, 3]) {
    close(m["CH1.6"].value(0, K), 0);
    for (const P of [1, 3, 10])
      assert.ok(m["CH1.6"].value(P, K) > 0 && m["CH1.6"].value(P, K) < 1);
  }
  for (const alpha of [0.2, 0.5, 0.8]) {
    close(m["CH1.12"].value(0, alpha), 0);
    const h = 1e-5;
    close(
      (m["CH1.12"].value(h, alpha) - m["CH1.12"].value(-h, alpha)) / (2 * h),
      1,
      1e-8,
    );
  }
});
test("avoided crossing gap and harmonic Gaussian variational bound agree with exact spectra", () => {
  for (const w of [0.5, 1, 3]) {
    close(m["CH2.3"].value(w / 2, w), w / 2);
    for (const a of [0.1, 0.5, 1, 3])
      assert.ok(m["CH2.3"].value(a, w) >= w / 2 - 1e-12);
  }
  close(-2 * m["CH2.2"].value(0, 0.3), 0.6);
});
test("rotational ladder and dipole intensity preserve integer and sign conventions", () => {
  close(m["CH2.4"].value(3, 2) - m["CH2.4"].value(2, 2), 12);
  close(m["CH2.5"].value(-2, 0.5), m["CH2.5"].value(2, 0.5));
  close(m["CH2.6"].value(3, 2), 6);
});
