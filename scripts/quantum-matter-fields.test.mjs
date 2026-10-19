import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { quantumInvestigations as q } from "../src/lib/quantum-investigations.ts";
import { matterInvestigations as m } from "../src/lib/matter-investigations.ts";
import { fieldsInvestigations as f } from "../src/lib/fields-investigations.ts";
import { coverageInvestigations as c } from "../src/lib/coverage-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
for (const [prefix, models] of [
  ["quantum_", q],
  ["matter_", m],
  ["fields_", f],
  ["coverage_", c],
])
  for (const [id, v] of Object.entries(models))
    test(`${id} supported model inputs remain finite and registered`, () => {
      const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
      assert.ok(source.includes(`name="${prefix}${id}"`));
      for (let i = 0; i <= 20; i++)
        for (let j = 0; j <= 10; j++) {
          let x = v.x[1] + (i * (v.x[2] - v.x[1])) / 20,
            p = v.parameter[1] + (j * (v.parameter[2] - v.parameter[1])) / 10;
          if (v.xStep) x = Math.round(x / v.xStep) * v.xStep;
          if (v.parameterStep)
            p = Math.round(p / v.parameterStep) * v.parameterStep;
          assert.ok(Number.isFinite(v.value(x, p)));
        }
    });
test("all 354 drafts meet the expanded-bank floor and have an explicit relevant investigation", () => {
  const files = fs
    .readdirSync("content/lessons")
    .filter((x) => x.endsWith(".mdx"));
  assert.equal(files.length, 354);
  for (const file of files) {
    const s = fs.readFileSync(`content/lessons/${file}`, "utf8"),
      d = JSON.parse(s.split("---")[1]);
    assert.ok(d.questions.length >= 9, file);
    assert.match(s, /<Widget name="[^"]+"/, file);
    assert.equal(d.status, "draft");
  }
});
test("well ground state retains unit probability for different widths", () => {
  for (const L of [0.5, 1, 3]) {
    let sum = 0,
      N = 2000;
    for (let i = 0; i < N; i++)
      sum += (q["PH8.2"].value((i + 0.5) / N, L) * L) / N;
    close(sum, 1);
  }
});
test("Born spin Rabi and entangled outputs obey probability or correlation bounds", () => {
  for (let i = 0; i <= 100; i++) {
    const a = (i * Math.PI) / 100;
    for (const value of [
      q["PH8.7"].value(a, 1),
      q["PH9.3"].value(a, 2),
      m["PH12.5"].value(a, 2),
    ])
      assert.ok(value >= 0 && value <= 1);
    assert.ok(Math.abs(q["PH9.8"].value(a, 1)) <= 1);
  }
});
test("nondegenerate perturbation has the correct leading second-order limit", () => {
  const E = q["PH9.1"].value;
  close(E(0.001, 2) / 0.001 ** 2, -0.5, 2e-7);
});
test("Gaussian variational energy is never below the exact oscillator energy", () => {
  for (const a of [0.2, 0.5, 1, 2, 4])
    for (const w of [0.2, 1, 3])
      assert.ok(q["PH9.4"].value(a, w) >= w / 2 - 1e-12);
});
test("fermionic counts use distinct spin-orbitals and half-integer spin steps", () => {
  close(q["PH9.5"].value(4, 2), 6);
  close(q["PH9.5"].value(4, 1), 4);
  assert.equal(q["PH8.5"].xStep, 0.5);
  assert.equal(q["PH8.6"].xStep, 1);
});
test("s-wave elastic cross section stays below its partial-wave unitarity bound", () => {
  for (const k of [0.1, 0.5, 1, 3])
    for (const a of [0.2, 1, 3])
      assert.ok(q["PH9.6"].value(k, a) <= (4 * Math.PI) / (k * k));
});
test("diagonal density-matrix purity stays between one half and one", () => {
  for (let i = 0; i <= 20; i++)
    for (let j = 0; j <= 10; j++) {
      const purity = q["PH9.7"].value(i / 20, j / 10);
      assert.ok(purity >= 0.5 && purity <= 1);
    }
});
test("relativistic energy branches satisfy the mass shell and aberration preserves endpoints", () => {
  for (const p of [0, 1, 4])
    for (const mass of [0.2, 1, 3])
      close(m["PH11.2"].value(p, mass) ** 2 - p * p, mass * mass, 1e-8);
  for (const b of [-0.9, 0, 0.9]) {
    close(m["PH11.4"].value(1, b), 1);
    close(m["PH11.4"].value(-1, b), -1);
  }
});
test("daughter feeding is initially zero nonnegative and vanishes at late time", () => {
  for (const rate of [0.2, 1, 1.8]) {
    close(m["PH13.2"].value(0, rate), 0);
    assert.ok(m["PH13.2"].value(1, rate) > 0);
    assert.ok(m["PH13.2"].value(100, rate) < 1e-8);
  }
});
test("lattice dispersion derivative agrees with its long-wavelength sound limit", () => {
  const h = 1e-6;
  close(m["PH14.2"].value(h, 1) / h, 1, 1e-8);
  close(m["PH14.2"].value(Math.PI, 1), 2);
});
test("Fermi occupations retain particle-hole complement and fixed chemical-potential crossing", () => {
  for (const T of [0.2, 1, 3]) {
    close(m["PH14.3"].value(0, T), 0.5);
    close(m["PH14.3"].value(1, T) + m["PH14.3"].value(-1, T), 1);
  }
});
test("running toy satisfies its beta equation on the declared domain", () => {
  const a = f["PH15.6"].value,
    h = 1e-5;
  for (const l of [-1, 0, 1])
    close((a(l + h, 0.1) - a(l - h, 0.1)) / (2 * h), a(l, 0.1) ** 2, 1e-9);
});
test("scalar potential minima and radial curvature match the chosen convention", () => {
  const U = f["PH15.8"].value,
    h = 1e-4,
    v = 1.3;
  close(U(v, v), 0);
  close((U(v + h, v) - 2 * U(v, v) + U(v - h, v)) / (h * h), 2 * v * v, 1e-7);
});
test("Kerr horizons obey the nonrotating limit and spin-sign symmetry", () => {
  close(f["PH16.4"].value(0, 2), 4);
  for (const spin of [0.2, 0.6, 0.9])
    close(f["PH16.4"].value(spin, 2), f["PH16.4"].value(-spin, 2));
});
test("sampled sinusoids alias at integer sample-rate offsets", () => {
  for (let n = 0; n <= 20; n++)
    close(f["PH17.2"].value(n, 0.3), f["PH17.2"].value(n, 1.3), 1e-12);
});
test("molecular-dynamics force is minus the potential derivative", () => {
  const U = (r, e) => 4 * e * (r ** -12 - r ** -6),
    h = 1e-6;
  for (const r of [1, 1.2, 2])
    close(
      f["PH17.4"].value(r, 1),
      -(U(r + h, 1) - U(r - h, 1)) / (2 * h),
      1e-7,
    );
});
test("logic counterexamples limit tests and terminal-drag benchmarks retain their scope", () => {
  assert.ok(c["MA1.1"].value(1, 2) < 0);
  assert.ok(c["MA1.4"].value(1000, 1) > c["MA1.4"].value(100, 1));
  close(c["MA1.6"].value(0.5, 3), 0);
  close(c["PH1.1"].value(0, 1), 0);
  assert.ok(c["PH1.1"].value(6, 1) < 1);
});

test("LS coupling counts all J labels in unit steps rather than counting replicas", () => {
  close(m["PH12.2"].value(0, 0.5), 1);
  close(m["PH12.2"].value(1, 0.5), 2);
  close(m["PH12.2"].value(2, 1), 3);
  assert.equal(m["PH12.2"].parameterStep, 0.5);
});

test("discrete group orbit count and modular answers reject nearby fractional responses", async () => {
  const { gradeNumeric } = await import("../src/lib/learning-core.ts");
  for (const [id, prefix, index] of [
    ["MA10.1", "structure", 1],
    ["MA10.3", "structure", 2],
    ["MB2.1", "foundation_next", 1],
    ["PH9.5", "quantum", 2],
  ]) {
    const d = JSON.parse(
        fs.readFileSync(`content/lessons/${id}.mdx`, "utf8").split("---")[1],
      ),
      q = d.questions.find((q) => q.id === `${prefix}-transfer-${index}`),
      answer = Number(q.answer);
    assert.equal(gradeNumeric(String(answer), answer, q.exact), true);
    assert.equal(gradeNumeric(String(answer + 0.01), answer, q.exact), false);
  }
});
