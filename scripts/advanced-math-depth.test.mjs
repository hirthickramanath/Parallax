import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { advancedMathInvestigations as models } from "../src/lib/advanced-math-investigations.ts";
const answers = {
  "MA6.1": [4, -5],
  "MA6.2": [6.283185307179586, -6.283185307179586],
  "MA6.3": [2, 1.5707963267948966],
  "MA6.4": [-1, -1],
  "MA6.5": [6, 16],
  "MA6.6": [12.566370614359172, 3],
  "MA7.1": [120, 0.08333333333333333],
  "MA7.2": [-0.5, 0],
  "MA7.3": [1, -0.25],
  "MA7.4": [2, 0.7071067811865475],
  "MA7.5": [1.7724538509055159, 0.5],
  "MA8.1": [0.2, 0.4],
  "MA8.2": [0.5, 4],
  "MA8.3": [0.1353352832366127, 6],
  "MA8.4": [2, 0.98],
  "MA8.5": [0.6666666666666666, 5],
  "MA8.6": [0.25, 1],
  "MA8.7": [1.4142135623730951, 0.8],
  "MA9.1": [-12, 0],
  "MA9.2": [2, 8],
  "MA9.3": [18, 6],
};
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
for (const [id, values] of Object.entries(answers))
  test(`${id} transfer values and declared model domain`, () => {
    const source = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8"),
      d = JSON.parse(source.split("---")[1]);
    values.forEach((v, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `advanced-math-transfer-${i + 1}`)
            .answer,
        ),
        v,
      ),
    );
    assert.equal(d.status, "draft");
    assert.ok(source.includes(`name="advanced_math_${id}"`));
    const m = models[id];
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
test("Bessel series satisfies its differential equation away from the regular origin", () => {
  const J = models["MA7.3"].value,
    h = 1e-4;
  for (const x of [0.2, 1, 2, 3]) {
    const y = J(x, 1),
      yp = (J(x + h, 1) - J(x - h, 1)) / (2 * h),
      ypp = (J(x + h, 1) - 2 * y + J(x - h, 1)) / (h * h);
    close(x * x * ypp + x * yp + x * x * y, 0, 1e-6);
  }
  close(J(0, 2), 1);
});
test("Legendre quadrupole is orthogonal to a constant by symmetric quadrature", () => {
  let sum = 0,
    N = 1000;
  for (let i = 0; i < N; i++)
    sum += (models["MA7.2"].value(-1 + ((i + 0.5) * 2) / N, 1) * 2) / N;
  close(sum, 0, 3e-6);
});
test("conjugate update and symmetric Metropolis acceptance preserve probability bounds", () => {
  close(models["MA8.5"].value(3, 1), 2 / 3);
  close(models["MA8.6"].value(-2, 1), 1);
  close(models["MA8.6"].value(Math.log(4), 1), 0.25);
});
test("Noether benchmark is independent of phase while constrained cost has its minimum", () => {
  for (const t of [0, 0.3, 2, 5]) close(models["MA9.3"].value(t, 2), 2);
  const f = models["MA9.2"].value;
  assert.ok(f(2, 4) < f(1, 4) && f(2, 4) < f(3, 4));
});
