import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { structureInvestigations as s } from "../src/lib/structure-investigations.ts";
import { computingInvestigations as c } from "../src/lib/computing-investigations.ts";
import { foundationNextInvestigations as f } from "../src/lib/foundation-next-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
for (const [prefix, models] of [
  ["structure_", s],
  ["computing_", c],
  ["foundation_next_", f],
])
  for (const [id, m] of Object.entries(models))
    test(`${id} model remains finite over its supported domain and keeps counts discrete`, () => {
      const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
      assert.ok(source.includes(`name="${prefix}${id}"`));
      for (let i = 0; i <= 20; i++)
        for (let j = 0; j <= 10; j++) {
          let x = m.x[1] + (i * (m.x[2] - m.x[1])) / 20,
            p = m.parameter[1] + (j * (m.parameter[2] - m.parameter[1])) / 10;
          if (m.xStep) x = Math.round(x / m.xStep) * m.xStep;
          if (m.parameterStep)
            p = Math.round(p / m.parameterStep) * m.parameterStep;
          assert.ok(Number.isFinite(m.value(x, p)));
        }
    });
test("cyclic quotient representatives remain bounded and periodic including negative inputs", () => {
  for (const n of [2, 3, 5, 8])
    for (let x = -12; x <= 12; x++) {
      const y = s["MA10.1"].value(x, n);
      assert.ok(y >= 0 && y < n);
      close(y, s["MA10.1"].value(x + n, n));
    }
});
test("rapidity composition is subluminal and agrees with velocity addition", () => {
  for (const a of [-1, 0, 0.5, 2])
    for (const b of [-1, 0.3, 1]) {
      const v = s["MA10.6"].value(a, b);
      assert.ok(Math.abs(v) < 1);
      close(
        v,
        (Math.tanh(a) + Math.tanh(b)) / (1 + Math.tanh(a) * Math.tanh(b)),
      );
    }
});
test("sphere curvature has inverse-square radius scaling", () =>
  close(s["MA11.5"].value(2, 1), s["MA11.5"].value(1, 1) / 4));
test("normalized delta approximants retain unit area as width changes", () => {
  for (const width of [0.1, 0.5, 1]) {
    let area = 0;
    const N = 4000,
      dx = (12 * width) / N;
    for (let i = 0; i < N; i++)
      area += s["MA12.4"].value(-6 * width + (i + 0.5) * dx, width) * dx;
    close(area, 1, 3e-9);
  }
});
test("logistic fixed-point derivative crosses stability boundary at r=3", () => {
  for (const r of [2, 2.5, 3.5]) {
    const x = 1 - 1 / r,
      h = 1e-6;
    close(s["MA13.1"].value(x, r), x);
    close(
      (s["MA13.1"].value(x + h, r) - s["MA13.1"].value(x - h, r)) / (2 * h),
      2 - r,
      1e-8,
    );
  }
});
test("OU variance starts at zero and approaches its stationary value monotonically", () => {
  close(s["MA13.2"].value(0, 2), 0);
  assert.ok(s["MA13.2"].value(1, 2) < s["MA13.2"].value(2, 2));
  close(s["MA13.2"].value(20, 2), 2);
});
test("linearized RG flow obeys its scale-composition law", () =>
  close(
    s["MA13.3"].value(0.7, 1.2) * s["MA13.3"].value(0.4, 1.2),
    s["MA13.3"].value(1.1, 1.2),
  ));
test("central-difference error has second-order convergence before roundoff", () =>
  close(c["CP1.3"].value(0.1, 1) / c["CP1.3"].value(0.2, 1), 0.25, 1e-10));
test("RK4 amplification matches its local exponential order and loses unconditional stability", () => {
  close(c["CP1.4"].value(0.01, 1), Math.exp(-0.01), 1e-11);
  assert.ok(Math.abs(c["CP1.4"].value(3, 1)) > 1);
});
test("grid-scale FTCS stability distinguishes admissible from unstable ratios", () => {
  close(c["CP2.1"].value(0.5, Math.PI), -1);
  assert.ok(Math.abs(c["CP2.1"].value(0.6, Math.PI)) > 1);
});
test("Amdahl bound never exceeds worker count and serial work remains a ceiling", () => {
  for (const p of [1, 2, 4, 64])
    for (const frac of [0, 0.2, 0.8, 0.99]) {
      const speed = c["CP2.5"].value(p, frac);
      assert.ok(speed <= p + 1e-12);
      assert.ok(speed <= 1 / (1 - frac) + 1e-12);
    }
});
test("wave cancellation photoelectric threshold and diode equilibrium preserve physical limits", () => {
  close(f["PB3.3"].value(Math.PI, 1), 0);
  close(f["PB5.1"].value(0.5, 1), 0);
  close(f["PB5.3"].value(0, 1), 0);
  close(f["PB5.2"].value(Math.log(2), 1), 50);
});
