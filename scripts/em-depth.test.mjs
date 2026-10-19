import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "yaml";
import { chargeField, wireField } from "../src/lib/field-probes.ts";
import { emInvestigations as m } from "../src/lib/em-investigations.ts";
const close = (a, b, t = 1e-9) =>
  assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const values = {
  "PH4.1": [3, 0.5],
  "PH4.2": [-1, 9],
  "PH4.3": [1 / 16, 0],
  "PH4.4": [0.125, 2],
  "PH4.5": [2, 9],
  "PH4.6": [6, 4],
  "PH4.7": [1.5, 0],
  "PH4.8": [4, 0],
  "PH5.1": [-12, 5],
  "PH5.2": [6, 8],
  "PH5.3": [0.5, 0.5],
  "PH5.4": [0.04, 0.5],
  "PH5.5": [2, -12],
  "PH5.6": [9, 4],
  "PH5.7": [16, 0],
  "PH5.8": [5, 0.8],
};
for (const [id, v] of Object.entries(values))
  test(`${id} field transfer arithmetic and controls have explicit finite models`, () => {
    const text = fs.readFileSync(`content/lessons/${id}.mdx`, "utf8");
    const d = parse(/^---\n([\s\S]*?)\n---/.exec(text)[1]);
    v.forEach((x, i) =>
      close(
        Number(d.questions.find((q) => q.id === `em-transfer-${i + 1}`).answer),
        x,
      ),
    );
    assert.ok(
      d.questions.find((q) => q.id === "em-model-assumptions").misconceptions,
    );
    const model = m[id];
    if (model)
      for (let i = 0; i <= 10; i++)
        for (let j = 0; j <= 10; j++)
          assert.ok(
            Number.isFinite(
              model.value(
                model.x[1] + (i / 10) * (model.x[2] - model.x[1]),
                model.parameter[1] +
                  (j / 10) * (model.parameter[2] - model.parameter[1]),
              ),
            ),
          );
  });
test("Coulomb superposition separates potential cancellation and field addition", () => {
  const dipole = [
      { x: -1, y: 0, q: 1 },
      { x: 1, y: 0, q: -1 },
    ],
    same = [
      { x: -1, y: 0, q: 1 },
      { x: 1, y: 0, q: 1 },
    ];
  const a = chargeField(0, 0, dipole),
    b = chargeField(0, 0, same);
  close(a.potential, 0);
  close(a.ex, 2);
  close(b.ex, 0);
  close(b.potential, 2);
  assert.equal(chargeField(1, 0, dipole), null);
});
test("Coulomb electric field equals negative scalar-potential gradient away from source discs", () => {
  const sources = [
      { x: -1, y: 0, q: 1 },
      { x: 1, y: 0, q: -0.5 },
    ],
    x = 0.2,
    y = 0.7,
    h = 1e-5;
  const e = chargeField(x, y, sources);
  close(
    e.ex,
    -(
      chargeField(x + h, y, sources).potential -
      chargeField(x - h, y, sources).potential
    ) /
      (2 * h),
    1e-8,
  );
  close(
    e.ey,
    -(
      chargeField(x, y + h, sources).potential -
      chargeField(x, y - h, sources).potential
    ) /
      (2 * h),
    1e-8,
  );
});
test("image charges satisfy grounded boundary and leave normal field", () => {
  for (const h of [0.5, 1, 1.5])
    for (const x of [-3, -1, 0, 1, 3]) {
      const f = chargeField(x, 0, [
        { x: 0, y: h, q: 1 },
        { x: 0, y: -h, q: -1 },
      ]);
      close(f.potential, 0);
      close(f.ex, 0);
      assert.ok(f.ey < 0);
    }
});
test("straight-wire field is tangent, reverses with current and has inverse-radius magnitude", () => {
  for (const [x, y] of [
    [1, 0],
    [0, 2],
    [-2, 1],
  ]) {
    const b = wireField(x, y, 2),
      r = wireField(x, y, -2);
    close(b.ex * x + b.ey * y, 0);
    close(Math.hypot(b.ex, b.ey), 2 / Math.hypot(x, y));
    close(b.ex, -r.ex);
    close(b.ey, -r.ey);
  }
  assert.equal(wireField(0, 0, 1), null);
});
