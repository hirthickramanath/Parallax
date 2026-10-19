import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { linearOdeInvestigations as m } from "../src/lib/linear-ode-investigations.ts";
const close = (a, b, e = 1e-9) =>
  assert.ok(Math.abs(a - b) < e, `${a} != ${b}`);
const values = {
  "MA3.1": [2, 2],
  "MA3.2": [11, 8],
  "MA3.3": [5, 3],
  "MA3.4": [7, 1],
  "MA3.5": [2, 4],
  "MA3.6": [3, 2.5],
  "MA3.7": [3, 20],
  "MA3.8": [3, Math.exp(-1)],
  "MA4.1": [12, 2],
  "MA4.2": [1.5, 2],
  "MA4.3": [0.75, 6],
  "MA4.4": [-16, 0.5],
  "MA4.5": [2, -1],
  "MA4.6": [4, Math.PI / 2],
  "MA5.1": [2, 1],
  "MA5.2": [Math.exp(-2), 3],
  "MA5.3": [1 / 3, 7],
  "MA5.4": [4, 0.75],
  "MA5.5": [6, Math.PI / 4],
  "MA5.6": [0, 4],
  "MA5.7": [0.125, 0.125],
};
for (const [id, v] of Object.entries(values))
  test(`${id} transfer answers and finite model domain`, () => {
    const s = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(s)[1]);
    v.forEach((x, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `linear-ode-transfer-${i + 1}`)
            .answer,
        ),
        x,
      ),
    );
    assert.ok(s.includes(`name="linear_ode_${id}"`));
    const t = m[id];
    for (let i = 0; i <= 15; i++)
      for (let j = 0; j <= 10; j++)
        assert.ok(
          Number.isFinite(
            t.value(
              t.x[1] + (i / 15) * (t.x[2] - t.x[1]),
              t.parameter[1] + (j / 10) * (t.parameter[2] - t.parameter[1]),
            ),
          ),
        );
  });
test("Rayleigh, shear area and inverse sensitivity match independent spectral reasoning", () => {
  for (let a = 0; a <= 180; a += 5)
    assert.ok(
      m["MA3.6"].value(a, 4) >= 1 - 1e-12 &&
        m["MA3.6"].value(a, 4) <= 4 + 1e-12,
    );
  close(m["MA3.3"].value(2, 1), 0);
  close(m["MA3.7"].value(0.1, 2), 20);
});
test("Jordan exponential satisfies the coupled matrix-entry differential equation", () => {
  for (const t of [0.2, 1, 3]) {
    const h = 1e-5,
      b = 1.5;
    const derivative =
      (m["MA3.8"].value(t + h, b) - m["MA3.8"].value(t - h, b)) / (2 * h);
    close(derivative, -m["MA3.8"].value(t, b) + b * Math.exp(-t), 1e-8);
  }
});
test("nonlinear exact solution obeys cubic flow and Fourier modes keep midpoint at the jump", () => {
  const t = 1,
    h = 1e-5;
  const f = m["MA4.4"].value;
  close((f(t + h, 2) - f(t - h, 2)) / (2 * h), -(f(t, 2) ** 3), 1e-8);
  for (const n of [1, 3, 10]) close(m["MA5.1"].value(0, n), 0);
});
test("Dirichlet Green kernel is symmetric, has zero boundary values and required derivative jump", () => {
  const G = m["MA5.7"].value;
  for (const s of [0.2, 0.5, 0.8]) {
    close(G(0, s), 0);
    close(G(1, s), 0);
    close(G(0.3, s), G(s, 0.3));
    const h = 1e-5;
    close((G(s + h, s) - G(s, s)) / h - (G(s, s) - G(s - h, s)) / h, -1, 1e-9);
  }
});
