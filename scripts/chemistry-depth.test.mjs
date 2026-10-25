import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { chemistryInvestigations as m } from "../src/lib/chemistry-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const values = {
  "CB1.3": [6, -Math.log(4)],
  "CB1.4": [2, 5],
  "CB1.5": [0.5, 3],
  "CH3.1": [0.5, 2],
  "CH3.2": [4, 3],
  "CH3.3": [16, 50],
  "CH3.4": [0.1 / 1.09, 0.5],
  "CH3.5": [4, 0.25],
  "CH4.1": [0, 1],
  "CH4.2": [(Math.acos(-1 / 3) * 180) / Math.PI, 2],
  "CH4.3": [2, -1],
  "CH4.4": [0, Math.sqrt(2)],
  "CH4.5": [2 ** (1 / 6), -3],
  "CH4.6": [8, -2],
  "CH4.7": [-1.2, -2.4],
  "CH4.8": [1 / Math.sqrt(2), 4],
  "CH5.1": [0.5, 54.4],
  "CH5.2": [4, 6],
  "CH5.3": [2, 4 / 3],
  "CH5.4": [4, 2],
  "CH6.1": [6, 1],
  "CH6.2": [2, 0],
  "CH6.3": [-1, 2],
  "CH6.4": [2, 1],
  "CH6.5": [2 / 3, -Math.log(4)],
  "CH6.6": [-2, -1],
  "CH6.7": [3, 0.01],
  "CH6.8": [0.5, 0.25],
};
for (const [id, v] of Object.entries(values))
  test(`${id} distinct transfer answers and lesson investigations remain valid`, () => {
    const text = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      d = parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    v.forEach((x, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `chemistry-transfer-${i + 1}`)
            .answer,
        ),
        x,
      ),
    );
    assert.equal(d.status, "draft");
    assert.ok(
      d.questions.find((q) => q.id === "chemistry-model-assumptions")
        .misconceptions,
    );
    const q = m[id];
    if (q) {
      assert.ok(text.includes(`name="chemistry_${id}"`));
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
    }
  });
test("Lennard–Jones minimum and zero crossing have distinct physical meanings", () => {
  const U = m["CH4.5"].value,
    r = 2 ** (1 / 6),
    h = 1e-5;
  close(U(1, 2), 0);
  close(U(r, 2), -2);
  close((U(r + h, 2) - U(r - h, 2)) / (2 * h), 0, 1e-6);
  assert.ok(U(r + h, 2) > U(r, 2) && U(r - h, 2) > U(r, 2));
});
test("Hückel ring levels are periodic and preserve the zero onsite trace", () => {
  for (const N of [3, 4, 6, 8]) {
    let sum = 0;
    for (let j = 0; j < N; j++) sum += m["CH6.6"].value(j, N);
    close(sum, 0);
    close(m["CH6.6"].value(1, N), m["CH6.6"].value(1 + N, N));
  }
});
test("angular-momentum and formal-charge families preserve exact reference values", () => {
  close(m["CH5.3"].value(0, 0.5), 2);
  close(m["CH5.3"].value(1, 0.5), 4 / 3);
  close(m["CH4.1"].value(2, 3), 0);
  close(m["CH4.1"].value(0, 4), 1);
  close(m["CH5.4"].value(4, 2), 4);
});
test("conformational minima and kinetic-order contrasts match stated regimes", () => {
  close(m["CH6.2"].value(0, 2), 2);
  close(m["CH6.2"].value(60, 2), 0);
  close(m["CH6.4"].value(2, 0) / m["CH6.4"].value(1, 0), 1);
  close(m["CH6.4"].value(2, 1) / m["CH6.4"].value(1, 1), 2);
});
