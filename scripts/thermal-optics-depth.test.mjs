import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { thermalOpticsInvestigations as m } from "../src/lib/thermal-optics-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const values = {
  "PH3.1": [0.75, -2],
  "PH3.2": [2, 0.01],
  "PH3.3": [16, 1],
  "PH3.4": [2, Math.sqrt(10)],
  "PH6.1": [3, 5],
  "PH6.2": [4, 0],
  "PH6.3": [0.8, 3],
  "PH6.4": [2, 12500],
  "PH6.5": [1 / 3, 0.5],
  "PH7.1": [2 * Math.log(2), 0.5],
  "PH7.2": [Math.sqrt(3), Math.sqrt(1.5)],
  "PH7.3": [Math.log(4), 15],
  "PH7.4": [0.25, 0.1875],
  "PH7.5": [0.5, 2],
  "PH7.6": [0.25, 0.5],
  "PH7.7": [27, 16],
  "PH7.8": [1, 0.5],
  "PH7.9": [1, Math.exp(-2)],
  "PH7.10": [0.75, 1],
};
for (const [id, v] of Object.entries(values))
  test(`${id} transfers and model domain stay consistent`, () => {
    const text = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    v.forEach((x, i) =>
      close(
        Number(
          d.questions.find((q) => q.id === `thermal-optics-transfer-${i + 1}`)
            .answer,
        ),
        x,
      ),
    );
    assert.ok(text.includes(`name="thermal_optics_${id}"`));
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
test("logistic orbit remains bounded and starts from the stated initial condition", () => {
  for (const r of [2.5, 3, 3.8, 4]) {
    close(m["PH3.1"].value(0, r), 0.2);
    for (let n = 1; n <= 80; n++) {
      const x = m["PH3.1"].value(n, r);
      assert.ok(x >= 0 && x <= 1);
    }
  }
});
test("interference central limit, Malus sign and two-level noninversion obey the model", () => {
  close(m["PH6.2"].value(0, 0.2), 1);
  close(m["PH6.2"].value(Math.PI / 2, 0.2), 0);
  close(m["PH6.4"].value(60, 8), 2);
  for (const R of [0, 1, 5, 10000]) assert.ok(m["PH6.5"].value(R, 1) < 0.5);
});
test("Maxwell speed density normalizes as a density rather than a point probability", () => {
  for (const T of [0.2, 1, 3]) {
    const dx = 0.005;
    let area = 0;
    for (let i = 1; i < 4000; i++) area += m["PH7.2"].value(i * dx, T) * dx;
    close(area, 1, 1e-8);
  }
});
test("canonical heat capacity agrees with energy fluctuations", () => {
  const T = 1.3,
    d = 2,
    h = 1e-5,
    p = m["PH7.4"].value(T, d);
  const heat =
    (d * (m["PH7.4"].value(T + h, d) - m["PH7.4"].value(T - h, d))) / (2 * h);
  close(heat, (d * d * p * (1 - p)) / (T * T), 1e-8);
});
test("Landau selected branch is stationary and OU variance follows its moment equation", () => {
  for (const t of [-1, -0.2, 0.2, 1]) {
    const b = 1.3,
      x = m["PH7.8"].value(t, b);
    close(2 * t * x + 4 * b * x ** 3, 0);
    assert.ok(2 * t + 12 * b * x * x >= 0);
  }
  const f = m["PH7.10"].value,
    t = 1,
    g = 0.7,
    h = 1e-5;
  close((f(t + h, g) - f(t - h, g)) / (2 * h), -2 * g * f(t, g) + 2 * g, 1e-8);
});
